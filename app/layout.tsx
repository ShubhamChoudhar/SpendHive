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
  title: "SpendHive – Smart Budgeting & Expense Tracking",
  description: "Track expenses, manage budgets, and improve financial health with SpendHive — your personal finance dashboard.",
  keywords: [
    "budget app",
    "expense tracker",
    "personal finance",
    "spending tracker",
    "money management",
    "SpendHive"
  ],
  openGraph: {
    title: "SpendHive – Smart Expense Tracking",
    description: "Smart budgeting made simple.",
    url: "spendhive.vercel.app",
    siteName: "SpendHive",
    images: [
      {
        url: "/SpendHive.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
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
        {children}
      </body>
    </html>
  );
}
