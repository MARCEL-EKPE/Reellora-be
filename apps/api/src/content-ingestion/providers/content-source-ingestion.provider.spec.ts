import { ContentSourceIngestionProvider } from './content-source-ingestion.provider';
import {
  ContentSourceDefinition,
  ContentSourceFetcher,
  ContentSourceItem,
} from '../../shared/interfaces/content-source.interface';

class FakeContentSourceFetcher implements ContentSourceFetcher {
  async fetch(source: ContentSourceDefinition): Promise<ContentSourceItem[]> {
    return [
      {
        id: `${source.id}-1`,
        title: `${source.name} item`,
        summary: 'A test summary for the new ingestion pipeline.',
        source: source.name,
        url: source.url,
        publishedAt: '2026-07-20T00:00:00.000Z',
      },
    ];
  }
}

const mockSourcesConfig = {
  sources: [
    {
      id: 'reuters-africa',
      name: 'Reuters Africa',
      url: 'https://reutersbest.com/region/africa/feed/',
      type: 'rss',
      category: 'news',
      region: 'africa',
      enabled: true,
    },
    {
      id: 'businessday-nigeria',
      name: 'BusinessDay Nigeria',
      url: 'https://businessday.ng/feed/',
      type: 'rss',
      category: 'news',
      region: 'nigeria',
      enabled: true,
    },
  ] as ContentSourceDefinition[],
};

describe('ContentSourceIngestionProvider', () => {
  it('reads configured content sources from config', () => {
    const provider = new ContentSourceIngestionProvider(
      new FakeContentSourceFetcher(),
      mockSourcesConfig as never,
    );

    const configuredSources = provider.getConfiguredSources();
    const sourceIds = configuredSources.map((source) => source.id);

    expect(sourceIds).toEqual(
      expect.arrayContaining(['reuters-africa', 'businessday-nigeria']),
    );
  });

  it('normalizes items from configured content sources', async () => {
    const provider = new ContentSourceIngestionProvider(
      new FakeContentSourceFetcher(),
      mockSourcesConfig as never,
    );

    const items = await provider.ingestSources();

    expect(items.length).toBeGreaterThan(0);
    expect(items[0]).toEqual(
      expect.objectContaining({
        title: expect.any(String),
        source: expect.any(String),
        url: expect.any(String),
      }),
    );
  });
});
