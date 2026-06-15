// 사주팔자 카드용 상세 데이터 — 지장간 / 십이운성 / 신살 / 방위 / 음양.
// 전부 전통 명리 표준 테이블을 코드로 옮긴 것이며 "참고용 · 재미로"의 범위 안에서 씁니다.
// 표준 테이블 검산: 무(戊) 일간, 지지 오/술/미 → 십이운성 제왕/묘/쇠, 12신살 육해/천살/화개와 일치.

import {
  STEMS, BRANCHES, Stem, Branch, Element, YinYang,
  STEM_HANJA, STEM_ELEMENT, STEM_YINYANG, BRANCH_YINYANG,
  ELEMENT_COLOR, branchIndex, tenGodOf, TenGod,
} from "./constants";
import type { SajuChart, Pillar } from "./engine";

// ── 지장간(支藏干): 여기 → 중기 → 정기(본기) ──────────────────────────
export const BRANCH_HIDDEN: Record<Branch, Stem[]> = {
  자: ["임", "계"],
  축: ["계", "신", "기"],
  인: ["무", "병", "갑"],
  묘: ["갑", "을"],
  진: ["을", "계", "무"],
  사: ["무", "경", "병"],
  오: ["병", "기", "정"],
  미: ["정", "을", "기"],
  신: ["무", "임", "경"],
  유: ["경", "신"],
  술: ["신", "정", "무"],
  해: ["무", "갑", "임"],
};

// ── 십이운성(十二運星) ──────────────────────────────────────────────
const STAGES = ["장생", "목욕", "관대", "건록", "제왕", "쇠", "병", "사", "묘", "절", "태", "양"] as const;
// 일간별 장생(長生) 지지. 양간은 순행, 음간은 역행.
const CHANGSAENG: Record<Stem, Branch> = {
  갑: "해", 병: "인", 무: "인", 경: "사", 임: "신",
  을: "오", 정: "유", 기: "유", 신: "자", 계: "묘",
};
export function twelveStage(dayStem: Stem, branch: Branch): string {
  const start = branchIndex(CHANGSAENG[dayStem]);
  const yang = STEM_YINYANG[dayStem] === "양";
  let off = (branchIndex(branch) - start) * (yang ? 1 : -1);
  off = ((off % 12) + 12) % 12;
  return STAGES[off];
}

// ── 신살(神殺) ──────────────────────────────────────────────────────
// 12신살: 년지 삼합국 기준. 겁살 시작 지지 인덱스(목국 신, 화국 해, 금국 인, 수국 사).
const SINSAL12 = [
  "겁살", "재살", "천살", "지살", "연살", "월살",
  "망신살", "장성살", "반안살", "역마살", "육해살", "화개살",
] as const;
function groupStart(yearBranch: Branch): number {
  const i = branchIndex(yearBranch);
  // 해묘미(목)=11,3,7 / 인오술(화)=2,6,10 / 사유축(금)=5,9,1 / 신자진(수)=8,0,4
  if ([11, 3, 7].includes(i)) return 8; // 목국 → 겁살 신
  if ([2, 6, 10].includes(i)) return 11; // 화국 → 겁살 해
  if ([5, 9, 1].includes(i)) return 2; // 금국 → 겁살 인
  return 5; // 수국 → 겁살 사
}
function sinsal12(yearBranch: Branch, target: Branch): string {
  const pos = ((branchIndex(target) - groupStart(yearBranch)) % 12 + 12) % 12;
  return SINSAL12[pos];
}

// 양인살(羊刃): 양간 일간의 제왕지. 음간은 없음.
const YANGIN: Partial<Record<Stem, Branch>> = { 갑: "묘", 병: "오", 무: "오", 경: "유", 임: "자" };

// 천을귀인(天乙貴人): 일간 기준 길성 지지 2개.
const CHEONEUL: Record<Stem, Branch[]> = {
  갑: ["축", "미"], 무: ["축", "미"], 경: ["축", "미"],
  을: ["자", "신"], 기: ["자", "신"],
  병: ["해", "유"], 정: ["해", "유"],
  임: ["사", "묘"], 계: ["사", "묘"],
  신: ["오", "인"],
};

export interface SinsalChip { name: string; tone: "fortune" | "neutral" | "caution" }
export function pillarSinsal(chart: SajuChart, branch: Branch): SinsalChip[] {
  const out: SinsalChip[] = [];
  const s12 = sinsal12(chart.pillars.year.branch, branch);
  const cautionSet = ["겁살", "재살", "천살", "지살", "월살", "망신살", "육해살"];
  out.push({ name: s12, tone: cautionSet.includes(s12) ? "caution" : "neutral" });
  if (YANGIN[chart.dayStem] === branch) out.push({ name: "양인살", tone: "caution" });
  if (CHEONEUL[chart.dayStem]?.includes(branch)) out.push({ name: "천을귀인", tone: "fortune" });
  return out;
}

// ── 방위(方位): 지지 → 가까운 4정방위 (레퍼런스와 동일한 단순화) ──────────
export const BRANCH_DIRECTION: Record<Branch, string> = {
  자: "북", 축: "북", 인: "동", 묘: "동", 진: "남", 사: "남",
  오: "남", 미: "남", 신: "서", 유: "서", 술: "서", 해: "북",
};

// ── 카드 한 칸에 필요한 모든 표시 데이터 ────────────────────────────
export interface HiddenView { stem: Stem; hanja: string; element: Element; tenGod: TenGod; color: string }
export interface PillarView {
  head: string;
  isDay: boolean;
  // 천간
  stem: Stem; stemHanja: string; stemElement: Element; stemColor: string;
  stemYin: YinYang; stemTenGod: string;
  // 지지
  branch: Branch; branchHanja: string; branchElement: Element; branchColor: string;
  branchYin: YinYang; branchTenGod: string; direction: string;
  // 상세
  hidden: HiddenView[];
  sinsal: SinsalChip[];
  stage: string; // 십이운성
}

export function buildPillarView(chart: SajuChart, p: Pillar, head: string, isDay: boolean): PillarView {
  const hidden: HiddenView[] = BRANCH_HIDDEN[p.branch].map((st) => ({
    stem: st,
    hanja: STEM_HANJA[st],
    element: STEM_ELEMENT[st],
    tenGod: tenGodOf(chart.dayStem, st),
    color: ELEMENT_COLOR[STEM_ELEMENT[st]],
  }));
  return {
    head,
    isDay,
    stem: p.stem,
    stemHanja: p.hanja[0],
    stemElement: p.stemElement,
    stemColor: ELEMENT_COLOR[p.stemElement],
    stemYin: STEM_YINYANG[p.stem],
    stemTenGod: isDay ? "일원" : (p.stemTenGod ?? ""),
    branch: p.branch,
    branchHanja: p.hanja[1],
    branchElement: p.branchElement,
    branchColor: ELEMENT_COLOR[p.branchElement],
    branchYin: BRANCH_YINYANG[p.branch],
    branchTenGod: p.branchTenGod,
    direction: BRANCH_DIRECTION[p.branch],
    hidden,
    sinsal: pillarSinsal(chart, p.branch),
    stage: twelveStage(chart.dayStem, p.branch),
  };
}
