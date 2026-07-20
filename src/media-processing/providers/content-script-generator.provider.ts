import { Injectable, Logger } from '@nestjs/common';
import { ContentPipelineRequest } from '../interfaces/content-pipeline.interface';

@Injectable()
export class ContentScriptGeneratorProvider {
    private readonly logger = new Logger(ContentScriptGeneratorProvider.name);

    async generateScript(request: ContentPipelineRequest): Promise<string> {
        this.logger.log(`Generating script for topic: ${request.topic}`);
        return `Script for ${request.topic}: ${request.sourceText}`.trim();
    }
}
