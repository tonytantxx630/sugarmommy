"use client";

import { useEffect, useMemo, useState } from "react";
import InputTab from "./InputTab";
import GraphTab from "./GraphTab";
import TableTab from "./TableTab";

export type MealType = "empty stomach" | "after meal";

export type RecordRow = {
  id: number;
  meal_type: MealType;
  sugar_level: number;
  comment: string | null;
  created_at: string;
};

type Tab = "Input" | "Graph" | "Table";

export default function TabbedApp() {
  const [tab, setTab] = useState<Tab>("Input");
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/records", { cache: "no-store" });
      if (!res.ok) throw new Error(`GET /api/records failed (${res.status})`);
      const data = (await res.json()) as RecordRow[];
      setRecords(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const header = useMemo(() => {
    const tabs: Tab[] = ["Input", "Graph", "Table"];

    return (
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-fuchsia-500 to-cyan-400" />
            <div>
              <h1 className="text-xl font-semibold text-white">sugarmommy</h1>
              <p className="text-sm text-white/60">Glucose tracking — empty stomach vs after meal</p>
            </div>
          </div>
        </div>

        <div className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur">
          {tabs.map((t) => (
            <button
              key={t}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                tab === t
                  ? "bg-white text-slate-900 shadow"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    );
  }, [tab]);

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_10%_0%,rgba(217,70,239,0.25),transparent_50%),radial-gradient(900px_circle_at_90%_20%,rgba(34,211,238,0.18),transparent_55%),linear-gradient(to_bottom,rgba(2,6,23,1),rgba(15,23,42,1))]">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {header}

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-6 text-sm text-white/60">Loading…</div>
        ) : tab === "Input" ? (
          <InputTab onRecorded={refresh} />
        ) : tab === "Graph" ? (
          <GraphTab records={records} />
        ) : (
          <TableTab records={records} />
        )}

        <div className="mt-10 text-xs text-white/40">
          Tip: red dots indicate out-of-range thresholds (empty stomach &gt; 95, after meal &gt; 120).
        </div>
      </div>
    </div>
  );
}
