import Link from "next/link";
import { PsychTest } from "@/components/PsychTest";

export const metadata = { title: "1분 마음 체크 — 토닥" };

export default function CheckPage() {
  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <div className="mb-1 flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">1분 마음 체크</h1>
        <span className="rounded-full px-2.5 py-1 text-xs" style={{ backgroundColor: "var(--line)", color: "var(--muted)" }}>
          근거 기반
        </span>
      </div>
      <p className="mb-6 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
        요즘 내가 나를 어떻게 대하고 있는지 비춰보는 자가검사예요. 사주·관상과 달리 이건 ‘재미’가
        아니라 심리척도에 기반했어요. 그래도 진단은 아니에요.
      </p>
      <div className="card p-5">
        <PsychTest />
      </div>
      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        <Link href="/report" className="btn-ghost">오늘의 나 리포트 보기</Link>
        <Link href="/face" className="btn-ghost">관상·손 모양 보기</Link>
      </div>
    </div>
  );
}
