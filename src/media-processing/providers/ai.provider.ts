import { Injectable } from '@nestjs/common';
import { HighlightExtractionProvider } from './highlight-extraction.provider';
import { TranscriptSummaryProvider } from './transcript-summary.provider';
import { VisualHighlightsProvider } from './visual-highlights.provider';

/**
 * AiProvider acts as a facade/orchestrator for AI-driven media analysis.
 * It delegates to specialized providers for highlight extraction, summarization, and vision refinement.
 */
@Injectable()
export class AiProvider {
  constructor(
    private readonly highlightExtraction: HighlightExtractionProvider,
    private readonly transcriptSummary: TranscriptSummaryProvider,
    private readonly visualHighlights: VisualHighlightsProvider,
  ) { }

  /**
   * Extract highlight segments from a transcript using LLM
   */
  async selectHighlights(transcript: any, maxHighlights?: number) {
    return this.highlightExtraction.selectHighlights(transcript, maxHighlights);
  }

  /**
   * Generate structured news summary from a transcript
   */
  async summarizeNewsTranscript(transcript: any) {
    return this.transcriptSummary.summarizeNewsTranscript(transcript);
  }

  /**
   * Refine highlight candidates by analyzing video frames with vision model
   */
  async refineHighlightsWithVision(params: {
    transcript: any;
    candidates: Array<{ start: number; end: number; summary?: string }>;
    sampledFrames: Array<{ windowIndex: number; timestamp: number; path: string }>;
  }) {
    return this.visualHighlights.refineHighlightsWithVision(params);
  }
}
