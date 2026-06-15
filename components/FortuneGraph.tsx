"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis,
  ReferenceLine, ReferenceDot, Tooltip, CartesianGrid,
} from "recharts";
import type { SajuChart } from "@/lib/saju/engine";
import type { FortuneSeries } from "@/lib/saju/fortune";
import { RefLabel } from "./Disclaimer";

type Tab = "daeun" | "seun" | "wolun";

interface Point {
  key: string;
  label: string; // 간지
  x: string; // 축 라벨
  score: number;
  reason: string;
  sub: string; // 보조 정보(나이/연도/절기)
  current?: boolean;
}

export function FortuneGraph({
  chart,
  series,
}: {
  chart: SajuChart;
  series: FortuneSeries;
}) {
  const [tab, setTab] = useState<Tab>("daeun");
  const thisYear = new Date().getFullYear();
  const curAge = thisYear - chart.input.year;

  const points = useMemo<Record<Tab, Point[]>>(() => {
    const daeun: Point[] = series.daeun.map((d) => {
      const endAge = d.startAge + 10;
      const current = curAge >= d.startAge && curAge < endAge;
      return {
        key: `d${d.startYear}`,
        label: d.label,
        x: `${Math.floor(d.startAge)}세`,
        score: d.score,
        reason: d.reason,
        sub: `${Math.floor(d.startAge)}~${Math.floor(endAge)}세 · ${d.startYear}년~`,
        current,
      };
    });
    const seun: Point[] = series.seun.map((s) => ({
      key: `s${s.year}`,
      label: s.label,
      x: `${s.year}`,
      score: s.score,
      reason: s.reason,
      sub: `${s.year}년 (${s.year - chart.input.year}세)`,
      current: s.isThisYear,
    }));
    const wolun: Point[] = series.wolun.map((w) => ({
      key: `w${w.month}`,
      label: w.label,
      x: `${w.month}월`,
      score: w.score,
      reason: w.reason,
      sub: `${w.termName} 절기 시작 · ${w.month}월령`,
    }));
    return { daeun, seun, wolun };
  }, [series, curAge, chart.input.year]);

  const data = points[tab];
  const [selected, setSelected] = useState<Point | null>(null);
  const active = selected ?? data.find((p) => p.current) ?? data[0];

  const currentPoint = data.find((p) => p.current);

  const tabs: { id: Tab; label: string; hint: string }[] = [
    { id: "daeun", label: "대운 (10년 단위)", hint: "인생 전체 흐름" },
    { id: "seun", label: "세운 (올해~10년)", hint: "연도별 흐름" },
    { id: "wolun", label: "월운 (올해 12개월)", hint: "올해 달별 흐름" },
  ];

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id);
              setSelected(null);
            }}
            className="rounded-xl border px-3 py-1.5 text-sm"
            style={
              tab === t.id
                ? { borderColor: "#7c9a6e", backgroundColor: "var(--line)", fontWeight: 500 }
                : {}
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 12, left: -18, bottom: 0 }}
            onClick={(e: any) => {
              const p = e?.activePayload?.[0]?.payload as Point | undefined;
              if (p) setSelected(p);
            }}
          >
            <defs>
              <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c9a6e" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#7c9a6e" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--line)" vertical={false} />
            <XAxis dataKey="x" tick={{ fill: "var(--muted)", fontSize: 11 }} tickLine={false} />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <ReferenceLine y={50} stroke="var(--muted)" strokeDasharray="4 4" />
            <Tooltip
              cursor={{ stroke: "#7c9a6e", strokeWidth: 1 }}
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--line)",
                borderRadius: 12,
                fontSize: 12,
                color: "var(--fg)",
              }}
              formatter={(v: any) => [`${v}점`, "운세 점수"]}
              labelFormatter={(l: any, pl: any) => {
                const p = pl?.[0]?.payload as Point | undefined;
                return p ? `${l} · ${p.label}` : l;
              }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#647f58"
              strokeWidth={2}
              fill="url(#fg)"
              dot={{ r: 3, fill: "#647f58" }}
              activeDot={{ r: 5 }}
            />
            {currentPoint && (
              <ReferenceDot
                x={currentPoint.x}
                y={currentPoint.score}
                r={6}
                fill="#D99B72"
                stroke="var(--card)"
                strokeWidth={2}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-1 text-center text-xs" style={{ color: "var(--muted)" }}>
        곡선의 한 점을 누르면 “왜 이 시기가 이런지” 설명이 나와요.
        {currentPoint ? " 살구색 점이 지금 시기예요." : ""}
      </p>

      {active && (
        <div className="mt-3 rounded-xl border p-4" style={{ backgroundColor: "var(--bg)" }}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold">{active.label}</span>
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                {active.sub}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">
                운세 점수{" "}
                <b style={{ color: active.score >= 50 ? "#647f58" : "#C07F55" }}>
                  {active.score}
                </b>
                <span style={{ color: "var(--muted)" }}> / 100</span>
              </span>
              <RefLabel />
            </div>
          </div>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--fg)" }}>
            {active.reason}
          </p>
          <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
            점수는 50점이 평균(중립)이에요. 내 일간({chart.dayStem})에게 유리한 오행이
            들어오면 올라가고, 부담이 되는 오행이면 내려가는 상대적 표현일 뿐, 좋고
            나쁨의 단정이 아니에요.
          </p>
        </div>
      )}
    </div>
  );
}
