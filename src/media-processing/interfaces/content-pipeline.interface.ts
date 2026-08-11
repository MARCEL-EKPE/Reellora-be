import { TextToSpeechModel, TextToSpeechVoice } from '../enums/text-to-speech.enum';
import { ContentSourceItem } from '../../content-ingestion/interfaces/content-source.interface';

export interface ContentPipelineRequest {
    /** Optional hint to steer which ingested story the intelligence layer selects. */
    topic?: string;
    /** Optional pre-fetched items, useful for tests or bypassing live ingestion. */
    sourceItems?: ContentSourceItem[];
    outputDir: string;
    voice?: TextToSpeechVoice;
    model?: TextToSpeechModel;
    speed?: number;
}

export interface ContentPipelineResult {
    script: string;
    audioPath: string;
    videoPath: string;
    outputDir: string;
}
