import { TextToSpeechModel, TextToSpeechVoice } from '../enums/text-to-speech.enum';

export interface ContentPipelineRequest {
    topic: string;
    sourceText: string;
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
