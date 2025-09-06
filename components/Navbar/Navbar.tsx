"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
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
          <h1 className="text-xl font-bold text-white">Horários</h1>
        </div>

        {/* Botão hambúrguer - só no mobile */}
        <button
          className="md:hidden text-gray-300 hover:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        {/* Navegação normal - desktop */}
        <nav className="hidden md:flex items-center gap-6 text-gray-300 text-sm">
          <Link className="px-3 py-2 rounded-md hover:bg-gray-800 hover:text-white transition" href="/cursos">Curso</Link>
          <Link className="px-3 py-2 rounded-md hover:bg-gray-800 hover:text-white transition" href="/docentes">Docente</Link>
          <Link className="px-3 py-2 rounded-md hover:bg-gray-800 hover:text-white transition" href="/disciplinas">Disciplina</Link>
          <Link className="px-3 py-2 rounded-md hover:bg-gray-800 hover:text-white transition" href="/salas">Sala</Link>
          {/* <Link className="ml-6 px-3 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-700 transition" href="/editarHorarios">Editar</Link> */}
        </nav>
      </div>

      {/* Dropdown - mobile */}
      {menuOpen && (
        <div className="md:hidden bg-black/95 text-gray-300 border-t border-gray-700">
          <Link className="block px-4 py-2 hover:bg-gray-800 hover:text-white" href="/cursos" onClick={() => setMenuOpen(false)}>Curso</Link>
          <Link className="block px-4 py-2 hover:bg-gray-800 hover:text-white" href="/docentes" onClick={() => setMenuOpen(false)}>Docente</Link>
          <Link className="block px-4 py-2 hover:bg-gray-800 hover:text-white" href="/disciplinas" onClick={() => setMenuOpen(false)}>Disciplina</Link>
          <Link className="block px-4 py-2 hover:bg-gray-800 hover:text-white" href="/salas" onClick={() => setMenuOpen(false)}>Sala</Link>
          {/* <Link className="block px-4 py-2 bg-gray-800 text-white hover:bg-gray-700" href="/editarHorarios" onClick={() => setMenuOpen(false)}>Editar</Link> */}
        </div>
      )}
    </header>
  );
}
