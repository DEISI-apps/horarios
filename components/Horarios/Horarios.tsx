"use client";

import { useState } from "react";
import SelectHorario from "@/components/SelectHorario/SelectHorario";
import DisciplinasSection from "@/components/DisciplinasSection/DisciplinasSection";
import TurmasSection from "../TurmasSection/TurmasSection";
import CalendarioSemanal from "../CalendarioSemanal";


export default function Horarios() {

  //
  // A. Definição do estado

  const [selectedHorarioId, setSelectedHorarioId] = useState<number | null>(null);


  //
  // B. Renderização

  return (
    <div className="p-4">
      <SelectHorario onSelect={setSelectedHorarioId} />

      {selectedHorarioId && (
        <>
          <CalendarioSemanal horario_id={Number(selectedHorarioId)} />
          <TurmasSection horario_id={Number(selectedHorarioId)} />
          <DisciplinasSection horario_id={Number(selectedHorarioId)} />
        </>
      )}
    </div>
  );
}
