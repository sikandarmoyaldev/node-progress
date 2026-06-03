import { describe, expect, it } from "vitest";
import { calculateEta, clamp, formatTime, resolveOptions, validateTotal } from "../utils";

describe("clamp", () => {
    /** !core: ensures value stays within [min, max] bounds */
    it("returns value when within bounds", () => {
        expect(clamp(5, 0, 10)).toBe(5); // !expected: unchanged
    });

    /** !important: prevents underflow → protects progress from negative */
    it("returns min when value below", () => {
        expect(clamp(-3, 0, 10)).toBe(0); // !clamped to lower bound
    });

    /** !important: prevents overflow → protects progress from exceeding total */
    it("returns max when value above", () => {
        expect(clamp(15, 0, 10)).toBe(10); // !clamped to upper bound
    });
});

describe("formatTime", () => {
    /** !core: handles sub-minute durations */
    it("formats seconds only", () => {
        expect(formatTime(45000)).toBe("45s"); // !simple case
    });

    /** !important: ETA display uses this format → must be human-readable */
    it("formats minutes + seconds", () => {
        expect(formatTime(90000)).toBe("1m 30s"); // !common case
    });

    /** !edge case: long-running tasks need hour formatting */
    it("formats hours + minutes + seconds", () => {
        expect(formatTime(3665000)).toBe("1h 1m 5s"); // !complex case
    });
});

describe("calculateEta", () => {
    /** !important: can't calculate ETA at start → return null */
    it("returns null at 0% progress", () => {
        expect(calculateEta(10000, 0)).toBeNull(); // !guard: no division by zero
    });

    /** !important: no ETA needed when complete → return null */
    it("returns null at 100% progress", () => {
        expect(calculateEta(10000, 1)).toBeNull(); // !guard: task done
    });

    /** !core formula: remaining = elapsed / progress - elapsed */
    it("calculates ETA at 50% progress", () => {
        expect(calculateEta(30000, 0.5)).toBe(30000); // !30s elapsed → 30s remaining
    });
});

describe("resolveOptions", () => {
    /** !internal: called once in constructor → apply all defaults */
    it("applies defaults for minimal input", () => {
        const result = resolveOptions({ total: 100 });
        expect(result.quiet).toBe(false); // !default: verbose
        expect(result.barWidth).toBe(40); // !default width
        expect(result.symbols.filled).toBe("█"); // !default symbol
        expect(result.prefix).toBe("🎬"); // !default prefix
    });

    /** !important: user values must override defaults */
    it("overrides defaults with user values", () => {
        const result = resolveOptions({
            total: 50,
            quiet: true, // !override
            barWidth: 60, // !override
            prefix: "⚡", // !override
        });
        expect(result.quiet).toBe(true);
        expect(result.barWidth).toBe(60);
        expect(result.prefix).toBe("⚡");
    });
});

describe("validateTotal", () => {
    /** !core: valid input should pass silently */
    it("accepts valid positive number", () => {
        expect(() => validateTotal(100)).not.toThrow(); // !expected: no error
    });

    /** !important: fail fast on negative → prevents silent bugs */
    it("throws on negative number", () => {
        expect(() => validateTotal(-5)).toThrow("non-negative"); // !guard clause
    });

    /** !important: NaN is invalid → must throw */
    it("throws on NaN", () => {
        expect(() => validateTotal(NaN)).toThrow("finite"); // !guard clause
    });
});
