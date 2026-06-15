"use client";

// 위기 표현 감지 시 안내 우선 노출 (기획서 9. 안전, 타협 없음)
export function CrisisModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      role="dialog"
      aria-modal="true"
    >
      <div className="card max-w-sm p-6">
        <p className="text-lg font-semibold">잠깐, 혼자 견디지 말아요.</p>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
          지금 많이 힘든 마음이 느껴져요. 그 마음을 들어줄 사람이 24시간 기다리고 있어요.
          비밀은 지켜집니다.
        </p>
        <div className="mt-4 space-y-2">
          <a
            href="tel:109"
            className="btn-primary block text-center"
            style={{ textDecoration: "none" }}
          >
            자살예방 상담전화 109 걸기
          </a>
          <a href="tel:129" className="btn-ghost block text-center">
            보건복지상담 129
          </a>
        </div>
        <p className="mt-3 text-xs" style={{ color: "var(--muted)" }}>
          토닥은 의료·심리 치료를 대체하지 않아요. 일기는 저장하지 않았어요.
        </p>
        <button onClick={onClose} className="mt-3 w-full text-xs underline" style={{ color: "var(--muted)" }}>
          닫기
        </button>
      </div>
    </div>
  );
}
