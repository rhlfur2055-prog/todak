import type { MetadataRoute } from "next";

// PWA 매니페스트 — Next가 /manifest.webmanifest 로 서빙하고 <link rel="manifest"> 자동 주입.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "토닥 — 사주 운세 그래프",
    short_name: "토닥",
    description: "내 운세 곡선과 ‘너 잘못이 아니야’ 한마디. 로그인 없는 무료 위로 웹앱.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#faf8f4",
    theme_color: "#4f6446",
    lang: "ko",
    categories: ["lifestyle", "health"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
