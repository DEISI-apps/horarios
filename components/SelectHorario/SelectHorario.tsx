"use client";
import { useState, useEffect } from "react";

interface RawItem {
  id: number;
  curso: { 
    nome: string, 
    sigla: string 
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

export default function SelectHorario({ endpoint, onSelect }: SelectHorarioProps) {
  
  //
  // A. Gestão de estados
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");

  //
  // E. Handlers
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedId(value);

    const selectedOption = options.find((opt) => opt.id.toString() === value) || null;
    onSelect(selectedOption);
  };

  //
  // F. Efeitos
  useEffect(() => {
    async function fetchOptions() {
      try {
        const res = await fetch(endpoint);
        const data: RawItem[] = await res.json();

        const transformed = data.map((item) => ({
          id: item.id,
          label: `${item.curso.sigla}, ${item.ano}º ano, ${item.semestre}º semestre (${item.ano_lectivo.ano_lectivo})`,
          raw: item,
        }));

        setOptions(transformed);
      } catch (err) {
        console.error("Error fetching options:", err);
      }
    }
    fetchOptions();
  }, [endpoint]);


  //
  // G. Renderização
  return (
    <select
      value={selectedId}
      onChange={handleChange}
      className="border rounded p-2 font-bold"
    >
      <option value="">Selecione um horário...</option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
