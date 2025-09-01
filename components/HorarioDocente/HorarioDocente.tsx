"use client";
import { useAnosLectivos } from "@/hooks/useAnosLectivos";
import { useDocentes } from "@/hooks/useDocentes";
import {  useEffect, useState } from "react";
import CalendarioSemanalDocente from "../CalendarioSemanalDocente";
import { DocenteBase } from "@/types/interfaces";


export default function HorarioDocente() {

  //
  // A. Gestão de estado do componente
  const [selectedAnoLectivo, setSelectedAnoLectivo] = useState<number | null>(35);
  const [selectedSemestre, setSelectedSemestre] = useState<number | null>(1);
  const [selectedDocente, setSelectedDocente] = useState<DocenteBase | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectOpened, setSelectOpened] = useState(true);

  useEffect(() => { 
      setSelectedAnoLectivo(35);
    setSelectedSemestre(1);
  }, []);


  //
  // B. Obtenção de dados da API usando SWR
  const { anosLectivos, isLoadingAnosLectivos } = useAnosLectivos();
  const { docentes, isLoadingDocentes } = useDocentes(selectedAnoLectivo, selectedSemestre);

  //
  // C. Handlers

  // const handleAnoLectivoSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   setSelectedAnoLectivo(parseInt(e.target.value));
  // };

  // const handleSemestreSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   setSelectedSemestre(parseInt(e.target.value));
  // };

  const handleDocenteSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const docenteId = e.target.value;

    if (docenteId == "-1") {
      setSelectedDocente(null);
      setSearchTerm("");
      setSelectOpened(true);
      return;
    }

    const docenteObj = docentes?.find((docente) => String(docente.id) === docenteId) || null;
    setSelectedDocente(docenteObj);
    setSearchTerm(docenteObj?.nome ? docenteObj.nome : "");
    setSelectOpened(false);
  };

  //
  // D. Renderização
  if (isLoadingAnosLectivos || isLoadingDocentes) return <div>A carregar informação...</div>;
  if (!anosLectivos) return <div>Nenhum ano lectivo disponível.</div>;

  return (<>
    <div className="flex gap-4 pl-4 items-start">

      {/* Seletor de Ano Lectivo */}
      {/* <select
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
      </select> */}

      {/* Seletor de Semestre */}
      {/* <select
        value={selectedSemestre ?? ""}
        onChange={handleSemestreSelection}
        className="border rounded p-2 font-bold text-lg cursor-pointer"
      >
        <option key={1} value="1">1º Semestre</option>
        <option key={2} value="2">2º Semestre</option>
      </select> */}

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
            onClick={() => setSelectOpened(true)}
            placeholder="Escreva o nome do docente..."
            className="border rounded p-2 font-bold text-lg mb-2 leading-3"
          />

          {selectOpened && (
            <select
              value={selectedDocente ? String(selectedDocente.id) : ""}
              onChange={handleDocenteSelection}
              size={Math.min(5, docentes.length)} // mostra várias opções
              className="border rounded p-2 font-bold text-lg cursor-pointer"
            >
              <option value="-1"
                onClick={() => {
                  setSelectedDocente(null);
                  setSearchTerm("");
                  setSelectOpened(true);
                }}
              >listar todos...</option>
              {docentes
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
