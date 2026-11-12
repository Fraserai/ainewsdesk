import Link from 'next/link';
import { StoryCluster } from '@/lib/types';

const categoryLabels: Record<StoryCluster['category'], string> = {
  model_launch: 'Model launch',
  product_update: 'Product update',
  funding: 'Funding',
  startup_news: 'Startup news',
  demo: 'Demo',
  research: 'Research',
  regulation: 'Regulation',
  discourse: 'Discourse',
  australia_ai: 'Australia AI',
  other: 'Other',
};

export function ClusterCard({ cluster }: { cluster: StoryCluster }) {
  return (
    <article className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
      <header className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">{cluster.title}</h3>
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Score {cluster.score.toFixed(1)}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 rounded-full border border-slate-200 bg-slate-50">{categoryLabels[cluster.category] ?? 'Other'}</span>
          {cluster.region_tag === 'australia' ? (
            <span className="px-2 py-1 rounded-full bg-slate-900 text-white">Australia</span>
          ) : null}
          <span className="px-2 py-1 rounded-full border border-slate-200 bg-slate-50">{cluster.source_count} sources</span>
        </div>
      </header>
      <p className="text-slate-600">{cluster.short_summary}</p>
      <div className="grid gap-2 text-sm text-slate-600">
        <div className="text-slate-500">Why it matters: {cluster.why_it_matters}</div>
        <div className="flex flex-wrap gap-2">
          {cluster.content_angles.slice(0, 3).map((angle) => (
            <span key={angle.type} className="bg-slate-100 rounded-full px-3 py-1 text-xs text-slate-500">
              {angle.label}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between text-sm text-slate-500">
        <Link href={`/story/${cluster.id}`} className="font-medium text-accent hover:text-accent-strong">
          View story
        </Link>
        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">AI Desk</div>
      </div>
    </article>
  );
}
