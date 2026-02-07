"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SelectHorario from "@/components/SelectHorario/SelectHorario";
import CalendarioSemanal from "../CalendarioSemanal";
import CalendarioSemanalTurma from "@/components/CalendarioSemanalTurma/CalendarioSemanalTurma";
import { useHorarios } from "@/hooks/useHorarios";
import { useAulas } from "@/hooks/useAulas";
import { Loader2, School, Info } from "lucide-react";
import { Turma } from "@/types/interfaces";


export default function Cursos() {
  const router = useRouter();
  const searchParams = useSearchParams();

  //
  // A. Definição do estado

  const [selectedHorarioId, setSelectedHorarioId] = useState<number | null>(null);
  const [selectedTurmaId, setSelectedTurmaId] = useState<"all" | number>("all");
  const [hasPrefilled, setHasPrefilled] = useState(false);
  const { horarios, isLoading } = useHorarios();

  const horario = useMemo(() => {
    if (!selectedHorarioId || !horarios) return null;
    return horarios.find(h => h.id === selectedHorarioId) || null;
  }, [selectedHorarioId, horarios]);

  const { aulas } = useAulas(selectedHorarioId ?? 0);

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

  useEffect(() => {
    if (horario) {
      const primeiraTurmaId = horario.turmas[0]?.id;
      setSelectedTurmaId(primeiraTurmaId ?? "all");
    }
  }, [horario]);

  //
  // B. Renderização

  if (isLoading) return (
    <div className="flex justify-center items-center h-32 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      <p className="text-gray-500 font-medium">A carregar cursos...</p>
    </div>
  );

  return (
    <div className="p-4 flex flex-col gap-6 max-w-6xl mx-auto">
      
      {/* Secção de Pesquisa */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <School className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Horário de Curso</h1>
            <p className="text-sm text-gray-500">Selecione o curso, ano e turma</p>
          </div>
        </div>
        
        <SelectHorario onSelect={setSelectedHorarioId} />

        {selectedHorarioId && horario && (
          <>
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                type="button"
                onClick={() => setSelectedTurmaId("all")}
                className={`focus:outline-none px-3 py-2 rounded border-2 text-sm uppercase tracking-wide ${
                  selectedTurmaId === "all"
                    ? "border-blue-600 text-blue-700 bg-blue-50 font-bold"
                    : "border-gray-300 text-gray-600 bg-white"
                }`}
              >
                Todas as turmas
              </button>
              {horario.turmas.map((turma: Turma) => (
                <button
                  key={turma.id}
                  type="button"
                  onClick={() => setSelectedTurmaId(turma.id)}
                  className={`focus:outline-none hover:underlined px-3 py-2 rounded ${
                    selectedTurmaId === turma.id ? "bg-blue-500 text-white font-bold" : "bg-gray-200"
                  }`}
                >
                  {turma.nome}
                </button>
              ))}
            </div>

            <div className="flex items-start gap-3 mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold">Clique no nome da disciplina, docente, sala ou alunos, para mais detalhes.</p>
              </div>
            </div>
          </>
        )}
      </div>

      {selectedHorarioId && horario && (
        <div className="p-4 bg-white rounded-2xl shadow-lg border border-gray-100">
          {selectedTurmaId === "all" ? (
            <CalendarioSemanal horario={horario} editar={false} />
          ) : (
            <CalendarioSemanalTurma
              turma_id={selectedTurmaId}
              aulas={aulas}
              ano_lectivo_id={horario.ano_lectivo_id}
              semestre={horario.semestre}
            />
          )}
        </div>
      )}
    </div>
  );
}
