// 음력 → 양력 변환 (korean-lunar-calendar, 오프라인·무료, 1000~2050년)
import KoreanLunarCalendar from "korean-lunar-calendar";

export interface SolarDate {
  year: number;
  month: number;
  day: number;
}

export function lunarToSolar(
  year: number,
  month: number,
  day: number,
  isLeapMonth = false,
): SolarDate | null {
  const cal = new KoreanLunarCalendar();
  const ok = cal.setLunarDate(year, month, day, isLeapMonth);
  if (!ok) return null;
  const s = cal.getSolarCalendar();
  return { year: s.year, month: s.month, day: s.day };
}
