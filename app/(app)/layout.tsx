import type { Metadata } from "next";
import localFont from "next/font/local";
import "../globals.css";
import Navbar from "@/components/Navbar/Navbar";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
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
      <>
        <Navbar /> {/* Menu separado */}
        <main className="flex-1 w-full max-w-7xl mx-auto">
          <div>{children}</div>
        </main>
        <footer className="w-full py-4">
          <div className="text-center text-xs text-gray-500 flex flex-row justify-center items-center">
            <span>DEISI · Universidade Lusófona © 2025 · </span>
            <a
              href="mailto:lucio.studer@ulusofona.pt"
              aria-label="Contactar por email"
              className="inline-flex items-center ml-1 hover:text-gray-700 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                fill="currentColor"
                viewBox="0 0 16 16"
                className="inline-block"
              >
                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v.217l-8 4.8-8-4.8V4z" />
                <path d="M0 6.383v5.634L5.803 8.66 0 6.383zM6.761 9.674l-6.761 4.06A2 2 0 0 0 2 14h12a2 2 0 0 0 1.999-1.266l-6.76-4.06L8 10.917l-1.239-.743zM16 6.383l-5.803 2.277L16 12.017V6.383z" />
              </svg>
            </a>
          </div>
        </footer>
      </>
  );
}
