import { calculateEta, clamp, formatTime, resolveOptions, validateTotal } from "../utils";
import {
    ProgressOptions,
    ProgressState,
    ResolvedOptions,
    StartOptions,
    UpdateOptions,
} from "./types";

export class ProgressBar {
    // !state: config is immutable after construction
    private readonly config: ResolvedOptions;
    private current: number;
    private startTime: number;
    private lastUpdate: number;
    private isPaused: boolean;
    private completed: boolean;

    /**
     * Create ProgressBar instance
     * !important: validates total + resolves defaults once
     */
    constructor(options: ProgressOptions) {
        validateTotal(options.total); // !guard: fail early on bad input
        this.config = resolveOptions(options); // !optimize: no repeated null checks
        this.current = 0;
        this.startTime = Date.now();
        this.lastUpdate = 0;
        this.isPaused = false;
        this.completed = false;
    }

    /**
     * Start/restart progress with optional initial value
     * !important: resets timers + renders initial state
     */
    public start(options?: StartOptions): void {
        const initial = options?.initialValue ?? 0;
        this.current = clamp(initial, 0, this.config.total); // !safety: clamp to bounds
        this.startTime = Date.now(); // !reset: fresh timing for ETA
        this.lastUpdate = 0;
        this.completed = false;
        this.isPaused = false;

        if (options?.message && !this.config.quiet) {
            process.stdout.write(`${options.message}\n`);
        }
        this.render(); // !trigger: show initial bar
    }

    /**
     * Increment progress by positive amount
     * !important: throws on negative → use update(-n) for decrement
     */
    public increment(count: number = 1): void {
        if (count < 0) {
            throw new Error("increment() requires positive value. Use update(-n) to decrement."); // !guard
        }
        this.update(count, { relative: true }); // !delegate: reuse update logic
    }

    /**
     * Update progress: absolute value OR relative delta
     * !important: supports forward/backward movement (e.g., retries)
     */
    public update(value: number, options?: UpdateOptions): void {
        const { relative = false, message } = options ?? {};

        // !core: calculate new position (relative vs absolute)
        const newValue = relative ? this.current + value : clamp(value, 0, this.config.total);
        this.current = clamp(newValue, 0, this.config.total); // !safety: enforce bounds

        if (this.current >= this.config.total && !this.completed) {
            this.completed = true; // !flag: mark done for final render
        }

        if (message && !this.config.quiet) {
            process.stdout.write(`\n↳ ${message}\n`); // !UX: show checkpoint message
        }
        this.draw(); // !render: update terminal display
    }

    /**
     * Force immediate re-render (bypasses throttling)
     * !important: use for final updates or debugging
     */
    public render(): void {
        if (this.config.quiet || this.isPaused) return;
        this.lastUpdate = 0; // !override: skip throttle check
        this.draw();
    }

    /**
     * Mark complete + optional success message
     * !important: adds newline to finalize output
     */
    public complete(message?: string): void {
        this.current = this.config.total; // !ensure: 100% complete
        this.completed = true;
        this.draw(true); // !force: final render with newline

        if (message && !this.config.quiet) {
            process.stdout.write(`\n✨ ${message}\n`); // !UX: success indicator
        }
    }

    /**
     * Handle error: stop progress + display error message
     * !important: clears progress line before stderr output
     */
    public error(message: string): void {
        this.isPaused = true; // !stop: prevent further renders
        if (!this.config.quiet) {
            process.stdout.write("\n"); // !clean: move cursor off progress line
        }
        console.error(`❌ ${message}`); // !stderr: proper error channel
    }

    /** Pause visual updates (keep tracking progress internally) */
    public pause(): void {
        this.isPaused = true;
    }

    /** Resume visual updates + re-render current state */
    public resume(): void {
        this.isPaused = false;
        this.render(); // !catch-up: sync display to current state
    }

    /**
     * Get current progress snapshot (for logging/metrics)
     * !important: etaMs is null when progress is 0% or 100%
     */
    public getProgress(): ProgressState {
        const elapsed = Date.now() - this.startTime;
        const progress = this.config.total > 0 ? this.current / this.config.total : 0;
        const etaMs = calculateEta(elapsed, progress); // !delegate: reuse ETA logic

        return {
            current: this.current,
            total: this.config.total,
            percent: Math.round(progress * 100),
            isComplete: this.completed || this.current >= this.config.total,
            etaMs,
            elapsedMs: elapsed,
        };
    }

    /** Check if progress reached completion */
    public isComplete(): boolean {
        return this.completed || this.current >= this.config.total;
    }

    /**
     * !core: draw progress bar to terminal
     * Handles throttling, formatting, cursor control
     */
    private draw(force: boolean = false): void {
        if (this.config.quiet || this.isPaused) return;

        const now = Date.now();
        // !throttle: skip render if too soon (unless forced or complete)
        const shouldThrottle =
            !force && now - this.lastUpdate < this.config.updateInterval && !this.completed;
        if (shouldThrottle) return;
        this.lastUpdate = now; // !update: reset throttle timer

        const progress = this.config.total > 0 ? this.current / this.config.total : 0;
        const filled = Math.round(this.config.barWidth * progress); // !visual: bar width calculation
        const empty = this.config.barWidth - filled;

        const elapsed = now - this.startTime;
        const eta = this.config.showEta ? calculateEta(elapsed, progress) : null;

        // !build: visual bar with custom symbols
        const bar =
            this.config.symbols.filled.repeat(filled) + this.config.symbols.empty.repeat(empty);

        // !build: dynamic output parts (only include enabled sections)
        const parts: string[] = [];
        if (this.config.prefix) parts.push(this.config.prefix);
        parts.push(`[${bar}]`);
        if (this.config.showPercent) parts.push(`${Math.round(progress * 100)}%`);
        if (this.config.showEta && eta !== null && eta > 0) {
            parts.push(`| ETA: ${formatTime(eta)}`);
        }
        if (this.config.showCounter) {
            parts.push(`| ${Math.round(this.current)}/${this.config.total}`);
        }
        if (this.config.suffix) parts.push(this.config.suffix);

        // !terminal: \r = return to start, \x1b[K = clear to end of line
        const output = `\r${parts.join(" ")}\x1b[K`;

        // !finalize: add newline only on completion (preserves final message)
        if (this.completed) {
            process.stdout.write(output + "\n");
        } else {
            process.stdout.write(output);
        }
    }
}

/**
 * Factory: quick ProgressBar creation
 * !recommended: use this instead of `new ProgressBar()` for simple cases
 */
export const createProgressBar = (total: number, quiet = false): ProgressBar => {
    return new ProgressBar({ total, quiet });
};
