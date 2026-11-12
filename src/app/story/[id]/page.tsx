import { getClusterById, getRawItemsByIds } from '@/lib/api';

export default async function StoryDetailPage({ params }: { params: { id: string } }) {
  const cluster = await getClusterById(params.id);
  if (!cluster) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-slate-500">
        Story cluster not found.
      </div>
    );
  }

  const sources = await getRawItemsByIds(cluster.source_ids);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Story detail</p>
        <h1 className="text-4xl font-semibold">{cluster.title}</h1>
        <p className="text-slate-600">{cluster.short_summary}</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-3 shadow-sm">
          <p className="text-sm uppercase tracking-[0.4em] text-slate-400">Full summary</p>
          <p className="text-slate-700 whitespace-pre-line">{cluster.full_summary}</p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-3 shadow-sm">
          <p className="text-sm uppercase tracking-[0.4em] text-slate-400">Why it matters</p>
          <p className="text-slate-700">{cluster.why_it_matters}</p>
          <button className="w-full rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-strong">
            Generate Content Pack (placeholder)
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-4 shadow-sm">
        <h2 className="text-lg font-semibold">Suggested angles</h2>
        <div className="grid gap-2 md:grid-cols-3">
          {cluster.content_angles.map((angle) => (
            <div key={angle.type} className="rounded-xl border border-slate-100 p-3 text-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{angle.label}</p>
              <p className="text-slate-600">{angle.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Source items</h2>
        <div className="grid gap-3">
          {sources.map((source) => (
            <div key={source.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">
                {new Date(source.published_at).toLocaleString('en-AU', { dateStyle: 'short', timeStyle: 'short' })}
                {' • '}
                {source.source_name}
              </p>
              <a href={source.url} target="_blank" rel="noreferrer" className="text-lg font-semibold text-accent">
                {source.title}
              </a>
              <p className="text-slate-600">{source.raw_text.slice(0, 220)}…</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
