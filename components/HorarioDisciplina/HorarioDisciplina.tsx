"use client";
import { useAnosLectivos } from "@/hooks/useAnosLectivos";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Disciplina } from "@/types/interfaces";
import { useDisciplinasAnoSemestre } from "@/hooks/useDisciplinasAnoSemestre";
import CalendarioSemanalDisciplina from "../CalendarioSemanalDisciplina";
import { Loader2, Search, BookOpen } from "lucide-react";


export default function HorarioDisciplina() {
  const router = useRouter();
  const searchParams = useSearchParams();

  //
  // A. Gestão de estado do componente
  const [selectedAnoLectivo, setSelectedAnoLectivo] = useState<number | null>(35);
  const [selectedSemestre, setSelectedSemestre] = useState<number | null>(2);
  const [selectedDisciplina, setSelectedDisciplina] = useState<Disciplina | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectOpened, setSelectOpened] = useState(false);
  const [hasPrefilled, setHasPrefilled] = useState(false);

  useEffect(() => {
    setSelectedAnoLectivo(35);
    setSelectedSemestre(2);
  }, []);

  //
  // B. Obtenção de dados da API usando SWR
  const { anosLectivos, isLoadingAnosLectivos } = useAnosLectivos();
  const { disciplinas, isLoadingDisciplinas } = useDisciplinasAnoSemestre(selectedAnoLectivo, selectedSemestre);

  // Prefill da disciplina a partir da URL
  useEffect(() => {
    if (!disciplinas || hasPrefilled) return;
    
    const disciplinaParam = searchParams.get("disciplina");
    if (disciplinaParam) {
      const disciplinaObj = disciplinas.find(d => d.nome === disciplinaParam);
      if (disciplinaObj) {
        setSelectedDisciplina(disciplinaObj);
        setSearchTerm(disciplinaObj.nome);
        setSelectOpened(false);
        setHasPrefilled(true);
      }
    }
  }, [disciplinas, searchParams, hasPrefilled]);

  //
  // D. Handlers

  const handleAnoLectivoSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAnoLectivo(parseInt(e.target.value));
  };

  const handleSemestreSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSemestre(parseInt(e.target.value));
  };

  const handleDisciplinaSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const disciplinaId = e.target.value;

    if (disciplinaId == "-1") {
      setSelectedDisciplina(null);
      setSearchTerm("");
      setSelectOpened(true);
      router.replace('/disciplinas', { scroll: false });
      return;
    }
    const disciplinaObj = disciplinas?.find((disciplina) => String(disciplina.id) === disciplinaId) || null;
    setSelectedDisciplina(disciplinaObj);
    setSearchTerm(disciplinaObj?.nome ? disciplinaObj.nome : "");
    setSelectOpened(false);
    
    // Atualiza a URL com o nome da disciplina
    if (disciplinaObj) {
      router.replace(`/disciplinas?disciplina=${encodeURIComponent(disciplinaObj.nome)}`, { scroll: false });
    }
  };

  //
  // E. Renderização
  if (isLoadingAnosLectivos || isLoadingDisciplinas || !disciplinas) return (
    <div className="flex justify-center items-center h-32 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      <p className="text-gray-500 font-medium">A carregar disciplinas...</p>
    </div>
  );
    
  if (!anosLectivos) return <div className="p-4 text-lg font-medium">Nenhum ano lectivo disponível.</div>;

  return (
    <div className="p-4 flex flex-col gap-6 max-w-6xl mx-auto">
      
      {/* Secção de Pesquisa */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Horário de Disciplina</h1>
            <p className="text-sm text-gray-500">Pesquise pelo nome da disciplina</p>
          </div>
        </div>

        {/* Seletor de Ano Lectivo - Hidden */}
        <select
          value={selectedAnoLectivo ?? ""}
          onChange={handleAnoLectivoSelection}
          className="hidden"
        >
          <option value="35">25-26</option>
        </select>

        {/* Seletor de Semestre - Hidden */}
        <select
          value={selectedSemestre ?? ""}
          onChange={handleSemestreSelection}
          className="hidden"
        >
          <option key={2} value="2">2º Semestre</option>
        </select>

        {/* Seletor de Disciplina */}
        {selectedAnoLectivo && selectedSemestre && disciplinas && (
          <div className="flex flex-col">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSelectedDisciplina(null)
                  setSearchTerm(e.target.value);
                  setSelectOpened(true);
                }}
                onClick={() => setSelectOpened(true)}
                placeholder="Pesquisar disciplina pelo nome..."
                className="w-full border-2 rounded-xl p-4 pl-12 font-medium text-lg focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-400 placeholder:font-normal border-gray-200"
                style={{ color: 'black' }}
                autoFocus
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            {selectOpened && (
              <select
                value={selectedDisciplina ? String(selectedDisciplina.id) : ""}
                onChange={handleDisciplinaSelection}
                size={Math.min(6, disciplinas.filter((d) => d.nome.toLowerCase().includes(searchTerm.toLowerCase())).length + 1)}
                className="border-2 border-gray-200 rounded-xl p-3 font-medium text-lg cursor-pointer hover:border-blue-300 mt-2 focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="-1" className="text-gray-500">Listar todas as disciplinas...</option>
                {disciplinas
                  .filter((disciplina) =>
                    disciplina.nome.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((disciplina) => (
                    <option key={disciplina.id} value={disciplina.id}>
                      {disciplina.nome}
                    </option>
                  ))}
              </select>
            )}
          </div>
        )}
      </div>

      {/* Calendário */}
      {selectedAnoLectivo && selectedSemestre && selectedDisciplina && (
        <div className="p-4 bg-white rounded-2xl shadow-lg border border-gray-100">
          <CalendarioSemanalDisciplina
            disciplina_id={selectedDisciplina.id}
            ano_lectivo_id={selectedAnoLectivo}
            semestre={selectedSemestre}
          />
        </div>
      )}
    </div>
  );
}
