"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { UserNav } from "@/components/UserNav";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="mx-auto max-w-7xl px-4 pt-4">
        <div className="rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Branding */}

            <Link href="/">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-white tracking-wide">DEISI</h1>
                <Image
                  src="/deisi-ball.png"
                  alt="DEISI Logo"
                  width={40}
                  height={40}
                  className="rounded-full invert"
                />
                <h1 className="text-xl font-semibold text-white tracking-wide">Horários</h1>
              </div>
            </Link>

            {/* Botão hambúrguer - só no mobile */}
            <button
              className="md:hidden text-gray-300 hover:text-white transition"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              ☰
            </button>

            {/* Navegação normal - desktop */}
            <div className="hidden md:flex items-center gap-6">
              {session && (
                <>
                  <nav className="flex items-center gap-1 text-white text-base font-semibold tracking-wide">
                    <Link className="px-3 py-2 rounded-lg hover:bg-white/10 hover:text-white transition" href="/cursos">Curso</Link>
                    <Link className="px-3 py-2 rounded-lg hover:bg-white/10 hover:text-white transition" href="/docentes">Docente</Link>
                    <Link className="px-3 py-2 rounded-lg hover:bg-white/10 hover:text-white transition" href="/disciplinas">Disciplina</Link>
                    <Link className="px-3 py-2 rounded-lg hover:bg-white/10 hover:text-white transition" href="/salas">Sala</Link>
                    {/* <Link className="ml-6 px-3 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-700 transition" href="/editarHorarios">Editar</Link> */}
                  </nav>
                  <div className="pl-6 border-l border-white/10">
                    <UserNav />
                  </div>
                </>
              )}
              {!session && (
                <>
                  <nav className="flex items-center gap-1 text-white text-base font-semibold tracking-wide">
                    <Link className="px-3 py-2 rounded-lg hover:bg-white/10 hover:text-white transition" href="/turmas-alunos">Horários</Link>
                  </nav>
                  <div className="pl-6 border-l border-white/10">
                    <UserNav />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Dropdown - mobile */}
          {menuOpen && session && (
            <div className="md:hidden text-white border-t border-white/10 rounded-b-2xl">
              <Link className="block px-4 py-2 hover:bg-white/10 hover:text-white" href="/cursos" onClick={() => setMenuOpen(false)}>Curso</Link>
              <Link className="block px-4 py-2 hover:bg-white/10 hover:text-white" href="/docentes" onClick={() => setMenuOpen(false)}>Docente</Link>
              <Link className="block px-4 py-2 hover:bg-white/10 hover:text-white" href="/disciplinas" onClick={() => setMenuOpen(false)}>Disciplina</Link>
              <Link className="block px-4 py-2 hover:bg-white/10 hover:text-white" href="/salas" onClick={() => setMenuOpen(false)}>Sala</Link>
              {/* <Link className="block px-4 py-2 bg-gray-800 text-white hover:bg-gray-700" href="/editarHorarios" onClick={() => setMenuOpen(false)}>Editar</Link> */}
              <div className="border-t border-white/10 px-4 py-3">
                <UserNav />
              </div>
            </div>
          )}
          {menuOpen && !session && (
            <div className="md:hidden text-white border-t border-white/10 rounded-b-2xl">
              <Link className="block px-4 py-2 hover:bg-white/10 hover:text-white" href="/turmas-alunos" onClick={() => setMenuOpen(false)}>Horários</Link>
              <div className="border-t border-white/10 px-4 py-3">
                <UserNav />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
