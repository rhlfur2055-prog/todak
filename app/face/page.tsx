import Link from "next/link";
import { FaceReading } from "@/components/FaceReading";

export const metadata = { title: "관상·손 모양 (재미) — 토닥" };

export default function FacePage() {
  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <div className="mb-1 flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">관상·손 모양</h1>
        <span className="label-fun">※ 재미로 봐주세요</span>
      </div>
      <p className="mb-6 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
        얼굴·손의 비율을 기기 안에서 읽어 따뜻한 인상으로 풀어드려요. 외모를 평가하거나 점수를
        매기지 않아요. 사진은 <b>업로드하지 않고</b>, 분석이 끝나면 남기지도 않아요.
      </p>
      <div className="card p-5">
        <FaceReading />
      </div>
      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        <Link href="/check" className="btn-ghost">1분 마음 체크</Link>
        <Link href="/report" className="btn-ghost">오늘의 나 리포트</Link>
      </div>
    </div>
  );
}
