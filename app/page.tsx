import Link from "next/link";
import { FunLabel } from "@/components/Disclaimer";

export default function Landing() {
  return (
    <div className="mx-auto max-w-3xl px-5">
      <section className="py-16 text-center fade-up">
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          무료 사주 · 운세 그래프
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
          내 운이 시간에 따라
          <br />
          오르내리는 곡선으로.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed" style={{ color: "var(--muted)" }}>
          생년월일을 넣으면 사주를 계산해서, 대운·세운의 흐름을 주가 차트처럼 한눈에
          보여줘요. 그리고 마지막엔, “너 잘못이 아니야” 한마디를 듣고 가요.
        </p>
        <div className="mt-7 flex flex-col items-center gap-3">
          <Link href="/app" className="btn-primary">
            내 운세 곡선 보기
          </Link>
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            로그인 없이 바로 · 생년월일은 내 브라우저에만 저장
          </span>
        </div>
      </section>

      {/* 미리보기 곡선 (정적) */}
      <section className="card mb-12 p-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium">운세 곡선 미리보기</span>
          <FunLabel text="명리 규칙 기반 휴리스틱 · 참고용" />
        </div>
        <PreviewCurve />
        <p className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
          대운(10년)·세운(연도별)·월운(12개월)·오행 밸런스를 곡선과 도넛으로. 한 점을
          누르면 “왜 이 시기가 이런지” 설명이 나와요.
        </p>
      </section>

      <section className="mb-12 grid gap-4 sm:grid-cols-3">
        {[
          { t: "재미는 사주로", d: "전통 명리(용신·희신·기신)를 코드로 옮긴 휴리스틱. 우기지 않고 ‘참고용’으로." },
          { t: "위로는 진심으로", d: "자기자비 3요소(마음챙김·보편적 인간성·자기친절)로, 빈말 없이." },
          { t: "끝까지 무료", d: "핵심 기능은 전부 무료. 계산은 브라우저에서, 정보는 밖으로 안 나가요." },
        ].map((c) => (
          <div key={c.t} className="card p-5">
            <p className="font-medium">{c.t}</p>
            <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              {c.d}
            </p>
          </div>
        ))}
      </section>

      {/* 더 해보기 (선택·재미) */}
      <section className="mb-16">
        <p className="mb-3 px-1 text-sm font-medium">원하면, 더 가볍게</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/face" className="card p-5 transition-colors hover:bg-[var(--line)]">
            <p className="font-medium">관상 · 손 모양 <span className="label-fun ml-1">재미</span></p>
            <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              셀카·손 사진을 기기 안에서만 읽어 따뜻한 인상으로. 업로드 안 함.
            </p>
          </Link>
          <Link href="/check" className="card p-5 transition-colors hover:bg-[var(--line)]">
            <p className="font-medium">1분 마음 체크 <span className="rounded-full px-2 py-0.5 text-[11px]" style={{ backgroundColor: "var(--line)", color: "var(--muted)" }}>근거</span></p>
            <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              자기자비척도 기반 자가검사 + 다정한 리프레이밍. 진단은 아니에요.
            </p>
          </Link>
          <Link href="/report" className="card p-5 transition-colors hover:bg-[var(--line)]">
            <p className="font-medium">오늘의 나</p>
            <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              본 것만 한 장에. 재미와 근거를 구분해 모아, 공유 카드로 저장.
            </p>
          </Link>
        </div>
      </section>

      <section className="mb-20 text-center">
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          힘든 밤이라면, 사주보다 먼저 이 번호를 기억해요.
        </p>
        <p className="mt-1">
          자살예방 상담전화{" "}
          <a href="tel:109" className="font-semibold underline underline-offset-2">
            109
          </a>{" "}
          · 24시간 · 비밀 보장
        </p>
      </section>
    </div>
  );
}

function PreviewCurve() {
  const scores = [48, 55, 62, 58, 70, 66, 60, 52, 57, 64];
  const W = 640, H = 170, pad = 18;
  const pts = scores.map((v, i) => {
    const x = pad + (i * (W - pad * 2)) / (scores.length - 1);
    const y = pad + (1 - v / 100) * (H - pad * 2);
    return [x, y] as const;
  });
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]} ${p[1]}`).join(" ");
  const area = `${path} L${pts[pts.length - 1][0]} ${H - pad} L${pts[0][0]} ${H - pad} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <line x1={pad} y1={H / 2} x2={W - pad} y2={H / 2} stroke="var(--line)" strokeDasharray="4 4" />
      <path d={area} fill="#7c9a6e" fillOpacity={0.16} />
      <path d={path} fill="none" stroke="#647f58" strokeWidth={2.5} />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={i === 4 ? 5 : 3} fill={i === 4 ? "#D99B72" : "#647f58"} />
      ))}
    </svg>
  );
}
