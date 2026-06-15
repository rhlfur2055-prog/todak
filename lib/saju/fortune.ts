// 운세 점수 휴리스틱 (억부용신 抑扶用神 기반)
//
// ⚠️ 이 점수는 "예언"이 아니라, 전통 명리 규칙을 코드로 옮긴 휴리스틱입니다.
//   - 일간의 신강/신약을 판단하고
//   - 운(대운/세운/월운)의 간지 오행이 용신/희신이면 +, 기신/구신이면 - 로 점수화합니다.
//   - 곡선의 오르내림은 "이 시기 오행 기운이 나에게 유리/불리한 쪽인가"의 상대적 표현일 뿐입니다.
// 절대적 길흉이 아니며, 항상 "참고용"입니다.

import {
  Element, ELEMENTS, GENERATES, CONTROLS,
  STEM_ELEMENT, BRANCH_ELEMENT, Stem, Branch, branchIndex,
} from "./constants";
import { SajuChart } from "./engine";

export type Category = "비겁" | "인성" | "식상" | "재성" | "관성";

// 일간 오행 D 기준, 다른 오행 E 의 십성 카테고리
export function categoryOf(day: Element, e: Element): Category {
  if (e === day) return "비겁";
  if (GENERATES[e] === day) return "인성"; // E 가 나를 생함
  if (GENERATES[day] === e) return "식상"; // 내가 E 를 생함
  if (CONTROLS[day] === e) return "재성"; // 내가 E 를 극함
  return "관성"; // E 가 나를 극함
}

export interface YongsinResult {
  strength: number; // 신강 점수 (0~1, 0.5 기준)
  isStrong: boolean; // 신강 여부
  elementScore: Record<Element, number>; // 오행별 유불리 (-1.5 ~ +1.5)
  favorable: Element[]; // 용신/희신 (유리)
  unfavorable: Element[]; // 기신/구신 (불리)
  summary: string;
}

// 일간의 신강/신약 + 오행별 유불리 점수 산출
export function computeYongsin(chart: SajuChart): YongsinResult {
  const day = chart.dayElement;

  // 신강 점수: 8자(시 모름이면 6자) 중 비겁/인성 비중. 월지(월령) 가중.
  const chars: { el: Element; weight: number }[] = [];
  const p = chart.pillars;
  const push = (el: Element, w: number) => chars.push({ el, weight: w });

  push(STEM_ELEMENT[p.year.stem], 1);
  push(BRANCH_ELEMENT[p.year.branch], 1);
  push(STEM_ELEMENT[p.month.stem], 1);
  push(BRANCH_ELEMENT[p.month.branch], 2); // 월지 = 득령 여부, 가중 2배
  push(STEM_ELEMENT[p.day.stem], 1.2); // 일간 자신
  push(BRANCH_ELEMENT[p.day.branch], 1.2); // 일지 = 통근
  if (p.hour) {
    push(STEM_ELEMENT[p.hour.stem], 1);
    push(BRANCH_ELEMENT[p.hour.branch], 1);
  }

  let support = 0;
  let total = 0;
  for (const c of chars) {
    total += c.weight;
    const cat = categoryOf(day, c.el);
    if (cat === "비겁" || cat === "인성") support += c.weight;
  }
  const strength = total > 0 ? support / total : 0.5;
  const isStrong = strength >= 0.5;

  // 오행별 유불리 점수
  const elementScore: Record<Element, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  for (const e of ELEMENTS) {
    const cat = categoryOf(day, e);
    if (isStrong) {
      // 신강 → 빼주는(설기/극) 오행이 용신
      if (cat === "재성") elementScore[e] = 1.5;
      else if (cat === "관성") elementScore[e] = 1.0;
      else if (cat === "식상") elementScore[e] = 1.0;
      else if (cat === "인성") elementScore[e] = -1.0;
      else elementScore[e] = -1.5; // 비겁
    } else {
      // 신약 → 도와주는(생/부) 오행이 용신
      if (cat === "인성") elementScore[e] = 1.5;
      else if (cat === "비겁") elementScore[e] = 1.0;
      else if (cat === "식상") elementScore[e] = -1.0;
      else if (cat === "재성") elementScore[e] = -1.0;
      else elementScore[e] = -1.5; // 관성
    }
  }

  const favorable = ELEMENTS.filter((e) => elementScore[e] > 0);
  const unfavorable = ELEMENTS.filter((e) => elementScore[e] < 0);

  const summary = isStrong
    ? `일간(${day})이 비교적 강한 편입니다. 기운을 덜어내고 흐르게 하는 ${favorable.join("·")} 기운이 들어올 때 한결 편해지는 구조예요.`
    : `일간(${day})이 비교적 여린 편입니다. 나를 받쳐주고 채워주는 ${favorable.join("·")} 기운이 들어올 때 힘이 나는 구조예요.`;

  return { strength, isStrong, elementScore, favorable, unfavorable, summary };
}

// 지지 충(沖) 관계 (불안정 요인, 가벼운 감점)
const BRANCH_CLASH: Record<number, number> = {
  0: 6, 1: 7, 2: 8, 3: 9, 4: 10, 5: 11,
  6: 0, 7: 1, 8: 2, 9: 3, 10: 4, 11: 5,
};

export interface LuckScore {
  raw: number; // 대략 -1.5 ~ +1.5
  score: number; // 0~100 (표시용)
  stemEl: Element;
  branchEl: Element;
  reason: string;
}

// 운(대운/세운/월운) 한 칸의 간지를 점수화
export function scoreGanzi(
  chart: SajuChart,
  yong: YongsinResult,
  stem: Stem,
  branch: Branch,
): LuckScore {
  const stemEl = STEM_ELEMENT[stem];
  const branchEl = BRANCH_ELEMENT[branch];
  // 천간(0.4) + 지지(0.6) 가중
  let raw = yong.elementScore[stemEl] * 0.4 + yong.elementScore[branchEl] * 0.6;

  // 일지/년지와 충이면 가벼운 감점(변동·이동 기운)
  const dayBranchIdx = branchIndex(chart.pillars.day.branch);
  const bi = branchIndex(branch);
  let clash = false;
  if (BRANCH_CLASH[dayBranchIdx] === bi) {
    raw -= 0.25;
    clash = true;
  }

  const score = clamp(Math.round(50 + raw * 28), 5, 95);

  // 설명 문장
  const parts: string[] = [];
  const f = (el: Element, label: string) => {
    const v = yong.elementScore[el];
    if (v > 0) parts.push(`${label}의 ${el} 기운이 나에게 힘이 되는 쪽`);
    else if (v < 0) parts.push(`${label}의 ${el} 기운이 다소 부담이 되는 쪽`);
    else parts.push(`${label}의 ${el} 기운은 중립`);
  };
  f(stemEl, "천간");
  f(branchEl, "지지");
  if (clash) parts.push("내 일지와 부딪히는 흐름이라 변동이 잦을 수 있는 시기");

  return { raw, score, stemEl, branchEl, reason: parts.join(", ") + "." };
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

// 차트 전체에 대한 운세 시계열 산출
export interface FortuneSeries {
  yong: YongsinResult;
  daeun: { label: string; startAge: number; startYear: number; score: number; raw: number; reason: string }[];
  seun: { year: number; label: string; score: number; raw: number; reason: string; isThisYear: boolean }[];
  wolun: { month: number; label: string; termName: string; score: number; raw: number; reason: string }[];
}

export function computeFortuneSeries(chart: SajuChart): FortuneSeries {
  const yong = computeYongsin(chart);
  const thisYear = new Date().getFullYear();

  const daeun = chart.daeun.map((d) => {
    const s = scoreGanzi(chart, yong, d.stem, d.branch);
    return { label: d.label, startAge: d.startAge, startYear: d.startYear, score: s.score, raw: s.raw, reason: s.reason };
  });

  const seun = chart.seun.map((s) => {
    const sc = scoreGanzi(chart, yong, s.stem, s.branch);
    return { year: s.year, label: s.label, score: sc.score, raw: sc.raw, reason: sc.reason, isThisYear: s.year === thisYear };
  });

  const wolun = chart.wolun.map((w) => {
    const sc = scoreGanzi(chart, yong, w.stem, w.branch);
    return { month: w.month, label: w.label, termName: w.termName, score: sc.score, raw: sc.raw, reason: sc.reason };
  });

  return { yong, daeun, seun, wolun };
}
