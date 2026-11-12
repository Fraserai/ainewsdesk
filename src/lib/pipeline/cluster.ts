import dataStore from '../dataStore';
import { ContentAngle, IngestedItem, StoryCluster } from '../types';
import { randomUUID } from 'crypto';

const CATEGORY_WEIGHT: Record<string, number> = {
  model_launch: 1.2,
  product_update: 1.1,
  funding: 1.0,
  startup_news: 1.0,
  demo: 1.0,
  research: 1.1,
  regulation: 1.0,
  discourse: 0.9,
  australia_ai: 1.3,
  other: 0.8,
};

const angleTemplates: { type: ContentAngle['type']; label: string; prompt: (cluster: StoryCluster) => string }[] = [
  {
    type: 'straight_news',
    label: 'Straight news',
    prompt: (cluster) => `Top update: ${cluster.title}. Source count ${cluster.source_count}.`,
  },
  {
    type: 'why_people_care',
    label: 'Why people care',
    prompt: (cluster) => `People should care because ${cluster.why_it_matters}.`,
  },
  {
    type: 'hot_take',
    label: 'Hot take',
    prompt: (cluster) => `Hot take: ${cluster.title} shows that ${cluster.full_summary.split('.')[0]}.`,
  },
  {
    type: 'implication',
    label: 'Bigger shift',
    prompt: (cluster) => `Implication: ${cluster.full_summary.split('.')[0]}.`,
  },
  {
    type: 'product',
    label: 'Product angle',
    prompt: (cluster) => `Product lens: ${cluster.title} could help teams ${cluster.short_summary}.`,
  },
  {
    type: 'startup',
    label: 'Startup/business',
    prompt: (cluster) => `Startup angle: Combine ${cluster.category} momentum with source diversity.`,
  },
];

const stopWords = new Set(['the', 'this', 'that', 'with', 'from', 'for', 'will', 'have', 'also']);

function normalizeTokens(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.has(word));
}

function pickCategory(items: IngestedItem[]) {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    const cat = item.category ?? 'other';
    counts.set(cat, (counts.get(cat) ?? 0) + 1);
  });
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'other';
}

function pickRegion(items: IngestedItem[]) {
  if (items.some((item) => item.region_tag === 'australia')) {
    return 'australia';
  }
  return undefined;
}

function generateShortSummary(items: IngestedItem[]) {
  const title = items[0]?.title ?? 'Untitled AI story';
  return `${title} (${items.length} sources)`;
}

function generateFullSummary(items: IngestedItem[]) {
  const highlights = items.slice(0, 3).map((item) => `• ${item.title} (${item.source_name})`);
  return `Latest: ${items[0]?.title}. Sources:\n${highlights.join('\n')}`;
}

function generateWhyItMatters(items: IngestedItem[], category: string) {
  if (category === 'australia_ai') {
    return 'Signals that Australian AI policy and investment are accelerating.';
  }
  return 'This moment reshapes how organizations treat AI product delivery and safety.';
}

function buildContentAngles(cluster: StoryCluster): ContentAngle[] {
  return angleTemplates.map((template) => ({
    type: template.type,
    label: template.label,
    text: template.prompt(cluster),
  }));
}

function calculateScore(items: IngestedItem[], category: string, sourceTypes: string[], manualPriority = 0) {
  const now = Date.now();
  const latest = Math.max(...items.map((item) => new Date(item.published_at).getTime()));
  const ageHours = Math.max(1, (now - latest) / 1000 / 60 / 60);

  const engagement = items.reduce((sum, item) => {
    const metrics = item.engagement;
    if (!metrics) return sum;
    return sum + (metrics.likes ?? 0) * 0.4 + (metrics.replies ?? 0) * 0.3 + (metrics.reposts ?? 0) * 0.3;
  }, 0);

  const recencyScore = 1 / ageHours;
  const engagementScore = Math.log(engagement + 1);
  const diversity = sourceTypes.length;
  const categoryWeight = CATEGORY_WEIGHT[category] ?? 1;
  const australiaBoost = category === 'australia_ai' ? 0.3 : 0;

  return (
    5 * recencyScore +
    3 * engagementScore +
    2 * diversity +
    4 * categoryWeight +
    australiaBoost +
    manualPriority * 0.5
  );
}

export async function runClustering() {
  const items = await dataStore.listRawItems({
    since: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  });
  const accumulators: { tokens: Set<string>; items: IngestedItem[] }[] = [];

  items.forEach((item) => {
    const tokens = new Set(normalizeTokens(`${item.title} ${item.raw_text}`));
    let matched = false;
    for (const acc of accumulators) {
      const overlap = Array.from(tokens).filter((token) => acc.tokens.has(token)).length;
      if (overlap >= 3) {
        acc.items.push(item);
        tokens.forEach((token) => acc.tokens.add(token));
        matched = true;
        break;
      }
    }
    if (!matched) {
      accumulators.push({ tokens, items: [item] });
    }
  });

  const clusters = accumulators.map((acc) => {
    const sortedItems = acc.items.sort(
      (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
    );
    const category = pickCategory(sortedItems);
    const region_tag = pickRegion(sortedItems);
    const short_summary = generateShortSummary(sortedItems);
    const why_it_matters = generateWhyItMatters(sortedItems, category);
    const full_summary = generateFullSummary(sortedItems);
    const source_types = Array.from(new Set(sortedItems.map((item) => item.source_type)));
    const score = calculateScore(sortedItems, category, source_types);

    const cluster: StoryCluster = {
      id: randomUUID(),
      title: sortedItems[0]?.title ?? 'Untitled story',
      short_summary,
      full_summary,
      why_it_matters,
      content_angles: [],
      score,
      category: category as StoryCluster['category'],
      region_tag,
      source_count: sortedItems.length,
      source_types: source_types as StoryCluster['source_types'],
      source_ids: sortedItems.map((item) => item.id),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    cluster.content_angles = buildContentAngles(cluster);
    return cluster;
  });

  await dataStore.upsertClusters(clusters);
  return clusters;
}
