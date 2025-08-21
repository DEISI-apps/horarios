"use client";

import { useAulas } from "@/hooks/useAulas";
import { useDisciplinas } from "@/hooks/useDisciplinas";
import { useTurmas } from "@/hooks/useTurmas";
import { useEffect, useState } from "react";
import DisciplinaModal from "../CalendarioSemanalDisciplina/DisciplinaModal";
import { Horario } from "@/types/interfaces";


const gerarCorDisciplina = (id: number) => {
  const hue = (id * 137) % 360;
  return `hsl(${hue}, 80%, 80%)`; // cor mais clara para background
};

interface DisciplinaAPI {
  id: number;
  nome: string;
  aula_teorica_duracao: number;
  aula_pratica_duracao: number;
  horas_teoricas: number;
  horas_praticas: number;
}

interface DisciplinaInfo {
  nome: string;
  teorica: number;
  pratica: number;
}

interface TurmaInfo {
  nome: string;
  disciplinas: Map<number, DisciplinaInfo>;
}

type TurmasMap = Map<number, TurmaInfo>;


function serializeDisciplinaInfo(info: DisciplinaInfo): string {
  return `${info.nome}:${info.teorica}:${info.pratica}`;
}

function serializeTurmasMap(map: TurmasMap): string {
  return Array.from(map.entries())
    .map(([turmaId, turma]) => {
      const disciplinasStr = Array.from(turma.disciplinas.entries())
        .map(([discId, info]) => `${discId}=${serializeDisciplinaInfo(info)}`)
        .sort()
        .join(',');
      return `${turmaId}:{${turma.nome}|${disciplinasStr}}`;
    })
    .sort()
    .join(';');
}


export default function TurmasSection({ horario }: { horario: Horario }) {

  //
  // A. Definição de estados
  const [turmasMap, setTurmasMap] = useState<TurmasMap>(new Map());
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedDisciplina, setSelectedDisciplina] = useState<DisciplinaAPI>();

  //
  // B. Obtenção de dados
  const { disciplinas, isLoadingDisciplinas, errorDisciplinas } = useDisciplinas(horario.id);
  const { turmas, isLoadingTurmas } = useTurmas(horario.id);
  const { aulas, isLoadingAulas, errorAulas } = useAulas(horario.id);


  //
  // C. atualização da lista de turmas e suas aulas.
  useEffect(() => {

    if (!disciplinas || !turmas || !aulas) return;

    const novoTurmasMap: TurmasMap = new Map();

    // Inicializa o mapa de turmas com as disciplinas
    turmas.forEach(({ id: turmaId, nome: turmaNome }) => {
      const disciplinasMap = new Map<number, DisciplinaInfo>();
      disciplinas.forEach(({ id: disciplinaId, nome: disciplinaNome }) => {
        disciplinasMap.set(disciplinaId, { nome: disciplinaNome, teorica: 0, pratica: 0 });
      });
      novoTurmasMap.set(turmaId, { nome: turmaNome, disciplinas: disciplinasMap });
    });

    // Atualiza as horas das aulas agendadas
    if (aulas) {
      aulas.forEach(({ turma_id, disciplina_id, tipo, duracao, juncao }) => {
        if (juncao) return;

        const discInfo = novoTurmasMap.get(turma_id)?.disciplinas.get(disciplina_id);
        if (!discInfo) return;

        const horasAula = (duracao ?? 0) / 60;

        if (tipo.toLowerCase().startsWith("t")) discInfo.teorica += horasAula;
        else if (tipo.toLowerCase().startsWith("p")) discInfo.pratica += horasAula;
      });
    }

    // Compara antes de atualizar para evitar loops
    const currentMapSerialized = serializeTurmasMap(turmasMap);
    const newMapSerialized = serializeTurmasMap(novoTurmasMap);

    if (currentMapSerialized !== newMapSerialized) {
      setTurmasMap(novoTurmasMap);
    }

  }, [disciplinas, turmas, aulas, turmasMap]);


  //
  // C. renderiza
  if (isLoadingDisciplinas) return <p className="text-gray-500">A carregar disciplinas...</p>;
  if (isLoadingAulas) return <p className="text-gray-500">A carregar aulas...</p>;
  if (errorDisciplinas) return <p className="text-red-500">Erro ao carregar disciplinas.</p>;
  if (isLoadingTurmas) return <p className="text-gray-500">A carregar turmas...</p>;

  return (<>
    <section className="pt-8">
      <h2 className="mt-4 mb-2 text-lg font-semibold">Aulas Marcadas por Turma e Disciplina</h2>

      {(isLoadingDisciplinas || isLoadingAulas) && <p className="text-gray-500">A carregar dados...</p>}
      {(errorDisciplinas || errorAulas) && <p className="text-red-500">Erro ao carregar dados.</p>}

      {!isLoadingDisciplinas && disciplinas && turmasMap.size > 0 && (
        <div className="overflow-auto">
          <table className="border-separate border-spacing-y-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 rounded-l-lg text-left">Disciplina</th>
                {Array.from(turmasMap.entries()).map(([turmaId, turma], index, array) => (
                  <th
                    key={turmaId}
                    className={`px-2 py-1 ${index === array.length - 1 ? 'rounded-r-lg' : ''}`}
                  >
                    Turma {turma.nome}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...disciplinas]  // Create a new array to avoid mutating the original
                .sort((a, b) => a.nome.localeCompare(b.nome, 'pt'))  // Sort by name
                .map((disciplina: DisciplinaAPI) => (
                  <tr
                    key={disciplina.id}
                    className="rounded-lg text-sm"
                    style={{ backgroundColor: gerarCorDisciplina(disciplina.id) }}
                  >
                    <td className="border px-2 py-1 rounded-l-lg">

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDisciplina(disciplina);
                          setModalOpen(true);
                        }}
                        className="font-semibold underline focus:outline-none text-left"
                      >
                        {disciplina.nome}
                      </button>
                      <br />
                      <span> Duração T: {disciplina.aula_teorica_duracao}h, P: {disciplina.aula_pratica_duracao}h</span>
                    </td>

                    {Array.from(turmasMap.entries()).map(([turmaId, turma], index, array) => {
                      const discInfo = turma.disciplinas.get(disciplina.id);

                      return (
                        <td
                          key={turmaId}
                          className={`border m px-2 py-1 text-left align-top bg-white ${index === array.length - 1 ? 'rounded-r-lg' : ''}`}
                        >
                          {discInfo && (
                            <>
                              <div>
                                <span className="font-medium">T:</span>{" "}
                                {discInfo.teorica ? `${discInfo.teorica.toFixed(1)}h` : "-"}
                              </div>
                              <div>
                                <span className="font-medium">P:</span>{" "}
                                {discInfo.pratica ? `${discInfo.pratica.toFixed(1)}h` : "-"}
                              </div>
                            </>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </section>

    {selectedDisciplina && (
      <DisciplinaModal
        isOpen={isModalOpen}
        setModalOpen={setModalOpen}
        disciplina_id={selectedDisciplina.id}
        disciplina_nome={selectedDisciplina.nome}
        ano_lectivo_id={horario.ano_lectivo_id}
        semestre={horario.semestre}
      />)
    }
  </>
  );
}