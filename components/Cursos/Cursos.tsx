"use client";

import { useMemo, useState } from "react";
import SelectHorario from "@/components/SelectHorario/SelectHorario";
import DisciplinasSection from "@/components/DisciplinasSection/DisciplinasSection";
import TurmasSection from "../TurmasSection/TurmasSection";
import CalendarioSemanal from "../CalendarioSemanal";
import { useHorarios } from "@/hooks/useHorarios";
import SalasSection from "../SalasSection/SalasSection";


export default function Cursos() {

  //
  // A. Definição do estado

  const [selectedHorarioId, setSelectedHorarioId] = useState<number | null>(null);
  const { horarios } = useHorarios();

  const horario = useMemo(() => {
    if (!selectedHorarioId || !horarios) return null;
    return horarios.find(h => h.id === selectedHorarioId) || null;
  }, [selectedHorarioId, horarios]);

  //
  // B. Renderização


  return (
    <div className="p-4">
      <SelectHorario onSelect={setSelectedHorarioId} />

      {selectedHorarioId && horario && (
        <>

          <CalendarioSemanal horario={horario} editar={false} />
          <h2 className="mt-4 mb-2 text-2xl font-semibold pt-8">Ocupação dos Labs do DEISI Hub</h2>
          <TurmasSection horario={horario} />
          <DisciplinasSection horario={horario} />
        </>
      )}
    </div>
  );
}
