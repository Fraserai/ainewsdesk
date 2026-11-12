import dataStore from '../dataStore';
import { seedConnectors } from '../../data/seedConnectors';

export async function ensureSeedConnectors() {
  const existing = await dataStore.listConnectors();
  if (existing.length === 0) {
    await dataStore.upsertConnectors(seedConnectors);
  }
}
