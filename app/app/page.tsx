"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BirthForm, BirthFormValue } from "@/components/BirthForm";
import { SajuTable } from "@/components/SajuTable";
import { FortuneGraph } from "@/components/FortuneGraph";
import { ElementBalance } from "@/components/ElementBalance";
import { ComfortCard, BreathingTool, JournalTool } from "@/components/ComfortCard";
import { ShareCard } from "@/components/ShareCard";
import { CareerFortune } from "@/components/CareerFortune";
import { FunLabel, RefLabel } from "@/components/Disclaimer";
import { computeSaju, BirthInput } from "@/lib/saju/engine";
import { computeFortuneSeries } from "@/lib/saju/fortune";
import { interpret } from "@/lib/saju/interpret";
import { readCareer } from "@/lib/saju/career";
import { lunarToSolar } from "@/lib/saju/lunar";
import { Profile, loadProfiles, saveProfile, deleteProfile } from "@/lib/store/profiles";

function toSolarInput(v: BirthFormValue): { input: BirthInput; warn?: string } {
  if (v.calendar === "lunar") {
    const s = lunarToSolar(v.year, v.month, v.day, v.isLeapMonth);
    if (!s) {
      return {
        input: { year: v.year, month: v.month, day: v.day, hour: v.hour, minute: v.minute, hourUnknown: v.hourUnknown, gender: v.gender },
        warn: "음력→양력 변환 범위를 벗어나 입력값을 그대로 사용했어요.",
      };
    }
    return {
      input: { year: s.year, month: s.month, day: s.day, hour: v.hour, minute: v.minute, hourUnknown: v.hourUnknown, gender: v.gender },
    };
  }
  return { input: { year: v.year, month: v.month, day: v.day, hour: v.hour, minute: v.minute, hourUnknown: v.hourUnknown, gender: v.gender } };
}

export default function AppPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [active, setActive] = useState<BirthFormValue | null>(null);
  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    const list = loadProfiles();
    setProfiles(list);
    if (list.length > 0) {
      setActive(list[0]);
      setShowForm(false);
    }
  }, []);

  function onSubmit(v: BirthFormValue) {
    const p = saveProfile(v);
    setProfiles(loadProfiles());
    setActive(p);
    setShowForm(false);
  }

  function remove(id: string) {
    deleteProfile(id);
    const list = loadProfiles();
    setProfiles(list);
    if (list.length) {
      setActive(list[0]);
    } else {
      setActive(null);
      setShowForm(true);
    }
  }

  const result = useMemo(() => {
    if (!active) return null;
    const { input, warn } = toSolarInput(active);
    const chart = computeSaju(input);
    const series = computeFortuneSeries(chart);
    const interp = interpret(chart, series.yong);
    const career = readCareer(chart, series);
    return { chart, series, interp, career, warn };
  }, [active]);

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      {/* 프로필 바 */}
      {profiles.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {profiles.map((p) => (
            <div
              key={p.id}
              className="group flex items-center gap-1 rounded-xl border px-3 py-1.5 text-sm"
              style={
                active && "id" in active && (active as Profile).id === p.id
                  ? { borderColor: "#7c9a6e", backgroundColor: "var(--line)" }
                  : {}
              }
            >
              <button onClick={() => { setActive(p); setShowForm(false); }}>
                {p.name || `${p.year}.${p.month}.${p.day}`}
              </button>
              <button
                onClick={() => remove(p.id)}
                className="ml-1 text-xs opacity-40 hover:opacity-100"
                aria-label="삭제"
              >
                ✕
              </button>
            </div>
          ))}
          <button onClick={() => { setShowForm(true); setActive(null); }} className="btn-ghost">
            + 프로필 추가
          </button>
        </div>
      )}

      {showForm && (
        <div className="mx-auto max-w-md">
          <h1 className="text-xl font-semibold">생년월일을 넣어주세요</h1>
          <p className="mb-5 mt-1 text-sm" style={{ color: "var(--muted)" }}>
            나, 가족, 친구의 운세 곡선을 볼 수 있어요. 입력값은 이 브라우저에만 남아요.
          </p>
          <div className="card p-5">
            <BirthForm onSubmit={onSubmit} />
          </div>
        </div>
      )}

      {result && active && (
        <div className="space-y-6">
          {result.warn && (
            <p className="text-sm" style={{ color: "#C07F55" }}>
              {result.warn}
            </p>
          )}

          {/* 헤드라인: 운세 그래프 */}
          <section className="card p-5 fade-up">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">내 운세 곡선</h2>
              <FunLabel text="명리 규칙 기반 휴리스틱 · 참고용" />
            </div>
            <p className="mb-4 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              {result.series.yong.summary}
            </p>
            <FortuneGraph chart={result.chart} series={result.series} />
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* 사주팔자 */}
            <section className="card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">사주팔자</h2>
                <RefLabel text="만세력 계산" />
              </div>
              <SajuTable chart={result.chart} />
              <p className="mt-3 text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                일간(나)은 <b>{result.chart.dayStem}({result.chart.dayElement})</b>.{" "}
                {result.chart.input.hourUnknown ? "시 모름으로 6자만 사용했어요." : ""} 절기·표준시
                기준의 자동 계산이며 참고용이에요.
              </p>
            </section>

            {/* 오행 밸런스 */}
            <section className="card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">오행 밸런스</h2>
                <RefLabel />
              </div>
              <ElementBalance chart={result.chart} />
            </section>
          </div>

          {/* 사주 성향 (재미) */}
          <section className="card p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">사주 성향</h2>
              <FunLabel />
            </div>
            <p className="text-base">
              <b>{result.interp.dayStemTrait.keyword}</b> 같은 사람이에요.{" "}
              {result.interp.dayStemTrait.desc}
            </p>
            <div className="mt-3 space-y-2 text-sm leading-relaxed">
              {result.interp.dayStemDetail.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
            <p className="mb-1 mt-4 text-xs font-medium" style={{ color: "var(--muted)" }}>
              타고난 강점
            </p>
            <ul className="space-y-1.5 text-sm">
              {result.interp.strengths.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span style={{ color: "#7c9a6e" }}>·</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>
              {result.interp.elementNote}
            </p>
            <p className="mt-2 text-sm leading-relaxed">{result.interp.elementDetail}</p>
            <p className="mt-2 text-sm">{result.interp.phase}</p>
          </section>

          {/* 직업·취업운 (취준 핵심) */}
          <section className="card p-5" style={{ borderColor: "#A9BE9E" }}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">직업·취업운</h2>
              <FunLabel text="명리 기반 · 참고용" />
            </div>
            <CareerFortune reading={result.career} />
          </section>

          {/* 내 안의 기운 (십성) */}
          {result.interp.tenGodNotes.length > 0 && (
            <section className="card p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">내 안의 기운 (십성)</h2>
                <FunLabel />
              </div>
              <p className="mb-3 text-sm" style={{ color: "var(--muted)" }}>
                사주에 들어 있는 기운들이에요. 이 조합이 성향과 운의 결을 만들어요.
              </p>
              <ul className="space-y-2.5">
                {result.interp.tenGodNotes.map((g, i) => (
                  <li key={i} className="text-sm leading-relaxed">
                    <b>{g.label}</b> — {g.text}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 분야별 운세 */}
          <section className="card p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">분야별 운세</h2>
              <FunLabel />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {result.interp.lifeAreas.map((a) => (
                <div
                  key={a.key}
                  className="rounded-xl border p-4"
                  style={{ borderColor: "var(--line)" }}
                >
                  <p className="mb-1.5 text-sm font-semibold" style={{ color: "#7c9a6e" }}>
                    {a.title}
                  </p>
                  <p className="text-sm leading-relaxed">{a.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 나를 돕는 기운 + 신살 */}
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="card p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">나를 돕는 기운</h2>
                <FunLabel text="용신 기반 · 재미로" />
              </div>
              <dl className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0" style={{ color: "var(--muted)" }}>행운 색</dt>
                  <dd>{result.interp.luck.colors}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0" style={{ color: "var(--muted)" }}>방향</dt>
                  <dd>{result.interp.luck.directions}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0" style={{ color: "var(--muted)" }}>계절</dt>
                  <dd>{result.interp.luck.seasons}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0" style={{ color: "var(--muted)" }}>도움 되는 것</dt>
                  <dd>{result.interp.luck.advice}</dd>
                </div>
              </dl>
            </section>

            {result.interp.sinsal.length > 0 && (
              <section className="card p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold">신살 한 스푼</h2>
                  <FunLabel />
                </div>
                <ul className="space-y-2.5">
                  {result.interp.sinsal.map((s, i) => (
                    <li key={i} className="text-sm leading-relaxed">
                      <b>{s.name}</b> — {s.text}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* 위로 코어 */}
          <section className="card p-6" style={{ borderColor: "#A9BE9E" }}>
            <p className="mb-3 text-xs" style={{ color: "var(--muted)" }}>
              오늘의 토닥
            </p>
            <ComfortCard />
          </section>

          {/* 위로 도구 */}
          <div className="grid gap-6 sm:grid-cols-2">
            <section className="card p-5">
              <h2 className="mb-2 text-base font-semibold">1분 호흡</h2>
              <BreathingTool />
            </section>
            <section className="card p-5">
              <h2 className="mb-2 text-base font-semibold">한 줄 일기</h2>
              <JournalTool />
            </section>
          </div>

          {/* 공유 카드 */}
          <section className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">공유 카드</h2>
              <RefLabel text="개인정보 미포함" />
            </div>
            <ShareCard series={result.series} />
          </section>

          {/* 더 해보기 */}
          <section className="card p-5">
            <h2 className="mb-3 text-base font-semibold">이어서, 가볍게</h2>
            <div className="grid gap-2 sm:grid-cols-3">
              <Link href="/face" className="btn-ghost text-center">관상·손 모양</Link>
              <Link href="/check" className="btn-ghost text-center">1분 마음 체크</Link>
              <Link href="/report" className="btn-ghost text-center">오늘의 나 리포트</Link>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
