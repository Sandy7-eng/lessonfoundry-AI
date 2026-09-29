import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LessonFoundry — Curriculum Copilot",
  description: "Verified, source-grounded curriculum units for secondary and further education",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <div className="ambient-background" aria-hidden="true">
          <div className="ambient-shape ambient-shape-1" />
          <div className="ambient-shape ambient-shape-2" />
          <div className="ambient-shape ambient-shape-3" />
        </div>
        {children}
      </body>
    </html>
  );
}
