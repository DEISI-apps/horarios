"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import { LogOut, User, LogIn } from "lucide-react";

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
        title="Entrar"
      >
        <LogIn className="w-4 h-4" />
        <span className="text-sm">Entrar</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/10 border border-white/10">
      <User className="w-4 h-4 text-white/70" />
      <span className="text-sm text-white/90 font-medium">{session.user?.name}</span>
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
