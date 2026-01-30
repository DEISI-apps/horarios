"use client";
import { useHorarios } from "@/hooks/useHorarios";
import { Horario } from "@/types/interfaces";
import { useEffect, useState } from "react";

interface SelectHorarioProps {
  onSelect: (value: number | null) => void;
}

export default function SelectHorarioLEI({ onSelect }: SelectHorarioProps) {
  //
  // A. Gestão de estado do componente
  const [selectedAnoSemestre, setSelectedAnoSemestre] = useState<string>("");
  const [selectedCurso, setSelectedCurso] = useState<string>("LEI");

  //
  // B. Obtenção de dados da API usando SWR
  const { horarios, isLoading, isError } = useHorarios();

  //
  // C. Transformação/processamento dos dados recebidos
  const horarioOptions =
    horarios?.map((horario: Horario) => ({
      id: horario.id,
      ano: horario.ano,
      semestre: horario.semestre,
      curso: horario.curso.sigla,
      anoLectivo: horario.ano_lectivo.ano_lectivo,
      label: `${horario.curso.sigla}, ${horario.ano}ºano, ${horario.semestre}ºsem (${horario.ano_lectivo.ano_lectivo})`,
    })) || [];

  // Opções únicas para ano+semestre e curso
  const anoSemestreOptions = Array.from(
    new Set(horarioOptions.filter(h => h.semestre==2).map((h) => `${h.ano}ºano, ${h.semestre}ºsem (${h.anoLectivo})`))
  );

  
  // useEffect ( () => setSelectedAnoSemestre(anoSemestreOptions[0]) ,)
  
  const cursoOptions = Array.from(new Set(horarioOptions.map((h) => h.curso)));

  //
  // D. Handlers

useEffect(() => {
  if (!selectedAnoSemestre) {
    onSelect(null);
    return;
  }

  const selectedHorario = horarioOptions.find(
    (h) =>
      `${h.ano}ºano, ${h.semestre}ºsem (${h.anoLectivo})` === selectedAnoSemestre &&
      h.curso === selectedCurso
  );

  onSelect(selectedHorario ? selectedHorario.id : null);
}, [selectedAnoSemestre, selectedCurso, horarioOptions]);

const handleAnoSemestreSelection = (
  e: React.ChangeEvent<HTMLSelectElement>
) => {
  setSelectedAnoSemestre(e.target.value);
};

  // Combina ano+semestre com curso e procura o horário correspondente
  const updateSelection = (anoSem: string, curso: string) => {
    const selectedHorario = horarioOptions.find(
      (h) =>
        `${h.ano}ºano, ${h.semestre}ºsem (${h.anoLectivo})` === anoSem &&
        h.curso === curso
    );
    
    onSelect(selectedHorario ? selectedHorario.id : null);
  };

  //
  // E. Renderização
  if (isError) return <div>Erro ao carregar cursos.</div>;
  if (isLoading) return <div>A carregar...</div>;
      
  return (
    <div className="flex flex-wrap gap-4 items-start bg-white p-4 rounded-xl shadow-md">
      
      <h2 className="text-lg font-bold p-2">LEI</h2>
      
      {/* Seletor de Ano & Semestre */}
      <select
        value={selectedAnoSemestre}
        onChange={handleAnoSemestreSelection}
        className="border rounded p-2 font-bold text-lg cursor-pointer"
      >
        <option value="">Ano & Sem...</option>
        {anoSemestreOptions.map((option, idx) => (
          <option key={idx} value={option}>
            {option}
          </option>
        ))}
      </select>

      
    </div>
  );
}
