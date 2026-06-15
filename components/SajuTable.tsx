import type { SajuChart, Pillar } from "@/lib/saju/engine";
import { ELEMENT_COLOR } from "@/lib/saju/constants";

function Cell({ p, head, isDay }: { p: Pillar | null; head: string; isDay?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-1 text-xs" style={{ color: "var(--muted)" }}>
        {head}
        {isDay ? " (일간)" : ""}
      </div>
      {p ? (
        <div
          className="w-full rounded-xl border p-2 text-center"
          style={isDay ? { borderColor: "#7c9a6e" } : {}}
        >
          {/* 천간 */}
          <div
            className="rounded-lg py-2 text-2xl font-semibold"
            style={{ backgroundColor: ELEMENT_COLOR[p.stemElement] + "22", color: "var(--fg)" }}
          >
            {p.stem}
            <span className="ml-0.5 text-sm" style={{ color: "var(--muted)" }}>
              {p.hanja[0]}
            </span>
          </div>
          <div className="mt-0.5 text-[11px]" style={{ color: "var(--muted)" }}>
            {p.stemElement}
            {p.stemTenGod ? ` · ${p.stemTenGod}` : ""}
          </div>
          {/* 지지 */}
          <div
            className="mt-1.5 rounded-lg py-2 text-2xl font-semibold"
            style={{ backgroundColor: ELEMENT_COLOR[p.branchElement] + "22", color: "var(--fg)" }}
          >
            {p.branch}
            <span className="ml-0.5 text-sm" style={{ color: "var(--muted)" }}>
              {p.hanja[1]}
            </span>
          </div>
          <div className="mt-0.5 text-[11px]" style={{ color: "var(--muted)" }}>
            {p.branchElement} · {p.branchTenGod}
          </div>
        </div>
      ) : (
        <div
          className="flex w-full items-center justify-center rounded-xl border p-2 text-center text-xs"
          style={{ color: "var(--muted)", minHeight: 120 }}
        >
          시 모름
        </div>
      )}
    </div>
  );
}

export function SajuTable({ chart }: { chart: SajuChart }) {
  const { year, month, day, hour } = chart.pillars;
  return (
    <div className="grid grid-cols-4 gap-2">
      <Cell p={hour} head="시주" />
      <Cell p={day} head="일주" isDay />
      <Cell p={month} head="월주" />
      <Cell p={year} head="연주" />
    </div>
  );
}
