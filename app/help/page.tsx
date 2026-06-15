export const metadata = { title: "도움받을 곳 — 토닥" };

export default function HelpPage() {
  const items = [
    {
      name: "자살예방 상담전화 109",
      desc: "24시간 · 비밀 보장. 2024년부터 통합 운영되는 전국 단일 번호.",
      tel: "109",
    },
    {
      name: "보건복지상담센터 129",
      desc: "복지·위기 전반 상담. 정신건강 위기 시 연계 안내.",
      tel: "129",
    },
    {
      name: "정신건강 위기상담 1577-0199",
      desc: "지역 정신건강복지센터 연계 24시간 상담.",
      tel: "15770199",
    },
  ];
  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="text-2xl font-semibold">도움받을 곳</h1>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
        지금 많이 힘들다면, 전문가의 도움을 받는 건 약함이 아니라 가장 단단한 선택이에요.
        아래는 언제든 연결되는 곳이에요.
      </p>
      <div className="mt-6 space-y-3">
        {items.map((it) => (
          <a
            key={it.tel}
            href={`tel:${it.tel}`}
            className="card block p-5 transition-colors"
            style={{ textDecoration: "none" }}
          >
            <p className="font-medium">{it.name}</p>
            <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
              {it.desc}
            </p>
          </a>
        ))}
      </div>
      <p className="mt-8 text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
        거주지 정신건강복지센터·청년 마음건강 지원(바우처)은 지역별로 다르게 운영돼요.
        포털에서 “(지역명) 정신건강복지센터”로 검색하면 가까운 곳을 찾을 수 있어요. 토닥은
        의료·심리 치료를 대체하지 않으며, 어떤 결과도 진단이 아닙니다.
      </p>
    </div>
  );
}
