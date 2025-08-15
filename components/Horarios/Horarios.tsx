"use client";

import { useState } from "react";
import SelectHorario from "@/components/SelectHorario/SelectHorario";
import CalendarioSemanal from "@/components/CalendarioSemanal/CalendarioSemanal";
import DisciplinasSection from "@/components/DisciplinasSection/DisciplinasSection";
import { Option } from "@/types/interfaces"; 
import TurmasSection from "../TurmasSection/TurmasSection";


export default function Horarios() {

  //
  // A. Definição de estados
  const [selectedHorarioId, setSelectedHorarioId] = useState<Option | null>(null);

  return (
    <div className="p-4">
      <p className="pb-4">
        Selecione um curso & ano e marque as aulas no calendário, de acordo com as necessidades listadas em baixo.
      </p>

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
