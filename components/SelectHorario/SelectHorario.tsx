"use client";
import { useState } from "react";
import useSWR from "swr";

interface RawItem {
  id: number;
  curso: {
    nome: string;
    sigla: string;
  };
  ano: number;
  semestre: number;
  ano_lectivo: { ano_lectivo: string };
}

interface Option {
  id: number;
  label: string;
  raw: RawItem;
}

interface SelectHorarioProps {
  endpoint: string;
  onSelect: (value: Option | null) => void;
}

// Função fetcher usada pelo SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SelectHorario({ endpoint, onSelect }: SelectHorarioProps) {
  //
  // A. Gestão de estado do componente
  const [selectedId, setSelectedId] = useState<string>("");

  //
  // B. Obtenção de dados da API usando SWR
  const { data, error, isLoading } = useSWR<RawItem[]>(endpoint, fetcher);

  //
  // C. Transformação/processamento dos dados recebidos
  const options: Option[] = data?.map((item) => ({
    id: item.id,
    label: `${item.curso.sigla}, ${item.ano}º ano, ${item.semestre}º semestre (${item.ano_lectivo.ano_lectivo})`,
    raw: item,
  })) || [];

  //
  // D. Handler, função que lida com evento do utilizador (seleção de opção). 
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedId(value);
    const selectedOption = options.find((option) => option.id.toString() === value) || null;
    onSelect(selectedOption);
  };

  //
  // E. Renderização, retorna o JSX que define e exibe a UI
  if (error) return <div>Erro ao carregar cursos.</div>;

  if (isLoading) return <div>A carregar...</div>;

  return (
    <select
      value={selectedId}
      onChange={handleChange}
      className="border rounded p-2 font-bold text-base"
    >
      <option value="">Selecione um Curso & Ano...</option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
