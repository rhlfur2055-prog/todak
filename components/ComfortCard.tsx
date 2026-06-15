"use client";

import { useState } from "react";
import { pickComfortCard, detectCrisis } from "@/lib/comfort/messages";
import { CrisisModal } from "./CrisisModal";

export function ComfortCard() {
  const card = pickComfortCard();
  return (
    <div className="space-y-3">
      <p className="text-sm" style={{ color: "var(--muted)" }}>
        {card.mindfulness}
      </p>
      <p className="text-sm" style={{ color: "var(--muted)" }}>
        {card.commonHumanity}
      </p>
      <p className="text-2xl font-semibold leading-snug">{card.headline}</p>
      <p className="text-sm" style={{ color: "var(--fg)" }}>
        {card.selfKindness}
      </p>
    </div>
  );
}

// 1분 호흡
export function BreathingTool() {
  const [running, setRunning] = useState(false);
  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div
        className={`flex h-28 w-28 items-center justify-center rounded-full border text-sm ${running ? "breathe" : ""}`}
        style={{ borderColor: "#7c9a6e", color: "var(--muted)" }}
      >
        {running ? "들이쉬고 · 내쉬고" : "준비됐을 때"}
      </div>
      <button className="btn-ghost" onClick={() => setRunning((v) => !v)}>
        {running ? "멈추기" : "1분 호흡 시작"}
      </button>
      <style jsx>{`
        .breathe {
          animation: breathe 8s ease-in-out infinite;
        }
        @keyframes breathe {
          0%, 100% { transform: scale(0.85); }
          50% { transform: scale(1.12); }
        }
        @media (prefers-reduced-motion: reduce) {
          .breathe { animation: none; }
        }
      `}</style>
    </div>
  );
}

// 한 줄 일기 (로컬 저장 + 위기 키워드 감지)
export function JournalTool() {
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  const [crisis, setCrisis] = useState(false);

  function save() {
    if (detectCrisis(text)) {
      setCrisis(true);
      return;
    }
    try {
      const key = "todak-journal";
      const prev = JSON.parse(localStorage.getItem(key) || "[]");
      prev.unshift({ at: new Date().toISOString(), text });
      localStorage.setItem(key, JSON.stringify(prev.slice(0, 100)));
    } catch {}
    setSaved(true);
    setText("");
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-2">
      <textarea
        className="field min-h-[72px] resize-none"
        placeholder="오늘 마음에 남은 한 줄. (이 브라우저에만 저장돼요)"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (crisis) setCrisis(false);
        }}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: "var(--muted)" }}>
          {saved ? "저장됐어요." : " "}
        </span>
        <button className="btn-ghost" onClick={save} disabled={!text.trim()}>
          한 줄 남기기
        </button>
      </div>
      {crisis && <CrisisModal onClose={() => setCrisis(false)} />}
    </div>
  );
}
