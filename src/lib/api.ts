import dataStore, { ClusterFilter, RawItemFilter } from './dataStore';
import { runStoryPipeline } from './pipeline';
import { isSupabaseConfigured } from './supabaseClient';
import { Category, StoryCluster } from './types';

let localBootstrapPromise: Promise<void> | null = null;

async function ensureLocalData() {
  if (isSupabaseConfigured) {
    return;
  }

  const existing = await dataStore.listClusters({ limit: 1 });
  if (existing.length > 0) {
    return;
  }

  if (!localBootstrapPromise) {
    localBootstrapPromise = runStoryPipeline()
      .then(() => undefined)
      .finally(() => {
        localBootstrapPromise = null;
      });
  }

  await localBootstrapPromise;
}

export async function getTodayClusters() {
  await ensureLocalData();
  const since = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();
  return dataStore.listClusters({ since, limit: 12 });
}

export async function getAllClusters(filter?: ClusterFilter) {
  await ensureLocalData();
  return dataStore.listClusters(filter);
}

export async function getClusterById(id: string): Promise<StoryCluster | null> {
  await ensureLocalData();
  return dataStore.getClusterById(id);
}

export async function getRawItems(filter?: RawItemFilter) {
  await ensureLocalData();
  return dataStore.listRawItems(filter);
}

export async function getConnectorList() {
  await ensureLocalData();
  return dataStore.listConnectors();
}

export const CATEGORY_FILTERS: Category[] = [
  'model_launch',
  'product_update',
  'funding',
  'startup_news',
  'demo',
  'research',
  'regulation',
  'discourse',
  'australia_ai',
];

export async function getRawItemsByIds(ids: string[]) {
  await ensureLocalData();
  if (!ids.length) {
    return [];
  }
  const allItems = await dataStore.listRawItems();
  const lookup = new Set(ids);
  return allItems.filter((item) => lookup.has(item.id));
}
