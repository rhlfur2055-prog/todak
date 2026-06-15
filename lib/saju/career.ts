// 직업·취업운 — 취준생 페르소나 핵심 기능 (기획서 타깃: 취업/이직 준비생)
//
// 데이터 기반: 십성 분포(적성) + 용신/신강(전략) + 세운 천간 십성(연도별 취업 테마) + 운세 점수.
// 전통 명리를 코드로 옮긴 휴리스틱이며 "참고용". 단정·겁주기 없이 방향만 제시.

import { Element, STEM_ELEMENT, BRANCH_ELEMENT } from "./constants";
import { categoryOf, Category, FortuneSeries } from "./fortune";
import type { SajuChart } from "./engine";

export interface CareerTiming {
  year: number;
  label: string; // 세운 간지
  category: Category; // 그 해 천간 십성
  favorable: boolean; // 운세 점수 양호?
  score: number;
  note: string; // 취준 맥락 한 줄
  isThisYear: boolean;
  recommended: boolean; // 취업/합격 유리 해
}

export interface CareerReading {
  aptitudeKeyword: string;
  fields: string[]; // 추천 직군 칩
  aptitudeReason: string;
  timing: CareerTiming[];
  bestYears: number[];
  tips: string[];
}

// 십성 카테고리 분포 (천간 + 지지 본기, 8자 기준)
function categoryCounts(chart: SajuChart): Record<Category, number> {
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

const FIELDS: Record<Category, string[]> = {
  관성: ["공무원·공기업", "대기업 관리직", "법무·인사", "군·경·행정", "시험 기반 직무"],
  식상: ["기획·마케팅", "콘텐츠·미디어", "디자인·창작", "교육·강의", "영업·세일즈"],
  재성: ["금융·회계", "영업·유통", "경영·창업", "세무·부동산", "데이터·숫자 직무"],
  인성: ["연구·R&D", "교육·상담", "의료·전문직", "자격 기반 직무", "공공·학술"],
  비겁: ["전문직·프리랜서", "스타트업", "기술·개발", "1인 사업·동업", "현장·실무"],
};

const APTITUDE_KEYWORD: Record<Category, string> = {
  관성: "조직에서 인정받는 타입",
  식상: "표현하고 만들어내는 타입",
  재성: "현실 감각과 수완의 타입",
  인성: "배우고 깊이 파는 타입",
  비겁: "내 몫이 분명한 독립 타입",
};

// 일간 오행으로 추천 직군 한 갈래 보강
const ELEMENT_FIELD: Record<Element, string> = {
  목: "교육·기획·성장 분야",
  화: "미디어·IT·표현 분야",
  토: "중개·부동산·관리 분야",
  금: "금융·법·정밀 제조 분야",
  수: "연구·유통·유연한 직무",
};

const YEAR_NOTE: Record<Category, string> = {
  관성: "조직·시험·취업에 힘이 실리는 해. 공채·자격시험·입사 지원에 유리해요.",
  인성: "문서·합격·공부의 해. 자격증·시험·합격 통보(계약)에 좋은 흐름이에요.",
  재성: "성과·실무·이직의 해. 결과가 따라오니 적극 지원·연봉 협상에 좋아요.",
  식상: "표현·활동의 해. 포트폴리오·면접·직무 전환 시도에 잘 맞아요.",
  비겁: "경쟁·독립의 해. 동료·인맥이 힘이 되고, 단독 도전도 해볼 만해요.",
};

export function readCareer(chart: SajuChart, series: FortuneSeries): CareerReading {
  const counts = categoryCounts(chart);
  const sorted = (Object.entries(counts) as [Category, number][]).sort((a, b) => b[1] - a[1]);
  const top = sorted[0][0];

  const fields = [...FIELDS[top]];
  const elField = ELEMENT_FIELD[chart.dayElement];
  if (!fields.includes(elField)) fields.splice(2, 0, elField);

  const aptitudeReason =
    `사주에 ${top} 기운이 가장 도드라져요. ` +
    APTITUDE_KEYWORD[top] +
    `이라, 위 같은 결의 일에서 강점이 잘 살아요. 일간이 ${chart.dayElement}이라 ${elField}와도 잘 맞고요.`;

  // 연도별 취업 테마 (세운 천간 십성)
  const timing: CareerTiming[] = chart.seun.map((s, i) => {
    const cat = categoryOf(chart.dayElement, STEM_ELEMENT[s.stem]);
    const sc = series.seun[i];
    const favorable = sc.score >= 55;
    const recommended = (cat === "관성" || cat === "인성") || sc.score >= 68;
    return {
      year: s.year,
      label: s.label,
      category: cat,
      favorable,
      score: sc.score,
      note: YEAR_NOTE[cat],
      isThisYear: sc.isThisYear,
      recommended,
    };
  });
  const bestYears = timing.filter((t) => t.recommended).map((t) => t.year).slice(0, 4);

  // 전략 팁
  const tips: string[] = [];
  if (series.yong.isStrong) {
    tips.push("신강한 편이에요 — 망설이기보다 다발로 지원하고 부딪히며 길을 찾는 게 잘 맞아요.");
  } else {
    tips.push("신약한 편이에요 — 지원을 늘리기 전에 자격·포트폴리오로 기초를 먼저 단단히 하면 결과가 붙어요.");
  }
  const favEl = series.yong.favorable[0];
  if (favEl) {
    tips.push(`나를 돕는 기운은 ${series.yong.favorable.join("·")}이에요. 면접·중요한 날엔 그 기운의 색을 한 점 걸치면 마음이 단단해져요(재미로).`);
  }
  tips.push(`가장 도드라진 ${top} 기운을 숨기지 말고 자기소개·면접에서 강점으로 내세워 보세요.`);

  return {
    aptitudeKeyword: APTITUDE_KEYWORD[top],
    fields,
    aptitudeReason,
    timing,
    bestYears,
    tips,
  };
}
