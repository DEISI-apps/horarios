import type { Metadata } from "next";
import localFont from "next/font/local";
import Image from "next/image";
import "./globals.css";
import Link from "next/link";

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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased
          min-h-screen
          flex flex-col justify-start items-center
          bg-black
        `}
      >
        <header className=" 
              w-[90vw] pb-3
              flex flex-row items-center
              gap-16
              text-white 
        ">
          <div className="flex flex-row items-center gap-4 mt-8 mb-4">
            <h1 className="text-2xl font-bold">DEISI</h1><Image
              src="/deisi-ball.png"
              alt="DEISI Logo"
              width={40}
              height={40}
              className="rounded-full invert"
            />
            <h1 className="text-2xl font-bold">Horários</h1>
          </div>
          {<nav className="flex flex-row gap-8 text-gray-300 items-center mt-8 mb-4 w-[80vw]">
            <div className="flex flex-row gap-2 justify-start items-center">
              {/* <div className="text-gray-400">Consultar horários de:</div> */}
              <Link className="px-4 py-1 rounded hover:bg-gray-800" href="/cursos">curso</Link>
              <Link className="px-4 py-1 rounded hover:bg-gray-800" href="/docentes">docente</Link>
              <Link className="px-4 py-1 rounded hover:bg-gray-800" href="/disciplinas">disciplina</Link>
              <Link className="px-4 py-1 rounded hover:bg-gray-800" href="/salas">sala</Link>
            </div>
            <Link className="px-4 py-1 rounded hover:bg-gray-800 ml-auto" href="/editarHorarios">editar</Link>
          </nav>}
        </header>

        <main className="min-h-[70vh] w-[90vw] p-5 rounded-xl bg-gray-100">{children}</main>

        <footer className="text-sm text-white pt-4">2025, DEISI, Lusófona</footer>

      </body>
    </html>
  );
}
