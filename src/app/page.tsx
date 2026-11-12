import { getTodayClusters } from '@/lib/api';
import { ClusterCard } from './components/cluster-card';

export default async function TodayPage() {
  const clusters = await getTodayClusters();

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm">
          <p className="text-sm uppercase tracking-[0.4em] text-slate-400">Refresh cadence</p>
          <p className="text-2xl font-semibold">Live feed</p>
          <p className="text-sm text-slate-500">Pipeline runs every hour. Digest heads out at 8 AM AEST.</p>
        </div>
        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm">
          <p className="text-sm uppercase tracking-[0.4em] text-slate-400">Clusters tracked</p>
          <p className="text-2xl font-semibold">{clusters.length}</p>
          <p className="text-sm text-slate-500">Top {Math.min(12, clusters.length)} stories selected for Today.</p>
        </div>
        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm">
          <p className="text-sm uppercase tracking-[0.4em] text-slate-400">Australian AI lane</p>
          <p className="text-2xl font-semibold">
            {clusters.filter((cluster) => cluster.region_tag === 'australia' || cluster.category === 'australia_ai').length}
          </p>
          <p className="text-sm text-slate-500">Filtered view surfaces local policy, funding, and startups.</p>
        </div>
      </div>

      <div className="space-y-4">
        {clusters.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6 text-center text-slate-500">
            No stories yet. Run the pipeline or add sample seeds to populate.
          </div>
        ) : (
          clusters.map((cluster) => <ClusterCard key={cluster.id} cluster={cluster} />)
        )}
      </div>
    </section>
  );
}
