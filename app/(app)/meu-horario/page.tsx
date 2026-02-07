"use client";

import { useSession, signIn } from "next-auth/react";
import HorarioAluno from "@/components/HorarioAluno/HorarioAluno";

export default function Page() {
  const { data: session, status } = useSession();
  const numero = (session?.user as { numero?: string })?.numero;

  if (status === "loading") {
    return <div className="p-4">A carregar...</div>;
  }

  if (!session) {
    signIn("google", { callbackUrl: "/meu-horario" });
    return <div className="p-4">A redirecionar...</div>;
  }

  if (!numero) {
    return <div className="p-4">Numero de aluno nao encontrado.</div>;
  }

  return <HorarioAluno numeroAlunoInicial={numero} esconderPesquisa />;
}
