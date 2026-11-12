import cron from 'node-cron';
import { runStoryPipeline } from './pipeline';
import { sendDailyDigest } from './email/digest';

let initialized = false;

export function startCronJobs() {
  if (initialized || process.env.NODE_ENV === 'test' || process.env.DISABLE_CRON === 'true') {
    return;
  }
  initialized = true;

  const pipelineSchedule = process.env.PIPELINE_CRON || '0 * * * *';
  const digestSchedule = process.env.DIGEST_CRON || '0 8 * * *';

  cron.schedule(pipelineSchedule, async () => {
    try {
      await runStoryPipeline();
    } catch (err) {
      console.error('Pipeline cron failed', err);
    }
  }, { timezone: 'Australia/Sydney' });

  cron.schedule(digestSchedule, async () => {
    try {
      await sendDailyDigest();
    } catch (err) {
      console.error('Digest cron failed', err);
    }
  }, { timezone: 'Australia/Sydney' });
}
