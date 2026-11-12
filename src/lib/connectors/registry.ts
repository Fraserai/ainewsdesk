import RSSParser from 'rss-parser';
import { ConnectorDefinition, IngestedItem } from '../types';
import { mockArticles } from '../../data/mockArticleSeeds';
import { mockSocialPosts } from '../../data/mockSocialPosts';

const parser = new RSSParser();

const stopWords = new Set([
  'about',
  'after',
  'against',
  'before',
  'because',
  'between',
  'during',
  'from',
  'have',
  'into',
  'like',
  'over',
  'through',
  'under',
  'within',
  'without',
  'other',
]);

const MAX_TOKENS = 8;

function extractKeywords(text: string) {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 3 && !stopWords.has(token))
    .slice(0, MAX_TOKENS);
  return Array.from(new Set(tokens));
}

async function fetchRss(connector: ConnectorDefinition): Promise<IngestedItem[]> {
  const entries: IngestedItem[] = [];
  for (const [seedKey, seedUrl] of Object.entries(connector.seeds)) {
    try {
      const feed = await parser.parseURL(seedUrl as string);
      const feedTitle = feed.title || connector.name;
      (feed.items || []).forEach((item) => {
        const title = item.title || item.contentSnippet || 'AI story';
        const rawText = item.contentSnippet || item.content || item.summary || '';
        const published_at = item.isoDate || item.pubDate || new Date().toISOString();
        const id = item.guid || `${connector.id}-${seedKey}-${published_at}`;
        entries.push({
          id,
          title,
          url: item.link || feed.link || seedUrl,
          source_name: feedTitle,
          source_type: connector.source_type,
          author_name: item.creator || item.author || feedTitle,
          published_at,
          raw_text: rawText,
          engagement: undefined,
          category: connector.category,
          region_tag: connector.region_tag,
          entities: extractKeywords(`${title} ${rawText}`),
          fetched_at: new Date().toISOString(),
          connector_id: connector.id,
        });
      });
    } catch (error) {
      console.warn(`Failed to fetch feed ${seedUrl}`, error);
    }
  }
  return entries;
}

async function fetchXWatchlist(connector: ConnectorDefinition): Promise<IngestedItem[]> {
  const handles = Object.values(connector.seeds).map((value) => value.toString().toLowerCase());
  return mockSocialPosts
    .filter((post) => handles.includes(post.handle.toLowerCase()) || handles.includes(post.id.toLowerCase()))
    .map((post) => ({
      id: post.id,
      title: post.title || post.text.slice(0, 80),
      url: post.url,
      source_name: `@${post.handle}`,
      source_type: 'x_post',
      author_name: post.handle,
      published_at: post.published_at,
      raw_text: post.text,
      engagement: {
        likes: post.likes,
        replies: post.replies,
        reposts: post.reposts,
        quotes: post.quotes,
      },
      category: post.category,
      region_tag: post.region_tag ?? connector.region_tag,
      entities: extractKeywords(post.text),
      fetched_at: new Date().toISOString(),
      connector_id: connector.id,
    }));
}

async function fetchMock(connector: ConnectorDefinition): Promise<IngestedItem[]> {
  return mockArticles.map((article) => ({
    id: article.id,
    title: article.title,
    url: article.url,
    source_name: article.source_name,
    source_type: connector.source_type,
    author_name: article.source_name,
    published_at: article.published_at,
    raw_text: article.summary,
    category: article.category,
    region_tag: article.region_tag || connector.region_tag,
    entities: extractKeywords(`${article.title} ${article.summary}`),
    fetched_at: new Date().toISOString(),
    connector_id: connector.id,
  }));
}

const handlers: Record<string, (connector: ConnectorDefinition) => Promise<IngestedItem[]>> = {
  rss: fetchRss,
  x_watchlist: fetchXWatchlist,
  mock: fetchMock,
};

export async function fetchConnectorItems(connector: ConnectorDefinition) {
  const handler = handlers[connector.kind];
  if (!handler) {
    return [];
  }
  return handler(connector);
}
