"use client";

import { useMemo, useState } from "react";
import SelectHorario from "@/components/SelectHorario/SelectHorario";
import DisciplinasSection from "@/components/DisciplinasSection/DisciplinasSection";
import TurmasSection from "../TurmasSection/TurmasSection";
import CalendarioSemanal from "../CalendarioSemanal";
import { useHorarios } from "@/hooks/useHorarios";
import SalasSection from "../SalasSection/SalasSection";
import { Calendar, Building2, BookOpen, Users } from "lucide-react";


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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Título Principal */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editar Horário</h1>
              <p className="text-sm text-gray-500">Marcação de aulas, visualização das necessidades e distribuição de serviço docente.</p>
            </div>
          </div>
        </div>

        {/* Seletor de Horário */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 mb-8">
          <SelectHorario onSelect={setSelectedHorarioId} />
        </div>

        {selectedHorarioId && horario && (
          <div className="space-y-8">
            
            {/* Seção: Marcação de Aulas */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Marcação de Aulas</h2>
                  <p className="text-blue-50 text-sm">Marque o horário semanal das aulas de cada turma, de acordo com as necessidades apresentadas nas tabelas em baixo.</p>
                </div>
              </div>
              <div className="p-6">
                <CalendarioSemanal horario={horario} editar={true} />
              </div>
            </div>

            {/* Seção: Ocupação dos Labs */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Ocupação dos Labs do DEISI Hub</h2>
                  <p className="text-purple-50 text-sm">Monitore a utilização das salas</p>
                </div>
              </div>
              <div className="p-6">
                <SalasSection ano_lectivo_id={horario.ano_lectivo_id} semestre={horario.semestre} />
              </div>
            </div>

            {/* Seção: Necessidades */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Necessidades e Aulas Marcadas</h2>
                  <p className="text-amber-50 text-sm">Visualize as turmas e horas alocadas</p>
                </div>
              </div>
              <div className="p-6">
                <TurmasSection horario={horario} />
              </div>
            </div>

            {/* Seção: Disciplinas */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Distribuição de Serviço Docente</h2>
                  <p className="text-emerald-50 text-sm">Disciplinas e Horas Agregadas. Horas lecionadas / horas disponíveis. Horas agregadas dos vários cursos em que a disciplina funcionam.</p>
                </div>
              </div>
              <div className="p-6">
                <DisciplinasSection horario={horario} />
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
