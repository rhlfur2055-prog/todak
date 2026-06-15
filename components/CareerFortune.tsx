import type { CareerReading, CareerTiming } from "@/lib/saju/career";
import type { Category } from "@/lib/saju/fortune";

const CAT_COLOR: Record<Category, string> = {
  관성: "#7E96B8",
  인성: "#7C9A6E",
  재성: "#C7A77B",
  식상: "#D99B72",
  비겁: "#A9B0B8",
};

function TimingRow({ t }: { t: CareerTiming }) {
  return (
    <li
      className="flex items-center gap-3 rounded-xl border p-3"
      style={t.recommended ? { borderColor: "#7c9a6e", backgroundColor: "var(--line)" } : { borderColor: "var(--line)" }}
    >
      <div className="w-14 shrink-0 text-center">
        <div className="text-sm font-semibold">{t.year}</div>
        <div className="text-[11px]" style={{ color: "var(--muted)" }}>{t.label}</div>
      </div>
      <span
        className="shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium text-white"
        style={{ backgroundColor: CAT_COLOR[t.category] }}
      >
        {t.category}
      </span>
      <p className="flex-1 text-xs leading-relaxed">
        {t.isThisYear && <b>올해 · </b>}
        {t.note}
      </p>
      {t.recommended && (
        <span className="shrink-0 text-[11px] font-medium" style={{ color: "#4f6446" }}>
          ★ 유리
        </span>
      )}
    </li>
  );
}

export function CareerFortune({ reading }: { reading: CareerReading }) {
  return (
    <div className="space-y-5">
      {/* 적성 / 추천 직군 */}
      <div>
        <p className="text-base">
          <b>{reading.aptitudeKeyword}</b>이에요.
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {reading.fields.map((f) => (
            <span
              key={f}
              className="rounded-full px-2.5 py-1 text-xs"
              style={{ backgroundColor: "var(--line)", color: "var(--fg)" }}
            >
              {f}
            </span>
          ))}
        </div>
        <p className="mt-2.5 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
          {reading.aptitudeReason}
        </p>
      </div>

      {/* 취업 유리 시기 */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium">취업·이직 유리한 시기 (앞으로 10년)</p>
          {reading.bestYears.length > 0 && (
            <p className="text-xs" style={{ color: "#4f6446" }}>
              주목: {reading.bestYears.join(" · ")}
            </p>
          )}
        </div>
        <ul className="space-y-1.5">
          {reading.timing.map((t) => (
            <TimingRow key={t.year} t={t} />
          ))}
        </ul>
        <p className="mt-2 text-[11px] leading-relaxed" style={{ color: "var(--muted)" }}>
          그 해 천간의 십성으로 본 ‘테마’예요. 관성·인성 해는 시험·합격·입사에, 재성·식상 해는 성과·실무·이직에 결이 맞아요. 참고용이에요.
        </p>
      </div>

      {/* 전략 팁 */}
      <div>
        <p className="mb-2 text-sm font-medium">취업 전략 한 스푼</p>
        <ul className="space-y-1.5 text-sm">
          {reading.tips.map((tip, i) => (
            <li key={i} className="flex gap-2 leading-relaxed">
              <span style={{ color: "#7c9a6e" }}>·</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
