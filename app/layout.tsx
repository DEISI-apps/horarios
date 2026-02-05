import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthSessionProvider } from "./providers";

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
        className={`${geistSans.variable} ${geistMono.variable} bg-gradient-to-br from-blue-50 to-indigo-100 antialiased text-foreground min-h-screen flex flex-col`}
      >
        <AuthSessionProvider>
          <main className="flex-1 w-full max-w-7xl mx-auto">
            <div>{children}</div>
          </main>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
