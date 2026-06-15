// 안전 안내 — 상시 노출 (기획서 9. 안전·윤리, 타협 없음)
import Link from "next/link";

export function SafetyBanner() {
  return (
    <footer className="border-t" style={{ backgroundColor: "var(--card)" }}>
      <div className="mx-auto max-w-5xl px-5 py-5">
        <div
          className="rounded-xl border p-4 text-sm"
          style={{ borderColor: "var(--line)" }}
        >
          <p className="font-medium">지금 많이 힘들다면, 혼자 견디지 않아도 돼요.</p>
          <p className="mt-1.5" style={{ color: "var(--muted)" }}>
            자살예방 상담전화{" "}
            <a href="tel:109" className="font-semibold underline underline-offset-2">
              109
            </a>{" "}
            — 24시간, 비밀 보장. · 보건복지상담{" "}
            <a href="tel:129" className="underline underline-offset-2">
              129
            </a>
            <span className="ml-2">
              (
              <Link href="/help" className="underline underline-offset-2">
                도움받을 곳 더 보기
              </Link>
              )
            </span>
          </p>
        </div>
        <p className="mt-3 text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
          토닥의 사주·운세 점수는 전통 명리학 규칙을 코드로 옮긴 휴리스틱이며 재미로
          봐주세요. 이 앱은 의료·심리 치료를 대체하지 않고, 진단이 아닙니다. 생년월일은
          기본적으로 이 브라우저에만 저장되며 외부로 전송되지 않습니다.
        </p>
      </div>
    </footer>
  );
}
