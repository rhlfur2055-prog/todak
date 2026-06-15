"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import type { FortuneSeries } from "@/lib/saju/fortune";
import { pickComfortCard } from "@/lib/comfort/messages";

// 공유 카드: 운세 곡선 + 한마디. 생년월일/이름 등 개인정보는 넣지 않는다.
export function ShareCard({ series }: { series: FortuneSeries }) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const headline = pickComfortCard().headline;

  // 세운 10년 점수로 sparkline
  const scores = series.seun.map((s) => s.score);
  const W = 520, H = 150, pad = 16;
  const max = 100, min = 0;
  const pts = scores.map((v, i) => {
    const x = pad + (i * (W - pad * 2)) / (scores.length - 1);
    const y = pad + (1 - (v - min) / (max - min)) * (H - pad * 2);
    return [x, y] as const;
  });
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const area = `${path} L${pts[pts.length - 1][0].toFixed(1)} ${H - pad} L${pts[0][0].toFixed(1)} ${H - pad} Z`;

  async function save() {
    if (!ref.current) return;
    setBusy(true);
    try {
      const url = await toPng(ref.current, { pixelRatio: 2, cacheBust: true });
      const a = document.createElement("a");
      a.href = url;
      a.download = "todak-운세곡선.png";
      a.click();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div
        ref={ref}
        className="overflow-hidden rounded-2xl border p-6"
        style={{ backgroundColor: "#FAF8F4", color: "#332E28", width: "100%", maxWidth: 560 }}
      >
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold">토닥 · 내 운세 곡선</span>
          <span className="text-[11px]" style={{ color: "#7C7264" }}>
            앞으로 10년 흐름 · 참고용
          </span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full">
          <line x1={pad} y1={H / 2} x2={W - pad} y2={H / 2} stroke="#D9D3C8" strokeDasharray="4 4" />
          <path d={area} fill="#7c9a6e" fillOpacity={0.18} />
          <path d={path} fill="none" stroke="#647f58" strokeWidth={2.5} />
          {pts.map((p, i) => (
            <circle key={i} cx={p[0]} cy={p[1]} r={i === 0 ? 4 : 2.5} fill={i === 0 ? "#D99B72" : "#647f58"} />
          ))}
        </svg>
        <p className="mt-3 text-lg font-semibold">{headline}</p>
        <p className="mt-1 text-xs" style={{ color: "#7C7264" }}>
          전통 명리학 기반 휴리스틱 · 재미로 봐주세요 · todak
        </p>
      </div>
      <button className="btn-ghost" onClick={save} disabled={busy}>
        {busy ? "이미지 만드는 중…" : "공유 카드 이미지로 저장"}
      </button>
    </div>
  );
}
