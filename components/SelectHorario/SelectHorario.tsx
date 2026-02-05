"use client";
import { useHorarios } from "@/hooks/useHorarios";
import { Horario } from "@/types/interfaces";
import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";

interface SelectHorarioProps {
  onSelect: (value: number | null) => void;
}

export default function SelectHorario({ onSelect }: SelectHorarioProps) {
  const searchParams = useSearchParams();

  //
  // A. Gestão de estado do componente
  const [selectedAnoSemestre, setSelectedAnoSemestre] = useState<string>("");
  const [selectedCurso, setSelectedCurso] = useState<string>("");
  const [hasPrefilled, setHasPrefilled] = useState(false);

  //
  // B. Obtenção de dados da API usando SWR
  const { horarios, isError } = useHorarios();

  //
  // C. Transformação/processamento dos dados recebidos
  const horarioOptions = useMemo(() => 
    horarios?.map((horario: Horario) => ({
      id: horario.id,
      ano: horario.ano,
      semestre: horario.semestre,
      curso: horario.curso.sigla,
      anoLectivo: horario.ano_lectivo.ano_lectivo,
      label: `${horario.curso.sigla}, ${horario.ano}ºano, ${horario.semestre}ºsem (${horario.ano_lectivo.ano_lectivo})`,
    })) || [], [horarios]);

  // Opções únicas para ano+semestre e curso
  const anoSemestreOptions = Array.from(
    new Set(horarioOptions.filter(h => h.semestre==2).map((h) => `${h.ano}ºano, ${h.semestre}ºsem (${h.anoLectivo})`))
  );
  const cursoOptions = Array.from(new Set(horarioOptions.map((h) => h.curso)));

  useEffect(() => {
    if (hasPrefilled || horarioOptions.length === 0) return;

    const cursoParam = searchParams.get("curso");
    const anoParam = Number(searchParams.get("ano"));
    const semParam = Number(searchParams.get("sem"));

    if (!cursoParam || !anoParam || !semParam) return;

    const matching = horarioOptions
      .filter(
        (h) =>
          h.curso.toLowerCase() === cursoParam.toLowerCase() &&
          h.ano === anoParam &&
          h.semestre === semParam
      )
      .sort((a, b) => b.anoLectivo.localeCompare(a.anoLectivo));

    if (matching.length === 0) return;

    const selected = matching[0];
    const anoSemestre = `${selected.ano}ºano, ${selected.semestre}ºsem (${selected.anoLectivo})`;

    setSelectedCurso(selected.curso);
    setSelectedAnoSemestre(anoSemestre);
    onSelect(selected.id);
    setHasPrefilled(true);
  }, [hasPrefilled, horarioOptions, onSelect, searchParams]);

  //
  // D. Handlers
  const handleAnoSemestreSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAnoSemestre(e.target.value);
    updateSelection(e.target.value, selectedCurso);
  };

  const handleCursoSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCurso(e.target.value);
    updateSelection(selectedAnoSemestre, e.target.value);
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
      
  return (
    <div className="flex flex-wrap gap-4 items-start bg-white p-4 rounded-xl shadow-md">
      
      {/* Seletor de Curso */}
      <select
        value={selectedCurso}
        onChange={handleCursoSelection}
        className="border rounded p-2 font-bold text-lg cursor-pointer"
      >
        <option value="">Curso...</option>
        {cursoOptions.sort((a, b) => a.localeCompare(b)).map((curso, idx) => (
          <option key={idx} value={curso}>
            {curso}
          </option>
        ))}
      </select>
      
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
