import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthContext";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import BrowserExtensionHandler from "@/components/BrowserExtensionHandler";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TalentUnlock - Bridge Your International Experience to Canadian Success",
  description: "Transform your international experience into Canadian job opportunities with AI-powered skill mapping and job matching.",
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
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={inter.className}
        suppressHydrationWarning={true}
      >
        <BrowserExtensionHandler />
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
