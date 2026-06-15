// 오늘 본 결과 저장 — 통합 리포트 "오늘의 나"에서 묶기 위함.
// 이 브라우저(localStorage)에만. 사진·원본은 저장하지 않고, 해석 텍스트 요약만.
"use client";

import type { ReadingResult } from "@/lib/face/vision";
import type { ScsResult } from "@/lib/psych/scs";

const FACE_KEY = "todak-face";
const HAND_KEY = "todak-hand";
const PSYCH_KEY = "todak-psych";

export interface Stamped<T> { at: string; data: T }

function read<T>(key: string): Stamped<T> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Stamped<T>) : null;
  } catch {
    return null;
  }
}
function write<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify({ at: new Date().toISOString(), data }));
  } catch {}
}

export const saveFace = (r: ReadingResult) => write(FACE_KEY, r);
export const saveHand = (r: ReadingResult) => write(HAND_KEY, r);
export const savePsych = (r: ScsResult) => write(PSYCH_KEY, r);

export const loadFace = () => read<ReadingResult>(FACE_KEY);
export const loadHand = () => read<ReadingResult>(HAND_KEY);
export const loadPsych = () => read<ScsResult>(PSYCH_KEY);

export function clearResults() {
  [FACE_KEY, HAND_KEY, PSYCH_KEY].forEach((k) => {
    try { localStorage.removeItem(k); } catch {}
  });
}
