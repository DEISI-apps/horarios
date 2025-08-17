"use client";

import { useAulas } from "@/hooks/useAulas";
import { useDisciplinas } from "@/hooks/useDisciplinas";
import { useTurmas } from "@/hooks/useTurmas";
import { useEffect, useState } from "react";

const gerarCorDisciplina = (id: number) => {
  const hue = (id * 137) % 360;
  return `hsl(${hue}, 80%, 80%)`; // cor mais clara para background
};

interface DisciplinaAPI {
  id: number;
  nome: string;
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

export default function TurmasSection({ horario_id }: { horario_id: number }) {

  //
  // A. Definição de estados
  const [turmasMap, setTurmasMap] = useState<TurmasMap>(new Map());

  //
  // B. Obtenção de dados
  const { disciplinas, isLoadingDisciplinas, errorDisciplinas } = useDisciplinas(horario_id);
  const { turmas, isLoadingTurmas } = useTurmas(horario_id);
  const { aulas, isLoadingAulas, errorAulas } = useAulas(horario_id);


  //
  // C. atualização da lista de turmas e suas aulas.
  useEffect(() => {

    if (!disciplinas || !turmas) return;

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
        if (tipo.toLowerCase().startsWith("t")) discInfo.teorica += (duracao ?? 0) / 60;
        else if (tipo.toLowerCase().startsWith("p")) discInfo.pratica += (duracao ?? 0) / 60;
      });
    }

    // Compara antes de atualizar para evitar loops
    const currentMapStr = JSON.stringify(Array.from(turmasMap.entries()));
    const newMapStr = JSON.stringify(Array.from(novoTurmasMap.entries()));
    
    if (currentMapStr !== newMapStr) {
      setTurmasMap(novoTurmasMap);
    }

  }, [disciplinas, turmas, aulas, turmasMap]);


    //
  // C. renderiza
  if (isLoadingDisciplinas) return <p className="text-gray-500">A carregar disciplinas...</p>;
  if (errorDisciplinas) return <p className="text-red-500">Erro ao carregar disciplinas.</p>;
  if (isLoadingTurmas) return <p className="text-gray-500">A carregar turmas...</p>;

  return (
    <section className="pt-8">
      <h2 className="mt-4 mb-2 text-lg font-semibold">Aulas Marcadas</h2>

      {(isLoadingDisciplinas || isLoadingAulas) && <p className="text-gray-500">A carregar dados...</p>}
      {(errorDisciplinas || errorAulas) && <p className="text-red-500">Erro ao carregar dados.</p>}

      {!isLoadingDisciplinas && disciplinas && turmasMap.size > 0 && (
        <div className="overflow-auto">
          <table className="border-separate border-spacing-y-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1 rounded-l-lg">Disciplina</th>
                {Array.from(turmasMap.entries()).map(([turmaId, turma], index, array) => (
                  <th
                    key={turmaId}
                    className={`border px-2 py-1 ${index === array.length - 1 ? 'rounded-r-lg' : ''}`}
                  >
                    Turma {turma.nome}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...disciplinas]  // Create a new array to avoid mutating the original
                .sort((a, b) => a.nome.localeCompare(b.nome, 'pt'))  // Sort by name
                .map((disc: DisciplinaAPI) => (
                <tr
                  key={disc.id}
                  className="rounded-lg text-sm"
                  style={{ backgroundColor: gerarCorDisciplina(disc.id) }}
                >
                  <td className="border px-2 py-1 rounded-l-lg">
                    <span className="font-semibold">{disc.nome}</span>
                    <br />
                    <span> (T: 1.5h, P: 2h (forçado))</span>
                  </td>

                  {Array.from(turmasMap.entries()).map(([turmaId, turma], index, array) => {
                    const discInfo = turma.disciplinas.get(disc.id);
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
  );
}