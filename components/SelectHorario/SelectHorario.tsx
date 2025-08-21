"use client";
import { useHorarios } from "@/hooks/useHorarios";
import { Horario } from "@/types/interfaces";
import { useState } from "react";


interface SelectHorarioProps {
  onSelect: (value: number | null) => void;
}


export default function SelectHorario({ onSelect }: SelectHorarioProps) {
  //
  // A. Gestão de estado do componente
  const [selectedHorarioId, setSelectedHorarioId] = useState<string>("");

  //
  // B. Obtenção de dados da API usando SWR
  const { horarios, isLoading, isError } = useHorarios();

  //
  // C. Transformação/processamento dos dados recebidos
  const horarioOptions = horarios?.map((horario: Horario) => ({
    id: horario.id,
    label: `${horario.curso.sigla}, ${horario.ano}º ano, ${horario.semestre}º semestre (${horario.ano_lectivo.ano_lectivo})`
  })) || [];

  //
  // D. Função (handler) que lida com a escolha do horario (evento). 
  const handleHorarioSelection = ({ target: { value } }: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedHorarioId(value);
    onSelect(value ? Number(value) : null);
  };

  //
  // E. Renderização, retorna o JSX que define e exibe a UI
  if (isError) return <div>Erro ao carregar cursos.</div>;
  if (isLoading) return <div>A carregar...</div>;

  return (
    <select
      value={selectedHorarioId}
      onChange={handleHorarioSelection}
      className="border rounded p-2 font-bold text-xl cursor-pointer mb-2 flex row gap-3 items-center"
      style={{ border: '1px solid lightgray' }}
    >
      <option value="">Selecione um Curso & Ano...</option>
      {horarioOptions.map((horarioOption) => (
        <option key={horarioOption.id} value={horarioOption.id}>
          {horarioOption.label}
        </option>
      ))}
    </select>
  );
}
