import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { promises as fs } from 'fs';
import * as path from 'path';
import mediaProcessingConfig from '../config/media-processing.config';
import type { CompositionRequest } from '../interfaces/composition.interface';

@Injectable()
export class FfmpegCompositionProvider {
  constructor(
    @Inject(mediaProcessingConfig.KEY)
    private readonly config: ConfigType<typeof mediaProcessingConfig>,
  ) {}

  async compose(request: CompositionRequest): Promise<string> {
    if (!this.config.useMockComposition) {
      throw new BadRequestException(
        'Real FFmpeg composition not yet implemented',
      );
    }

    await fs.mkdir(path.dirname(request.finalOutputPath), { recursive: true });
    await fs.writeFile(request.finalOutputPath, 'placeholder-video');
    return request.finalOutputPath;
  }
}
