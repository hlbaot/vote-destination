import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vote Destination",
  description: "Bình chọn điểm đến du lịch Việt Nam",
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
        <AppShell header={<Header />} footer={<Footer />}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}