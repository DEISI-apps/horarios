"use client";
import { useHorarios } from "@/hooks/useHorarios";
import { Horario } from "@/types/interfaces";
import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";

interface SelectHorarioProps {
  onSelect: (value: number | null) => void;
}

// Função para abreviar nome do curso
function abreviarNomeCurso(nome: string): string {
  return nome
    .replace("Mestrado em", "MSc")
    .replace("Licenciatura em", "Lic.");
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
      cursoSigla: horario.curso.sigla,
      cursoNome: horario.curso.nome,
      cursoDisplay: `${horario.curso.sigla} - ${abreviarNomeCurso(horario.curso.nome)}`,
      anoLectivo: horario.ano_lectivo.ano_lectivo,
    })) || [], [horarios]);

  // Opções únicas para ano+semestre e curso
  const anoSemestreOptions = Array.from(
    new Set(horarioOptions.filter(h => h.semestre==2).map((h) => `${h.ano}ºano, ${h.semestre}ºsem (${h.anoLectivo})`))
  );
  
  const cursoOptions = useMemo(() => {
    const uniqueCursos = new Map<string, string>();
    horarioOptions.forEach(h => {
      uniqueCursos.set(h.cursoSigla, h.cursoDisplay);
    });
    return Array.from(uniqueCursos.entries()).map(([sigla, display]) => ({ sigla, display }));
  }, [horarioOptions]);

  useEffect(() => {
    if (hasPrefilled || horarioOptions.length === 0) return;

    const cursoParam = searchParams.get("curso");
    const anoParam = Number(searchParams.get("ano"));
    const semParam = Number(searchParams.get("sem"));

    if (!cursoParam || !anoParam || !semParam) return;

    const matching = horarioOptions
      .filter(
        (h) =>
          h.cursoSigla.toLowerCase() === cursoParam.toLowerCase() &&
          h.ano === anoParam &&
          h.semestre === semParam
      )
      .sort((a, b) => b.anoLectivo.localeCompare(a.anoLectivo));

    if (matching.length === 0) return;

    const selected = matching[0];
    const anoSemestre = `${selected.ano}ºano, ${selected.semestre}ºsem (${selected.anoLectivo})`;

    setSelectedCurso(selected.cursoSigla);
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
  const updateSelection = (anoSem: string, cursoSigla: string) => {
    const selectedHorario = horarioOptions.find(
      (h) =>
        `${h.ano}ºano, ${h.semestre}ºsem (${h.anoLectivo})` === anoSem &&
        h.cursoSigla === cursoSigla
    );
    onSelect(selectedHorario ? selectedHorario.id : null);
  };

  //
  // E. Renderização
  if (isError) return <div>Erro ao carregar cursos.</div>;
      
  return (
    <div className="flex flex-wrap gap-4 items-start bg-white p-4 rounded-xl shadow-md">
      
      {/* Seletor de Curso - Mobile (apenas sigla) */}
      <select
        value={selectedCurso}
        onChange={handleCursoSelection}
        className="md:hidden border rounded p-3 font-bold text-xl cursor-pointer"
      >
        <option value="">Curso...</option>
        {cursoOptions.sort((a, b) => a.sigla.localeCompare(b.sigla)).map((curso, idx) => (
          <option key={idx} value={curso.sigla}>
            {curso.sigla}
          </option>
        ))}
      </select>

      {/* Seletor de Curso - Desktop (sigla + nome) */}
      <select
        value={selectedCurso}
        onChange={handleCursoSelection}
        className="hidden md:block border rounded p-3 font-bold text-xl cursor-pointer"
      >
        <option value="">Curso...</option>
        {cursoOptions.sort((a, b) => a.sigla.localeCompare(b.sigla)).map((curso, idx) => (
          <option key={idx} value={curso.sigla}>
            {curso.display}
          </option>
        ))}
      </select>
      
      {/* Seletor de Ano & Semestre */}
      <select
        value={selectedAnoSemestre}
        onChange={handleAnoSemestreSelection}
        className="border rounded p-3 font-bold text-xl cursor-pointer"
      >
        <option value="">Ano...</option>
        {anoSemestreOptions.map((option, idx) => {
          // Extrai apenas a primeira parte (ex: "2ºano" de "2ºano, 2ºsem (25-26)")
          const firstPart = option.split(',')[0].trim();
          // Adiciona espaço após º e capitaliza a próxima letra (ex: "2ºano" -> "2º Ano")
          const formatted = firstPart.replace(/º(\w)/, (match, letter) => `º ${letter.toUpperCase()}`);
          
          return (
            <option key={idx} value={option}>
              {formatted}
            </option>
          );
        })}
      </select>

      
    </div>
  );
}
