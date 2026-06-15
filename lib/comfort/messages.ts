// 위로 코어 — "너 잘못이 아니야"
// 자기자비(Self-Compassion) 3요소: 마음챙김 → 보편적 인간성 → 자기친절
// 빈말("할 수 있어") 금지. 인정 → 정상화 → 다정함 순서. (기획서 4.5 계승)

export interface ComfortCardContent {
  mindfulness: string; // 마음챙김: 감정 인정
  commonHumanity: string; // 보편적 인간성: 고립감 해소
  selfKindness: string; // 자기친절: 자기비난 차단
  headline: string; // "너 잘못이 아니야" 계열 한마디
}

// 메인 카드 풀 (랜덤/일자 기반 선택)
export const COMFORT_CARDS: ComfortCardContent[] = [
  {
    mindfulness: "오늘 하루, 마음이 많이 무거웠구나.",
    commonHumanity: "이 구간을 지나는 사람은 너 혼자가 아니야. 다들 말 안 할 뿐, 비슷한 밤을 보내.",
    selfKindness: "친한 친구가 같은 일을 겪었다면 뭐라고 해줬을까. 그 말을 너에게도 해줘.",
    headline: "너 잘못이 아니야.",
  },
  {
    mindfulness: "잘 안 풀리는 날이 이어지면 지치는 게 당연해.",
    commonHumanity: "결과가 더딘 건 네 노력이 부족해서가 아니라, 원래 시간이 걸리는 일이라서야.",
    selfKindness: "오늘만큼은 자책을 잠깐 내려놔도 괜찮아.",
    headline: "불합격은 너의 가치가 아니라, 이번 매칭의 문제일 뿐이야.",
  },
  {
    mindfulness: "애쓰고 있다는 거, 누구보다 네가 잘 알지.",
    commonHumanity: "남들 다 잘 지내는 것처럼 보여도, 보이는 게 전부는 아니야.",
    selfKindness: "조금 천천히 가도 돼. 멈춘 게 아니라 숨 고르는 중인 거야.",
    headline: "지금 멈춰 있는 것 같아도, 너는 분명히 나아가고 있어.",
  },
  {
    mindfulness: "오늘 기운이 바닥났다면, 그건 그만큼 버텨왔다는 뜻이야.",
    commonHumanity: "지친 건 약해서가 아니라, 오래 견뎠기 때문이야.",
    selfKindness: "잘 쉬는 것도 실력이야. 오늘은 너를 좀 봐주자.",
    headline: "여기까지 온 것만으로 충분히 잘하고 있어.",
  },
  {
    mindfulness: "마음 한구석이 자꾸 '내가 문제인가' 하고 묻는다면.",
    commonHumanity: "그 질문은 너만 던지는 게 아니야. 성실한 사람일수록 더 자주 던져.",
    selfKindness: "문제를 찾으려 들기 전에, 오늘 버텨낸 너를 먼저 인정해 줘.",
    headline: "너는 고장 난 게 아니라, 잠깐 지쳤을 뿐이야.",
  },
];

// 일자 기반으로 매일 같은 카드(오늘의 토닥), 시드 입력 가능
export function pickComfortCard(seed?: number): ComfortCardContent {
  const base = seed ?? dayOfYear();
  return COMFORT_CARDS[base % COMFORT_CARDS.length];
}

function dayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

// 한 줄 일기에서 위기 신호를 감지하기 위한 키워드 (안전 모듈에서 사용)
export const CRISIS_KEYWORDS = [
  "자살", "죽고싶", "죽고 싶", "죽고십", "사라지고싶", "사라지고 싶",
  "없어지고싶", "없어지고 싶", "극단적", "자해", "목숨", "끝내고싶", "끝내고 싶",
  "더는 못", "더는못", "살기싫", "살기 싫", "살고싶지않", "살고 싶지 않",
];

export function detectCrisis(text: string): boolean {
  const t = text.replace(/\s+/g, "");
  return CRISIS_KEYWORDS.some((k) => t.includes(k.replace(/\s+/g, "")));
}
