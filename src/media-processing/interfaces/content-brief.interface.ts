/**
 * Structured output of the INTELLIGENCE LAYER.
 * Turns raw ingested feed items into the facts/angle the script
 * generator needs, instead of handing it raw RSS text.
 */
export interface ContentBrief {
    topic: string;
    angle: string;
    keyFacts: string[];
    statistics: string[];
    sources: Array<{ title: string; source: string; url?: string }>;
}
