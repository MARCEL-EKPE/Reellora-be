import { Module } from '@nestjs/common';
import { McpModule } from '@nestjs-mcp/server';
import { MediaProcessingModule } from 'src/media-processing/media-processing.module';

@Module({
    imports: [
        McpModule.forRoot({
            name: 'content-pipeline-mcp',
            version: '1.0.0',
        }),
        MediaProcessingModule,
    ],
})
export class AppMcpModule { }
