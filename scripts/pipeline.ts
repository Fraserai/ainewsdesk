import { runStoryPipeline } from '@/lib/pipeline';

async function main() {
  const result = await runStoryPipeline();
  console.log('Pipeline finished', result);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
