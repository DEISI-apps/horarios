import type { Metadata } from "next";
import localFont from "next/font/local";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

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
        className={`${geistSans.variable} ${geistMono.variable}  bg-gray-50 antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        {/* Header fixo */}
        <header className="sticky top-0 z-50 w-full bg-black/90 backdrop-blur-md border-b border-gray-800">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            {/* Branding */}
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white">DEISI</h1>
                            <Image
                src="/deisi-ball.png"
                alt="DEISI Logo"
                width={40}
                height={40}
                className="rounded-full invert"
              />
              <h1 className="text-xl font-bold text-white"> Horários</h1>
            </div>

            {/* Navegação */}
            <nav className="flex items-center gap-6 text-gray-300 text-sm">
              <Link className="px-3 py-2 rounded-md hover:bg-gray-800 hover:text-white transition" href="/cursos">Curso</Link>
              <Link className="px-3 py-2 rounded-md hover:bg-gray-800 hover:text-white transition" href="/docentes">Docente</Link>
              <Link className="px-3 py-2 rounded-md hover:bg-gray-800 hover:text-white transition" href="/disciplinas">Disciplina</Link>
              <Link className="px-3 py-2 rounded-md hover:bg-gray-800 hover:text-white transition" href="/salas">Sala</Link>
              <Link className="ml-6 px-3 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-700 transition" href="/editarHorarios">Editar</Link>
            </nav>
          </div>
        </header>

        {/* Conteúdo principal */}
        <main className="flex-1 w-full max-w-7xl mx-auto  ">
          <div className="rounded-2xl p-6 shadow-sm">{children}</div>
        </main>

        {/* Footer minimalista */}
        <footer className="w-full border-t border-gray-200 py-4">
          <div className="text-center text-xs text-gray-500">
            © 2025 DEISI · Universidade Lusófona
          </div>
        </footer>
      </body>
    </html>
  );
}
