import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Horários",
  description: "Aplicação para criar horários",
  icons: {
    icon: "/deisi-ball.png",
    shortcut: "/deisi-ball.png",
    apple: "/deisi-ball.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-gray-50 antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        
        <main className="flex-1 w-full max-w-7xl mx-auto">
          <div>{children}</div>
        </main>
        
      </body>
    </html>
  );
}
