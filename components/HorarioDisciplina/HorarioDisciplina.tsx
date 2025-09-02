"use client";
import { useAnosLectivos } from "@/hooks/useAnosLectivos";
import { useEffect, useState } from "react";
import { Disciplina } from "@/types/interfaces";
import { useDisciplinasAnoSemestre } from "@/hooks/useDisciplinasAnoSemestre";
import CalendarioSemanalDisciplina from "../CalendarioSemanalDisciplina";


export default function HorarioDisciplina() {

  //
  // A. Gestão de estado do componente
  const [selectedAnoLectivo, setSelectedAnoLectivo] = useState<number | null>(35);
  const [selectedSemestre, setSelectedSemestre] = useState<number | null>(1);
  const [selectedDisciplina, setSelectedDisciplina] = useState<Disciplina | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectOpened, setSelectOpened] = useState(true);

  useEffect(() => {
    setSelectedAnoLectivo(35);
    setSelectedSemestre(1);
  }, []);

  //
  // B. Obtenção de dados da API usando SWR
  const { anosLectivos, isLoadingAnosLectivos } = useAnosLectivos();
  const { disciplinas, isLoadingDisciplinas } = useDisciplinasAnoSemestre(selectedAnoLectivo, selectedSemestre);

  //
  // D. Handlers

  // const handleAnoLectivoSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   setSelectedAnoLectivo(parseInt(e.target.value));
  // };

  // const handleSemestreSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   setSelectedSemestre(parseInt(e.target.value));
  // };

  const handleDisciplinaSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const disciplinaId = e.target.value;

    if (disciplinaId == "-1") {
      setSelectedDisciplina(null);
      setSearchTerm("");
      setSelectOpened(true);
      return;
    }
    const disciplinaObj = disciplinas?.find((disciplina) => String(disciplina.id) === disciplinaId) || null;
    setSelectedDisciplina(disciplinaObj);
    setSearchTerm(disciplinaObj?.nome ? disciplinaObj.nome : "");
    setSelectOpened(false);
  };

  //
  // E. Renderização
  if (isLoadingAnosLectivos || isLoadingDisciplinas || !disciplinas) return <div>A carregar informação...</div>;
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

      {/* Seletor de Disciplina */}
      {selectedAnoLectivo && selectedSemestre && disciplinas && (
        <div className="flex flex-col w-[65ch]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSelectedDisciplina(null)
              setSearchTerm(e.target.value);
              setSelectOpened(true);
            }}
            onClick={() => setSelectOpened(true)}
            placeholder="Escreva o nome da disciplina..."
            className="border rounded p-2 font-bold text-lg mb-2 leading-3 width-[30ch]"
          />

          {selectOpened && (
            <select
              value={selectedDisciplina ? String(selectedDisciplina.id) : ""}
              onChange={handleDisciplinaSelection}
              size={Math.min(5, disciplinas.length)} // mostra várias opções
              className="border rounded p-2 font-bold text-lg cursor-pointer"
            >
              <option 
                value="-1"
                onClick={() => {
                  setSelectedDisciplina(null);
                  setSearchTerm("");
                  setSelectOpened(true);
                }}              
              >[ver todas...]</option>
              {disciplinas
                .filter((disciplina) =>
                  disciplina.nome.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((disciplina) => (
                  <option key={disciplina.id} value={disciplina.id}>
                    {disciplina.nome}
                  </option>
                ))}
            </select>)}
        </div>
      )}

    </div>

    {selectedAnoLectivo && selectedSemestre && selectedDisciplina && (<div className="p-4">
      <CalendarioSemanalDisciplina
        disciplina_id={selectedDisciplina.id}
        ano_lectivo_id={selectedAnoLectivo}
        semestre={selectedSemestre} />
    </div>)}
  </>
  );
}
