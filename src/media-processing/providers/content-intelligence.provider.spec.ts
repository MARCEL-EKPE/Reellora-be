import { BadRequestException } from '@nestjs/common';
import { ContentIntelligenceProvider } from './content-intelligence.provider';
import { AnthropicClientProvider } from './anthropic-client.provider';
import { ContentSourceItem } from '../../content-ingestion/interfaces/content-source.interface';

const items: ContentSourceItem[] = [
    {
        id: 'a-1',
        title: 'Nigeria raises benchmark interest rate',
        summary: 'The central bank raised rates to curb inflation.',
        source: 'BusinessDay Nigeria',
        url: 'https://example.com/a',
    },
    {
        id: 'b-1',
        title: 'AfDB approves new infrastructure fund',
        summary: 'A new fund targets regional infrastructure gaps.',
        source: 'African Development Bank News',
        url: 'https://example.com/b',
    },
];

describe('ContentIntelligenceProvider', () => {
    it('builds a brief from the anthropic response, mapping the selected source item', async () => {
        const anthropicClient = {
            complete: jest.fn().mockResolvedValue(JSON.stringify({
                selectedIndex: 1,
                topic: 'AfDB Infrastructure Fund',
                angle: 'A new fund could unlock regional infrastructure investment.',
                keyFacts: ['The fund targets cross-border infrastructure gaps.'],
                statistics: ['$500M initial commitment'],
            })),
        } as unknown as AnthropicClientProvider;

        const provider = new ContentIntelligenceProvider(anthropicClient);
        const brief = await provider.buildBrief(items);

        expect(brief.topic).toBe('AfDB Infrastructure Fund');
        expect(brief.sources).toEqual([
            { title: items[1].title, source: items[1].source, url: items[1].url },
        ]);
        expect(brief.statistics).toEqual(['$500M initial commitment']);
    });

    it('rejects when there are no source items to analyze', async () => {
        const anthropicClient = { complete: jest.fn() } as unknown as AnthropicClientProvider;
        const provider = new ContentIntelligenceProvider(anthropicClient);

        await expect(provider.buildBrief([])).rejects.toThrow(BadRequestException);
        expect(anthropicClient.complete).not.toHaveBeenCalled();
    });
});
