"use client";

import type { RecordRow } from "./TabbedApp";

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

function RecordsTable({ title, records }: { title: string; records: RecordRow[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wide text-white/90">{title}</h3>
        <div className="text-xs text-white/60">{records.length} records</div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-white/50">
            <tr>
              <th className="px-3 py-2">Time</th>
              <th className="px-3 py-2">Level</th>
              <th className="px-3 py-2">Comment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {records.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-white/60" colSpan={3}>
                  No records yet.
                </td>
              </tr>
            ) : (
              records
                .slice()
                .reverse()
                .map((r) => (
                  <tr key={r.id} className="hover:bg-white/5">
                    <td className="whitespace-nowrap px-3 py-2 text-white/80">{formatTime(r.created_at)}</td>
                    <td className="px-3 py-2 font-medium text-white">{r.sugar_level}</td>
                    <td className="max-w-[28rem] px-3 py-2 text-white/70">
                      {r.comment ? r.comment : <span className="text-white/30">—</span>}
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function TableTab({ records }: { records: RecordRow[] }) {
  const empty = records.filter((r) => r.meal_type === "empty stomach");
  const after = records.filter((r) => r.meal_type === "after meal");

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <RecordsTable title="Empty stomach" records={empty} />
      <RecordsTable title="After meal" records={after} />
    </div>
  );
}
