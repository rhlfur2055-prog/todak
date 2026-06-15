// 사주 엔진 정확도 검증
// manseryeok(2.0.0) 라이브러리를 "오라클"로 삼아 내 엔진과 교차검증한다.
// 실행: npm run verify:saju
//
// 비교 기준: 진태양시 보정 없음(trueSolarTime 미지정), 일경계 'midnight' — 내 엔진과 동일 가정.

import { calculateFourPillars, type BirthInfo, type HeavenlyStem } from "manseryeok";
import { computeSaju, gregorianToJDNExport, type BirthInput } from "../lib/saju/engine";

// manseryeok 천간/지지는 한글 1글자. 내 엔진도 한글. 직접 비교 가능.

function pillarStr(stem: string, branch: string): string {
  return `${stem}${branch}`;
}

// --- 1) 일주 보정값(DAY_GANZI_OFFSET) 캘리브레이션 ---
// 기준 날짜 하나로 manseryeok 일주에 맞는 offset 을 역산.
function calibrateOffset(): number {
  const cal = { year: 2000, month: 5, day: 15 };
  const oracle = calculateFourPillars({ ...cal, hour: 12, minute: 0 });
  const oracleDayStem = oracle.day.heavenlyStem;
  const oracleDayBranch = oracle.day.earthlyBranch;
  const STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
  const BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
  const targetStem = STEMS.indexOf(oracleDayStem);
  const targetBranch = BRANCHES.indexOf(oracleDayBranch);
  const jdn = gregorianToJDNExport(cal.year, cal.month, cal.day);
  for (let off = 0; off < 60; off++) {
    const gi = (((jdn + off) % 60) + 60) % 60;
    if (gi % 10 === targetStem && gi % 12 === targetBranch) {
      return off;
    }
  }
  return -1;
}

function randInt(lo: number, hi: number): number {
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

function run() {
  console.log("=== 사주 엔진 검증 (oracle: manseryeok 2.0.0) ===\n");

  const off = calibrateOffset();
  console.log(`캘리브레이션된 DAY_GANZI_OFFSET = ${off}`);
  console.log(`(engine.ts 의 DAY_GANZI_OFFSET 값과 일치해야 합니다)\n`);

  const N = 400;
  let yearOk = 0, monthOk = 0, dayOk = 0, hourOk = 0;
  const fails: string[] = [];

  for (let i = 0; i < N; i++) {
    const y = randInt(1940, 2030);
    const m = randInt(1, 12);
    const d = randInt(1, 28);
    const h = randInt(0, 22); // 23시는 일경계 처리 차이 가능성 있어 제외(아래서 별도)
    const minute = randInt(0, 59);
    const gender = Math.random() < 0.5 ? "남" : "여";

    const input: BirthInput = { year: y, month: m, day: d, hour: h, minute, gender };
    const mine = computeSaju(input);
    const oracle = calculateFourPillars({
      year: y, month: m, day: d, hour: h, minute,
      gender: gender === "남" ? "male" : "female",
    });

    const checks: [string, string, string][] = [
      ["year", pillarStr(mine.pillars.year.stem, mine.pillars.year.branch), pillarStr(oracle.year.heavenlyStem, oracle.year.earthlyBranch)],
      ["month", pillarStr(mine.pillars.month.stem, mine.pillars.month.branch), pillarStr(oracle.month.heavenlyStem, oracle.month.earthlyBranch)],
      ["day", pillarStr(mine.pillars.day.stem, mine.pillars.day.branch), pillarStr(oracle.day.heavenlyStem, oracle.day.earthlyBranch)],
      ["hour", pillarStr(mine.pillars.hour!.stem, mine.pillars.hour!.branch), pillarStr(oracle.hour.heavenlyStem, oracle.hour.earthlyBranch)],
    ];

    for (const [name, a, b] of checks) {
      if (a === b) {
        if (name === "year") yearOk++;
        else if (name === "month") monthOk++;
        else if (name === "day") dayOk++;
        else hourOk++;
      } else if (fails.length < 25) {
        fails.push(`${y}-${m}-${d} ${h}:${minute} [${name}] mine=${a} oracle=${b}`);
      }
    }
  }

  const pct = (n: number) => ((n / N) * 100).toFixed(1) + "%";
  console.log(`샘플 ${N}건 비교 결과`);
  console.log(`  연주(年柱): ${yearOk}/${N}  (${pct(yearOk)})`);
  console.log(`  월주(月柱): ${monthOk}/${N}  (${pct(monthOk)})`);
  console.log(`  일주(日柱): ${dayOk}/${N}  (${pct(dayOk)})`);
  console.log(`  시주(時柱): ${hourOk}/${N}  (${pct(hourOk)})`);

  if (fails.length) {
    console.log(`\n불일치 사례 (최대 25):`);
    fails.forEach((f) => console.log("  - " + f));
  } else {
    console.log("\n✅ 모든 샘플에서 사주팔자 4기둥이 오라클과 100% 일치");
  }

  // --- 대운 검증 ---
  console.log("\n=== 대운(大運) 검증 ===");
  const dcases: BirthInput[] = [
    { year: 1990, month: 3, day: 15, hour: 10, minute: 30, gender: "남" },
    { year: 1985, month: 11, day: 2, hour: 6, minute: 0, gender: "여" },
    { year: 2001, month: 7, day: 20, hour: 23, minute: 10, gender: "남" },
  ];
  for (const c of dcases) {
    const mine = computeSaju(c);
    const oracle = calculateFourPillars({
      year: c.year, month: c.month, day: c.day, hour: c.hour!, minute: c.minute!,
      gender: c.gender === "남" ? "male" : "female",
    });
    const lp = oracle.luckPillars!;
    const myDir = mine.daeunDirection === "순행";
    const myFirst = mine.daeun[0].label;
    const orFirst = lp.pillars[0]?.korean;
    console.log(
      `\n${c.year}-${c.month}-${c.day} (${c.gender}): ` +
        `방향 mine=${mine.daeunDirection}/${myDir} oracle=${lp.forward ? "순행" : "역행"}, ` +
        `대운수 mine≈${mine.daeunStartAge.toFixed(1)} oracle=${lp.startAge}, ` +
        `첫대운 mine=${myFirst} oracle=${orFirst}`,
    );
  }
}

run();
