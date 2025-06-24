import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TalentUnlock - Unlock Your Canadian Career",
  description: "AI-powered platform that translates your international experience into Canadian job opportunities. Break down credential barriers and find your dream job in Canada.",
  keywords: "immigration, Canada, jobs, career, AI, skills mapping, newcomers, talent",
  authors: [{ name: "TalentUnlock Team" }],
  openGraph: {
    title: "TalentUnlock - Unlock Your Canadian Career",
    description: "AI-powered platform that translates your international experience into Canadian job opportunities.",
    type: "website",
    locale: "en_CA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navigation />
        {children}
      </body>
    </html>
  );
}
