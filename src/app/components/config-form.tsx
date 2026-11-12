'use client';

import { useState } from 'react';
import { ConnectorDefinition } from '@/lib/types';

export function ConfigForm({ connector }: { connector: ConnectorDefinition }) {
  const [priority, setPriority] = useState(connector.priority_weight);
  const [seeds, setSeeds] = useState(JSON.stringify(connector.seeds, null, 2));
  const [status, setStatus] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('Saving…');
    try {
      const payload: ConnectorDefinition = {
        ...connector,
        priority_weight: Number(priority),
        seeds: JSON.parse(seeds),
      };
      const response = await fetch('/api/connectors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error('save failed');
      }
      setStatus('Saved!');
    } catch (error) {
      console.error(error);
      setStatus('Unable to save.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{connector.name}</h3>
        <span className="text-xs uppercase tracking-[0.3em] text-slate-400">{connector.kind}</span>
      </div>
      <div className="text-sm text-slate-500">{connector.description}</div>
      <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Priority weight</label>
      <input
        type="number"
        value={priority}
        onChange={(event) => setPriority(Number(event.target.value))}
        className="w-full rounded-xl border border-slate-200 px-3 py-2"
      />
      <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Seeds (JSON)</label>
      <textarea
        rows={4}
        value={seeds}
        onChange={(event) => setSeeds(event.target.value)}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-xs"
      />
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{status}</span>
        <button type="submit" className="rounded-full bg-accent px-4 py-1 text-white">
          Save
        </button>
      </div>
    </form>
  );
}
