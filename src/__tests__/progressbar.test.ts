import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProgressBar } from "../progressbar/index";

/** !setup: mock stdout + enable fake timers for reliable timing tests */
beforeEach(() => {
    vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    vi.useFakeTimers(); // !important: control time for throttling/ETA tests
});

afterEach(() => {
    vi.restoreAllMocks(); // !cleanup: prevent test leakage
    vi.useRealTimers(); // !important: restore real time after fake
});

describe("ProgressBar constructor", () => {
    /** !core: valid total → instance created */
    it("creates instance with valid total", () => {
        const bar = new ProgressBar({ total: 100 });
        expect(bar).toBeDefined(); // !expected: no throw
    });

    /** !important: invalid total → fail fast */
    it("throws on invalid total", () => {
        expect(() => new ProgressBar({ total: -1 })).toThrow(); // !guard: validateTotal
    });
});

describe("start()", () => {
    /** !core: initialValue sets current position */
    it("sets current to initialValue", () => {
        const bar = new ProgressBar({ total: 100, quiet: true });
        bar.start({ initialValue: 25 });
        // @ts-expect-error: testing private field access for validation
        expect(bar.current).toBe(25); // !expected: resume point
    });

    /** !important: clamp protects against bad initialValue */
    it("clamps initialValue to bounds", () => {
        const bar = new ProgressBar({ total: 50, quiet: true });
        bar.start({ initialValue: 100 });
        // @ts-expect-error: testing private field clamping behavior
        expect(bar.current).toBe(50); // !clamped to max
    });

    /** !important: fresh timers → accurate ETA calculation */
    it("resets timers on start", () => {
        const bar = new ProgressBar({ total: 100, quiet: true });
        const before = bar.getProgress().elapsedMs;

        vi.advanceTimersByTime(1000); // !fake: move time forward 1s
        bar.start();

        // @ts-expect-error: testing private timer reset logic
        expect(bar.startTime).toBeGreaterThan(before); // !timer reset verified
    });
});

describe("increment()", () => {
    /** !core: positive count advances progress */
    it("increases current by count", () => {
        const bar = new ProgressBar({ total: 100, quiet: true });
        bar.start();
        bar.increment(5);
        // @ts-expect-error: testing private field mutation
        expect(bar.current).toBe(5); // !expected: +5
    });

    /** !important: negative increment is invalid → use update(-n) */
    it("throws on negative count", () => {
        const bar = new ProgressBar({ total: 100, quiet: true });
        expect(() => bar.increment(-1)).toThrow("positive"); // !guard: explicit error
    });

    /** !important: never exceed total → clamp on increment */
    it("does not exceed total", () => {
        const bar = new ProgressBar({ total: 10, quiet: true });
        bar.start();
        bar.increment(15);
        // @ts-expect-error: testing private field upper bound
        expect(bar.current).toBe(10); // !clamped to total
    });
});

describe("update()", () => {
    /** !core: absolute mode sets exact position */
    it("sets absolute value", () => {
        const bar = new ProgressBar({ total: 100, quiet: true });
        bar.update(42);
        // @ts-expect-error: testing private field direct assignment
        expect(bar.current).toBe(42); // !expected: jump to 42
    });

    /** !important: relative mode enables +/- adjustments */
    it("updates relatively when relative: true", () => {
        const bar = new ProgressBar({ total: 100, quiet: true });
        bar.start({ initialValue: 10 });
        bar.update(5, { relative: true });
        // @ts-expect-error: testing private field relative math
        expect(bar.current).toBe(15); // !10 + 5 = 15
    });

    /** !important: negative relative supports retries/backtracking */
    it("supports negative relative updates", () => {
        const bar = new ProgressBar({ total: 100, quiet: true });
        bar.start({ initialValue: 20 });
        bar.update(-5, { relative: true });
        // @ts-expect-error: testing private field negative delta
        expect(bar.current).toBe(15); // !20 - 5 = 15
    });

    /** !important: clamp protects absolute values too */
    it("clamps absolute values to bounds", () => {
        const bar = new ProgressBar({ total: 50, quiet: true });
        bar.update(-10);
        // @ts-expect-error: testing private field lower bound
        expect(bar.current).toBe(0); // !clamped to min
        bar.update(100);
        // @ts-expect-error: testing private field upper bound
        expect(bar.current).toBe(50); // !clamped to max
    });
});

describe("complete()", () => {
    /** !core: sets progress to 100% */
    it("sets current to total", () => {
        const bar = new ProgressBar({ total: 100, quiet: true });
        bar.complete();
        // @ts-expect-error: testing private field final state
        expect(bar.current).toBe(100); // !expected: done
    });

    /** !important: marks internal completed flag */
    it("marks as completed", () => {
        const bar = new ProgressBar({ total: 100, quiet: true });
        bar.complete();
        expect(bar.isComplete()).toBe(true); // !flag set
    });
});

describe("error()", () => {
    /** !important: pause prevents further renders after error */
    it("pauses progress", () => {
        const bar = new ProgressBar({ total: 100, quiet: true });
        bar.error("test");
        // @ts-expect-error: testing private pause state
        expect(bar.isPaused).toBe(true); // !stop rendering
    });

    /** !important: errors go to stderr, not stdout */
    it("logs to stderr", () => {
        const spy = vi.spyOn(console, "error").mockImplementation(() => {});
        const bar = new ProgressBar({ total: 100, quiet: true });
        bar.error("fail");
        expect(spy).toHaveBeenCalledWith("❌ fail"); // !stderr output
        spy.mockRestore();
    });
});

describe("pause()/resume()", () => {
    /** !important: pause suppresses all stdout.write calls */
    it("pause stops rendering", () => {
        const bar = new ProgressBar({ total: 100 });
        bar.pause();
        bar.increment(); // !should not render
        expect(process.stdout.write).not.toHaveBeenCalled(); // !verified: silent
    });

    /** !important: resume re-enables rendering + catches up */
    it("resume re-enables rendering", () => {
        const bar = new ProgressBar({ total: 100 });
        bar.pause();
        bar.resume();
        bar.increment(); // !should render now
        expect(process.stdout.write).toHaveBeenCalled(); // !verified: active
    });
});

describe("getProgress()", () => {
    /** !core: returns snapshot of current state */
    it("returns current state snapshot", () => {
        const bar = new ProgressBar({ total: 100, quiet: true });
        bar.start({ initialValue: 25 });
        const state = bar.getProgress();
        expect(state.current).toBe(25); // !position
        expect(state.total).toBe(100); // !target
        expect(state.percent).toBe(25); // !calculated
        expect(state.isComplete).toBe(false); // !not done
    });

    /** !important: etaMs null at start → no data yet */
    it("etaMs is null at start", () => {
        const bar = new ProgressBar({ total: 100, quiet: true });
        const state = bar.getProgress();
        expect(state.etaMs).toBeNull(); // !expected: can't calculate
    });
});

describe("isComplete()", () => {
    /** !core: false when progress < total */
    it("returns false when incomplete", () => {
        const bar = new ProgressBar({ total: 100, quiet: true });
        expect(bar.isComplete()).toBe(false); // !expected: still running
    });

    /** !important: true when current >= total */
    it("returns true when current >= total", () => {
        const bar = new ProgressBar({ total: 100, quiet: true });
        bar.update(100);
        expect(bar.isComplete()).toBe(true); // !done flag
    });
});

describe("draw() throttling", () => {
    /** !important: skip render if within updateInterval */
    it("skips render within updateInterval", () => {
        const bar = new ProgressBar({ total: 100, updateInterval: 100 });

        // !important: attach spy BEFORE start() to catch initial render
        const writeSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

        bar.start(); // !first render: should call write
        vi.advanceTimersByTime(50); // !fake: move 50ms (less than 100ms interval)
        bar.increment(); // !should be throttled → no render

        expect(writeSpy).toHaveBeenCalledTimes(1); // !verified: only initial render
    });

    /** !important: force render on completion regardless of throttle */
    it("forces render when completed", () => {
        const bar = new ProgressBar({ total: 10, updateInterval: 1000 });

        const writeSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

        bar.start(); // !initial render
        vi.advanceTimersByTime(100); // !fake: move time (still within 1000ms throttle)
        bar.update(10); // !jump to complete → should force render despite throttle

        expect(writeSpy).toHaveBeenCalled(); // !verified: forced render on complete
    });
});
