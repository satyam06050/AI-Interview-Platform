// src/app/layout.jsx
import "./globals.css";
import Providers from "@/components/Providers";
import Script from "next/script";

export const metadata = {
  title: "InterviewIQ.AI",
  description: "AI-powered smart interview preparation platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Razorpay checkout script */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
