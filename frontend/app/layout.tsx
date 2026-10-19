import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";

export const metadata: Metadata = {
  title: "웨딩 플래너 | D-Day & 필수 체크리스트",
  description:
    "결혼식까지 남은 D-Day와 카테고리별 필수 체크리스트를 한 화면에서 스마트하게 관리하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen bg-rose-50/30 text-gray-900 selection:bg-rose-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
