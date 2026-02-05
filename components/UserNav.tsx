"use client";

import { useSession, signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";

export function UserNav() {
  const { data: session } = useSession();

  if (!session) return null;

  async function handleLogout() {
    await signOut({ callbackUrl: "/login" });
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
