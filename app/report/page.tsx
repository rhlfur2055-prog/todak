"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toPng } from "html-to-image";
import { ComfortCard } from "@/components/ComfortCard";
import { FunLabel, RefLabel } from "@/components/Disclaimer";
import { pickComfortCard } from "@/lib/comfort/messages";
import { loadProfiles } from "@/lib/store/profiles";
import { loadFace, loadHand, loadPsych, clearResults, type Stamped } from "@/lib/store/results";
import type { ReadingResult } from "@/lib/face/vision";
import type { ScsResult } from "@/lib/psych/scs";
import { computeSaju, type BirthInput } from "@/lib/saju/engine";
import { computeFortuneSeries } from "@/lib/saju/fortune";
import { interpret } from "@/lib/saju/interpret";
import { lunarToSolar } from "@/lib/saju/lunar";

interface SajuSummary {
  name?: string;
  dayStem: string;
  dayElement: string;
  keyword: string;
  phase: string;
  nowScore: number;
}

export default function ReportPage() {
  const [saju, setSaju] = useState<SajuSummary | null>(null);
  const [face, setFace] = useState<Stamped<ReadingResult> | null>(null);
  const [hand, setHand] = useState<Stamped<ReadingResult> | null>(null);
  const [psych, setPsych] = useState<Stamped<ScsResult> | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setFace(loadFace());
    setHand(loadHand());
    setPsych(loadPsych());

    const profiles = loadProfiles();
    if (profiles.length > 0) {
      const v = profiles[0];
      let input: BirthInput = {
        year: v.year, month: v.month, day: v.day,
        hour: v.hour, minute: v.minute, hourUnknown: v.hourUnknown, gender: v.gender,
      };
      if (v.calendar === "lunar") {
        const s = lunarToSolar(v.year, v.month, v.day, v.isLeapMonth);
        if (s) input = { ...input, year: s.year, month: s.month, day: s.day };
      }
      try {
        const chart = computeSaju(input);
        const series = computeFortuneSeries(chart);
        const interp = interpret(chart, series.yong);
        const nowScore = series.seun[0]?.score ?? 50;
        setSaju({
          name: v.name,
          dayStem: chart.dayStem,
          dayElement: chart.dayElement,
          keyword: interp.dayStemTrait.keyword,
          phase: interp.phase,
          nowScore,
        });
      } catch {}
    }
    setReady(true);
  }, []);

  const comfort = useMemo(() => pickComfortCard(), []);
  const hasFun = !!(saju || face || hand);
  const anything = hasFun || !!psych;

  function reset() {
    clearResults();
    setFace(null);
    setHand(null);
    setPsych(null);
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <h1 className="text-2xl font-semibold">오늘의 나</h1>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
        오늘 본 것만 한 장에 모았어요. <b>재미(사주·관상)</b>와 <b>근거(마음 체크·위로)</b>를
        구분해서 보여드려요. 개인정보(생일·사진)는 담지 않아요.
      </p>

      {ready && !anything && (
        <div className="card mt-6 p-6 text-center">
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            아직 본 게 없어요. 하나 보고 오면 여기 모여요.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link href="/app" className="btn-ghost">운세 곡선</Link>
            <Link href="/face" className="btn-ghost">관상·손 모양</Link>
            <Link href="/check" className="btn-ghost">1분 마음 체크</Link>
          </div>
        </div>
      )}

      {/* 진심 — 위로 (항상) */}
      <section className="card mt-6 p-6" style={{ borderColor: "#A9BE9E" }}>
        <p className="mb-3 text-xs font-medium" style={{ color: "#647f58" }}>진심 · 오늘의 토닥</p>
        <ComfortCard />
      </section>

      {/* 근거 — 마음 체크 */}
      {psych && (
        <section className="card mt-5 p-6">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-xs font-medium" style={{ color: "#647f58" }}>근거 · 마음 체크</p>
            <RefLabel text="심리척도 기반" />
          </div>
          <p className="text-base font-semibold">{psych.data.headline}</p>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
            자기자비 {psych.data.total.toFixed(1)} / 5 · {psych.data.bandLabel}
          </p>
          <p className="mt-2 text-sm leading-relaxed">{psych.data.reframe.line}</p>
        </section>
      )}

      {/* 재미 — 사주 / 관상 / 손 모양 */}
      {hasFun && (
        <section className="mt-5">
          <div className="mb-2 flex items-center gap-2 px-1">
            <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>재미 · 전통 + 인상</span>
            <FunLabel text="재미로 봐주세요" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {saju && (
              <div className="card p-5">
                <p className="text-xs" style={{ color: "var(--muted)" }}>사주</p>
                <p className="mt-1 text-base">
                  일간 <b>{saju.dayStem}({saju.dayElement})</b> · <b>{saju.keyword}</b> 같은 사람
                </p>
                <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>{saju.phase}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="h-2 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: "var(--line)" }}>
                    <span className="block h-full rounded-full" style={{ width: `${saju.nowScore}%`, backgroundColor: "#647f58" }} />
                  </span>
                  <span className="text-xs" style={{ color: "var(--muted)" }}>지금 흐름</span>
                </div>
              </div>
            )}
            {face && (
              <div className="card p-5">
                <p className="text-xs" style={{ color: "var(--muted)" }}>관상</p>
                <p className="mt-1 text-base font-semibold">{face.data.keyword}</p>
                <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>{face.data.traits[0]}</p>
              </div>
            )}
            {hand && (
              <div className="card p-5">
                <p className="text-xs" style={{ color: "var(--muted)" }}>손 모양</p>
                <p className="mt-1 text-base font-semibold">{hand.data.keyword}</p>
                <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>{hand.data.traits[0]}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 공유 카드 */}
      {anything && (
        <section className="card mt-6 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">공유 카드</h2>
            <RefLabel text="개인정보 미포함" />
          </div>
          <ReportShareCard
            comfort={comfort.headline}
            psychLine={psych ? `자기자비 ${psych.data.total.toFixed(1)}/5 · ${psych.data.bandLabel}` : null}
            funLine={saju ? `${saju.keyword} 같은 사람` : face ? face.data.keyword : hand ? hand.data.keyword : null}
          />
        </section>
      )}

      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        <Link href="/app" className="btn-ghost">운세 곡선</Link>
        <Link href="/face" className="btn-ghost">관상·손 모양</Link>
        <Link href="/check" className="btn-ghost">마음 체크</Link>
        {anything && (
          <button onClick={reset} className="text-xs underline" style={{ color: "var(--muted)" }}>
            오늘 결과 지우기
          </button>
        )}
      </div>
    </div>
  );
}

function ReportShareCard({
  comfort,
  psychLine,
  funLine,
}: {
  comfort: string;
  psychLine: string | null;
  funLine: string | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!ref.current) return;
    setBusy(true);
    try {
      const url = await toPng(ref.current, { pixelRatio: 2, cacheBust: true });
      const a = document.createElement("a");
      a.href = url;
      a.download = "todak-오늘의나.png";
      a.click();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div
        ref={ref}
        className="overflow-hidden rounded-2xl border p-7"
        style={{ backgroundColor: "#FAF8F4", color: "#332E28", width: "100%", maxWidth: 560 }}
      >
        <span className="text-sm font-semibold">토닥 · 오늘의 나</span>
        <p className="mt-4 text-xl font-semibold leading-snug">{comfort}</p>
        <div className="mt-4 space-y-1.5 text-sm" style={{ color: "#7C7264" }}>
          {funLine && <p>· {funLine} <span className="text-[11px]">(재미)</span></p>}
          {psychLine && <p>· {psychLine} <span className="text-[11px]">(근거)</span></p>}
        </div>
        <p className="mt-5 text-xs" style={{ color: "#7C7264" }}>
          재미는 사주로, 위로는 진심으로 · todak
        </p>
      </div>
      <button className="btn-ghost" onClick={save} disabled={busy}>
        {busy ? "이미지 만드는 중…" : "공유 카드 이미지로 저장"}
      </button>
    </div>
  );
}
