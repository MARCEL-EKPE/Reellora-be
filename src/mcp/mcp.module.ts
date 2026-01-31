import { Module } from '@nestjs/common';
import { McpModule } from '@nestjs-mcp/server';
import { VideoTools } from './video.tool';
import { MediaProcessingModule } from 'src/media-processing/media-processing.module';
@Module({
    imports: [
        McpModule.forRoot({
            name: 'video-edit-mcp',
            version: '1.0.0',
        })
        ,
        MediaProcessingModule
    ],
    providers: [VideoTools],
    exports: [VideoTools]
})
export class AppMcpModule { }