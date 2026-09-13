import { Injectable } from '@nestjs/common';

@Injectable()
export class SubtitleProvider {
  async generate(script: string): Promise<string> {
    return script;
  }
}
