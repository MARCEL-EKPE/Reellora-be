export interface TranscriptSegment {
    start: number;
    end: number;
    text: string;
}

export interface HighlightSegment {
    start: number;
    end: number;
    summary?: string;
}

export interface NarrationScene {
    index: number;
    text: string;
    startTime: number;
    endTime: number;
    duration: number;
    /** Proportional midpoint mapped into original video time — used as fallback if clip selection fails */
    targetTimestamp: number;
    /** Set after vision model selects the best clip for this scene */
    selectedClipPath?: string;
}