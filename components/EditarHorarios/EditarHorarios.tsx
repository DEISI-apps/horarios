"use client";

import { useMemo, useState } from "react";
import SelectHorario from "@/components/SelectHorario/SelectHorario";
import DisciplinasSection from "@/components/DisciplinasSection/DisciplinasSection";
import TurmasSection from "../TurmasSection/TurmasSection";
import CalendarioSemanal from "../CalendarioSemanal";
import { useHorarios } from "@/hooks/useHorarios";
import SalasSection from "../SalasSection/SalasSection";
import { Calendar } from "lucide-react";


export default function EditarHorarios() {

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
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editar Horário</h1>
            <p className="text-sm text-gray-500">Gestão do calendário de aulas</p>
          </div>
        </div>
      </div>

      <SelectHorario onSelect={setSelectedHorarioId} />

      {selectedHorarioId && horario && (
        <>       
          <CalendarioSemanal horario={horario} editar={true} />

          <h2 className="pt-8 mt-4 mb-2 text-2xl font-semibold">Ocupação dos Labs do DEISI Hub</h2>
          <SalasSection ano_lectivo_id={horario.ano_lectivo_id} semestre={horario.semestre} />

          <TurmasSection horario={horario} />

          <DisciplinasSection horario={horario} />
        </>
      )}
    </div>
  );
}
