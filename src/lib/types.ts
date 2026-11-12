export type SourceType =
  | 'x_post'
  | 'rss_article'
  | 'blog_post'
  | 'news_article'
  | 'company_update'
  | 'forum_post'
  | 'other';

export type Category =
  | 'model_launch'
  | 'product_update'
  | 'funding'
  | 'startup_news'
  | 'demo'
  | 'research'
  | 'regulation'
  | 'discourse'
  | 'australia_ai'
  | 'other';

export type ContentAngleType =
  | 'straight_news'
  | 'why_people_care'
  | 'hot_take'
  | 'implication'
  | 'product'
  | 'startup'
  | 'research'
  | 'policy'
  | 'other';

export type ContentAngle = {
  type: ContentAngleType;
  label: string;
  text: string;
};

export type EngagementMetrics = {
  likes?: number;
  replies?: number;
  reposts?: number;
  quotes?: number;
};

export type IngestedItem = {
  id: string;
  title: string;
  url: string;
  source_name: string;
  source_type: SourceType;
  author_name?: string;
  published_at: string;
  raw_text: string;
  engagement?: EngagementMetrics;
  category?: Category;
  region_tag?: string;
  entities?: string[];
  fetched_at: string;
  connector_id?: string;
};

export type StoryCluster = {
  id: string;
  title: string;
  short_summary: string;
  full_summary: string;
  why_it_matters: string;
  content_angles: ContentAngle[];
  score: number;
  category: Category;
  region_tag?: string;
  source_count: number;
  source_types: SourceType[];
  source_ids: string[];
  created_at: string;
  updated_at: string;
  manual_priority?: number;
  recommended_action?: string;
};

export type ConnectorKind = 'rss' | 'x_watchlist' | 'mock';

export type ConnectorDefinition = {
  id: string;
  name: string;
  description: string;
  kind: ConnectorKind;
  source_type: SourceType;
  region_tag?: string;
  category?: Category;
  priority_weight: number;
  config: Record<string, unknown>;
  seeds: Record<string, string>;
};
