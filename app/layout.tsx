import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionWrapper from "./components/SessionWrapper";
import HeaderClient from "./components/HeaderClient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Updated to reflect your actual app instead of the Next.js default
export const metadata: Metadata = {
  title: "Orentra | Find Your Perfect Home",
  description: "Rent, buy, and sell properties effortlessly with Orentra.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta
          name="google-adsense-account"
          content="ca-pub-9439206564301038"
        />
      </head>
      {/* Set a clean base background and text color */}
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <SessionWrapper>
          <HeaderClient />

        {/* --- MAIN PAGE CONTENT --- */}
        {/* flex-grow ensures the content fills the screen, pushing any future footer to the bottom */}
        <main className="flex-grow">
          {children}
        </main>

        </SessionWrapper>
      </body>
    </html>
  );
}