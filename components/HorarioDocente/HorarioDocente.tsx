"use client";
import { useAnosLectivos } from "@/hooks/useAnosLectivos";
import { useDocentes } from "@/hooks/useDocentes";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CalendarioSemanalDocente from "../CalendarioSemanalDocente";
import { DocenteBase } from "@/types/interfaces";
import { Loader2, Download, Info } from "lucide-react";

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
    return <div className="flex justify-center items-center h-32">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      <p className="text-gray-500">A carregar docentes...</p>
    </div>;
  if (!anosLectivos) return <div className="p-4 text-lg font-medium">Nenhum ano lectivo disponível.</div>;

  // Render
  return (
    <div className="p-4 flex flex-col gap-6">
      
      {/* Barra de Filtros */}
      <div className="flex flex-wrap gap-4 items-start bg-white p-4 rounded-xl shadow-md">
        {/* Ano Lectivo */}
        <select
          value={selectedAnoLectivo ?? ""}
          onChange={handleAnoLectivoSelection}
          className="hidden border rounded-lg p-3 font-medium text-xl cursor-pointer hover:bg-gray-50"
        >
          <option value={35}>25-26</option>
          {/* {anosLectivos
            .sort((a, b) => b.ano_lectivo.localeCompare(a.ano_lectivo))
            .map((ano) => (
              <option key={ano.id} value={ano.id}>
                {ano.ano_lectivo}
              </option>
            ))} */}
        </select>

        {/* Semestre */}
        <select
          value={selectedSemestre ?? ""}
          onChange={handleSemestreSelection}
          className="hidden border rounded-lg p-3 font-medium text-xl cursor-pointer hover:bg-gray-50"
        >
          {/* <option value="1">1º Semestre</option> */}
          <option value="2">2º Semestre</option>
        </select>

        {/* Docente */}
        {selectedAnoLectivo && selectedSemestre && docentes && (
          <div className="flex flex-col w-full">
            <div className="flex gap-2 items-center">
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
                placeholder="Nome do docente..."
                className="flex-1 border rounded-lg p-4 font-bold text-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-400"
                style={{ color: 'black' }}
                autoFocus
              />
              {selectedDocente && downloadFn && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadFn}
                    className="p-4 bg-blue-500 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 font-bold whitespace-nowrap"
                  >
                    <Download className="w-5 h-5" />
                    Descarregar Horário
                  </button>
                  <div className="relative group">
                    <Info className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-help" />
                    <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      <p className="mb-2">O ficheiro ICS contém o horário completo das semanas lectivas.</p>
                      <p>Pode importar no <strong>Google Calendar</strong> ou <strong>Outlook</strong>: clique no ficheiro descarregado ou importe-o nas definições do calendário.</p>
                      <div className="absolute right-4 -top-2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-800"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {selectOpened && (
              <select
                value={selectedDocente ? String(selectedDocente.id) : ""}
                onChange={handleDocenteSelection}
                size={Math.min(5, docentes.length)}
                className="border rounded-lg p-3 font-bold text-2xl cursor-pointer hover:bg-gray-50 mt-1"
              >
                <option value="-1">Listar todos...</option>
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
        <div className="p-4 bg-white rounded-xl shadow-md">
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
