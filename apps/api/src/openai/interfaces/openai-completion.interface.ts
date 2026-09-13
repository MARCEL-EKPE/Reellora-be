export interface OpenAiCompletionRequest {
    system: string;
    prompt: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
    jsonMode?: boolean;
}

export interface OpenAiCompletionResponse {
    text: string;
}
