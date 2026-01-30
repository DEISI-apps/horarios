"use client";
// import { useAnosLectivos } from "@/hooks/useAnosLectivos";
import { useEffect, useState } from "react";
import { useSalas } from "@/hooks/useSalas";
import CalendarioSemanalSala from "../CalendarioSemanalSala";
import { useAnosLectivos } from "@/hooks/useAnosLectivos";
import { Loader2 } from "lucide-react";


export default function HorarioSala() {

  //
  // A. Gestão de estado do componente
  const [selectedAnoLectivo, setSelectedAnoLectivo] = useState<number | null>(35);
  const [selectedSemestre, setSelectedSemestre] = useState<number | null>(2);
  const [selectedSala, setSelectedSala] = useState<number | null>(null);

  useEffect(() => {
    setSelectedAnoLectivo(35);
    setSelectedSemestre(2);
  }, []);


  //
  // B. Obtenção de dados da API usando SWR
  // const { anosLectivos, isLoadingAnosLectivos } = useAnosLectivos();
  const { salas, isLoadingSalas } = useSalas();
  const { anosLectivos, isLoadingAnosLectivos } = useAnosLectivos();

  //
  // C. Handlers

  const handleAnoLectivoSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAnoLectivo(parseInt(e.target.value));
  };

  const handleSemestreSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSemestre(parseInt(e.target.value));
  };


  const handleSalaSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = event.target.value;
    setSelectedSala(selectedId ? parseInt(selectedId) : null);
  };



  //
  // D. Renderização
  if (isLoadingSalas || isLoadingAnosLectivos || !anosLectivos) return <div className="flex justify-center items-center h-32">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      <p className="text-gray-500">A carregar salas...</p>
    </div>;

  return (
    <div className="p-4 flex flex-col gap-6">
      {/* Barra de Filtros */}
      <div className="flex flex-wrap gap-4 items-start bg-white p-4 rounded-xl shadow-md">

        {/* Seletor de Ano Lectivo */}
        <select
          value={selectedAnoLectivo ?? ""}
          onChange={handleAnoLectivoSelection}
          className="border rounded p-2 text-lg cursor-pointer"
        >
          <option value="35">25-26</option>
          {/* {anosLectivos
            .sort((a, b) => b.ano_lectivo.localeCompare(a.ano_lectivo))
            .map((ano, idx) => (
              <option key={idx} value={ano.id}>
                {ano.ano_lectivo}
              </option>
            ))
          } */}
        </select>

        {/* Seletor de Semestre */}
        <select
          value={selectedSemestre ?? ""}
          onChange={handleSemestreSelection}
          className="border rounded p-2 text-lg cursor-pointer"
        >
          {/* <option key={1} value="1">1º Semestre</option> */}
          <option key={2} value="2">2º Semestre</option>
        </select>

        {/* Seletor de Docente */}
        {selectedAnoLectivo && selectedSemestre && salas && (
          <select
            value={selectedSala ?? ""}
            onChange={handleSalaSelection}
            className="border rounded p-2 font-bold cursor-pointer mb-2 flex row gap-3 items-center"
            style={{ border: '1px solid lightgray' }}
          >
            <option value="">Selecione uma sala...</option>
            {salas.sort((a, b) => a.nome.localeCompare(b.nome)).map((salaOpcao) => (
              <option key={salaOpcao.id} value={salaOpcao.id}>
                Sala {salaOpcao.nome}
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedAnoLectivo && selectedSemestre && selectedSala && (
        <div className="p-4 bg-white rounded-xl shadow-md">
          <CalendarioSemanalSala
            sala_id={selectedSala}
            ano_lectivo_id={selectedAnoLectivo}
            semestre={selectedSemestre}
          />
        </div>
      )}
    </div>
  );
}
