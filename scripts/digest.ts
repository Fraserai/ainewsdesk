import { sendDailyDigest } from '@/lib/email/digest';

async function main() {
  await sendDailyDigest();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
