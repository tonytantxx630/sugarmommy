"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RecordRow } from "./TabbedApp";

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function GraphTab({ records }: { records: RecordRow[] }) {
  const empty = records.filter((r) => r.meal_type === "empty stomach");
  const after = records.filter((r) => r.meal_type === "after meal");

  return (
    <div className="mt-6">
      <div className="mb-3 text-sm text-white/60">Hover a dot to see comments.</div>

      <div className="h-[440px] w-full rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart margin={{ top: 10, right: 20, bottom: 30, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="t"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(t) => new Date(t as number).toLocaleDateString()}
              allowDuplicatedCategory={false}
            />
            <YAxis />
            <Tooltip
              content={({ payload }) => {
                if (!payload || payload.length === 0) return null;
                const p = payload[0]?.payload as unknown as RecordRow & { t: number };
                return (
                  <div className="rounded-xl border border-white/10 bg-slate-950/70 p-3 text-xs text-white shadow">
                    <div className="font-semibold">{p.meal_type}</div>
                    <div className="text-white/80">Level: {p.sugar_level}</div>
                    <div className="text-white/70">Time: {formatTime(p.created_at)}</div>
                    {p.comment ? <div className="mt-2 text-white/90">Comment: {p.comment}</div> : null}
                  </div>
                );
              }}
            />
            <Legend />

            <Line
              name="empty stomach"
              data={empty.map((r) => ({ ...r, t: new Date(r.created_at).getTime() }))}
              type="monotone"
              dataKey="sugar_level"
              stroke="#2563eb"
              dot={(props) => {
                const { cx, cy, payload } = props as unknown as { cx: number; cy: number; payload: RecordRow };
                const red = payload.sugar_level > 95;
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill={red ? "#ef4444" : "#2563eb"}
                    stroke="#fff"
                    strokeWidth={1}
                  />
                );
              }}
              connectNulls
            />

            <Line
              name="after meal"
              data={after.map((r) => ({ ...r, t: new Date(r.created_at).getTime() }))}
              type="monotone"
              dataKey="sugar_level"
              stroke="#16a34a"
              dot={(props) => {
                const { cx, cy, payload } = props as unknown as { cx: number; cy: number; payload: RecordRow };
                const red = payload.sugar_level > 120;
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill={red ? "#ef4444" : "#16a34a"}
                    stroke="#fff"
                    strokeWidth={1}
                  />
                );
              }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {records.length === 0 ? <div className="mt-3 text-sm text-slate-600">No records yet.</div> : null}
    </div>
  );
}
