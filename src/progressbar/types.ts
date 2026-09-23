export interface ProgressOptions {
    total: number;
    quiet?: boolean;
    barWidth?: number;
    symbol?: ProgressBarSymbols;
    prefix?: string;
    suffix?: string;
    showEta?: boolean;
    showPercent?: boolean;
    showCounter?: boolean;
    updateInterval?: number;
}

export interface ProgressBarSymbols {
    filled?: string;
    empty?: string;
}

export interface StartOptions {
    initialValue?: number;
    message?: string;
}

export interface UpdateOptions {
    relative?: boolean;
    message?: string;
}

export interface ProgressState {
    current: number;
    total: number;
    percent: number;
    isComplete: boolean;
    etaMs: number | null;
    elapsedMs: number;
}

/** @internal */
export interface ResolvedOptions {
    total: number;
    quiet: boolean;
    barWidth: number;
    symbols: Required<ProgressBarSymbols>;
    prefix: string;
    suffix: string;
    showEta: boolean;
    showPercent: boolean;
    showCounter: boolean;
    updateInterval: number;
}
