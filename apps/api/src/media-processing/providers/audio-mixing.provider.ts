import { Injectable } from '@nestjs/common';

@Injectable()
export class AudioMixingProvider {
  async mix(narrationPath: string, musicPath?: string): Promise<string> {
    return musicPath ? narrationPath : narrationPath;
  }
}
