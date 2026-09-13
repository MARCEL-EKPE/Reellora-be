export interface ResearchResult {
    topic: string;
    summary: string;
    keyFacts: string[];
    entities: Record<string, unknown>[];
    timeline: Record<string, unknown>[];
    uncertainties: string[];
    sources: Record<string, unknown>[];
}
