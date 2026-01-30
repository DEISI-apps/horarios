"use client";

import { useMemo, useState } from "react";
import SelectHorario from "@/components/SelectHorario/SelectHorario";
import ListaTurmas from "../ListaTurmas";
import { useHorarios } from "@/hooks/useHorarios";
import { Loader2 } from "lucide-react";


export default function Turmas() {

  //
  // A. Definição do estado

  const [selectedHorarioId, setSelectedHorarioId] = useState<number | null>(null);
  const { horarios, isLoading } = useHorarios();

  const horario = useMemo(() => {
    if (!selectedHorarioId || !horarios) return null;
    return horarios.find(h => h.id === selectedHorarioId) || null;
  }, [selectedHorarioId, horarios]);

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
          <ListaTurmas horario={horario} editar={false} />
          <p className="mt-4 text-center text-gray-500"><b className="text-black">Nomes sublinhados</b> permitem visualizar diretamente o horário da turma, disciplina, docente ou sala. No telemóvel é limitado, podendo alternativamente escolher no menu o que pretende.</p>
          
        </>
      )}
    </div>
  );
}
