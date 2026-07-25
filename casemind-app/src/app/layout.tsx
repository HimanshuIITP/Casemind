import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CaseMind — AI-Powered Judicial Intelligence Platform",
  description:
    "CaseMind transforms every legal case into a structured, searchable, and AI-assisted workspace. Empowering judges, lawyers, and litigants with intelligent case management.",
  keywords: [
    "legal AI",
    "case management",
    "judicial intelligence",
    "court software",
    "legal tech",
    "AI for lawyers",
    "case analysis",
    "document intelligence",
  ],
  authors: [{ name: "CaseMind" }],
  openGraph: {
    title: "CaseMind — AI-Powered Judicial Intelligence Platform",
    description:
      "The intelligent operating system for judicial case management. AI that organizes, understands, and assists — while keeping you in control.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "CaseMind — AI-Powered Judicial Intelligence",
    description:
      "Transform legal case management with AI. Built for judges, lawyers, and litigants.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${GeistSans.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
