// 프로필 저장 — 이 브라우저(localStorage)에만. 외부 전송 없음.
"use client";

import type { BirthFormValue } from "@/components/BirthForm";

const KEY = "todak-profiles";

export interface Profile extends BirthFormValue {
  id: string;
  createdAt: string;
}

export function loadProfiles(): Profile[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveProfile(v: BirthFormValue): Profile {
  const list = loadProfiles();
  const id = `${Date.now()}-${Math.floor(Math.random() * 1e4)}`;
  const p: Profile = { ...v, id, createdAt: new Date().toISOString() };
  list.unshift(p);
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 50)));
  } catch {}
  return p;
}

export function deleteProfile(id: string) {
  const list = loadProfiles().filter((p) => p.id !== id);
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
}
