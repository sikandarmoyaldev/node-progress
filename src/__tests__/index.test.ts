import { describe, expect, it } from "vitest";
import {
    ProgressBar,
    calculateEta,
    clamp,
    createProgressBar,
    formatTime,
    type ProgressOptions,
} from "../index";

describe("public API exports", () => {
    /** !core: ProgressBar class must be exported */
    it("exports ProgressBar class", () => {
        expect(ProgressBar).toBeDefined(); // !expected: class exists
        expect(typeof ProgressBar).toBe("function"); // !constructable
    });

    /** !important: factory function for simple usage */
    it("exports createProgressBar factory", () => {
        expect(createProgressBar).toBeDefined(); // !expected: function exists
        expect(typeof createProgressBar).toBe("function"); // !callable
    });

    /** !important: utilities exposed for advanced users */
    it("exports utility functions", () => {
        expect(clamp).toBeDefined(); // !helper: bounds
        expect(formatTime).toBeDefined(); // !helper: formatting
        expect(calculateEta).toBeDefined(); // !helper: ETA logic
    });
});

describe("createProgressBar factory", () => {
    /** !core: factory returns ProgressBar instance */
    it("creates ProgressBar instance", () => {
        const bar = createProgressBar(100);
        expect(bar).toBeInstanceOf(ProgressBar); // !expected: correct type
    });

    /** !important: passes quiet option through */
    it("passes quiet option", () => {
        const bar = createProgressBar(50, true);
        // @ts-expect-error: accessing private for testing
        expect(bar.config.quiet).toBe(true); // !verified: option applied
    });

    /** !important: factory ≡ new ProgressBar() for simple cases */
    it("equivalent to new ProgressBar()", () => {
        const bar1 = createProgressBar(100, false);
        const bar2 = new ProgressBar({ total: 100, quiet: false });
        expect(bar1.getProgress().total).toBe(bar2.getProgress().total); // !same result
    });
});

describe("type exports", () => {
    /** !important: types usable in consumer code */
    it("ProgressOptions type is usable", () => {
        const config: ProgressOptions = {
            total: 100, // !required
            quiet: true, // !optional override
            barWidth: 50, // !optional override
        };
        expect(config.total).toBe(100); // !verified: type works
    });
});
