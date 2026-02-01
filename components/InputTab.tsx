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
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <div className="mb-1 text-sm font-medium">Meal Type</div>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value as MealType)}
            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Select…</option>
            <option value="empty stomach">empty stomach</option>
            <option value="after meal">after meal</option>
          </select>
        </label>

        <label className="block">
          <div className="mb-1 text-sm font-medium">Sugar Level</div>
          <input
            inputMode="numeric"
            value={sugarLevel}
            onChange={(e) => setSugarLevel(e.target.value)}
            placeholder="e.g. 92"
            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm"
          />
        </label>

        <label className="block sm:col-span-3">
          <div className="mb-1 text-sm font-medium">Comment (optional)</div>
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Notes…"
            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm"
          />
        </label>
      </div>

      {canRecord ? (
        <button
          onClick={record}
          disabled={saving}
          className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {saving ? "Recording…" : "Record"}
        </button>
      ) : (
        <div className="text-sm text-slate-600">Select meal type and enter an integer sugar level to enable Record.</div>
      )}

      {error ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div> : null}
    </div>
  );
}
