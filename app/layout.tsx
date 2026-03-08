import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const geistMono = Inter({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Caretaker Tracker",
  description: "Track your caretaker's hours — daily logs, exact times, monthly reports.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
