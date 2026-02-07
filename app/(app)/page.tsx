"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Users, Building2, GraduationCap, Presentation, Search } from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Page() {
  const [isZoomed, setIsZoomed] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const router = useRouter();

  // Redireciona alunos para o seu horário
  useEffect(() => {
    if (session) {
      const role = (session.user as { role?: string })?.role;
      if (role === "aluno") {
        router.push("/meu-horario");
      }
    }
  }, [session, router]);

  // Remove parametros de erro do NextAuth para nao mostrar o estado na URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (url.searchParams.has("error")) {
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  // Se não está logado, redireciona para login
  const handleUnauthenticatedClick = (e: React.MouseEvent) => {
    if (!session) {
      e.preventDefault();
      signIn("google", { callbackUrl: "/" });
    }
  };

  return (
    <div>
      <div className="container mt-10 mx-auto px-4 py-8 md:py-10 font-[var(--font-geist-sans)]">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center max-w-6xl mx-auto">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Horários simples <br></br> e focados no essencial
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mt-4 max-w-2xl mx-auto lg:mx-0">
              Consulta e gestão de horários de forma rápida e intuitiva.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center lg:justify-start">
              <Link
                href="/turmas-alunos"
                className="bg-blue-600 text-white px-8 py-6 rounded-2xl shadow-lg hover:bg-blue-700 transition-colors font-semibold text-base md:text-lg min-w-[260px] text-center"
              >
                Consulte os Horários do DEISI
              </Link>
              {/* <Link
                href="/cursos"
                onClick={handleUnauthenticatedClick}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-blue-700 transition-colors font-semibold"
              >
                Horários para Docentes
              </Link> */}
              {/* <Link
                href="/docentes"
                className="bg-white text-blue-700 px-6 py-3 rounded-xl border border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-colors font-semibold"
              >
                Exportar ICS
              </Link>
              <Link
                href="/disciplinas"
                className="bg-white text-gray-900 px-6 py-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors font-semibold"
              >
                Listar Alunos
              </Link> */}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-blue-100 via-white to-amber-100 blur-xl opacity-70" />
            <div 
              ref={imageContainerRef}
              className="relative bg-white/80 rounded-3xl p-4 shadow-2xl overflow-hidden"
              style={{ cursor: isZoomed ? "none" : "default" }}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={(e) => {
                if (!imageContainerRef.current) return;
                const rect = imageContainerRef.current.getBoundingClientRect();
                setCursorPos({
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top
                });
              }}
            >
              <div className="relative">
                <Image
                  src="/horario.png"
                  alt="Calendario semanal"
                  width={560}
                  height={560}
                  sizes="(min-width: 1024px) 440px, (min-width: 768px) 380px, 320px"
                  className={`w-full h-auto rounded-2xl transition-transform duration-75 ${
                    isZoomed ? "scale-150" : "scale-100"
                  }`}
                  priority
                  onClick={() => {
                    if (!session) {
                      signIn("google", { callbackUrl: "/" });
                    } else {
                      window.location.href = "/cursos";
                    }
                  }}
                  style={isZoomed && imageContainerRef.current ? {
                    transformOrigin: `${(cursorPos.x / imageContainerRef.current.offsetWidth) * 100}% ${(cursorPos.y / imageContainerRef.current.offsetHeight) * 100}%`
                  } : {}}
                />
              </div>
              {isZoomed && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: `${cursorPos.x}px`,
                    top: `${cursorPos.y}px`,
                    transform: "translate(-50%, -50%)"
                  }}
                >
                  <Search className="w-24 h-24 text-black opacity-60 drop-shadow-lg" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-20">
          <h2 className="text-xl md:text-2xl font-bold text-center text-gray-900 mb-6">
            Funcionalidades Principais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/turmas-alunos"
              className="group bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <GraduationCap className="w-6 h-6 text-blue-600" />
              <div className="mt-2 font-semibold text-gray-900">Horário do aluno</div>
              <p className="text-sm text-gray-600">Consulta do calendario semanal de aulas, podendo exportar para Google Calendar.</p>
            </Link>

            <Link
              href="/docentes"
              onClick={handleUnauthenticatedClick}
              className="group bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <Presentation className="w-6 h-6 text-blue-600" />
              <div className="mt-2 font-semibold text-gray-900">Horário do Docente</div>
              <p className="text-sm text-gray-600">Consulta do calendario semanal de aulas, podendo exportar para Google Calendar.</p>
            </Link>

            <Link
              href="/disciplinas"
              onClick={handleUnauthenticatedClick}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <Users className="w-5 h-5 text-blue-600 mb-2" />
              <div className="text-lg font-semibold text-gray-900">Listagem de alunos</div>
              <p className="text-sm text-gray-600">O docente pode ver ou descarregar a lista de alunos de cada aula, e o seu horário (atualmente restrito a LEI).</p>
            </Link>

            <Link
              href="/disciplinas"
              onClick={handleUnauthenticatedClick}
              className="group bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <BookOpen className="w-6 h-6 text-blue-600" />
              <div className="mt-2 font-semibold text-gray-900">Horário da disciplina</div>
              <p className="text-sm text-gray-600">Distribuição semanal das aulas e e seus docentes.</p>
            </Link>
            
            <Link
              href="/docentes"
              onClick={handleUnauthenticatedClick}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <svg className="w-6 h-6 text-blue-600 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <div className="text-lg font-semibold text-gray-900">Google Calendar</div>
              <p className="text-sm text-gray-600">Importação das aulas do semestre inteiro no calendário Google ou Outlook.</p>
            </Link>
            
            <Link
              href="/salas"
              onClick={handleUnauthenticatedClick}
              className="group bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <Building2 className="w-6 h-6 text-blue-600" />
              <div className="mt-2 font-semibold text-gray-900">Edição de Horários</div>
              <p className="text-sm text-gray-600">Edição ágil e integrada dos horários, atualizada em tempo real (utilizadores com permissão de gestão).</p>
            </Link>
            
          </div>
        </div>
      </div>
    </div>
  );
}