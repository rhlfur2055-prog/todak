export function FunLabel({ text = "전통 명리학 기반 해석 · 재미로 봐주세요" }: { text?: string }) {
  return <span className="label-fun">※ {text}</span>;
}

export function RefLabel({ text = "참고용" }: { text?: string }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[11px]"
      style={{ backgroundColor: "var(--line)", color: "var(--muted)" }}
    >
      {text}
    </span>
  );
}
