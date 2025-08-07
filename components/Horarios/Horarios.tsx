"use client";

import { useState } from "react";
import SelectHorario from "@/components/SelectHorario/SelectHorario";
import CalendarioSemanal from "@/components/CalendarioSemanal/CalendarioSemanal";
import DisciplinasSection from "@/components/DisciplinasSection/DisciplinasSection";
import { Option } from "@/types/interfaces"; 


export default function Page() {
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  return (
    <div className="p-4">
      <p className="pb-4">
        Selecione um curso & ano e marque as aulas no calendário, de acordo com as necessidades listadas em baixo.
      </p>

      <SelectHorario onSelect={setSelectedOption} />

      {selectedOption && (
        <>
          <CalendarioSemanal horario_id={Number(selectedOption.id)} />
          <DisciplinasSection selectedOption={selectedOption} />
        </>
      )}
    </div>
  );
}
