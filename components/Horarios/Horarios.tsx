"use client";

import { useState } from "react";
import SelectHorario from "@/components/SelectHorario/SelectHorario";
import DisciplinasSection from "@/components/DisciplinasSection/DisciplinasSection";
import { Option } from "@/types/interfaces"; 
import TurmasSection from "../TurmasSection/TurmasSection";
import CalendarioSemanal from "../CalendarioSemanal";


export default function Horarios() {

  //
  // A. Definição de estados
  const [selectedHorarioId, setSelectedHorarioId] = useState<Option | null>(null);

  return (
    <div className="p-4">
      <SelectHorario onSelect={setSelectedHorarioId} />

      {selectedHorarioId && (
        <>
          <CalendarioSemanal horario_id={Number(selectedHorarioId.id)} />
          <TurmasSection horario_id={Number(selectedHorarioId.id)} />
          <DisciplinasSection horario_id={Number(selectedHorarioId.id)} />
        </>
      )}
    </div>
  );
}
