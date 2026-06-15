import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SafetyBanner } from "@/components/SafetyBanner";
import { PWARegister } from "@/components/PWARegister";
import Link from "next/link";

export const metadata: Metadata = {
  title: "토닥 — 사주 운세 그래프",
  description:
    "생년월일을 넣으면 내 운세가 곡선으로 보이고, 마지막엔 '너 잘못이 아니야' 한마디를 듣는 무료 사주 웹앱.",
  appleWebApp: { capable: true, title: "토닥", statusBarStyle: "default" },
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#4f6446",
};

const NAV = [
  { href: "/app", label: "운세" },
  { href: "/face", label: "관상" },
  { href: "/check", label: "마음 체크" },
  { href: "/report", label: "오늘의 나" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* 다크/라이트 깜빡임 방지: 렌더 전 테마 적용 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('todak-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <header className="border-b">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
            <Link href="/" className="flex items-baseline gap-2">
              <span className="text-lg font-semibold tracking-tight">토닥</span>
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                사주 운세 그래프
              </span>
            </Link>
            <nav className="flex items-center gap-0.5">
              <div className="hidden items-center gap-0.5 sm:flex">
                {NAV.map((n) => (
                  <Link key={n.href} href={n.href} className="rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-[var(--line)]">
                    {n.label}
                  </Link>
                ))}
              </div>
              <Link href="/app" className="btn-ghost border-0 sm:hidden">
                내 운세
              </Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <SafetyBanner />
        <PWARegister />
      </body>
    </html>
  );
}
