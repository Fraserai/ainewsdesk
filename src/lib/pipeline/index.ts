import { runClustering } from './cluster';
import { runIngestion } from './ingest';

export async function runStoryPipeline() {
  const ingestion = await runIngestion();
  const clusters = await runClustering();
  return {
    ingestion,
    clusters,
  };
}
