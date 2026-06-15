"use client";

import { useState } from "react";
import { SCS_ITEMS, SCS_CHOICES, scoreScs, ScsResult } from "@/lib/psych/scs";
import { savePsych } from "@/lib/store/results";
import { CrisisModal } from "./CrisisModal";

export function PsychTest({ onDone }: { onDone?: (r: ScsResult) => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<ScsResult | null>(null);
  const [crisis, setCrisis] = useState(false);

  const answered = Object.keys(answers).length;
  const allDone = answered === SCS_ITEMS.length;

  function submit() {
    const r = scoreScs(answers);
    setResult(r);
    savePsych(r);
    onDone?.(r);
    // 자책이 매우 무거운 경우, 안전 안내를 함께 띄운다.
    if (r.band === "low" && r.total <= 1.8) setCrisis(true);
  }

  function reset() {
    setAnswers({});
    setResult(null);
  }

  if (result) {
    return (
      <div className="space-y-5 fade-up">
        <div>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            자기자비 정도 · {result.bandLabel}
          </p>
          <p className="mt-1 text-xl font-semibold leading-snug">{result.headline}</p>
          <ScsMeter value={result.total} />
          <p className="mt-3 text-sm leading-relaxed">{result.body}</p>
        </div>

        <div className="rounded-xl border p-4" style={{ borderColor: "#A9BE9E" }}>
          <p className="text-xs font-medium" style={{ color: "#647f58" }}>
            지금 가장 다정함을 늘릴 여지: {result.reframe.focus}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed">{result.reframe.line}</p>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium" style={{ color: "var(--muted)" }}>
            여섯 갈래로 본 결 (높을수록 그 방향이 강함)
          </p>
          <ul className="space-y-2">
            {result.subscales.map((s) => (
              <li key={s.subscale} className="flex items-center gap-2 text-sm">
                <span className="w-24 shrink-0" style={{ color: "var(--muted)" }}>
                  {s.label}
                </span>
                <span className="h-2 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: "var(--line)" }}>
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${(s.mean / 5) * 100}%`, backgroundColor: "#7c9a6e" }}
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
          근거: 자기자비척도 단축형(SCS-SF, Raes·Neff 외)을 12문항으로 옮긴 간이 자가검사예요.
          진단이 아니고, 점수가 낮아도 ‘문제’가 아니라 ‘다정함을 늘릴 여지’일 뿐이에요.
        </p>
        <button onClick={reset} className="btn-ghost">
          다시 해보기
        </button>
        {crisis && <CrisisModal onClose={() => setCrisis(false)} />}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-sm" style={{ color: "var(--muted)" }}>
        12문항 · 약 1분. 정답은 없어요. 요즘의 나에 가장 가까운 쪽을 고르면 돼요.
      </p>
      <ol className="space-y-5">
        {SCS_ITEMS.map((it, idx) => (
          <li key={it.id}>
            <p className="text-sm">
              <span style={{ color: "var(--muted)" }}>{idx + 1}.</span> {it.text}
            </p>
            <div className="mt-2 grid grid-cols-5 gap-1.5">
              {SCS_CHOICES.map((c) => {
                const on = answers[it.id] === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setAnswers((a) => ({ ...a, [it.id]: c.value }))}
                    className="rounded-lg border px-1 py-2 text-center text-[11px] leading-tight"
                    style={on ? { borderColor: "#7c9a6e", backgroundColor: "var(--line)", fontWeight: 600 } : {}}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ol>
      <div className="sticky bottom-3">
        <button onClick={submit} disabled={!allDone} className="btn-primary w-full">
          {allDone ? "결과 보기" : `${answered} / ${SCS_ITEMS.length} 답함`}
        </button>
      </div>
    </div>
  );
}

function ScsMeter({ value }: { value: number }) {
  const pct = ((value - 1) / 4) * 100; // 1~5 → 0~100%
  return (
    <div className="mt-3">
      <div className="h-2.5 overflow-hidden rounded-full" style={{ backgroundColor: "var(--line)" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: "#647f58" }} />
      </div>
      <div className="mt-1 flex justify-between text-[11px]" style={{ color: "var(--muted)" }}>
        <span>자책이 무거움</span>
        <span>{value.toFixed(1)} / 5</span>
        <span>이미 다정함</span>
      </div>
    </div>
  );
}
