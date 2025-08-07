"use client";

import useSWR from "swr";
import DisciplinaCard from "../DisciplinaCard/DisciplinaCard";

interface Docente {
  nome: string;
  horas_teoricas: number;
  horas_praticas: number;
}

interface Disciplina {
  id: number;
  nome: string;
  semestre: number;
  horas_teoricas: number;
  horas_praticas: number;
  docentes: Docente[];
  cor: string;
}

// Função para gerar cor
const gerarCorDisciplina = (id: number) => {
  const hue = (id * 137) % 360;
  return `hsl(${hue}, 80%, 50%)`;
};

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Erro ao buscar dados");
    return res.json();
  });

export default function DisciplinasSection({ horario_id }: { horario_id: number }) {

  const {
    data: disciplinasRaw,
    isLoading: loadingDisciplinas,
    error: erroDisciplinas,
  } = useSWR<Disciplina[]>(
    horario_id
      ? `https://dsdeisi.pythonanywhere.com/api/horarios/horarios/${horario_id}/disciplinas`
      : null,
    fetcher
  );

  const disciplinas = (disciplinasRaw ?? []).map((disciplina) => ({
    ...disciplina,
    cor: gerarCorDisciplina(disciplina.id),
    docentes: [...disciplina.docentes].sort((a, b) => {
      if (a.horas_teoricas > 0 && b.horas_teoricas === 0) return -1;
      if (a.horas_teoricas === 0 && b.horas_teoricas > 0) return 1;
      return a.nome.localeCompare(b.nome, "pt", { sensitivity: "base" });
    }),
  }));

  return (
    <section>
      <h3 className="mt-4 mb-2 text-lg font-semibold">Disciplinas</h3>

      {loadingDisciplinas && (
        <p className="text-gray-500">A carregar disciplinas...</p>
      )}
      {erroDisciplinas && (
        <p className="text-red-500">Erro ao carregar disciplinas.</p>
      )}

      {!loadingDisciplinas && disciplinas.length > 0 && (
        <div className="space-y-4">
          {disciplinas.map((disciplina) => (
            <DisciplinaCard key={disciplina.id} disciplina={disciplina} />
          ))}
        </div>
      )}

      {!loadingDisciplinas && disciplinas.length === 0 && (
        <p className="text-gray-500">Nenhuma disciplina encontrada.</p>
      )}
    </section>
  );
}
