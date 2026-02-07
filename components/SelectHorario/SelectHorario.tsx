"use client";
import { useHorarios } from "@/hooks/useHorarios";
import { Horario } from "@/types/interfaces";
import { useState, useEffect, ReactNode } from "react";

interface SelectHorarioProps {
  onSelect: (value: number | null) => void;
  onSelectionChange?: (curso: string, anoSemestre: string) => void;
  initialCurso?: string;
  initialAnoSemestre?: string;
  children?: ReactNode;
}

export default function SelectHorario({ 
  onSelect, 
  onSelectionChange,
  initialCurso = "",
  initialAnoSemestre = "",
  children 
}: SelectHorarioProps) {
  //
  // A. Gestão de estado do componente
  const [selectedAnoSemestre, setSelectedAnoSemestre] = useState<string>(initialAnoSemestre);
  const [selectedCurso, setSelectedCurso] = useState<string>(initialCurso);
  const [initialized, setInitialized] = useState(false);

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
      cursoNome: horario.curso.nome,
      anoLectivo: horario.ano_lectivo.ano_lectivo,
      label: `${horario.curso.sigla}, ${horario.ano}ºano, ${horario.semestre}ºsem (${horario.ano_lectivo.ano_lectivo})`,
    })) || [];

  // Opções únicas para ano+semestre e curso
  const anoSemestreOptions = Array.from(
    new Set(horarioOptions.filter(h => h.semestre==2).map((h) => `${h.ano}ºano, ${h.semestre}ºsem (${h.anoLectivo})`))
  );
  
  // Mapa de sigla -> nome do curso
  const cursoMap = new Map<string, string>();
  horarioOptions.forEach(h => {
    if (!cursoMap.has(h.curso)) {
      cursoMap.set(h.curso, h.cursoNome);
    }
  });
  const cursoOptions = Array.from(cursoMap.entries());

  //
  // D. Handlers
  const handleAnoSemestreSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAnoSemestre(e.target.value);
    updateSelection(e.target.value, selectedCurso);
    onSelectionChange?.(selectedCurso, e.target.value);
  };

  const handleCursoSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCurso(e.target.value);
    updateSelection(selectedAnoSemestre, e.target.value);
    onSelectionChange?.(e.target.value, selectedAnoSemestre);
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

  // Inicialização com valores de URL
  useEffect(() => {
    if (!initialized && horarios && horarios.length > 0 && initialCurso && initialAnoSemestre) {
      setSelectedCurso(initialCurso);
      setSelectedAnoSemestre(initialAnoSemestre);
      updateSelection(initialAnoSemestre, initialCurso);
      setInitialized(true);
    }
  }, [initialized, horarios, initialCurso, initialAnoSemestre]);

  //
  // E. Renderização
  if (isError) return <div className="text-red-500 font-medium">Erro ao carregar cursos.</div>;
  if (isLoading) return <div className="text-gray-500">A carregar...</div>;
      
  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
      
      {/* Seletor de Curso */}
      <select
        value={selectedCurso}
        onChange={handleCursoSelection}
        className="flex-1 border-2 border-gray-200 rounded-xl p-4 font-medium text-lg cursor-pointer hover:border-blue-300 focus:outline-none focus:border-blue-500 transition-colors"
      >
        <option value="">Selecionar curso...</option>
        {cursoOptions.sort((a, b) => a[0].localeCompare(b[0])).map(([sigla, nome], idx) => (
          <option key={idx} value={sigla}>
            {sigla} - {nome}
          </option>
        ))}
      </select>
      
      {/* Seletor de Ano & Semestre */}
      <select
        value={selectedAnoSemestre}
        onChange={handleAnoSemestreSelection}
        className="flex-1 border-2 border-gray-200 rounded-xl p-4 font-medium text-lg cursor-pointer hover:border-blue-300 focus:outline-none focus:border-blue-500 transition-colors"
      >
        <option value="">Selecionar ano...</option>
        {anoSemestreOptions.map((option, idx) => (
          <option key={idx} value={option}>
            {option}
          </option>
        ))}
      </select>

      {/* Conteúdo adicional (botões, etc.) */}
      {children}
      
    </div>
  );
}