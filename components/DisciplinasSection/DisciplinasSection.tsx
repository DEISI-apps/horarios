"use client";

import DisciplinaCard from "../DisciplinaCard/DisciplinaCard";
import { atualizaDisciplinasHoras } from "@/lib/utils";
import { useMemo } from "react";
import { useDisciplinas } from "@/hooks/useDisciplinas";
import { useAulasAnoSemestre } from "@/hooks/useAulasAnoSemestre";
import { Horario } from "@/types/interfaces";
import { AlertCircle, Loader2 } from "lucide-react";


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

  if (isLoadingDisciplinas) {
    return (
      <section className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          <p className="text-gray-600">A carregar disciplinas...</p>
        </div>
      </section>
    );
  }

  if (errorDisciplinas) {
    return (
      <section className="py-8">
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700 font-medium">Erro ao carregar disciplinas.</p>
        </div>
      </section>
    );
  }

  if (disciplinas?.length === 0) {
    return (
      <section className="py-8">
        <div className="text-center text-gray-500 py-6">
          <p className="font-medium">Nenhuma disciplina encontrada.</p>
        </div>
      </section>
    );
  }

  if (isLoadingAulasAnoSemestre) {
    return (
      <section className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          <p className="text-gray-600">A carregar aulas...</p>
        </div>
      </section>
    );
  }

  return (
    <section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
