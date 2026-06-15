// 24절기 계산 (태양 황경 기반, Meeus 저정밀 알고리즘)
// 사주의 연주/월주 경계와 대운 시작 나이 계산에 쓰입니다.
//
// 핵심: 절기는 태양의 황경(ecliptic longitude)이 특정 각도에 도달하는 "순간"입니다.
// 월주를 가르는 12개의 "절(節)"은 황경 315°(입춘)부터 30° 간격입니다.
// 모든 시각은 한국 표준시(KST, UTC+9)로 변환해 반환합니다.

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// JS Date(UTC) → Julian Day (천문)
function dateToJD(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}
function jdToDate(jd: number): Date {
  return new Date((jd - 2440587.5) * 86400000);
}

// 태양의 겉보기 황경(도, 0~360). Meeus 저정밀(정확도 ~0.01°).
export function sunApparentLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  // 기하 평균 황경
  let L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  // 평균 근점이각
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const Mrad = toRad(M);
  // 중심차
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
    0.000289 * Math.sin(3 * Mrad);
  const trueLong = L0 + C;
  // 장동/광행차 보정
  const omega = 125.04 - 1934.136 * T;
  const lambda = trueLong - 0.00569 - 0.00478 * Math.sin(toRad(omega));
  return ((lambda % 360) + 360) % 360;
}

// 두 각도 차이를 [-180, 180) 로 정규화
function angleDiff(a: number, b: number): number {
  let d = (a - b) % 360;
  if (d >= 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

// targetLongitude(도)에 태양이 도달하는 시각(KST Date)을 구한다.
// nearJD 부근에서 뉴턴 반복으로 수렴.
function solveLongitude(targetLong: number, nearJD: number): Date {
  let jd = nearJD;
  for (let i = 0; i < 8; i++) {
    const lon = sunApparentLongitude(jd);
    const diff = angleDiff(targetLong, lon); // 도
    if (Math.abs(diff) < 1e-7) break;
    jd += diff / 0.98564736; // 태양 평균 운동 ≈ 0.9856°/일
  }
  return jdToDate(jd);
}

// 절기 정의: 12 절(節) — 월주 경계. 황경 순서대로.
// index 0 = 입춘(315°), 인월(寅月) 시작.
export interface SolarTerm {
  name: string;
  longitude: number; // 황경(도)
  monthBranchIndex: number; // 이 절기로 시작되는 월의 지지 인덱스(인=2 기준)
}

// 12 절(節) — 월주를 가르는 절기 (중기 12개는 월주 경계가 아니므로 제외)
export const NODE_TERMS: SolarTerm[] = [
  { name: "입춘", longitude: 315, monthBranchIndex: 2 }, // 인월
  { name: "경칩", longitude: 345, monthBranchIndex: 3 }, // 묘월
  { name: "청명", longitude: 15, monthBranchIndex: 4 }, // 진월
  { name: "입하", longitude: 45, monthBranchIndex: 5 }, // 사월
  { name: "망종", longitude: 75, monthBranchIndex: 6 }, // 오월
  { name: "소서", longitude: 105, monthBranchIndex: 7 }, // 미월
  { name: "입추", longitude: 135, monthBranchIndex: 8 }, // 신월
  { name: "백로", longitude: 165, monthBranchIndex: 9 }, // 유월
  { name: "한로", longitude: 195, monthBranchIndex: 10 }, // 술월
  { name: "입동", longitude: 225, monthBranchIndex: 11 }, // 해월
  { name: "대설", longitude: 255, monthBranchIndex: 0 }, // 자월
  { name: "소한", longitude: 285, monthBranchIndex: 1 }, // 축월
];

// 특정 연도의 12 절기 시각(KST)을 모두 구한다.
// 황경 기준 연도 안에서 각 절기가 대략 어느 날짜인지 추정해 수렴.
export interface DatedTerm {
  name: string;
  longitude: number;
  monthBranchIndex: number;
  date: Date; // KST
}

// 연도 year(양력)의 절기들을 구한다. (입춘~소한까지 그 해에 일어나는 12개)
export function solarTermsOfYear(year: number): DatedTerm[] {
  const result: DatedTerm[] = [];
  for (const term of NODE_TERMS) {
    // 절기의 대략적 통상 날짜로 초기 추정 (정확도 무관, 수렴용)
    // 입춘≈2/4, 이후 약 30.4일 간격
    const approxDayOfYear = approxDOY(term.longitude);
    const guessUTC = new Date(Date.UTC(year, 0, 1) + (approxDayOfYear - 1) * 86400000);
    const guessJD = dateToJD(guessUTC);
    const exactUTC = solveLongitude(term.longitude, guessJD);
    // KST 로 변환
    const kst = new Date(exactUTC.getTime() + KST_OFFSET_MS);
    result.push({
      name: term.name,
      longitude: term.longitude,
      monthBranchIndex: term.monthBranchIndex,
      date: kst,
    });
  }
  result.sort((a, b) => a.date.getTime() - b.date.getTime());
  return result;
}

// 황경 → 그 해 대략적 day-of-year (초기 추정용)
function approxDOY(longitude: number): number {
  // 춘분(황경 0°)이 대략 3/20 (DOY 79). 황경 1° ≈ 1.0146일.
  // longitude 를 (0=춘분 기준)으로 환산.
  const fromSpring = ((longitude % 360) + 360) % 360;
  let doy = 79 + fromSpring * 1.0146;
  // 입춘(315°)·소한(285°)·대설(255°) 등 늦은 황경은 이듬해 1~2월에 해당 →
  // 해당 연도 안으로 되돌린다(연도 경계 래핑).
  while (doy > 365) doy -= 365.2422;
  while (doy < 1) doy += 365.2422;
  return doy;
}

// 어떤 KST 시각이 속한 "월주 절기"와, 직전/직후 절기를 구한다.
// 대운 시작 나이 계산을 위해 직전/직후 절기까지의 일수가 필요.
export interface MonthTermContext {
  current: DatedTerm; // 출생이 속한 월의 시작 절기
  next: DatedTerm; // 다음 절기
  prev: DatedTerm; // 직전 절기
}

export function monthTermContext(birthKST: Date): MonthTermContext {
  const y = birthKST.getFullYear();
  // 전년/금년/내년 절기를 모아 시간순 정렬
  const all = [
    ...solarTermsOfYear(y - 1),
    ...solarTermsOfYear(y),
    ...solarTermsOfYear(y + 1),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  const t = birthKST.getTime();
  let idx = -1;
  for (let i = 0; i < all.length; i++) {
    if (all[i].date.getTime() <= t) idx = i;
    else break;
  }
  if (idx < 0) idx = 0;
  if (idx >= all.length - 1) idx = all.length - 2;
  return { current: all[idx], next: all[idx + 1], prev: all[idx - 1] ?? all[idx] };
}
