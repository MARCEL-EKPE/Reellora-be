import {
  ContentSourceDefinition,
  ContentSourceFetcher,
  ContentSourceIngestionProvider,
  ContentSourceItem,
} from './content-source-ingestion.provider';

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

describe('ContentSourceIngestionProvider', () => {
  it('normalizes items from configured content sources', async () => {
    const provider = new ContentSourceIngestionProvider(new FakeContentSourceFetcher());

    const items = await provider.ingestSources();

    expect(items.length).toBeGreaterThan(0);
    expect(items[0]).toEqual(
      expect.objectContaining({
        title: expect.stringContaining('Africa'),
        source: expect.any(String),
        url: expect.any(String),
      }),
    );
  });
});
