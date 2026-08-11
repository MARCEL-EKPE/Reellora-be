import { ContentScriptGeneratorProvider } from './content-script-generator.provider';
import { AnthropicClientProvider } from './anthropic-client.provider';
import { ContentBrief } from '../interfaces/content-brief.interface';

const brief: ContentBrief = {
    topic: 'AfDB Infrastructure Fund',
    angle: 'A new fund could unlock regional infrastructure investment.',
    keyFacts: ['The fund targets cross-border infrastructure gaps.'],
    statistics: ['$500M initial commitment'],
    sources: [{ title: 'AfDB approves new infrastructure fund', source: 'AfDB News', url: 'https://example.com/b' }],
};

describe('ContentScriptGeneratorProvider', () => {
    it('generates a script from the content brief via the Anthropic client', async () => {
        const anthropicClient = {
            complete: jest.fn().mockResolvedValue('Full narration script text...'),
        } as unknown as AnthropicClientProvider;

        const provider = new ContentScriptGeneratorProvider(anthropicClient);
        const script = await provider.generateScript(brief);

        expect(script).toBe('Full narration script text...');
        expect(anthropicClient.complete).toHaveBeenCalledWith(
            expect.objectContaining({
                prompt: expect.stringContaining('AfDB Infrastructure Fund'),
            }),
        );
    });
});
