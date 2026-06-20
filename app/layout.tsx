import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CarbonCompass — Navigate Your Path to Lower Emissions",
  description: "AI-powered sustainability coach and carbon footprint tracking companion to manage, assess, and reduce your global carbon footprint.",
  keywords: ["sustainability", "carbon footprint", "gemini ai", "environmental tracking", "hackathon"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="flex flex-col min-h-screen">
        {/* Dynamic header and navigation rendering */}
        <Navbar />
        
        {/* Main application router display area */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
