import dataStore from '../dataStore';
import { fetchConnectorItems } from '../connectors/registry';
import { ensureSeedConnectors } from '../seed/defaults';

export type IngestionResult = {
  connectorId: string;
  fetchedCount: number;
};

export async function runIngestion(): Promise<IngestionResult[]> {
  await ensureSeedConnectors();
  const connectors = await dataStore.listConnectors();
  const stats: IngestionResult[] = [];

  for (const connector of connectors) {
    const items = await fetchConnectorItems(connector);
    if (!items.length) {
      continue;
    }
    await dataStore.insertRawItems(items);
    stats.push({ connectorId: connector.id, fetchedCount: items.length });
  }

  return stats;
}
