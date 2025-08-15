// TurmasSection disciplinas da lista de aulas

"use client";

import { AulaAPI } from "@/types/interfaces";
import { useEffect, useState } from "react";
import useSWR from "swr";

// Função para gerar cor (pode ser usada para estilizar células, se quiser)
const gerarCorDisciplina = (id: number) => {
  const hue = (id * 137) % 360;
  return `hsl(${hue}, 80%, 50%)`;
};

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Erro ao buscar dados");
    return res.json();
  });

type DisciplinaInfo = {
  nome: string;
  teorica: number;
  pratica: number;
};

export default function TurmasSection({ horario_id }: { horario_id: number }) {
  //
  // Estado para turmas
  const [turmas, setTurmas] = useState<
    [number, { disciplinas: Map<string, DisciplinaInfo> }][]
  >([]);

  //
  // Obter dados
  const {
    data: aulas,
    isLoading: loadingAulas,
    error: erroAulas,
  } = useSWR<AulaAPI[]>(
    horario_id
      ? `https://dsdeisi.pythonanywhere.com/api/horarios/horarios/${horario_id}/aulas`
      : null,
    fetcher
  );

  //
  // Processar dados: agrupar por turma e disciplina
  useEffect(() => {
    if (aulas) {
      const turmasMap = new Map<number, { disciplinas: Map<string, DisciplinaInfo> }>();

      aulas.forEach((aula) => {
        const { turma_id, disciplina, tipo, duracao } = aula;

        if (!turmasMap.has(turma_id)) {
          turmasMap.set(turma_id, { disciplinas: new Map() });
        }

        const turmaData = turmasMap.get(turma_id)!;

        if (!turmaData.disciplinas.has(disciplina)) {
          turmaData.disciplinas.set(disciplina, {
            nome: disciplina,
            teorica: 0,
            pratica: 0,
          });
        }

        const discInfo = turmaData.disciplinas.get(disciplina)!;

        if (tipo === "T") {
          discInfo.teorica += duracao/60 || 0;
        } else if (tipo === "P") {
          discInfo.pratica += duracao/60 || 0;
        }
      });

      setTurmas(Array.from(turmasMap.entries()));
    }
  }, [aulas]);

  return (
    <section>
      <h3 className="mt-4 mb-2 text-lg font-semibold">Aulas</h3>

      {loadingAulas && <p className="text-gray-500">A carregar Aulas...</p>}
      {erroAulas && <p className="text-red-500">Erro ao carregar Aulas.</p>}

      {!loadingAulas && aulas && aulas.length > 0 && (
        <div className="space-y-4">
          {turmas.length > 0 ? (
            turmas.map(([turmaId, { disciplinas }]) => (
              <div key={turmaId} className="border p-4 rounded">
                <h4 className="font-semibold mb-2">Turma {turmaId}</h4>
                <table className="min-w-full border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-2 py-1">Disciplina</th>
                      <th className="border px-2 py-1">Teórica (h)</th>
                      <th className="border px-2 py-1">Prática (h)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from(disciplinas.values()).map((disc) => (
                      <tr key={disc.nome}>
                        <td
                          className="border px-2 py-1"
                          style={{ backgroundColor: gerarCorDisciplina(turmaId) }}
                        >
                          {disc.nome}
                        </td>
                        <td className="border px-2 py-1 text-center">{disc.teorica}</td>
                        <td className="border px-2 py-1 text-center">{disc.pratica}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Nenhuma turma encontrada.</p>
          )}
        </div>
      )}

      {!loadingAulas && aulas && aulas.length === 0 && (
        <p className="text-gray-500">Nenhuma aula encontrada.</p>
      )}
    </section>
  );
}
