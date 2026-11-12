import { Category } from '../lib/types';

export type MockSocialPost = {
  id: string;
  handle: string;
  text: string;
  title?: string;
  url: string;
  published_at: string;
  impressions?: number;
  likes: number;
  replies: number;
  reposts: number;
  quotes: number;
  category?: Category;
  region_tag?: string;
};

export const mockSocialPosts: MockSocialPost[] = [
  {
    id: 'x-openai-1',
    handle: 'OpenAI',
    text: 'Claude 3 is now optimized for enterprise benchmarks and is powering a new developer console.',
    url: 'https://x.com/OpenAI/status/1',
    published_at: '2026-04-05T07:15:00Z',
    likes: 3400,
    replies: 120,
    reposts: 180,
    quotes: 60,
    category: 'product_update',
  },
  {
    id: 'x-anthropic-1',
    handle: 'Anthropic',
    text: 'Introduced a new CLIP-style dataset to improve Claude’s grounding in enterprise knowledge.',
    url: 'https://x.com/Anthropic/status/2',
    published_at: '2026-04-05T02:00:00Z',
    likes: 2100,
    replies: 95,
    reposts: 110,
    quotes: 25,
    category: 'research',
  },
  {
    id: 'x-deepmind-1',
    handle: 'DeepMind',
    text: 'DeepMind is opening an Australia lab for neuro-symbolic reasoning research.',
    url: 'https://x.com/DeepMind/status/3',
    published_at: '2026-04-05T01:40:00Z',
    likes: 1800,
    replies: 85,
    reposts: 150,
    quotes: 30,
    category: 'model_launch',
    region_tag: 'australia',
  },
  {
    id: 'x-mistral-1',
    handle: 'Mistral',
    text: 'Mistral’s open-weight release now has better long-context control for creative teams.',
    url: 'https://x.com/MistralAI/status/4',
    published_at: '2026-04-04T18:05:00Z',
    likes: 2200,
    replies: 60,
    reposts: 140,
    quotes: 18,
    category: 'product_update',
  },
  {
    id: 'x-ausgov-1',
    handle: 'AusGovTech',
    text: 'Australian government is piloting AI-assisted policy briefings with local startups.',
    url: 'https://x.com/AusGovTech/status/5',
    published_at: '2026-04-05T03:30:00Z',
    likes: 900,
    replies: 45,
    reposts: 20,
    quotes: 10,
    category: 'regulation',
    region_tag: 'australia',
  },
];
