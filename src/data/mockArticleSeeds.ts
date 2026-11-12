import { Category } from '../lib/types';

export const mockArticles = [
  {
    id: 'mock-article-claude',
    title: 'Claude 3 enterprise packs now available in 18 languages',
    summary:
      'Anthropic officially launches Claude 3 Enterprise with deterministic scheduling controls and new safety guardrails.',
    url: 'https://blog.anthropic.com/claude-3-enterprise',
    published_at: '2026-04-05T05:30:00Z',
    source_name: 'Anthropic Blog',
    category: 'product_update' as Category,
    region_tag: null,
  },
  {
    id: 'mock-article-privacypolicy',
    title: 'Australia passes new AI safety regulation for public sector procurement',
    summary:
      'Parliament greenlights legislation requiring AI procurement audits for all federal agencies and outlines funding for responsible AI labs.',
    url: 'https://www.ausgovtech.gov.au/news/ai-safety',
    published_at: '2026-04-05T04:45:00Z',
    source_name: 'GovTech Aus',
    category: 'regulation' as Category,
    region_tag: 'australia',
  },
  {
    id: 'mock-article-diffusion',
    title: 'XAI demo: multi-modal reasoning that blends code, text, and audio',
    summary:
      'xAI demo showcases the Xylo model synthesizing documentation, live audio transcripts, and code completions inside one workflow.',
    url: 'https://xai.com/blog/xylo-demo',
    published_at: '2026-04-05T03:00:00Z',
    source_name: 'xAI Blog',
    category: 'demo' as Category,
    region_tag: null,
  },
  {
    id: 'mock-article-ausfund',
    title: 'Sydney seed fund backs AI-native climate monitoring startups',
    summary:
      'A$50M climate and AI fund will spin out teams building sensors and generative analytics for climate resilience.',
    url: 'https://innovationaus.com/ai-climate-fund',
    published_at: '2026-04-04T22:30:00Z',
    source_name: 'InnovationAus',
    category: 'funding' as Category,
    region_tag: 'australia',
  },
];
