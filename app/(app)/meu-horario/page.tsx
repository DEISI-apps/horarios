"use client";

import { useSession, signIn } from "next-auth/react";
import HorarioAluno from "@/components/HorarioAluno/HorarioAluno";
import MeuHorarioDocente from "@/components/HorarioDocente/MeuHorarioDocente";
import { useDocentes } from "@/hooks/useDocentes";
import { ANO_LECTIVO_ID, SEMESTRE } from "@/lib/constants";

export default function Page() {
  const { data: session, status } = useSession();
  const user = session?.user as { numero?: string; role?: string; email?: string } | undefined;
  const { docentes, isLoadingDocentes } = useDocentes(ANO_LECTIVO_ID, SEMESTRE);

  if (status === "loading") {
    return <div className="p-4">A carregar...</div>;
  }

  if (!session) {
    signIn("google", { callbackUrl: "/meu-horario" });
    return <div className="p-4">A redirecionar...</div>;
  }

  if (user?.role === "docente") {
    if (isLoadingDocentes) {
      return <div className="p-4">A carregar...</div>;
    }

    const docente = docentes?.find(
      (doc) => doc.email?.toLowerCase() === user.email?.toLowerCase()
    );

    if (!docente) {
      return <div className="p-4">Docente não encontrado.</div>;
    }

    return <MeuHorarioDocente docente={docente} />;
  }

  if (!user?.numero) {
    return <div className="p-4">Numero de aluno nao encontrado.</div>;
  }

  return <HorarioAluno numeroAlunoInicial={user.numero} esconderPesquisa />;
}
