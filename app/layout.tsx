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
        <Navbar /> {/* Menu separado */}
        <main className="flex-1 w-full max-w-7xl mx-auto">
          <div className="rounded-2xl p-6 shadow-sm">{children}</div>
        </main>
        <footer className="w-full border-t border-gray-200 py-4">
          <div className="text-center text-xs text-gray-500">
            © 2025 DEISI · Universidade Lusófona
          </div>
        </footer>
      </body>
    </html>
  );
}
