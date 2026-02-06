"use client";
import { useAnosLectivos } from "@/hooks/useAnosLectivos";
import { useDocentes } from "@/hooks/useDocentes";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CalendarioSemanalDocente from "../CalendarioSemanalDocente";
import { DocenteBase } from "@/types/interfaces";
import { Loader2 } from "lucide-react";

export default function HorarioDocente() {
  const searchParams = useSearchParams();
  
  // Estado
  const [selectedAnoLectivo, setSelectedAnoLectivo] = useState<number | null>(35);
  const [selectedSemestre, setSelectedSemestre] = useState<number | null>(2);
  const [selectedDocente, setSelectedDocente] = useState<DocenteBase | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectOpened, setSelectOpened] = useState(false);
  const [hasPrefilled, setHasPrefilled] = useState(false);

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
      return;
    }
    const docenteObj = docentes?.find((doc) => String(doc.id) === docenteId) || null;
    setSelectedDocente(docenteObj);
    setSearchTerm(docenteObj?.nome || "");
    setSelectOpened(false);
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
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSelectedDocente(null);
                setSearchTerm(e.target.value);
                setSelectOpened(true);
              }}
              onClick={() => setSelectOpened(true)}
              placeholder="Nome do docente..."
              className="border rounded-lg p-4 font-bold text-2xl mb-1 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-400"
              style={{ color: 'black' }}
              autoFocus
            />
            {selectOpened && (
              <select
                value={selectedDocente ? String(selectedDocente.id) : ""}
                onChange={handleDocenteSelection}
                size={Math.min(5, docentes.length)}
                className="border rounded-lg p-3 font-bold text-2xl cursor-pointer hover:bg-gray-50"
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
          />
        </div>
      )}
    </div>
  );
}
