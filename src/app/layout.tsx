import type { Metadata } from "next";
import AppShell from "@/components/shared/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Điểm đến du lịch nông thôn Việt Nam tốt nhất 2026",
  description: "Cổng thông tin và bình chọn Điểm đến du lịch nông thôn Việt Nam tốt nhất 2026",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" data-scroll-behavior="smooth">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
