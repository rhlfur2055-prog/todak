// 심리검사 — 자기자비 단축형 (근거 기반 모듈, 기획서 4.4)
//
// 근거: Self-Compassion Scale–Short Form (SCS-SF, Raes·Pommier·Neff·Van Gucht, 2011)
//       및 한국어판 자기자비척도(SCS, Neff; 한국어 공개본)를 참고해 12문항으로 구성.
// 원칙: 진단이 아니라 "지금 내가 나를 어떻게 대하는지" 비춰보는 간이 자가검사.
//       절대값을 부풀리지 않는다. 점수가 낮아도 "문제"가 아니라 "다정함을 늘릴 여지".
//
// 채점: 5점 척도(1 거의 그렇지 않다 ~ 5 거의 항상 그렇다).
//       부정 하위요인(자기판단·고립·과잉동일시) 문항은 역채점(6 - 응답).
//       총점 = 12문항 평균(1.0 ~ 5.0). 높을수록 자기자비가 높음.

export type Subscale =
  | "self-kindness" // 자기친절
  | "self-judgment" // 자기판단 (역)
  | "common-humanity" // 보편적 인간성
  | "isolation" // 고립 (역)
  | "mindfulness" // 마음챙김
  | "over-identification"; // 과잉동일시 (역)

export interface ScsItem {
  id: number;
  text: string;
  subscale: Subscale;
  reverse: boolean; // true면 역채점(부정 문항)
}

// 12문항 — 각 하위요인 2문항. 순서는 자가검사 흐름에 맞게 섞음.
export const SCS_ITEMS: ScsItem[] = [
  { id: 1, text: "중요한 일에 실패하면, 부족하다는 느낌에 온통 사로잡힌다.", subscale: "over-identification", reverse: true },
  { id: 2, text: "내 마음에 들지 않는 내 모습도, 이해하고 너그럽게 봐주려 한다.", subscale: "self-kindness", reverse: false },
  { id: 3, text: "괴로운 일이 생기면, 한쪽으로 치우치지 않고 균형 있게 보려 한다.", subscale: "mindfulness", reverse: false },
  { id: 4, text: "기분이 가라앉을 때면, 남들은 다 나보다 행복할 거라는 생각이 든다.", subscale: "isolation", reverse: true },
  { id: 5, text: "내 부족함도 사람이라면 누구나 겪는 일의 하나로 본다.", subscale: "common-humanity", reverse: false },
  { id: 6, text: "정말 힘든 시기를 지날 때, 내게 필요한 다정함과 보살핌을 스스로에게 준다.", subscale: "self-kindness", reverse: false },
  { id: 7, text: "속상한 일이 있어도, 감정이 한쪽으로 쏠리지 않게 다독이려 한다.", subscale: "mindfulness", reverse: false },
  { id: 8, text: "중요한 일에 실패하면, 나 혼자만 뒤처진 것 같은 기분이 든다.", subscale: "isolation", reverse: true },
  { id: 9, text: "기분이 가라앉으면, 잘못된 것들에 자꾸 매달리고 곱씹게 된다.", subscale: "over-identification", reverse: true },
  { id: 10, text: "내가 부족하게 느껴질 때, 그런 느낌은 대부분의 사람도 겪는다는 걸 떠올린다.", subscale: "common-humanity", reverse: false },
  { id: 11, text: "내 결점과 부족함에 대해 스스로를 못마땅해하고 깐깐하게 군다.", subscale: "self-judgment", reverse: true },
  { id: 12, text: "마음에 들지 않는 내 모습에 대해 참지 못하고 조급하게 군다.", subscale: "self-judgment", reverse: true },
];

export const SCS_CHOICES = [
  { value: 1, label: "거의 그렇지 않다" },
  { value: 2, label: "가끔 그렇다" },
  { value: 3, label: "절반쯤 그렇다" },
  { value: 4, label: "자주 그렇다" },
  { value: 5, label: "거의 항상 그렇다" },
];

const SUBSCALE_LABEL: Record<Subscale, string> = {
  "self-kindness": "자기친절",
  "self-judgment": "자기판단",
  "common-humanity": "보편적 인간성",
  isolation: "고립감",
  mindfulness: "마음챙김",
  "over-identification": "과잉 몰입",
};

export interface ScsResult {
  total: number; // 1.0 ~ 5.0 (반올림 전 평균)
  band: "low" | "mid" | "high";
  bandLabel: string;
  headline: string; // 다정한 한 줄 해석
  body: string; // 풀이
  reframe: { focus: string; line: string }; // 가장 낮은 하위요인 CBT 리프레이밍
  subscales: { subscale: Subscale; label: string; mean: number }[];
  answered: number;
}

// answers: { [itemId]: 1~5 }
export function scoreScs(answers: Record<number, number>): ScsResult {
  const scored = SCS_ITEMS.map((it) => {
    const raw = answers[it.id];
    const v = raw == null ? null : it.reverse ? 6 - raw : raw;
    return { ...it, v };
  });
  const valid = scored.filter((s) => s.v != null) as (ScsItem & { v: number })[];
  const total = valid.length ? valid.reduce((a, b) => a + b.v, 0) / valid.length : 0;

  // 하위요인 평균(채점 방향 적용 후 = '자기자비 기여도'). 낮을수록 다정함을 늘릴 여지.
  const subs = (Object.keys(SUBSCALE_LABEL) as Subscale[]).map((sub) => {
    const items = valid.filter((s) => s.subscale === sub);
    const mean = items.length ? items.reduce((a, b) => a + b.v, 0) / items.length : 0;
    return { subscale: sub, label: SUBSCALE_LABEL[sub], mean };
  });
  const lowest = [...subs].filter((s) => s.mean > 0).sort((a, b) => a.mean - b.mean)[0];

  const band: ScsResult["band"] = total >= 3.5 ? "high" : total >= 2.5 ? "mid" : "low";
  const bandLabel = band === "high" ? "이미 꽤 다정해요" : band === "mid" ? "다정함과 자책이 오가요" : "지금은 자책 쪽이 무거워요";

  const headline =
    band === "high"
      ? "스스로를 친구처럼 대하는 힘이 이미 있어요."
      : band === "mid"
        ? "어떤 날은 다정하고, 어떤 날은 가혹해요. 그게 보통이에요."
        : "요즘 나에게 가장 모진 사람은, 나 자신이었을지도 몰라요.";

  const body =
    band === "high"
      ? "힘들 때 자기 자신에게 보살핌을 줄 줄 아는 편이에요. 이 태도가 회복을 빠르게 해요. 다만 잘 지내는 날에도 가끔은 점검해 주세요 — 다정함은 근육이라 안 쓰면 줄어들어요."
      : band === "mid"
        ? "자기자비와 자기비난이 함께 살고 있어요. 특별히 이상한 게 아니라, 대부분의 사람이 여기 있어요. 아래의 한 가지만 의식해도 균형이 다정함 쪽으로 기울어요."
        : "지금은 자신을 다그치는 목소리가 큰 시기예요. 이건 당신이 약해서가 아니라, 오래 애써왔다는 신호에 가까워요. 한 번에 바꾸려 하지 말고, 아래 한 문장부터 시작해 보세요.";

  const reframe = reframeFor(lowest?.subscale);

  return {
    total,
    band,
    bandLabel,
    headline,
    body,
    reframe: { focus: lowest ? lowest.label : "자기친절", line: reframe },
    subscales: subs,
    answered: valid.length,
  };
}

// 가장 낮은 하위요인에 맞춘 CBT/CFT식 다정한 리프레이밍
function reframeFor(sub?: Subscale): string {
  switch (sub) {
    case "self-judgment":
      return "실수를 발견하면 '또 나야'가 아니라 '이번엔 이게 걸렸네'라고 바꿔 말해 보세요. 사람을 깎는 말과 행동을 고치는 말은 달라요.";
    case "isolation":
      return "'나만 이래'가 떠오를 때, '지금 같은 밤을 보내는 사람이 분명히 또 있다'를 한 번 떠올려 보세요. 고립감은 사실이 아니라 느낌일 때가 많아요.";
    case "over-identification":
      return "안 좋은 생각이 꼬리를 물면, '지금 나는 그 생각을 하고 있구나'라고 한 발 떨어져 이름을 붙여 보세요. 감정은 내가 아니라, 지나가는 날씨예요.";
    case "mindfulness":
      return "힘든 감정을 밀어내지도, 거기에 빠지지도 말고 '아, 지금 힘들구나' 하고 딱 한 번 알아만 줘도 돼요. 알아주는 것만으로 조금 가라앉아요.";
    case "common-humanity":
      return "'이건 나만 겪는 결함'이라는 생각이 들면, '이건 사람이라면 겪는 일'로 넓혀 보세요. 부족함은 당신의 특이점이 아니라 인간의 기본값이에요.";
    case "self-kindness":
    default:
      return "친한 친구가 지금의 당신과 똑같은 일을 겪는다면 뭐라고 해줄까요? 그 말을, 똑같이 당신에게 해주세요. 자격을 따지지 말고요.";
  }
}
