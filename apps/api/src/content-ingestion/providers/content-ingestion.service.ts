import { Injectable } from '@nestjs/common';
import type {
  ContentSourceDefinition,
  ContentSourceItem,
} from '../../shared/interfaces/content-source.interface';
import { ContentSourceIngestionProvider } from './content-source-ingestion.provider';

@Injectable()
export class ContentIngestionService {
  constructor(
    private readonly contentSourceIngestionProvider: ContentSourceIngestionProvider,
  ) {}

  getConfiguredSources(): ContentSourceDefinition[] {
    return this.contentSourceIngestionProvider.getConfiguredSources();
  }

  async discoverItemsBySource(): Promise<Map<string, ContentSourceItem[]>> {
    const sources = this.getConfiguredSources();
    const bySource = new Map<string, ContentSourceItem[]>();

    for (const source of sources) {
      const items = await this.contentSourceIngestionProvider.fetchSource(source);
      bySource.set(source.id, items);
    }

    return bySource;
  }
}
