import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-fraunces",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "InterviewAI — Practice Smarter",
  description: "AI-powered mock interviews tailored to your resume and role.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
        <body className="bg-[#0a0a0a] text-[#f0ede6] font-sans antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
