"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SelectHorario from "@/components/SelectHorario/SelectHorario";
import DisciplinasSection from "@/components/DisciplinasSection/DisciplinasSection";
// import TurmasSection from "../TurmasSection/TurmasSection";
import CalendarioSemanal from "../CalendarioSemanal";
import { useHorarios } from "@/hooks/useHorarios";
import { Loader2 } from "lucide-react";


export default function Cursos() {
  const router = useRouter();
  const searchParams = useSearchParams();

  //
  // A. Definição do estado

  const [selectedHorarioId, setSelectedHorarioId] = useState<number | null>(null);
  const [hasPrefilled, setHasPrefilled] = useState(false);
  const { horarios, isLoading } = useHorarios();

  const horario = useMemo(() => {
    if (!selectedHorarioId || !horarios) return null;
    return horarios.find(h => h.id === selectedHorarioId) || null;
  }, [selectedHorarioId, horarios]);

  // Prefill do curso a partir da URL
  useEffect(() => {
    if (!horarios || hasPrefilled) return;
    
    const cursoParam = searchParams.get("curso");
    const anoParam = searchParams.get("ano");
    const semestreParam = searchParams.get("semestre");
    
    if (cursoParam && anoParam) {
      const horarioObj = horarios.find(h => 
        h.curso.sigla === cursoParam && String(h.ano) === anoParam && String(h.semestre) === semestreParam
      );
      if (horarioObj) {
        setSelectedHorarioId(horarioObj.id);
        setHasPrefilled(true);
      }
    }
  }, [horarios, searchParams, hasPrefilled]);

  // Atualiza URL quando seleciona horário
  useEffect(() => {
    if (horario) {
      router.replace(`/cursos?curso=${encodeURIComponent(horario.curso.sigla)}&ano=${horario.ano}&semestre=${horario.semestre}`, { scroll: false });
    } else if (selectedHorarioId === null && hasPrefilled) {
      router.replace('/cursos', { scroll: false });
    }
  }, [horario, selectedHorarioId, router, hasPrefilled]);

  //
  // B. Renderização

  if (isLoading) return <div className="flex justify-center items-center h-32">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      <p className="text-gray-500">A carregar cursos...</p>
    </div>;

  return (
    <div className="p-4">
      <SelectHorario onSelect={setSelectedHorarioId} />

      {selectedHorarioId && horario && (
        <>
          <CalendarioSemanal horario={horario} editar={false} />
          {/* <TurmasSection horario={horario} /> */}
          <DisciplinasSection horario={horario} />
        </>
      )}
    </div>
  );
}
