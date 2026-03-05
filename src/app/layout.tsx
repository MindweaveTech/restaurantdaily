import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://restaurant-daily.mindweave.tech'),
  title: "Restaurant Daily Operations Management | Cash, Payments & Team Tracking",
  description: "Simplify restaurant operations with daily cash reconciliation, payment tracking, and team management. SMS OTP login. Mobile-first. Built for Indian restaurants.",
  keywords: ["restaurant management software", "daily operations", "cash tracking", "payment management", "restaurant POS", "team management", "SMS OTP"],
  authors: [{ name: "Mindweave Technologies" }],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: "Restaurant Daily - Simplify Your Restaurant Operations",
    description: "Stop chasing receipts. Track cash, payments & team in real-time. Mobile-first restaurant management for India.",
    url: "https://restaurant-daily.mindweave.tech",
    siteName: "Restaurant Daily",
    locale: "en_IN",
    type: "website",
    images: ['/og-image.png'],
  },
  twitter: {
    card: "summary_large_image",
    title: "Restaurant Daily - Simplify Restaurant Operations",
    description: "Track cash, payments & team in real-time. Mobile-first management for restaurants.",
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
