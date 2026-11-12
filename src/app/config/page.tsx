import { getConnectorList } from '@/lib/api';
import { ConfigForm } from '@/app/components/config-form';

export default async function ConfigPage() {
  const connectors = await getConnectorList();

  return (
    <section className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Sources & config</p>
        <h2 className="text-3xl font-semibold">Manage connectors & priorities</h2>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {connectors.map((connector) => (
          <ConfigForm key={connector.id} connector={connector} />
        ))}
      </div>
    </section>
  );
}
