"use client";

import DisciplinaCard from "../DisciplinaCard/DisciplinaCard";
import { atualizaDisciplinasHoras } from "@/lib/utils";
import { useMemo } from "react";
import { useDisciplinas } from "@/hooks/useDisciplinas";
import { useAulasAnoSemestre } from "@/hooks/useAulasAnoSemestre";
import { Horario } from "@/types/interfaces";


export default function DisciplinasSection({ horario }: { horario: Horario }) {
  
  //
  // A. obtém disciplinas e aulas
  const { disciplinas, isLoadingDisciplinas, errorDisciplinas } = useDisciplinas(horario.id);
  const { aulas: aulasAnoSemestre, isLoadingAulas: isLoadingAulasAnoSemestre } = useAulasAnoSemestre(horario.ano_lectivo_id, horario.semestre);
  

  //
  // B. atualiza horas das disciplinas e ordena
  const disciplinasOrdenadas = useMemo(() => {
    if (!disciplinas?.length) return [];

    const atualizadas = atualizaDisciplinasHoras(disciplinas, aulasAnoSemestre);

    atualizadas.sort((a, b) => a.nome.localeCompare(b.nome, 'pt', { sensitivity: 'base' }));

    return atualizadas.map((disciplina) => ({
      ...disciplina,
      docentes: [...disciplina.docentes].sort((a, b) => {
        if (a.horas_teoricas > 0 && b.horas_teoricas === 0) return -1;
        if (a.horas_teoricas === 0 && b.horas_teoricas > 0) return 1;
        return a.nome.localeCompare(b.nome, "pt", { sensitivity: "base" });
      }),
    }));
  }, [disciplinas, aulasAnoSemestre]);

  //
  // C. renderiza


  // C.1. fallbacks

  if (isLoadingDisciplinas) return <p className="text-gray-500">A carregar disciplinas...</p>;
  if (errorDisciplinas) return <p className="text-red-500">Erro ao carregar disciplinas.</p>;
  if (disciplinas?.length === 0) return <p className="text-gray-500">Nenhuma disciplina encontrada.</p>;
  if (isLoadingAulasAnoSemestre) return <p className="text-gray-500">A carregar aulas...</p>;

  return (
    <section className="pt-8">
      <h2 className="mt-4 mb-2 text-lg font-semibold">Disciplinas e Horas Agregadas (dos vários cursos em que funcionam)</h2>
      <p className="text-gray-500 mb-4 text-sm">Horas lecionadas / horas disponíveis.</p>
      <div className="space-y-4">
        {disciplinasOrdenadas.map((disciplina) => (
          <DisciplinaCard
            key={disciplina.id}
            disciplina={disciplina}
            horario={horario}
          />
        ))}
      </div>
    </section>
  );
}
