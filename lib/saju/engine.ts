// 사주 엔진 — 생년월일시 → 사주팔자 / 오행 / 십성 / 대운 / 세운 / 월운
// 전부 클라이언트(브라우저)에서 계산됩니다. 외부 서버 전송 없음.
//
// 한계: 절기는 천문 저정밀 알고리즘(±수 분)으로 계산합니다. 절기 경계의 분 단위
// 출생은 오차가 있을 수 있습니다. 표준시는 현행 KST(UTC+9)를 사용합니다(역사적
// 표준시 변경/서머타임 미보정). "참고용"으로만 사용하세요.

import {
  STEMS, BRANCHES, Stem, Branch, Element, ELEMENTS,
  STEM_ELEMENT, BRANCH_ELEMENT, BRANCH_MAIN_STEM,
  stemOf, branchOf, stemIndex, branchIndex,
  tenGodOf, tenGodOfBranch, TenGod, STEM_HANJA, BRANCH_HANJA,
} from "./constants";
import { monthTermContext, DatedTerm } from "./solarTerms";

// 일주(日柱) 60갑자 기준 보정값. scripts/verify-saju.ts 에서 manseryeok 라이브러리를
// 오라클로 교차검증해 결정한 값입니다. (검증 후 확정)
export const DAY_GANZI_OFFSET = 49;

export type Gender = "남" | "여";
export type LateNightRule = "midnight" | "next-day";

export interface BirthInput {
  year: number;
  month: number; // 1-12 (양력)
  day: number; // 1-31 (양력)
  hour?: number; // 0-23, 모름이면 undefined
  minute?: number; // 0-59
  gender: Gender;
  hourUnknown?: boolean;
}

export interface Pillar {
  stem: Stem;
  branch: Branch;
  ganziIndex: number;
  label: string; // 예: "갑자"
  hanja: string; // 예: "甲子"
  stemElement: Element;
  branchElement: Element;
  stemTenGod: TenGod | null; // 일간 기준 (일주의 천간은 null = 일간 자기 자신)
  branchTenGod: TenGod;
}

export interface DaeunItem {
  index: number;
  startAge: number; // 만 나이(소수 가능)
  startYear: number;
  stem: Stem;
  branch: Branch;
  ganziIndex: number;
  label: string;
}

export interface SeunItem {
  year: number;
  stem: Stem;
  branch: Branch;
  ganziIndex: number;
  label: string;
}

export interface WolunItem {
  month: number; // 1-12 (절기 기준 월)
  monthBranch: Branch;
  stem: Stem;
  branch: Branch;
  label: string;
  termName: string;
}

export interface SajuChart {
  input: BirthInput;
  birthKST: Date;
  pillars: {
    year: Pillar;
    month: Pillar;
    day: Pillar;
    hour: Pillar | null; // 시 모름이면 null
  };
  dayStem: Stem; // 일간
  dayElement: Element;
  elementCount: Record<Element, number>; // 오행 분포(8자 기준, 시 모름이면 6자)
  daeunDirection: "순행" | "역행";
  daeunStartAge: number;
  daeun: DaeunItem[];
  seun: SeunItem[]; // 올해 포함 향후 10년
  wolun: WolunItem[]; // 올해 12개월
  monthTerm: DatedTerm; // 출생 월의 절기
}

// 양력 날짜 → JDN(정오 기준 정수). 그레고리력.
function gregorianToJDN(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return (
    d +
    Math.floor((153 * mm + 2) / 5) +
    365 * yy +
    Math.floor(yy / 4) -
    Math.floor(yy / 100) +
    Math.floor(yy / 400) -
    32045
  );
}

// 검증 스크립트용 export
export function gregorianToJDNExport(y: number, m: number, d: number): number {
  return gregorianToJDN(y, m, d);
}

function pillarFromGanzi(ganziIndex: number, dayStem: Stem | null, isDayPillar = false): Pillar {
  const idx = ((ganziIndex % 60) + 60) % 60;
  const stem = stemOf(idx);
  const branch = branchOf(idx);
  return {
    stem,
    branch,
    ganziIndex: idx,
    label: `${stem}${branch}`,
    hanja: `${STEM_HANJA[stem]}${BRANCH_HANJA[branch]}`,
    stemElement: STEM_ELEMENT[stem],
    branchElement: BRANCH_ELEMENT[branch],
    stemTenGod: isDayPillar || !dayStem ? null : tenGodOf(dayStem, stem),
    branchTenGod: tenGodOfBranch(dayStem ?? stem, branch),
  };
}

// 인월(寅月) 천간 인덱스 (오호둔)
function firstMonthStemIndex(yearStemIdx: number): number {
  return ((yearStemIdx % 5) * 2 + 2) % 10;
}

// 자시(子時) 천간 인덱스 (오자둔)
function ziHourStemIndex(dayStemIdx: number): number {
  return ((dayStemIdx % 5) * 2) % 10;
}

export function computeSaju(input: BirthInput): SajuChart {
  const hour = input.hourUnknown ? undefined : input.hour;
  const minute = input.minute ?? 0;
  const birthKST = new Date(
    input.year,
    input.month - 1,
    input.day,
    hour ?? 12,
    minute,
  );
  // 계산 기준 시: KST 로 취급 (로컬 Date 의 시/분을 그대로 사용)

  // --- 월주 절기 컨텍스트 ---
  const ctx = monthTermContext(birthKST);
  const monthTerm = ctx.current;

  // --- 연주 ---
  // 입춘 이전이면 전년. monthTerm 이 "소한/대설/입동..."이면 그대로, 단 입춘 경계 판정:
  // 사주년도 = 입춘 기준. monthTerm.monthBranchIndex 가 1(축월)/0(자월)이고 1월~2월초면 전년 가능.
  // 간단·정확하게: 가장 최근의 입춘과 비교.
  const sajuYear = resolveSajuYear(birthKST);
  const yearGanziIndex = ((sajuYear - 1984) % 60 + 60) % 60;
  const yearPillar = pillarFromGanzi(yearGanziIndex, null);

  // --- 월주 ---
  const monthBranchIdx = monthTerm.monthBranchIndex;
  const monthNumberFromTiger = ((monthBranchIdx - 2) + 12) % 12; // 인월=0
  const firstStem = firstMonthStemIndex(stemIndex(yearPillar.stem));
  const monthStemIdx = (firstStem + monthNumberFromTiger) % 10;
  const monthGanziIndex = ganziFromStemBranch(monthStemIdx, monthBranchIdx);
  const monthPillar = pillarFromGanzi(monthGanziIndex, null);

  // --- 일주 ---
  // 야자시 처리: 기본 'midnight'(자정 경계). 23시 출생도 당일 일주 사용.
  const jdn = gregorianToJDN(input.year, input.month, input.day);
  let dayGanziIndex = ((jdn + DAY_GANZI_OFFSET) % 60 + 60) % 60;
  const dayStem = stemOf(dayGanziIndex);
  const dayElement = STEM_ELEMENT[dayStem];

  // 일간 확정 후 일주/연주/월주의 십성 채우기
  const dayPillar = pillarFromGanzi(dayGanziIndex, dayStem, true);
  const yearPillar2 = pillarFromGanzi(yearGanziIndex, dayStem);
  const monthPillar2 = pillarFromGanzi(monthGanziIndex, dayStem);

  // --- 시주 ---
  let hourPillar: Pillar | null = null;
  if (hour !== undefined) {
    const hourBranchIdx = Math.floor(((hour + 1) % 24) / 2) % 12; // 자=0
    const ziStem = ziHourStemIndex(stemIndex(dayStem));
    const hourStemIdx = (ziStem + hourBranchIdx) % 10;
    const hourGanzi = ganziFromStemBranch(hourStemIdx, hourBranchIdx);
    hourPillar = pillarFromGanzi(hourGanzi, dayStem);
  }

  // --- 오행 분포 ---
  const elementCount: Record<Element, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  const collectPillars = [yearPillar2, monthPillar2, dayPillar];
  if (hourPillar) collectPillars.push(hourPillar);
  for (const p of collectPillars) {
    elementCount[STEM_ELEMENT[p.stem]] += 1;
    elementCount[BRANCH_ELEMENT[p.branch]] += 1;
  }

  // --- 대운 방향 ---
  const yearYang = isYangStem(yearPillar.stem);
  const forward =
    (yearYang && input.gender === "남") || (!yearYang && input.gender === "여");
  const daeunDirection: "순행" | "역행" = forward ? "순행" : "역행";

  // --- 대운 시작 나이 ---
  const msPerDay = 86400000;
  let daysToBoundary: number;
  if (forward) {
    // 순행: 출생 → 다음 절입까지 거리
    daysToBoundary = (ctx.next.date.getTime() - birthKST.getTime()) / msPerDay;
  } else {
    // 역행: 출생 → 이번 달을 연 절입(현재 절기)까지 거꾸로
    daysToBoundary = (birthKST.getTime() - ctx.current.date.getTime()) / msPerDay;
  }
  if (daysToBoundary < 0) daysToBoundary = 0;
  const daeunStartAge = daysToBoundary / 3; // 3일 = 1년

  // --- 대운 목록 (8개 = 80년) ---
  const daeun: DaeunItem[] = [];
  for (let i = 0; i < 9; i++) {
    const step = forward ? i + 1 : -(i + 1);
    const gi = ((monthGanziIndex + step) % 60 + 60) % 60;
    const startAge = daeunStartAge + i * 10;
    daeun.push({
      index: i,
      startAge,
      startYear: input.year + Math.floor(startAge),
      stem: stemOf(gi),
      branch: branchOf(gi),
      ganziIndex: gi,
      label: `${stemOf(gi)}${branchOf(gi)}`,
    });
  }

  // --- 세운 (올해부터 10년) ---
  const thisYear = new Date().getFullYear();
  const seun: SeunItem[] = [];
  for (let y = thisYear; y < thisYear + 10; y++) {
    const gi = ((y - 1984) % 60 + 60) % 60;
    seun.push({
      year: y,
      stem: stemOf(gi),
      branch: branchOf(gi),
      ganziIndex: gi,
      label: `${stemOf(gi)}${branchOf(gi)}`,
    });
  }

  // --- 월운 (올해 12개월, 절기 기준) ---
  const wolun: WolunItem[] = [];
  const curYearGanzi = ((thisYear - 1984) % 60 + 60) % 60;
  const curYearStem = stemOf(curYearGanzi);
  const firstStemCur = firstMonthStemIndex(stemIndex(curYearStem));
  const TERM_NAMES = ["입춘", "경칩", "청명", "입하", "망종", "소서", "입추", "백로", "한로", "입동", "대설", "소한"];
  for (let m = 0; m < 12; m++) {
    const branchIdx = (2 + m) % 12; // 인월부터
    const stemIdx = (firstStemCur + m) % 10;
    wolun.push({
      month: m + 1,
      monthBranch: branchOf(branchIdx),
      stem: stemOf(stemIdx),
      branch: branchOf(branchIdx),
      label: `${stemOf(stemIdx)}${branchOf(branchIdx)}`,
      termName: TERM_NAMES[m],
    });
  }

  return {
    input,
    birthKST,
    pillars: { year: yearPillar2, month: monthPillar2, day: dayPillar, hour: hourPillar },
    dayStem,
    dayElement,
    elementCount,
    daeunDirection,
    daeunStartAge,
    daeun,
    seun,
    wolun,
    monthTerm,
  };
}

// 천간 인덱스 + 지지 인덱스 → 60갑자 인덱스 (중국 잉여정리)
function ganziFromStemBranch(stemIdx: number, branchIdx: number): number {
  // ganzi % 10 = stemIdx, ganzi % 12 = branchIdx
  for (let i = 0; i < 60; i++) {
    if (i % 10 === ((stemIdx % 10) + 10) % 10 && i % 12 === ((branchIdx % 12) + 12) % 12) {
      return i;
    }
  }
  return 0;
}

function isYangStem(stem: Stem): boolean {
  return stemIndex(stem) % 2 === 0;
}

// 입춘 기준 사주 연도 판정
function resolveSajuYear(birthKST: Date): number {
  const y = birthKST.getFullYear();
  // 그 해 입춘 시각을 구해 비교
  const ctx = monthTermContext(birthKST);
  // monthTerm 체계로 직접: birth 이전의 가장 최근 입춘을 찾는다
  // 간단히: 1~2월이고 아직 입춘 전이면 전년
  // monthTermContext.current 가 '소한'(축월) 또는 '대설/입동'이고 달이 1~2월이면 전년 가능
  // 정확한 방법: 올해 입춘과 비교
  const ipChunThisYear = ipChun(y);
  if (birthKST.getTime() < ipChunThisYear.getTime()) {
    return y - 1;
  }
  return y;
}

// 특정 연도 입춘 시각(KST)
import { solarTermsOfYear } from "./solarTerms";
function ipChun(year: number): Date {
  const terms = solarTermsOfYear(year);
  const t = terms.find((x) => x.name === "입춘");
  return t ? t.date : new Date(year, 1, 4);
}

export { ELEMENTS };
