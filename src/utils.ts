export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

export function formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / 3600);

    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
}

export function calculateEta(elapsed: number, progress: number): number | null {
    if (progress <= 0 || progress >= 1) return null;
    return Math.round(elapsed / progress - elapsed);
}

export function resolveOptions(
    options: import("./progressbar/types").ProgressOptions,
): import("./progressbar/types").ResolvedOptions {
    return {
        total: options.total,
        quiet: options.quiet ?? false,
        barWidth: options.barWidth ?? 40,
        symbols: {
            filled: options.symbol?.filled ?? "█",
            empty: options.symbol?.empty ?? "░",
        },
        prefix: options.prefix ?? "🎬",
        suffix: options.suffix ?? "",
        showEta: options.showEta ?? true,
        showPercent: options.showPercent ?? true,
        showCounter: options.showCounter ?? true,
        updateInterval: options.updateInterval ?? 100,
    };
}

export function validateTotal(total: number): void {
    if (!Number.isFinite(total) || total < 0) {
        throw new Error(
            "ProgressOptions.total must be a non-negative finite number",
        );
    }
}
