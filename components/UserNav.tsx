"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import { LogOut, LogIn } from "lucide-react";
import { useState, useEffect } from "react";

export function UserNav() {
  const { data: session, status } = useSession();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    if (status === "authenticated") {
      const attemptingAluno = sessionStorage.getItem("attempting_aluno_login");
      if (attemptingAluno === "true") {
        sessionStorage.removeItem("attempting_aluno_login");
        const role = (session?.user as { role?: string })?.role;
        if (role !== "aluno") {
          setShowModal(true);
        }
      }
    }
  }, [session, status]);

  async function handleLogout() {
    await signOut({ callbackUrl: "/" });
  }

  async function handleLogin() {
    await signIn("google", { callbackUrl: "/" });
  }

  async function handleAlunoLogin() {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("attempting_aluno_login", "true");
    }
    await signIn("google", { callbackUrl: "/meu-horario" });
  }

  if (!session) {
    return (
      <>
        <div className="flex items-center gap-2">
          <button
            onClick={handleLogin}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
            title="Area Docente"
          >
            <LogIn className="w-4 h-4" />
            <span className="text-sm">Area Docente</span>
          </button>
          <button
            onClick={handleAlunoLogin}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition"
            title="Área do Aluno"
          >
            <LogIn className="w-4 h-4" />
            <span className="text-sm">Área Aluno</span>
          </button>
        </div>

        {showModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]"
            onClick={() => setShowModal(false)}
          >
            <div
              className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-3">Não registado como aluno</h2>
              <p className="text-gray-700 mb-4">
                Não encontrámos o seu registo como aluno na nossa base de dados.
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Nota:</strong> Atualmente, o sistema apenas funciona para alunos de <strong>Licenciatura em Engenharia Informática (LEI)</strong>.
              </p>
              <p className="text-gray-700 mb-6">
                Se é aluno LEI e acredita que deveria ter acesso, por favor contacte os serviços académicos. Caso contrário, pode consultar os horários públicos sem necessidade de autenticação.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    window.location.href = "/turmas-alunos";
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                >
                  Ver Horários Públicos
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 border border-white/10">
      <button
        onClick={handleLogout}
        className="text-white/70 hover:text-red-400 transition p-1"
        title="Sair"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
