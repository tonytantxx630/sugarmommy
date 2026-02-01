"use client";

import { useMemo, useState } from "react";
import type { MealType } from "./TabbedApp";

export default function InputTab({ onRecorded }: { onRecorded: () => void }) {
  const [mealType, setMealType] = useState<MealType | "">("");
  const [sugarLevel, setSugarLevel] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const sugarInt = useMemo(() => {
    if (sugarLevel.trim() === "") return null;
    const n = Number(sugarLevel);
    if (!Number.isInteger(n)) return null;
    return n;
  }, [sugarLevel]);

  const canRecord = mealType !== "" && sugarInt !== null;

  async function record() {
    if (!canRecord) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mealType, sugarLevel: sugarInt, comment }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`POST /api/records failed (${res.status}): ${t}`);
      }
      setSugarLevel("");
      setComment("");
      onRecorded();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-white">New reading</h2>
          <p className="text-sm text-white/60">Enter a meal type and glucose level. Comment is optional.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <div className="mb-1 text-sm font-medium text-white/80">Meal Type</div>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value as MealType)}
              className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-cyan-400/60"
            >
              <option value="">Select…</option>
              <option value="empty stomach">empty stomach</option>
              <option value="after meal">after meal</option>
            </select>
          </label>

          <label className="block">
            <div className="mb-1 text-sm font-medium text-white/80">Sugar Level</div>
            <input
              inputMode="numeric"
              value={sugarLevel}
              onChange={(e) => setSugarLevel(e.target.value)}
              placeholder="e.g. 92"
              className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-fuchsia-400/60"
            />
          </label>

          <label className="block sm:col-span-3">
            <div className="mb-1 text-sm font-medium text-white/80">Comment</div>
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Optional notes…"
              className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-white/30"
            />
          </label>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          {canRecord ? (
            <button
              onClick={record}
              disabled={saving}
              className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-white/90 disabled:opacity-50"
            >
              {saving ? "Recording…" : "Record"}
            </button>
          ) : (
            <div className="text-sm text-white/60">Fill meal type + integer level to enable Record.</div>
          )}

          <div className="text-xs text-white/40">Stored to Postgres via /api/records</div>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}
      </div>
    </div>
  );
}
