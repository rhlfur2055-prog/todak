import type { SajuChart, Pillar } from "@/lib/saju/engine";
import { buildPillarView, type PillarView, type SinsalChip } from "@/lib/saju/pillars";

// 음양 배지 (+/−)
function YinBadge({ yin }: { yin: "양" | "음" }) {
  const yang = yin === "양";
  return (
    <span
      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold"
      style={{ backgroundColor: yang ? "#D99B72" : "#7E96B8", color: "#fff" }}
      title={yin}
    >
      {yang ? "+" : "−"}
    </span>
  );
}

function TenGodChip({ label }: { label: string }) {
  if (!label) return <div className="h-5" />;
  return (
    <span
      className="inline-block rounded-md px-2 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: "var(--line)", color: "var(--fg)" }}
    >
      {label}
    </span>
  );
}

function SinsalChips({ list }: { list: SinsalChip[] }) {
  const color = (t: SinsalChip["tone"]) =>
    t === "fortune"
      ? { bg: "#EBF1E6", fg: "#4f6446" }
      : t === "caution"
        ? { bg: "#F6E9E0", fg: "#B5683E" }
        : { bg: "var(--line)", fg: "var(--muted)" };
  return (
    <div className="flex flex-col items-center gap-1">
      {list.map((s, i) => {
        const c = color(s.tone);
        return (
          <span
            key={i}
            className="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: c.bg, color: c.fg }}
          >
            {s.name}
          </span>
        );
      })}
    </div>
  );
}

function Glyph({
  hanja, color, yin, shape,
}: {
  hanja: string; color: string; yin: "양" | "음"; shape: "circle" | "square";
}) {
  return (
    <div className="relative flex justify-center">
      <div
        className={`flex h-14 w-14 items-center justify-center border-[2.5px] text-3xl font-semibold ${shape === "circle" ? "rounded-full" : "rounded-2xl"}`}
        style={{ borderColor: color, color }}
      >
        {hanja}
        <YinBadge yin={yin} />
      </div>
    </div>
  );
}

function PillarCard({ v }: { v: PillarView }) {
  return (
    <div
      className="flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3"
      style={v.isDay ? { borderColor: "#7c9a6e", backgroundColor: "var(--line)" } : { borderColor: "var(--line)" }}
    >
      <div className="text-xs" style={{ color: "var(--muted)" }}>{v.head}</div>

      {/* 천간 */}
      <TenGodChip label={v.stemTenGod} />
      <Glyph hanja={v.stemHanja} color={v.stemColor} yin={v.stemYin} shape="circle" />
      <div className="text-[11px]" style={{ color: "var(--muted)" }}>{v.stemElement}</div>

      {/* 지지 */}
      <Glyph hanja={v.branchHanja} color={v.branchColor} yin={v.branchYin} shape="square" />
      <div className="flex items-center gap-1 text-[11px]" style={{ color: "var(--muted)" }}>
        <span>{v.branchElement}</span>
        <span className="rounded px-1" style={{ backgroundColor: "#E7E2EF", color: "#6B5B95", fontSize: "10px" }}>{v.direction}</span>
      </div>
      <TenGodChip label={v.branchTenGod} />

      {/* 지장간 */}
      <div className="mt-1 flex items-end justify-center gap-1">
        {v.hidden.map((h, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="text-[9px]" style={{ color: "var(--muted)" }}>{h.tenGod}</span>
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full border text-[11px]"
              style={{ borderColor: h.color, color: h.color }}
            >
              {h.hanja}
            </span>
          </div>
        ))}
      </div>

      {/* 신살 */}
      <div className="mt-1 min-h-[18px]">
        <SinsalChips list={v.sinsal} />
      </div>

      {/* 십이운성 */}
      <div className="text-[11px]" style={{ color: "var(--muted)" }}>{v.stage}</div>
    </div>
  );
}

export function SajuTable({ chart }: { chart: SajuChart }) {
  const { year, month, day, hour } = chart.pillars;
  const cards: { p: Pillar | null; head: string; isDay: boolean }[] = [
    { p: hour, head: "시주", isDay: false },
    { p: day, head: "일주", isDay: true },
    { p: month, head: "월주", isDay: false },
    { p: year, head: "연주", isDay: false },
  ];
  return (
    <div className="-mx-1 overflow-x-auto pb-1">
      <div className="grid min-w-[460px] grid-cols-4 gap-2 px-1">
        {cards.map((c) =>
          c.p ? (
            <PillarCard key={c.head} v={buildPillarView(chart, c.p, c.head, c.isDay)} />
          ) : (
            <div
              key={c.head}
              className="flex flex-col items-center rounded-2xl border px-2 py-3"
              style={{ borderColor: "var(--line)" }}
            >
              <div className="text-xs" style={{ color: "var(--muted)" }}>{c.head}</div>
              <div className="flex flex-1 items-center justify-center text-center text-xs" style={{ color: "var(--muted)", minHeight: 160 }}>
                시 모름
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
