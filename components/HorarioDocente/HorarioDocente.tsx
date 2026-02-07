"use client";
import { useAnosLectivos } from "@/hooks/useAnosLectivos";
import { useDocentes } from "@/hooks/useDocentes";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CalendarioSemanalDocente from "../CalendarioSemanalDocente";
import { DocenteBase } from "@/types/interfaces";
import { Loader2, Download, Info, Search, GraduationCap } from "lucide-react";

export default function HorarioDocente() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Estado
  const [selectedAnoLectivo, setSelectedAnoLectivo] = useState<number | null>(35);
  const [selectedSemestre, setSelectedSemestre] = useState<number | null>(2);
  const [selectedDocente, setSelectedDocente] = useState<DocenteBase | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectOpened, setSelectOpened] = useState(false);
  const [hasPrefilled, setHasPrefilled] = useState(false);
  const [downloadFn, setDownloadFn] = useState<(() => void) | null>(null);

  // Callback para receber a função de download do CalendarioSemanalDocente
  const handleDownloadReady = useCallback((fn: () => void) => {
    setDownloadFn(() => fn);
  }, []);

  // Fetch SWR
  const { anosLectivos, isLoadingAnosLectivos } = useAnosLectivos();
  const { docentes, isLoadingDocentes } = useDocentes(selectedAnoLectivo, selectedSemestre);

  // Defaults
  useEffect(() => {
    setSelectedAnoLectivo(35);
    setSelectedSemestre(2);
  }, []);

  // Pré-preencher a partir de query params
  useEffect(() => {
    if (hasPrefilled || !docentes || docentes.length === 0) return;

    const docenteParam = searchParams.get("docente");
    
    if (!docenteParam) return;

    // Procura o docente por nome (case-insensitive)
    const matching = docentes.find(
      (doc) => doc.nome.toLowerCase() === docenteParam.toLowerCase()
    );

    if (matching) {
      setSelectedDocente(matching);
      setSearchTerm(matching.nome);
      setSelectOpened(false);
      setHasPrefilled(true);
    }
  }, [hasPrefilled, docentes, searchParams]);

  // Handlers
  const handleAnoLectivoSelection = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setSelectedAnoLectivo(parseInt(e.target.value));

  const handleSemestreSelection = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setSelectedSemestre(parseInt(e.target.value));

  const handleDocenteSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const docenteId = e.target.value;
    if (docenteId === "-1") {
      setSelectedDocente(null);
      setSearchTerm("");
      setSelectOpened(true);
      setDownloadFn(null);
      router.replace('/docentes', { scroll: false });
      return;
    }
    const docenteObj = docentes?.find((doc) => String(doc.id) === docenteId) || null;
    setSelectedDocente(docenteObj);
    setSearchTerm(docenteObj?.nome || "");
    setSelectOpened(false);
    setDownloadFn(null); // Reset download function until new calendar loads
    
    // Atualiza a URL com o nome do docente
    if (docenteObj) {
      router.replace(`/docentes?docente=${encodeURIComponent(docenteObj.nome)}`, { scroll: false });
    }
  };

  // Loading
  if (isLoadingAnosLectivos || isLoadingDocentes)
    return (
      <div className="flex justify-center items-center h-32 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-gray-500 font-medium">A carregar docentes...</p>
      </div>
    );
  if (!anosLectivos) return <div className="p-4 text-lg font-medium">Nenhum ano lectivo disponível.</div>;

  // Render
  return (
    <div className="p-4 flex flex-col gap-6 max-w-6xl mx-auto">
      
      {/* Secção de Pesquisa + Info Docente */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Horário de Docente</h1>
            <p className="text-sm text-gray-500">Pesquise pelo nome do docente</p>
          </div>
        </div>
        
        {/* Ano Lectivo - Hidden */}
        <select
          value={selectedAnoLectivo ?? ""}
          onChange={handleAnoLectivoSelection}
          className="hidden"
        >
          <option value={35}>25-26</option>
        </select>

        {/* Semestre - Hidden */}
        <select
          value={selectedSemestre ?? ""}
          onChange={handleSemestreSelection}
          className="hidden"
        >
          <option value="2">2º Semestre</option>
        </select>

        {/* Docente */}
        {selectedAnoLectivo && selectedSemestre && docentes && (
          <div className="flex flex-col">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              {/* Input de pesquisa */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSelectedDocente(null);
                    setSearchTerm(e.target.value);
                    setSelectOpened(true);
                    setDownloadFn(null);
                  }}
                  onClick={() => setSelectOpened(true)}
                  placeholder="Pesquisar docente pelo nome..."
                  className="w-full border-2 rounded-xl p-4 pl-12 font-medium text-lg focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-400 placeholder:font-normal border-gray-200"
                  style={{ color: 'black' }}
                  autoFocus
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              
              {/* Info do docente + botões (quando selecionado) */}
              {selectedDocente && downloadFn && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={downloadFn}
                    className="px-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 font-bold transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                  >
                    <Download className="w-5 h-5" />
                    <span className="hidden sm:inline">Descarregar</span>
                  </button>
                  <div className="relative group">
                    <div className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center cursor-help transition-colors">
                      <Info className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="absolute right-0 top-full mt-2 w-72 p-4 bg-gray-900 text-white text-sm rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      <p className="mb-2 font-medium">Exportar para Calendário</p>
                      <p className="text-gray-300">O ficheiro ICS contém o horário completo das semanas lectivas. Pode importar no <strong className="text-white">Google Calendar</strong> ou <strong className="text-white">Outlook</strong>.</p>
                      <div className="absolute right-6 -top-2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-900"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {selectOpened && (
              <select
                value={selectedDocente ? String(selectedDocente.id) : ""}
                onChange={handleDocenteSelection}
                size={Math.min(6, docentes.filter((doc) => doc.nome.toLowerCase().includes(searchTerm.toLowerCase())).length + 1)}
                className="border-2 border-gray-200 rounded-xl p-3 font-medium text-lg cursor-pointer hover:border-blue-300 mt-2 focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="-1" className="text-gray-500">Listar todos os docentes...</option>
                {docentes
                  .filter((doc) => doc.nome.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((docente) => (
                    <option key={docente.id} value={docente.id}>
                      {docente.nome}
                    </option>
                  ))}
              </select>
            )}
          </div>
        )}
      </div>

      {/* Calendário */}
      {selectedAnoLectivo && selectedSemestre && selectedDocente && (
        <div className="p-4 bg-white rounded-2xl shadow-lg border border-gray-100">
          <CalendarioSemanalDocente
            docente_id={selectedDocente.id}
            ano_lectivo_id={selectedAnoLectivo}
            semestre={selectedSemestre}
            showDownloadButton={false}
            onDownloadReady={handleDownloadReady}
          />
        </div>
      )}
    </div>
  );
}
