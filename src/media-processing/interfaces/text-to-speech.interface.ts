import { TextToSpeechModel, TextToSpeechVoice } from "../enums/text-to-speech.enum";

export type AudioFormat = 'mp3' | 'opus' | 'aac' | 'flac' | 'pcm' | 'wav';

export interface GenerateSpeechRequest {
    transcriptPath: string;
    outputPath: string;
    voice?: TextToSpeechVoice;
    model?: TextToSpeechModel;
    speed?: number;
    response_format?: AudioFormat;
}

export interface GenerateSpeechResponse {
    audioPath: string;
    size: number;
    duration?: number;
}

