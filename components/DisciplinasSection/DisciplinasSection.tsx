"use client";

import DisciplinaCard from "../DisciplinaCard/DisciplinaCard";
import { useAulas } from "@/hooks/useAulas";
import { atualizaDisciplinasHoras } from "@/lib/utils";
import { useMemo } from "react";
import { useDisciplinas } from "@/hooks/useDisciplinas";


export default function DisciplinasSection({ horario_id }: { horario_id: number }) {

  //
  // A. obtém disciplinas e aulas
  const { disciplinas, isLoadingDisciplinas, errorDisciplinas } = useDisciplinas(horario_id);
  const { aulas = [] } = useAulas(horario_id);
  
  //
  // B. atualiza horas das disciplinas e ordena
  const disciplinasOrdenadas = useMemo(() => {
    if (!disciplinas?.length) return [];

    const atualizadas = atualizaDisciplinasHoras(disciplinas, aulas);

    atualizadas.sort((a, b) => {
      if (a.nome < b.nome) return -1;
      if (a.nome > b.nome) return 1;
      return 0;
    });

    return atualizadas.map((disciplina) => ({
      ...disciplina,
      docentes: [...disciplina.docentes].sort((a, b) => {
        if (a.horas_teoricas > 0 && b.horas_teoricas === 0) return -1;
        if (a.horas_teoricas === 0 && b.horas_teoricas > 0) return 1;
        return a.nome.localeCompare(b.nome, "pt", { sensitivity: "base" });
      }),
    }));
  }, [disciplinas, aulas]);

  //
  // C. renderiza

  // C.1. fallbacks
  if (isLoadingDisciplinas) return <p className="text-gray-500">A carregar disciplinas...</p>;
  if (errorDisciplinas) return <p className="text-red-500">Erro ao carregar disciplinas.</p>;
  if (disciplinas?.length === 0) return <p className="text-gray-500">Nenhuma disciplina encontrada.</p>;


  return (
    <section className="pt-8">
      <h2 className="mt-4 mb-2 text-lg font-semibold">Disciplinas e Horas por Docente</h2>
      <p className="text-gray-500 mb-4">Horas lecionadas / atribuídas. Não exceder atribuídas.</p>
      <div className="space-y-4">
        {disciplinasOrdenadas.map((disciplina) => (
          <DisciplinaCard key={disciplina.id} disciplina={disciplina} />
        ))}
      </div>
    </section>
  );
}
