"use client";
import { useAnosLectivos } from "@/hooks/useAnosLectivos";
import { useDocentes } from "@/hooks/useDocentes";
import { useMemo, useState } from "react";
import CalendarioSemanalDocente from "../CalendarioSemanalDocente";
import { DocenteBase } from "@/types/interfaces";


export default function SelectDisciplina() {

  //
  // A. Gestão de estado do componente
  const [selectedAnoLectivo, setSelectedAnoLectivo] = useState<number | null>(35);
  const [selectedSemestre, setSelectedSemestre] = useState<number | null>(1);
  const [selectedDocente, setSelectedDocente] = useState<DocenteBase | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectOpened, setSelectOpened] = useState(false);
  //
  // B. Obtenção de dados da API usando SWR
  const { anosLectivos, isLoadingAnosLectivos } = useAnosLectivos();
  const { docentes } = useDocentes(selectedAnoLectivo, selectedSemestre);

  //
  // C. Transforma
  const docentesOrdenados = useMemo(() => {
    if (!docentes) return [];

    return [...new Set(docentes.map(item => JSON.stringify(item)))]
      .map(str => JSON.parse(str))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [docentes]);

  //
  // D. Handlers

  const handleAnoLectivoSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAnoLectivo(parseInt(e.target.value));
  };

  const handleSemestreSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSemestre(parseInt(e.target.value));
  };

  const handleDocenteSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const docenteId = e.target.value;
    const docenteObj = docentesOrdenados.find((docente) => String(docente.id) === docenteId) || null;
    setSelectedDocente(docenteObj);
    setSearchTerm(docenteObj.nome ? docenteObj.nome : "");
    setSelectOpened(false);
  };

  //
  // E. Renderização
  if (isLoadingAnosLectivos) return <div>A carregar informação...</div>;
  if (!anosLectivos) return <div>Nenhum ano lectivo disponível.</div>;

  return (<>
    <div className="flex gap-4 mb-4 items-start">

      {/* Seletor de Ano Lectivo */}
      <select
        value={selectedAnoLectivo ?? ""}
        onChange={handleAnoLectivoSelection}
        className="border rounded p-2 font-bold text-lg cursor-pointer"
      >
        <option value="35">25-26</option>
        {anosLectivos
          .sort((a, b) => b.ano_lectivo.localeCompare(a.ano_lectivo))
          .map((ano, idx) => (
            <option key={idx} value={ano.id}>
              {ano.ano_lectivo}
            </option>
          ))
        }
      </select>

      {/* Seletor de Semestre */}
      <select
        value={selectedSemestre ?? ""}
        onChange={handleSemestreSelection}
        className="border rounded p-2 font-bold text-lg cursor-pointer"
      >
        <option key={1} value="1">1º Semestre</option>
        <option key={2} value="2">2º Semestre</option>
      </select>

      {/* Seletor de Docente */}
      {selectedAnoLectivo && selectedSemestre && docentes && (
        <div className="flex flex-col">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSelectedDocente(null)
              setSearchTerm(e.target.value);
              setSelectOpened(true);
            }}
            placeholder="Escreva o nome do docente..."
            className="border rounded p-2 font-bold text-lg mb-2 leading-3"
          />

          {selectOpened && (
            <select
              value={selectedDocente ? String(selectedDocente.id) : ""}
              onChange={handleDocenteSelection}
              size={Math.min(5, docentesOrdenados.length)} // mostra várias opções
              className="border rounded p-2 font-bold text-lg cursor-pointer"
            >
              <option value="">Escolha um docente...</option>
              {docentesOrdenados
                .filter((doc) =>
                  doc.nome.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((docente) => (
                  <option key={docente.id} value={docente.id}>
                    {docente.nome}
                  </option>
                ))}
            </select>)}
        </div>
      )}

    </div>

    { selectedAnoLectivo && selectedSemestre && selectedDocente && (<div className="p-4">
      <CalendarioSemanalDocente 
        docente_id={selectedDocente.id} 
        ano_lectivo_id={selectedAnoLectivo} 
        semestre={selectedSemestre} />
    </div>)}
  </>
  );
}
