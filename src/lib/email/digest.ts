import nodemailer from 'nodemailer';
import dataStore from '../dataStore';
import { getTodayClusters } from '../api';

function buildHtml(
  clusters: {
    title: string;
    short_summary: string;
    score: number;
    category: string;
    source_count: number;
    content_angles: { label: string; text: string }[];
  }[],
) {
  const rows = clusters
    .map((cluster) => {
      const angles = cluster.content_angles
        .map((angle) => `<li><strong>${angle.label}:</strong> ${angle.text}</li>`)
        .join('');
      return `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">
            <strong>${cluster.title}</strong>
            <p style="margin:4px 0;font-size:0.875rem;color:#555;">
              ${cluster.category} • Score ${cluster.score.toFixed(1)} • ${cluster.source_count} sources
            </p>
            <p style="margin:0 0 8px;">${cluster.short_summary}</p>
            <ul style="margin:0;padding-left:18px;">${angles}</ul>
          </td>
        </tr>
      `;
    })
    .join('');

  return `
    <html>
      <body style="font-family:system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin:0;padding:24px;background:#f7f7f7;">
        <div style="max-width:720px;margin:0 auto;background:#fff;padding:24px;border-radius:12px;">
          <h2 style="margin-top:0;">AI News Desk Digest</h2>
          <p style="margin-top:0;color:#444;">Snapshot of the top clusters for the last 24 hours.</p>
          <table role="presentation" style="width:100%;border-collapse:collapse;">${rows}</table>
        </div>
      </body>
    </html>
  `;
}

export async function sendDailyDigest() {
  const recipient = process.env.DIGEST_RECIPIENT;
  if (!recipient) {
    console.warn('Daily digest recipient missing, skipping email.');
    return;
  }

  const clusters = await getTodayClusters();
  if (!clusters.length) {
    console.info('No clusters to include in digest.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const html = buildHtml(
    clusters.map((cluster) => ({
      title: cluster.title,
      short_summary: cluster.short_summary,
      score: cluster.score,
      category: cluster.category,
      source_count: cluster.source_count,
      content_angles: cluster.content_angles,
    })),
  );

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'no-reply@ainewsdesk.internal',
    to: recipient,
    subject: `AI News Desk – ${new Date().toLocaleDateString('en-AU')}`,
    html,
  });

  await dataStore.setSetting('last_digest_run', {
    ranAt: new Date().toISOString(),
    clusters: clusters.map((cluster) => cluster.id),
  });
}
