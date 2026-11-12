import { getAllClusters, CATEGORY_FILTERS } from '@/lib/api';
import { ClusterCard } from '@/app/components/cluster-card';

type SearchParams = {
  category?: string;
  sourceType?: string;
  australia?: string;
  minScore?: string;
};

export default async function AllStoriesPage({ searchParams }: { searchParams: SearchParams }) {
  const filter = {
    category: searchParams.category,
    sourceType: searchParams.sourceType,
    includeAustraliaOnly: searchParams.australia === 'true',
    minScore: searchParams.minScore ? Number(searchParams.minScore) : undefined,
  };

  const clusters = await getAllClusters(filter);

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3">
        <h2 className="text-3xl font-semibold">All story clusters</h2>
        <p className="text-sm text-slate-500">Filter by category, source type, or highlight Australian signals.</p>
        <div className="flex flex-wrap gap-2 text-sm">
          {CATEGORY_FILTERS.map((category) => (
            <a
              key={category}
              href={`/all?category=${category}`}
              className="px-3 py-1 rounded-full border border-slate-200 bg-white text-slate-700"
            >
              {category.replace('_', ' ')}
            </a>
          ))}
          <a
            href="/all?australia=true"
            className="px-3 py-1 rounded-full border border-slate-200 bg-slate-200 text-slate-700"
          >
            Australia
          </a>
        </div>
      </header>
      {clusters.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6 text-center text-slate-500">
          No stories matching that filter yet.
        </div>
      ) : (
        <div className="space-y-4">
          {clusters.map((cluster) => (
            <ClusterCard key={cluster.id} cluster={cluster} />
          ))}
        </div>
      )}
    </section>
  );
}
