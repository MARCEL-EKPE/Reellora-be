import { registerAs } from '@nestjs/config';
import type { ContentSourceDefinition } from '../interfaces/content-source.interface';

export default registerAs('contentSourcesConfig', () => {
    const defaultSources: ContentSourceDefinition[] = [
        {
            id: 'reuters-africa',
            name: 'Reuters Africa',
            url: 'https://reutersbest.com/region/africa/feed/',
            type: 'rss',
            category: 'news',
            region: 'africa',
            enabled: true,
            description: 'Fast breaking African and business news wire coverage (via reutersbest.com aggregator).',
        },
        {
            id: 'bloomberg-africa',
            name: 'Bloomberg Africa',
            url: 'https://www.bloomberg.com/feeds/africa.rss',
            type: 'rss',
            category: 'news',
            region: 'africa',
            enabled: true,
            description: 'Placeholder Bloomberg Africa RSS endpoint — replace with a verified working feed URL.',
        },
        {
            id: 'businessday-nigeria',
            name: 'BusinessDay Nigeria',
            url: 'https://businessday.ng/feed/',
            type: 'rss',
            category: 'news',
            region: 'nigeria',
            enabled: true,
            description: 'Strong Nigerian corporate, policy, market, and economy reporting.',
        },
        {
            id: 'afdb-reports',
            name: 'African Development Bank Reports',
            url: 'https://www.afdb.org/en/news-and-events/feed',
            type: 'rss',
            category: 'reports',
            region: 'africa',
            enabled: true,
            description: 'Development finance, infrastructure, and policy updates from AfDB.',
        },
        {
            id: 'imf-africa-data',
            name: 'IMF Africa Data',
            url: 'https://www.imf.org/en/rss?category=Africa',
            type: 'rss',
            category: 'data',
            region: 'africa',
            enabled: true,
            description: 'Macroeconomic analysis and regional policy updates.',
        },
        {
            id: 'world-bank-africa-data',
            name: 'World Bank Africa Data',
            url: 'https://www.worldbank.org/en/region/afr/rss',
            type: 'rss',
            category: 'data',
            region: 'africa',
            enabled: true,
            description: 'Development and regional economic data updates.',
        },
    ];

    const override = process.env.CONTENT_SOURCES_JSON;
    const sources: ContentSourceDefinition[] = override
        ? JSON.parse(override)
        : defaultSources;

    return { sources };
});
