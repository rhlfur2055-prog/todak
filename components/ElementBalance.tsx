"use client";

import {
  PieChart, Pie, Cell, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from "recharts";
import type { SajuChart } from "@/lib/saju/engine";
import { ELEMENTS, ELEMENT_COLOR, Element } from "@/lib/saju/constants";

export function ElementBalance({ chart }: { chart: SajuChart }) {
  const data = ELEMENTS.map((e: Element) => ({
    name: e,
    value: chart.elementCount[e],
    color: ELEMENT_COLOR[e],
  }));
  const total = data.reduce((s, d) => s + d.value, 0) || 1;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={42}
                outerRadius={70}
                paddingAngle={2}
                stroke="none"
              >
                {data.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs">
          {data.map((d) => (
            <span key={d.name} className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              {d.name} {d.value} ({Math.round((d.value / total) * 100)}%)
            </span>
          ))}
        </div>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="72%">
            <PolarGrid stroke="var(--line)" />
            <PolarAngleAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 12 }} />
            <Radar
              dataKey="value"
              stroke="#647f58"
              fill="#7c9a6e"
              fillOpacity={0.35}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
