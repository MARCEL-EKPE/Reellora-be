import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QualityCheck } from '../pipeline-core/entities/quality-check.entity';
import { Video } from '../pipeline-core/entities/video.entity';
import qualityControlConfig from './config/quality-control.config';
import { QualityControlProvider } from './providers/quality-control.provider';

@Module({
    imports: [
        ConfigModule.forFeature(qualityControlConfig),
        TypeOrmModule.forFeature([QualityCheck, Video]),
    ],
    providers: [QualityControlProvider],
    exports: [QualityControlProvider],
})
export class QualityControlModule {}
