"use client";

import { useAulas } from "@/hooks/useAulas";
import { useDisciplinas } from "@/hooks/useDisciplinas";
import { useTurmas } from "@/hooks/useTurmas";
import { useEffect, useState } from "react";
import DisciplinaModal from "../CalendarioSemanalDisciplina/DisciplinaModal";
import { Horario } from "@/types/interfaces";
import { gerarCorDisciplina } from "@/lib/utils";
import { AlertCircle } from "lucide-react";


interface DisciplinaAPI {
  id: number;
  nome: string;
  cursos: string;
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
      aulas.forEach(({ turma_id, disciplina_id, tipo, duracao }) => {

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
  if (isLoadingDisciplinas) return <p className="text-gray-500 py-8">A carregar disciplinas...</p>;
  if (isLoadingAulas) return <p className="text-gray-500 py-8">A carregar aulas...</p>;
  if (errorDisciplinas) return <p className="text-red-500 py-8">Erro ao carregar disciplinas.</p>;
  if (isLoadingTurmas) return <p className="text-gray-500 py-8">A carregar turmas...</p>;

  return (
    <>
      <section>
        {(isLoadingDisciplinas || isLoadingAulas) && <p className="text-gray-500 py-4">A carregar dados...</p>}
        {(errorDisciplinas || errorAulas) && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">Erro ao carregar dados.</p>
          </div>
        )}

        {!isLoadingDisciplinas && disciplinas && turmasMap.size > 0 && (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-amber-50 to-amber-100 border-b border-amber-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Disciplina</th>
                  {Array.from(turmasMap.entries()).map(([turmaId, turma]) => (
                    <th
                      key={turmaId}
                      className="px-4 py-3 text-center font-semibold text-gray-900 border-l border-amber-200"
                    >
                      <div className="text-sm">Turma</div>
                      <div className="font-bold text-lg text-amber-700">{turma.nome}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...disciplinas]
                  .sort((a, b) => a.nome.localeCompare(b.nome, 'pt'))
                  .map((disciplina: DisciplinaAPI) => (
                    <tr
                      key={disciplina.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition"
                    >
                      <td 
                        className="px-4 py-3 font-medium"
                        style={{ backgroundColor: gerarCorDisciplina(disciplina.id) + '22' }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDisciplina(disciplina);
                            setModalOpen(true);
                          }}
                          className="font-semibold underline hover:no-underline text-left focus:outline-none text-gray-900 hover:text-gray-700"
                        >
                          {disciplina.nome}
                        </button>
                        <div className="text-xs text-gray-600 mt-1">
                          <span>Necessidade: T: <span className="font-semibold">{disciplina.aula_teorica_duracao}h</span>, P: <span className="font-semibold">{disciplina.aula_pratica_duracao}h</span></span>
                        </div>
                      </td>

                      {Array.from(turmasMap.entries()).map(([turmaId, turma]) => {
                        const discInfo = turma.disciplinas.get(disciplina.id);
                        const teoricaCompleta = discInfo?.teorica === disciplina.aula_teorica_duracao;
                        const praticaCompleta = discInfo?.pratica === disciplina.aula_pratica_duracao;

                        return (
                          <td
                            key={turmaId}
                            className="px-4 py-3 text-center border-l border-gray-200"
                          >
                            {discInfo && (
                              <div className="flex gap-2 justify-center">
                                <div className={`px-2 py-1 rounded text-sm font-medium ${teoricaCompleta ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}>
                                  <span className="text-xs">T:</span> {discInfo.teorica ? `${discInfo.teorica.toFixed(1)}h` : "-"}
                                </div>
                                <div className={`px-2 py-1 rounded text-sm font-medium ${praticaCompleta ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}>
                                  <span className="text-xs">P:</span> {discInfo.pratica ? `${discInfo.pratica.toFixed(1)}h` : "-"}
                                </div>
                              </div>
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
          disciplina_cursos={selectedDisciplina.cursos}
          ano_lectivo_id={horario.ano_lectivo_id}
          semestre={horario.semestre}
        />
      )}
    </>
  );
}