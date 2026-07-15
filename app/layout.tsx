import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "언제 만나요 - 모임 날짜를 쉽게 정하는 서비스",
  description:
    "직장인 회식부터 동창회까지, 복잡한 일정 조율을 하나의 링크로 해결하세요",
  keywords: ["일정조율", "모임", "회식", "날짜선택", "일정관리"],
  authors: [{ name: "언제 만나요" }],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: defaultUrl,
    title: "언제 만나요",
    description:
      "직장인 회식부터 동창회까지, 복잡한 일정 조율을 하나의 링크로 해결하세요",
    siteName: "언제 만나요",
  },
  twitter: {
    card: "summary_large_image",
    title: "언제 만나요",
    description:
      "직장인 회식부터 동창회까지, 복잡한 일정 조율을 하나의 링크로 해결하세요",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
