"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import { LogOut, LogIn } from "lucide-react";

export function UserNav() {
  const { data: session } = useSession();

  async function handleLogout() {
    await signOut({ callbackUrl: "/" });
  }

  async function handleLogin() {
    await signIn("google", { callbackUrl: "/" });
  }

  if (!session) {
    return (
      <button
        onClick={handleLogin}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
        title="Acesso exclusivo para docentes"
      >
        <LogIn className="w-4 h-4" />
        <span className="text-sm">Área Docente</span>
      </button>
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
