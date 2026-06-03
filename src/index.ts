/**
 * @package @sikandarmoyaldev/progress
 * Terminal progress bar for Node.js CLI tools
 */

// Re-export main class + factory (no re-declaration needed)
export { createProgressBar, ProgressBar } from "./progressbar/index";

// Re-export types for TypeScript consumers
export type {
    ProgressBarSymbols,
    ProgressOptions,
    ProgressState,
    StartOptions,
    UpdateOptions,
} from "./progressbar/types";

// Re-export utilities (optional advanced use)
export { calculateEta, clamp, formatTime } from "./utils";
