import {
    calculateEta,
    clamp,
    formatTime,
    resolveOptions,
    validateTotal,
} from "../utils";
import {
    ProgressOptions,
    ProgressState,
    ResolvedOptions,
    StartOptions,
    UpdateOptions,
} from "./types";

export class ProgressBar {
    private readonly config: ResolvedOptions;
    private current: number;
    private startTime: number;
    private lastUpdate: number;
    private isPaused: boolean;
    private completed: boolean;

    constructor(options: ProgressOptions) {
        validateTotal(options.total);
        this.config = resolveOptions(options);
        this.current = 0;
        this.startTime = Date.now();
        this.lastUpdate = 0;
        this.isPaused = false;
        this.completed = false;
    }

    public start(options?: StartOptions): void {
        const initial = options?.initialValue ?? 0;
        this.current = clamp(initial, 0, this.config.total);
        this.startTime = Date.now();
        this.lastUpdate = 0;
        this.completed = false;
        this.isPaused = false;

        if (options?.message && !this.config.quiet) {
            process.stdout.write(`${options.message}\n`);
        }
        this.render();
    }

    public increment(count: number = 1): void {
        if (count < 0) {
            throw new Error(
                "increment() requires positive value. Use update(-n) to decrement.",
            );
        }
        this.update(count, { relative: true });
    }

    public update(value: number, options?: UpdateOptions): void {
        const { relative = false, message } = options ?? {};

        const newValue = relative
            ? this.current + value
            : clamp(value, 0, this.config.total);
        this.current = clamp(newValue, 0, this.config.total);

        if (this.current >= this.config.total && !this.completed) {
            this.completed = true;
        }

        if (message && !this.config.quiet) {
            process.stdout.write(`\n↳ ${message}\n`);
        }
        this.draw();
    }

    public render(): void {
        if (this.config.quiet || this.isPaused) return;
        this.lastUpdate = 0;
        this.draw();
    }

    public complete(message?: string): void {
        // !fix: prevent double rendering of the completed bar
        if (this.completed) return;

        this.current = this.config.total;
        this.completed = true;
        this.draw(true); // !force: final render with newline

        if (message && !this.config.quiet) {
            process.stdout.write(`✨ ${message}\n`);
        }
    }

    public error(message: string): void {
        this.isPaused = true;
        if (!this.config.quiet) {
            process.stdout.write("\n");
        }
        console.error(`❌ ${message}`);
    }

    public pause(): void {
        this.isPaused = true;
    }

    public resume(): void {
        this.isPaused = false;
        this.render();
    }

    public getProgress(): ProgressState {
        const elapsed = Date.now() - this.startTime;
        const progress =
            this.config.total > 0 ? this.current / this.config.total : 0;
        const etaMs = calculateEta(elapsed, progress);

        return {
            current: this.current,
            total: this.config.total,
            percent: Math.round(progress * 100),
            isComplete: this.completed || this.current >= this.config.total,
            etaMs,
            elapsedMs: elapsed,
        };
    }

    public isComplete(): boolean {
        return this.completed || this.current >= this.config.total;
    }

    private draw(force: boolean = false): void {
        if (this.config.quiet || this.isPaused) return;

        // !fix: prevent redrawing if already completed and not explicitly forced
        if (this.completed && !force) return;

        const now = Date.now();
        const shouldThrottle =
            !force &&
            now - this.lastUpdate < this.config.updateInterval &&
            !this.completed;
        if (shouldThrottle) return;

        this.lastUpdate = now;

        const progress =
            this.config.total > 0 ? this.current / this.config.total : 0;
        const filled = Math.round(this.config.barWidth * progress);
        const empty = this.config.barWidth - filled;

        const elapsed = now - this.startTime;
        const eta = this.config.showEta
            ? calculateEta(elapsed, progress)
            : null;

        const bar =
            this.config.symbols.filled.repeat(filled) +
            this.config.symbols.empty.repeat(empty);

        const parts: string[] = [];
        if (this.config.prefix) parts.push(this.config.prefix);
        parts.push(`[${bar}]`);
        if (this.config.showPercent)
            parts.push(`${Math.round(progress * 100)}%`);
        if (this.config.showEta && eta !== null && eta > 0) {
            parts.push(`| ETA: ${formatTime(eta)}`);
        }
        if (this.config.showCounter) {
            parts.push(`| ${Math.round(this.current)}/${this.config.total}`);
        }
        if (this.config.suffix) parts.push(this.config.suffix);

        const output = `\r${parts.join(" ")}\x1b[K`;

        if (this.completed) {
            process.stdout.write(output + "\n");
        } else {
            process.stdout.write(output);
        }
    }
}

/**
 * Factory: quick ProgressBar creation
 * !updated: now accepts full ProgressOptions object to support prefix, suffix, etc.
 */
export const createProgressBar = (options: ProgressOptions): ProgressBar => {
    return new ProgressBar(options);
};
