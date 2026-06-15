// 사주 성향 해석 (재미 영역) — 긍정·중립 톤. 겁주는 흉(凶) 표현 금지.
// "전통 명리학 기반 해석 · 재미로 봐주세요" 라벨과 함께만 쓰입니다.

import {
  Element, Stem, Branch, TenGod,
  STEM_ELEMENT, BRANCH_ELEMENT, branchIndex,
} from "./constants";
import { SajuChart } from "./engine";
import { YongsinResult, Category, categoryOf } from "./fortune";

// ──────────────────────────────────────────────────────────
// 1. 일간(천간)별 — 키워드 + 한 줄 + 상세 2문단
// ──────────────────────────────────────────────────────────
const DAY_STEM_TRAIT: Record<Stem, { keyword: string; desc: string }> = {
  갑: { keyword: "곧게 자라는 나무", desc: "방향이 정해지면 흔들림 없이 나아가는 사람. 시작과 추진의 힘이 있어요." },
  을: { keyword: "유연한 풀과 덩굴", desc: "부드럽게 적응하며 끝내 살아남는 끈기. 환경을 잘 읽고 둘러 가는 지혜가 있어요." },
  병: { keyword: "환한 태양", desc: "주변을 밝히는 표현력과 활기. 사람을 끌어모으는 따뜻한 에너지가 있어요." },
  정: { keyword: "은은한 촛불", desc: "가까운 사람을 세심히 비추는 다정함. 집중력과 섬세함이 강점이에요." },
  무: { keyword: "넓은 산과 대지", desc: "묵직하게 중심을 잡아주는 사람. 신뢰와 포용의 무게가 있어요." },
  기: { keyword: "기름진 밭", desc: "조용히 길러내고 보살피는 힘. 실속 있고 현실적인 감각이 있어요." },
  경: { keyword: "다듬어지는 쇠", desc: "결단력과 추진력. 끊고 맺는 게 분명하고 의리가 있어요." },
  신: { keyword: "보석과 정제된 금속", desc: "예리한 감각과 완성도. 섬세하게 다듬어 빛내는 재능이 있어요." },
  임: { keyword: "흐르는 큰 물", desc: "넓게 보는 시야와 융통성. 상황을 유연하게 풀어가는 지혜가 있어요." },
  계: { keyword: "스며드는 빗물", desc: "조용히 깊이 파고드는 사고력. 상상력과 공감 능력이 풍부해요." },
};

const DAY_STEM_DETAIL: Record<Stem, string[]> = {
  갑: [
    "큰 나무처럼 위로 곧게 자라려는 사람이에요. 명분과 방향이 서면 우직하게 밀고 나가고, 책임지는 자리에서 빛이 납니다. 새로운 일을 처음 여는 데 강해요.",
    "다만 한번 정한 길은 잘 안 굽혀서 융통성이 아쉬울 때가 있어요. 자존심이 상하면 오래 갑니다. 가끔은 '돌아가도 된다'고 스스로에게 허락하면 한결 편해져요.",
  ],
  을: [
    "풀과 덩굴처럼 부드럽게 휘면서도 끝내 살아남는 끈기가 있어요. 사람과 환경을 빠르게 읽고, 빈틈으로 길을 내는 현실 감각이 강점입니다.",
    "혼자 결단하기보다 기대고 싶을 때가 있고, 속으로 재느라 결정을 미루기도 해요. 작은 선택부터 빠르게 끊어보면 추진력이 붙습니다.",
  ],
  병: [
    "태양처럼 밝고 솔직한 사람이에요. 표현이 시원하고 분위기를 데우는 힘이 있어, 사람이 자연스레 모입니다. 뒤끝이 없는 편이에요.",
    "기분의 진폭이 커서 금방 달아올랐다 식기도 해요. 욱하는 순간만 한 박자 쉬어가면, 그 밝음이 오래 신뢰로 남습니다.",
  ],
  정: [
    "촛불·달빛 같은 사람이에요. 요란하지 않지만 가까운 사람을 세심히 비추고, 한곳을 깊게 파고드는 집중력이 있어요. 정이 깊습니다.",
    "예민해서 작은 말에도 오래 마음을 쓰고, 속으로 앓는 편이에요. 혼자 삭이지 말고 한 줄이라도 꺼내 놓으면 가벼워져요.",
  ],
  무: [
    "큰 산처럼 듬직한 사람이에요. 쉽게 흔들리지 않는 중심과 너른 포용으로, 사람들이 기대고 싶어 합니다. 신뢰가 큰 자산이에요.",
    "대신 변화가 느리고 한번 박힌 생각은 잘 안 움직여요. 고집과 신념을 구분해 보면, 그 무게가 더 단단해집니다.",
  ],
  기: [
    "잘 일군 밭 같은 사람이에요. 드러내기보다 조용히 길러내고 챙기는 힘, 실속 있는 현실 감각이 강점입니다. 곁에 있으면 든든해요.",
    "걱정이 많고 마음을 자주 졸여서 스스로를 깎을 때가 있어요. '여기까진 됐다' 하고 끊어주는 연습이 도움이 됩니다.",
  ],
  경: [
    "원석·도끼 같은 사람이에요. 맺고 끊는 게 분명하고 추진력과 의리가 있어, 일을 끝까지 밀어붙입니다. 단순명쾌한 게 매력이에요.",
    "표현이 거칠게 나가거나 욱할 때가 있어요. 결단의 힘은 그대로 두되, 말의 온도만 한 단계 낮추면 사람이 따릅니다.",
  ],
  신: [
    "잘 세공된 보석 같은 사람이에요. 예리한 감각과 높은 완성도, 깔끔한 마무리가 강점입니다. 디테일을 보는 눈이 남달라요.",
    "기준이 높아 스스로와 남을 자주 깐깐하게 봐요. 그 눈을 '비난'이 아니라 '다듬기'로 쓰면, 재능이 빛으로 바뀝니다.",
  ],
  임: [
    "바다·큰 강 같은 사람이에요. 시야가 넓고 융통성이 있어 복잡한 상황을 유연하게 풀어냅니다. 아이디어와 포용력이 큽니다.",
    "관심이 사방으로 퍼져 산만해지거나 변덕으로 보일 때가 있어요. 큰 그림에 닻 하나만 내려두면 흐름이 단단해집니다.",
  ],
  계: [
    "빗물·이슬 같은 사람이에요. 조용히 깊게 스며드는 사고력과 풍부한 상상력, 남의 마음을 잘 읽는 공감 능력이 강점입니다.",
    "생각이 너무 많아 시작 전에 지치거나 움츠러들 때가 있어요. 완벽히 준비하기 전에 작게라도 한 발 떼면, 그 깊이가 결과로 이어져요.",
  ],
};

// ──────────────────────────────────────────────────────────
// 2. 오행별 강점 / 부족 리프레임 / 건강 신호
// ──────────────────────────────────────────────────────────
const ELEMENT_STRENGTH: Record<Element, string> = {
  목: "기획하고 성장시키는 힘, 인정 많은 추진력",
  화: "표현하고 빛내는 힘, 사람을 끌어당기는 활기",
  토: "버티고 중재하는 힘, 믿음직한 안정감",
  금: "정리하고 결단하는 힘, 원칙 있는 추진력",
  수: "사고하고 적응하는 힘, 깊이 있는 통찰",
};

const ELEMENT_LACK_REFRAME: Record<Element, string> = {
  목: "새로 벌이기보다 있는 걸 키우는 데 강점이 있어요. 추진은 사람·환경의 도움을 빌리면 한결 수월해요.",
  화: "요란하게 드러내기보다 묵묵히 해내는 타입. 가끔은 의식적으로 표현해 보면 좋아요.",
  토: "변화에 빠른 대신 중심이 흔들릴 수 있어요. 루틴과 쉼이 든든한 닻이 돼줘요.",
  금: "유연한 대신 맺고 끊기가 어려울 수 있어요. 작은 결정부터 연습하면 편해져요.",
  수: "에너지가 밖으로 향하는 타입. 혼자 정리하는 시간을 일부러 확보하면 균형이 잡혀요.",
};

const ELEMENT_HEALTH: Record<Element, string> = {
  목: "간·눈·근육 쪽이 피로 신호를 먼저 보내요. 스트레칭과 충분한 수면이 약이에요.",
  화: "심장·혈압·수면 리듬이 컨디션을 좌우해요. 카페인과 밤샘을 줄이면 한결 안정돼요.",
  토: "위장·소화 쪽이 예민해요. 끼니를 거르지 말고 따뜻한 음식으로 챙기면 좋아요.",
  금: "폐·호흡기·피부 쪽이 신호가 빨라요. 환기와 가벼운 유산소가 도움이 돼요.",
  수: "신장·방광·수분·수면이 핵심이에요. 물 자주 마시고 하체를 따뜻하게 하면 좋아요.",
};

const ELEMENT_LUCK: Record<Element, { color: string; dir: string; season: string; act: string }> = {
  목: { color: "초록·청색", dir: "동쪽", season: "봄", act: "산책, 식물 곁에 두기, 아침 햇빛 쬐기" },
  화: { color: "붉은색·주황", dir: "남쪽", season: "여름", act: "햇빛 보기, 사람들과의 자리, 가벼운 운동" },
  토: { color: "노랑·황토색", dir: "중앙", season: "환절기", act: "규칙적인 루틴, 정리정돈, 땅 밟기" },
  금: { color: "흰색·은색", dir: "서쪽", season: "가을", act: "정돈, 맺고 끊기, 금속·악기 가까이" },
  수: { color: "검정·남색", dir: "북쪽", season: "겨울", act: "충분한 휴식, 독서, 물 가까이 두기" },
};

// ──────────────────────────────────────────────────────────
// 3. 십성(十星) 풀이
// ──────────────────────────────────────────────────────────
const TEN_GOD_DESC: Record<TenGod, { label: string; text: string }> = {
  비견: { label: "비견 比肩", text: "자립심과 동료의 기운. 내 힘으로 서려는 주관이 뚜렷하고, 뜻 맞는 사람과 함께할 때 강해요." },
  겁재: { label: "겁재 劫財", text: "추진력과 승부욕. 과감하게 밀어붙이는 힘이 있어요. 돈·기회는 함께 나눌수록 오래갑니다." },
  식신: { label: "식신 食神", text: "표현하고 누리는 여유의 기운. 꾸준히 만들어내는 생산력과 사람을 편하게 하는 다정함이 있어요." },
  상관: { label: "상관 傷官", text: "재능과 말솜씨, 틀을 깨는 창의력. 보여주는 일·기획·표현에 강해요. 날카로움을 다정함으로 감싸면 빛납니다." },
  편재: { label: "편재 偏財", text: "기회를 포착하는 활동성과 큰 그림의 재물 감각. 사람·정보가 곧 돈이 되는 수완이 있어요." },
  정재: { label: "정재 正財", text: "성실하게 모으는 안정의 기운. 꼼꼼하고 신중해서, 천천히 단단하게 쌓아 올리는 데 강해요." },
  편관: { label: "편관 偏官", text: "도전과 돌파의 기운. 압박 속에서 오히려 힘을 내는 강단이 있어요. 큰일을 맡을수록 단련됩니다." },
  정관: { label: "정관 正官", text: "책임감과 명예의 기운. 규율을 지키고 신뢰를 쌓는 데 강해, 조직·공적인 자리에서 인정받아요." },
  편인: { label: "편인 偏印", text: "직관과 독특한 학습력. 남다른 시각으로 빠르게 흡수하는 재치가 있어요. 전문·연구 분야와 잘 맞아요." },
  정인: { label: "정인 正印", text: "배움과 보살핌, 인덕의 기운. 차분히 받아들이고 베푸는 힘이 있어, 귀인의 도움을 자주 받아요." },
};

// ──────────────────────────────────────────────────────────
// 4. 신살(神煞) — 가벼운 재미. 길성 위주, 흉살은 부드럽게.
// ──────────────────────────────────────────────────────────
// 지지 삼합 그룹별 도화/역마/화개 목표 지지 (인덱스)
const TRIO_OF: Record<number, "수국" | "화국" | "금국" | "목국"> = {
  8: "수국", 0: "수국", 4: "수국", // 신자진
  2: "화국", 6: "화국", 10: "화국", // 인오술
  5: "금국", 9: "금국", 1: "금국", // 사유축
  11: "목국", 3: "목국", 7: "목국", // 해묘미
};
const DOHWA: Record<string, number> = { 수국: 9, 화국: 3, 금국: 6, 목국: 0 };
const YEOKMA: Record<string, number> = { 수국: 2, 화국: 8, 금국: 11, 목국: 5 };
const HWAGAE: Record<string, number> = { 수국: 4, 화국: 10, 금국: 1, 목국: 7 };
// 천을귀인 (일간 기준 지지 인덱스)
const CHEONEUL: Record<Stem, number[]> = {
  갑: [1, 7], 무: [1, 7], 경: [1, 7],
  을: [0, 8], 기: [0, 8],
  병: [11, 9], 정: [11, 9],
  임: [3, 5], 계: [3, 5],
  신: [2, 6],
};

export interface SinsalNote {
  name: string;
  text: string;
}

function detectSinsal(chart: SajuChart): SinsalNote[] {
  const notes: SinsalNote[] = [];
  const branches: Branch[] = [chart.pillars.year.branch, chart.pillars.month.branch, chart.pillars.day.branch];
  if (chart.pillars.hour) branches.push(chart.pillars.hour.branch);
  const idxs = branches.map(branchIndex);

  // 도화/역마/화개 — 일지 그룹 기준
  const dayTrio = TRIO_OF[branchIndex(chart.pillars.day.branch)];
  if (dayTrio) {
    if (idxs.includes(DOHWA[dayTrio]))
      notes.push({ name: "도화살 桃花", text: "사람을 끌어당기는 매력과 인기의 기운. 표현·예술·사람을 상대하는 일에서 특히 빛나요." });
    if (idxs.includes(YEOKMA[dayTrio]))
      notes.push({ name: "역마살 驛馬", text: "한곳에 머물기보다 움직일 때 길이 열리는 기운. 이동·새 환경·도전이 잘 맞아요." });
    if (idxs.includes(HWAGAE[dayTrio]))
      notes.push({ name: "화개살 華蓋", text: "혼자 깊이 파고드는 기운. 학문·예술·전문성에 강점이 있어요. 고독을 잘 다루면 큰 힘이 됩니다." });
  }

  // 천을귀인 — 길성
  const cheon = CHEONEUL[chart.dayStem] || [];
  if (idxs.some((i) => cheon.includes(i)))
    notes.push({ name: "천을귀인 天乙貴人", text: "어려울 때 돕는 사람이 나타나는 대표적 길성이에요. 막힐 땐 혼자 끙끙대지 말고 주변에 말해보세요." });

  return notes;
}

// ──────────────────────────────────────────────────────────
// 5. 분야별 운세 (재물·애정·직업·건강·대인) — 휴리스틱 + 취준 톤
// ──────────────────────────────────────────────────────────
export interface LifeArea {
  key: string;
  title: string;
  text: string;
}

function countCategories(chart: SajuChart): Record<Category, number> {
  const day = chart.dayElement;
  const c: Record<Category, number> = { 비겁: 0, 인성: 0, 식상: 0, 재성: 0, 관성: 0 };
  const ps = [chart.pillars.year, chart.pillars.month, chart.pillars.day];
  if (chart.pillars.hour) ps.push(chart.pillars.hour);
  for (const p of ps) {
    c[categoryOf(day, STEM_ELEMENT[p.stem])] += 1;
    c[categoryOf(day, BRANCH_ELEMENT[p.branch])] += 1;
  }
  return c;
}

function lifeAreas(chart: SajuChart, yong: YongsinResult): LifeArea[] {
  const cat = countCategories(chart);
  const strong = yong.isStrong;
  const gender = chart.input.gender;

  // 재물 (재성)
  const money =
    cat.재성 >= 2
      ? strong
        ? "재물을 끌어오는 감각과 기회를 잡는 추진력이 좋아요. 벌이가 들쭉날쭉할 수 있으니, 들어올 때 일부를 떼어 묶어두면 흐름이 안정됩니다."
        : "돈 들어올 길은 여럿이지만 혼자 다 쥐려다 지칠 수 있어요. 믿을 사람과 나눠 들고, 무리한 욕심만 덜면 실속이 커집니다."
      : cat.재성 === 1
        ? "한 방보다 성실하게 모으는 쪽이 잘 맞아요. 작은 돈도 꾸준히 관리하면 어느새 단단한 토대가 됩니다."
        : "돈을 좇기보다 실력과 신뢰가 쌓이면 보상이 뒤따라오는 타입이에요. 지금 시기엔 당장의 보수보다 경험치에 투자해도 괜찮아요.";

  // 애정 (남=재성, 여=관성 중심 + 일지)
  const loveStar = gender === "남" ? cat.재성 : cat.관성;
  const love =
    loveStar >= 2
      ? "인연의 기회가 많은 편이에요. 마음이 여러 갈래로 흔들릴 수 있으니, 솔직함과 꾸준함을 잃지 않으면 깊은 관계로 이어집니다."
      : loveStar === 1
        ? "한 사람에게 진득하게 마음을 쏟는 타입이에요. 표현을 조금만 더 자주 하면 오해 없이 가까워집니다."
        : "연애에 서두르지 않는 편이에요. 억지로 맞추기보다 편한 사람을 천천히 알아갈 때 가장 좋은 인연이 와요.";

  // 직업 (강한 카테고리 기준)
  const entries = (Object.entries(cat) as [Category, number][]).sort((a, b) => b[1] - a[1]);
  const top = entries[0][0];
  const WORK: Record<Category, string> = {
    관성: "책임과 규율이 분명한 환경에서 인정받는 타입이에요. 조직·공공·관리 직무, 자격이 쌓이는 일과 잘 맞아요.",
    식상: "표현하고 만들어내는 일에 강해요. 기획·콘텐츠·영업·교육처럼 결과를 보여주는 직무에서 빛납니다.",
    인성: "배우고 분석하는 힘이 좋아요. 연구·전문직·교육·자격 기반의 일에서 깊이를 발휘합니다.",
    재성: "현실 감각과 수완이 좋아요. 사람·돈·숫자를 다루는 일, 성과가 보이는 직무가 잘 맞아요.",
    비겁: "주관이 뚜렷해 내 몫이 분명한 환경이 맞아요. 전문성·프리랜서·동업 형태에서 힘이 납니다.",
  };
  const work = WORK[top] + (strong ? " 지금은 적극적으로 부딪혀볼 만한 흐름이에요." : " 지금은 기본기를 다지며 때를 고르면 좋은 흐름이에요.");

  // 건강 (가장 약한 오행)
  const minEl = (Object.entries(chart.elementCount) as [Element, number][]).sort((a, b) => a[1] - b[1])[0][0];
  const health = `타고난 균형상 ${ELEMENT_HEALTH[minEl]} 큰 병보다 '피로 관리'가 핵심이에요. 무리한 날엔 하나라도 덜어내세요.`;

  // 대인 (비겁/인성)
  const social =
    cat.비겁 >= 2
      ? "사람과 어울리는 힘이 좋고 의리가 있어요. 친구·동료가 큰 자산이지만, 모두를 챙기다 지치지 않게 거리도 가끔 두세요."
      : cat.인성 >= 2
        ? "윗사람·선배의 도움을 잘 받는 인덕이 있어요. 먼저 배우려는 태도가 곧 사람을 부릅니다."
        : "넓게 두루보다 소수와 깊게 가는 관계가 편한 타입이에요. 혼자만의 시간이 에너지를 채워줘요.";

  return [
    { key: "money", title: "재물운", text: money },
    { key: "love", title: "애정운", text: love },
    { key: "work", title: "직업·취업운", text: work },
    { key: "health", title: "건강운", text: health },
    { key: "social", title: "대인운", text: social },
  ];
}

// ──────────────────────────────────────────────────────────
// 종합 해석
// ──────────────────────────────────────────────────────────
export interface Interpretation {
  dayStemTrait: { keyword: string; desc: string };
  dayStemDetail: string[];
  strengths: string[];
  phase: string;
  elementNote: string;
  elementDetail: string;
  tenGodNotes: { label: string; text: string }[];
  lifeAreas: LifeArea[];
  luck: { favorable: Element[]; colors: string; directions: string; seasons: string; advice: string };
  sinsal: SinsalNote[];
}

export function interpret(chart: SajuChart, yong: YongsinResult): Interpretation {
  const trait = DAY_STEM_TRAIT[chart.dayStem];
  const dayStemDetail = DAY_STEM_DETAIL[chart.dayStem];

  // 강점
  const sorted = (Object.entries(chart.elementCount) as [Element, number][]).sort((a, b) => b[1] - a[1]);
  const strengths: string[] = [ELEMENT_STRENGTH[chart.dayElement]];
  for (const [el, cnt] of sorted) {
    if (cnt >= 2 && el !== chart.dayElement && strengths.length < 3) strengths.push(ELEMENT_STRENGTH[el]);
  }

  // 부족 오행
  const lacking = sorted.filter(([, c]) => c === 0).map(([e]) => e);
  const elementNote =
    lacking.length > 0
      ? `오행 중 ${lacking.join("·")} 기운이 옅은 편이에요. ${ELEMENT_LACK_REFRAME[lacking[0]]}`
      : "오행이 비교적 고르게 퍼져 있어요. 한쪽으로 치우치지 않는 균형이 강점이에요.";

  const elementDetail = yong.isStrong
    ? `타고난 기운이 단단한 편(신강)이에요. 가진 힘을 안에 쌓아두기보다 ${yong.favorable.join("·")} 쪽으로 흘려보내며 쓸 때 가장 편안하고, 성과로도 이어집니다.`
    : `타고난 기운이 여린 편(신약)이에요. 혼자 다 짊어지기보다 ${yong.favorable.join("·")} 기운(사람·배움·휴식)으로 나를 채울 때 힘이 나고 일이 풀립니다.`;

  // 십성 풀이 (차트에 등장한 십성만, 중복 제거)
  const gods: TenGod[] = [];
  const pushGod = (g: TenGod | null) => { if (g && !gods.includes(g)) gods.push(g); };
  for (const p of [chart.pillars.year, chart.pillars.month, chart.pillars.day, chart.pillars.hour]) {
    if (!p) continue;
    pushGod(p.stemTenGod);
    pushGod(p.branchTenGod);
  }
  const tenGodNotes = gods.map((g) => TEN_GOD_DESC[g]);

  // 행운 정보 (용신 기반)
  const fav = yong.favorable;
  const luck = {
    favorable: fav,
    colors: fav.map((e) => ELEMENT_LUCK[e].color).join(", "),
    directions: fav.map((e) => ELEMENT_LUCK[e].dir).join(", "),
    seasons: fav.map((e) => ELEMENT_LUCK[e].season).join(", "),
    advice: fav.map((e) => ELEMENT_LUCK[e].act).join(" / "),
  };

  const phase = yong.isStrong
    ? "지금은 가진 에너지를 안에 쌓기보다 밖으로 흘려보내며 쓰기 좋은 흐름이에요. 표현하고, 나누고, 시도해 보세요."
    : "지금은 무리해서 밀어붙이기보다 나를 채우고 회복하는 데 힘을 쓰면 좋은 흐름이에요. 쉼과 배움이 곧 힘이 돼요.";

  return {
    dayStemTrait: trait,
    dayStemDetail,
    strengths,
    phase,
    elementNote,
    elementDetail,
    tenGodNotes,
    lifeAreas: lifeAreas(chart, yong),
    luck,
    sinsal: detectSinsal(chart),
  };
}
