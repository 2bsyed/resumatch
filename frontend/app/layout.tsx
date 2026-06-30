import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-plus-jakarta-sans",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "ResuMatch — AI Resume Optimizer That Beats ATS",
  description: "Free AI tool that rewrites your resume to match any job description and pass ATS systems. No credit card required.",
  openGraph: {
    title: "ResuMatch — AI Resume Optimizer That Beats ATS",
    description: "Free AI tool that rewrites your resume to match any job description and pass ATS systems. No credit card required.",
    type: "website",
    locale: "en_US",
    url: "https://resumatch.io",
    siteName: "ResuMatch",
  },
  twitter: {
    card: "summary_large_image",
    title: "ResuMatch — AI Resume Optimizer That Beats ATS",
    description: "Free AI tool that rewrites your resume to match any job description and pass ATS systems. No credit card required.",
  }
};

import { ToastProvider } from "../components/ui/Toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-on-background font-sans">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
