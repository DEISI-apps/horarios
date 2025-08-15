"use client";

import { useAulas } from "@/hooks/useAulas";
import { useDisciplinas } from "@/hooks/useDisciplinas";
import { useTurmas } from "@/hooks/useTurmas";
import { AulaAPI, TurmaAPI } from "@/types/interfaces";
import { useEffect, useState } from "react";

const gerarCorDisciplina = (id: number) => {
  const hue = (id * 137) % 360;
  return `hsl(${hue}, 80%, 80%)`; // cor mais clara para background
};

type DisciplinaInfo = {
  nome: string;
  teorica: number;
  pratica: number;
};

type DisciplinaAPI = {
  id: number;
  nome: string;
  horas_teoricas: number;
  horas_praticas: number;
};

export default function TurmasSection({ horario_id }: { horario_id: number }) {

  const [turmasMap, setTurmasMap] = useState< Map<number, { nome: string; disciplinas: Map<number, DisciplinaInfo> }> >(new Map());

  const { disciplinas: disciplinasData, isLoadingDisciplinas: loadingDisciplinas, errorDisciplinas: erroDisciplinas } = useDisciplinas(horario_id);
  const { turmas: turmasData, isLoadingTurmas } = useTurmas(horario_id);
  const { aulas: aulasData, isLoadingAulas: loadingAulas, errorAulas: erroAulas } = useAulas(horario_id);

  useEffect(() => {
    if (!disciplinasData || !turmasData || !aulasData) return;

    const novoTurmasMap = new Map<number, { nome: string; disciplinas: Map<number, DisciplinaInfo> }>();

    turmasData.forEach(({ id: turmaId, nome: turmaNome }) => {
      const disciplinasMap = new Map<number, DisciplinaInfo>();
      disciplinasData.forEach(({ id: disciplinaId, nome: disciplinaNome }) => {
        disciplinasMap.set(disciplinaId, { nome: disciplinaNome, teorica: 0, pratica: 0 });
      });
      novoTurmasMap.set(turmaId, { nome: turmaNome, disciplinas: disciplinasMap });
    });

    // Atualiza as horas das aulas agendadas
    aulasData.forEach(({ turma_id, disciplina_id, tipo, duracao }) => {
      const discInfo = novoTurmasMap.get(turma_id)?.disciplinas.get(disciplina_id);
      if (!discInfo) return;

      if (tipo.toLowerCase().startsWith("t")) discInfo.teorica += (duracao ?? 0) / 60;
      else if (tipo.toLowerCase().startsWith("p")) discInfo.pratica += (duracao ?? 0) / 60;
    });

    // Só atualiza se mudou
    setTurmasMap(prev => {
      // comparação simples por referência, pode melhorar se quiser comparar conteúdo
      if (prev === novoTurmasMap) return prev;
      return novoTurmasMap;
    });

  }, [disciplinasData, turmasData, aulasData]);

  return (
    <section>
      <h3 className="mt-4 mb-2 text-lg font-semibold">Aulas Marcadas no Calendário</h3>

      {(loadingDisciplinas || loadingAulas) && <p className="text-gray-500">A carregar dados...</p>}
      {(erroDisciplinas || erroAulas) && <p className="text-red-500">Erro ao carregar dados.</p>}

      {!loadingDisciplinas && disciplinasData && turmasMap.size > 0 && (
        <div className="overflow-auto">
          <table className="w-full border-separate border-spacing-y-2">
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
              {Array.from(disciplinasData).map((disc: DisciplinaAPI) => (
                <tr 
                  key={disc.id}
                  className="rounded-lg"
                  style={{ backgroundColor: gerarCorDisciplina(disc.id) }}
                >
                  {/* Aplica cor de fundo apenas ao nome da disciplina */}
                  <td className="border px-2 py-1 font-semibold rounded-l-lg">
                    {disc.nome} (T: xh, P: xh)
                  </td>

                  {Array.from(turmasMap.entries()).map(([turmaId, turma], index, array) => {
                    const discInfo = turma.disciplinas.get(disc.id);
                    return (
                        <td
                        key={turmaId}
                        className={`border px-2 py-1 text-left align-top bg-white ${index === array.length - 1 ? 'rounded-r-lg' : ''}`}
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
