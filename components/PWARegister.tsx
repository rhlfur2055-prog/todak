"use client";

import { useEffect } from "react";

// 서비스워커 등록 — 오프라인 동작 + 설치 가능(PWA). 실패해도 앱은 그대로 동작.
export function PWARegister() {
  useEffect(() => {
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
