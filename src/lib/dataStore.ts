import { PostgrestClient } from '@supabase/supabase-js';
import { ensureSupabase, supabaseClient } from './supabaseClient';
import {
  Category,
  ConnectorDefinition,
  IngestedItem,
  StoryCluster,
} from './types';

export type RawItemFilter = {
  since?: string;
  limit?: number;
  connectorIds?: string[];
};

export type ClusterFilter = {
  since?: string;
  limit?: number;
  category?: Category;
  regionTag?: string;
  includeAustraliaOnly?: boolean;
  minScore?: number;
  sourceType?: string;
  connectorId?: string;
};

export interface DataStore {
  listConnectors(): Promise<ConnectorDefinition[]>;
  upsertConnectors(connectors: ConnectorDefinition[]): Promise<void>;
  insertRawItems(items: IngestedItem[]): Promise<void>;
  listRawItems(filter?: RawItemFilter): Promise<IngestedItem[]>;
  upsertClusters(clusters: StoryCluster[]): Promise<void>;
  listClusters(filter?: ClusterFilter): Promise<StoryCluster[]>;
  getClusterById(id: string): Promise<StoryCluster | null>;
  getSetting<T>(key: string): Promise<T | null>;
  setSetting(key: string, value: unknown): Promise<void>;
}

class MemoryDataStore implements DataStore {
  private connectors = new Map<string, ConnectorDefinition>();
  private rawItems = new Map<string, IngestedItem>();
  private clusters = new Map<string, StoryCluster>();
  private settings = new Map<string, unknown>();

  async listConnectors() {
    return Array.from(this.connectors.values());
  }

  async upsertConnectors(connectors: ConnectorDefinition[]) {
    connectors.forEach((connector) => {
      this.connectors.set(connector.id, connector);
    });
  }

  async insertRawItems(items: IngestedItem[]) {
    items.forEach((item) => {
      this.rawItems.set(item.id, item);
    });
  }

  async listRawItems(filter?: RawItemFilter) {
    let values = Array.from(this.rawItems.values());
    if (filter?.since) {
      values = values.filter((item) => new Date(item.published_at) >= new Date(filter.since!));
    }
    if (filter?.connectorIds?.length) {
      values = values.filter((item) => filter.connectorIds!.includes(item.connector_id || ''));
    }
    if (filter?.limit) {
      values = values.slice(-filter.limit);
    }
    return values.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  }

  async upsertClusters(clusters: StoryCluster[]) {
    clusters.forEach((cluster) => {
      this.clusters.set(cluster.id, cluster);
    });
  }

  async listClusters(filter?: ClusterFilter) {
    let values = Array.from(this.clusters.values());
    if (filter?.since) {
      values = values.filter((cluster) => new Date(cluster.updated_at) >= new Date(filter.since!));
    }
    if (filter?.category) {
      values = values.filter((cluster) => cluster.category === filter.category);
    }
    if (filter?.regionTag) {
      values = values.filter((cluster) => cluster.region_tag === filter.regionTag);
    }
    if (filter?.includeAustraliaOnly) {
      values = values.filter((cluster) => cluster.region_tag === 'australia' || cluster.category === 'australia_ai');
    }
    if (filter?.minScore) {
      values = values.filter((cluster) => cluster.score >= filter.minScore!);
    }
    if (filter?.sourceType) {
      values = values.filter((cluster) => cluster.source_types.includes(filter.sourceType!));
    }
    if (filter?.connectorId) {
      values = values.filter((cluster) => cluster.source_ids.some((id) => id.startsWith(filter.connectorId!)));
    }
    if (filter?.limit) {
      values = values.slice(0, filter.limit);
    }
    return values.sort((a, b) => b.score - a.score);
  }

  async getClusterById(id: string) {
    return this.clusters.get(id) ?? null;
  }

  async getSetting<T>(key: string) {
    return (this.settings.get(key) as T) ?? null;
  }

  async setSetting(key: string, value: unknown) {
    this.settings.set(key, value);
  }
}

class SupabaseDataStore implements DataStore {
  constructor(private client: PostgrestClient) {}

  private readonly clusterTable = 'story_clusters';
  private readonly rawTable = 'raw_items';
  private readonly connectorTable = 'connectors';

  async listConnectors() {
    const { data, error } = await this.client.from(this.connectorTable).select('*');
    if (error) {
      console.error(error);
      return [];
    }
    return (data ?? []) as ConnectorDefinition[];
  }

  async upsertConnectors(connectors: ConnectorDefinition[]) {
    const { error } = await this.client
      .from(this.connectorTable)
      .upsert(connectors, { onConflict: 'id' });
    if (error) {
      console.warn('Connector upsert failed', error);
    }
  }

  async insertRawItems(items: IngestedItem[]) {
    if (!items.length) {
      return;
    }
    const payload = items.map((item) => ({
      ...item,
      fetched_at: item.fetched_at,
      published_at: item.published_at,
    }));
    const { error } = await this.client.from(this.rawTable).upsert(payload, { onConflict: 'id' });
    if (error) {
      console.error('Failed to upsert raw items', error);
    }
  }

  async listRawItems(filter?: RawItemFilter) {
    let query = this.client.from(this.rawTable).select('*').order('published_at', { ascending: false });
    if (filter?.connectorIds?.length) {
      query = query.in('connector_id', filter.connectorIds);
    }
    if (filter?.since) {
      query = query.gte('published_at', filter.since);
    }
    if (filter?.limit) {
      query = query.limit(filter.limit);
    }
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching raw items', error);
      return [];
    }
    return (data ?? []) as IngestedItem[];
  }

  async upsertClusters(clusters: StoryCluster[]) {
    const payload = clusters.map((cluster) => ({
      ...cluster,
      content_angles: cluster.content_angles,
      source_types: cluster.source_types,
      source_ids: cluster.source_ids,
    }));
    const { error } = await this.client.from(this.clusterTable).upsert(payload, { onConflict: 'id' });
    if (error) {
      console.error('Failed to upsert clusters', error);
    }
  }

  async listClusters(filter?: ClusterFilter) {
    let query = this.client.from(this.clusterTable).select('*').order('score', { ascending: false });
    if (filter?.since) {
      query = query.gte('updated_at', filter.since);
    }
    if (filter?.category) {
      query = query.eq('category', filter.category);
    }
    if (filter?.regionTag) {
      query = query.eq('region_tag', filter.regionTag);
    }
    if (filter?.includeAustraliaOnly) {
      query = query.or('region_tag.eq.australia,category.eq.australia_ai');
    }
    if (filter?.minScore) {
      query = query.gte('score', filter.minScore);
    }
    if (filter?.sourceType) {
      query = query.contains('source_types', [filter.sourceType]);
    }
    if (filter?.limit) {
      query = query.limit(filter.limit);
    }
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching clusters', error);
      return [];
    }
    return (data ?? []) as StoryCluster[];
  }

  async getClusterById(id: string) {
    const { data } = await this.client
      .from(this.clusterTable)
      .select('*')
      .eq('id', id)
      .limit(1)
      .maybeSingle();
    return (data as StoryCluster) ?? null;
  }

  async getSetting<T>(key: string) {
    const { data } = await this.client.from('settings').select('value').eq('key', key).maybeSingle();
    return (data?.value as T) ?? null;
  }

  async setSetting(key: string, value: unknown) {
    await this.client.from('settings').upsert({ key, value }, { onConflict: 'key' });
  }
}

const store: DataStore = supabaseClient
  ? new SupabaseDataStore(ensureSupabase())
  : new MemoryDataStore();

export default store;
