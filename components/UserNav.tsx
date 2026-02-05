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
    <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-100">
      <User className="w-4 h-4 text-gray-600" />
      <span className="text-sm text-gray-700 font-medium">{session.user?.email}</span>
      <button
        onClick={handleLogout}
        className="text-gray-600 hover:text-red-600 transition p-1"
        title="Sair"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
