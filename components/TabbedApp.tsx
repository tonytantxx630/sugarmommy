"use client";

import { useEffect, useMemo, useState } from "react";
import InputTab from "./InputTab";
import GraphTab from "./GraphTab";

export type MealType = "empty stomach" | "after meal";

export type RecordRow = {
  id: number;
  meal_type: MealType;
  sugar_level: number;
  comment: string | null;
  created_at: string;
};

type Tab = "Input" | "Graph";

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
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const header = useMemo(() => {
    return (
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-xl font-semibold">sugarmommy</h1>
          <p className="text-sm text-slate-600">Track blood glucose levels (empty stomach vs after meal)</p>
        </div>
        <div className="flex gap-2">
          <button
            className={`rounded px-3 py-1 text-sm ${tab === "Input" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-900"}`}
            onClick={() => setTab("Input")}
          >
            Input
          </button>
          <button
            className={`rounded px-3 py-1 text-sm ${tab === "Graph" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-900"}`}
            onClick={() => setTab("Graph")}
          >
            Graph
          </button>
        </div>
      </div>
    );
  }, [tab]);

  return (
    <div className="mx-auto max-w-3xl p-6">
      {header}

      {error ? (
        <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
      ) : null}

      {loading ? (
        <div className="mt-4 text-sm text-slate-600">Loading…</div>
      ) : tab === "Input" ? (
        <InputTab onRecorded={refresh} />
      ) : (
        <GraphTab records={records} />
      )}
    </div>
  );
}
