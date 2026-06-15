// 사주(명리) 기본 상수 테이블
// 모든 해석은 "전통 명리학 기반 · 재미로 봐주세요" 범위 안에서만 쓰입니다.

export type Element = "목" | "화" | "토" | "금" | "수";
export type YinYang = "양" | "음";

// 천간(天干) 10
export const STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"] as const;
export type Stem = (typeof STEMS)[number];

// 지지(地支) 12
export const BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"] as const;
export type Branch = (typeof BRANCHES)[number];

// 한자 표기 (표시용)
export const STEM_HANJA: Record<Stem, string> = {
  갑: "甲", 을: "乙", 병: "丙", 정: "丁", 무: "戊",
  기: "己", 경: "庚", 신: "辛", 임: "壬", 계: "癸",
};
export const BRANCH_HANJA: Record<Branch, string> = {
  자: "子", 축: "丑", 인: "寅", 묘: "卯", 진: "辰", 사: "巳",
  오: "午", 미: "未", 신: "申", 유: "酉", 술: "戌", 해: "亥",
};

// 천간 → 오행
export const STEM_ELEMENT: Record<Stem, Element> = {
  갑: "목", 을: "목", 병: "화", 정: "화", 무: "토",
  기: "토", 경: "금", 신: "금", 임: "수", 계: "수",
};

// 천간 → 음양
export const STEM_YINYANG: Record<Stem, YinYang> = {
  갑: "양", 을: "음", 병: "양", 정: "음", 무: "양",
  기: "음", 경: "양", 신: "음", 임: "양", 계: "음",
};

// 지지 → 오행
export const BRANCH_ELEMENT: Record<Branch, Element> = {
  자: "수", 축: "토", 인: "목", 묘: "목", 진: "토", 사: "화",
  오: "화", 미: "토", 신: "금", 유: "금", 술: "토", 해: "수",
};

// 지지 → 음양
export const BRANCH_YINYANG: Record<Branch, YinYang> = {
  자: "양", 축: "음", 인: "양", 묘: "음", 진: "양", 사: "음",
  오: "양", 미: "음", 신: "양", 유: "음", 술: "양", 해: "음",
};

// 지지 지장간(支藏干) 본기(本氣) — 오행 분포 가중치 계산용(간이: 본기만 사용)
export const BRANCH_MAIN_STEM: Record<Branch, Stem> = {
  자: "계", 축: "기", 인: "갑", 묘: "을", 진: "무", 사: "병",
  오: "정", 미: "기", 신: "경", 유: "신", 술: "무", 해: "임",
};

// 오행 상생(生): A 가 B 를 생한다
export const GENERATES: Record<Element, Element> = {
  목: "화", 화: "토", 토: "금", 금: "수", 수: "목",
};
// 오행 상극(剋): A 가 B 를 극한다
export const CONTROLS: Record<Element, Element> = {
  목: "토", 토: "수", 수: "화", 화: "금", 금: "목",
};

export const ELEMENTS: Element[] = ["목", "화", "토", "금", "수"];

// 오행 색 (차분한 톤, 그라데이션 없이 단색)
export const ELEMENT_COLOR: Record<Element, string> = {
  목: "#7C9A6E", // 세이지
  화: "#D99B72", // 연살구
  토: "#C7A77B", // 모래
  금: "#A9B0B8", // 차분한 그레이블루
  수: "#7E96B8", // 가라앉은 블루
};

// 십성(十星) 이름
export type TenGod =
  | "비견" | "겁재"
  | "식신" | "상관"
  | "편재" | "정재"
  | "편관" | "정관"
  | "편인" | "정인";

// 60갑자 인덱스 → 천간/지지
export function stemOf(ganziIndex: number): Stem {
  return STEMS[((ganziIndex % 10) + 10) % 10];
}
export function branchOf(ganziIndex: number): Branch {
  return BRANCHES[((ganziIndex % 12) + 12) % 12];
}

// 천간/지지 인덱스
export const stemIndex = (s: Stem) => STEMS.indexOf(s);
export const branchIndex = (b: Branch) => BRANCHES.indexOf(b);

// 일간(日干, dayStem) 기준 다른 천간의 십성 산출
export function tenGodOf(dayStem: Stem, other: Stem): TenGod {
  const de = STEM_ELEMENT[dayStem];
  const oe = STEM_ELEMENT[other];
  const sameYin = STEM_YINYANG[dayStem] === STEM_YINYANG[other];

  if (de === oe) return sameYin ? "비견" : "겁재";
  if (GENERATES[de] === oe) return sameYin ? "식신" : "상관"; // 내가 생함 = 식상
  if (CONTROLS[de] === oe) return sameYin ? "편재" : "정재"; // 내가 극함 = 재성
  if (CONTROLS[oe] === de) return sameYin ? "편관" : "정관"; // 나를 극함 = 관성
  // 나를 생함(oe 가 de 를 생) = 인성
  return sameYin ? "편인" : "정인";
}

// 지지의 본기 천간으로 십성 산출
export function tenGodOfBranch(dayStem: Stem, branch: Branch): TenGod {
  return tenGodOf(dayStem, BRANCH_MAIN_STEM[branch]);
}
