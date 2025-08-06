"use client";

import { useState } from "react";
import useSWR from "swr";

import SelectHorario from "@/components/SelectHorario/SelectHorario";
import DisciplinaCard from "@/components/DisciplinaCard/DisciplinaCard";
import AulaCard from "@/components/AulaCard/AulaCard";
import CalendarioSemanal from "@/components/CalendarioSemanal/CalendarioSemanal";

interface Docente {
  nome: string;
  horas_teoricas: number;
  horas_praticas: number;
};

interface Disciplina {
  id: number;
  nome: string;
  semestre: number;
  horas_teoricas: number;
  horas_praticas: number;
  docentes: Docente[];
  cor: string;
};

interface Aula {
  id: number;
  disciplina_id: number;
  docente_id: number;
  sala_id: number;
  tipo: string; // "T" ou "P"
  sala: string;
  turma: number;
  dia_semana: number;
  hora_inicio: string;
  duracao: number;
  cor: string;
  disciplina: string;
  docente: string;
};

interface Option {
  id: number;
  label: string;
  raw: {
    id: number;
    curso: {
      nome: string;
      sigla: string;
    };
    ano: number;
    semestre: number;
    num_turmas: number;
    ano_lectivo: { ano_lectivo: string };
  };
}

//
// Função fetcher para SWR
const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error("Erro ao buscar dados");
  return res.json();
});

//
// Gerar cor simples para cada disciplina
const gerarCorDisciplina = (id: number) => {
  const hue = (id * 137) % 360; // 137 é um número primo para dispersar cores
  return `hsl(${hue}, 80%, 50%)`;
};

export default function Page() {

  //
  // A. Gestão de estados
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const horarioId = selectedOption?.id ?? null;

  //
  // B. Requisições (Fetch) SWR para obter dados
  const {
    data: disciplinasRaw,
    isLoading: loadingDisciplinas,
    error: erroDisciplinas,
  } = useSWR<Disciplina[]>(
    horarioId
      ? `https://dsdeisi.pythonanywhere.com/api/horarios/horarios/${horarioId}/disciplinas`
      : null,
    fetcher
  );

  const {
    data: aulas,
    isLoading: loadingAulas,
    error: erroAulas,
  } = useSWR<Aula[]>(
    horarioId
      ? `https://dsdeisi.pythonanywhere.com/api/horarios/horarios/${horarioId}/aulas`
      : null,
    fetcher
  );


  //
  // C. Processamento dos dados recebidos
  const disciplinas = (disciplinasRaw ?? []).map((disciplina) => ({
    ...disciplina,
    cor: gerarCorDisciplina(disciplina.id),
    docentes: [...disciplina.docentes].sort((a, b) => {
      if (a.horas_teoricas > 0 && b.horas_teoricas === 0) return -1;
      if (a.horas_teoricas === 0 && b.horas_teoricas > 0) return 1;
      return a.nome.localeCompare(b.nome, "pt", { sensitivity: "base" });
    }),
  }));


  //
  // D. Renderização do componente
  return (
    <div className="p-4">
      <p className="pt-4 pb-4">Selecione um horário e marque as aulas no calendário, de acordo com as necessidades listadas em baixo.</p>
      <h2 className="text-xl mb-2 flex row gap-3 items-center">
        {/* <div>Horário:</div> */}
        <SelectHorario
          endpoint="https://dsdeisi.pythonanywhere.com/api/horarios/horarios"
          onSelect={(option) => setSelectedOption(option)}
        />
      </h2>
      {/* {selectedOption && (
        <>
          <p className="mt-4">
            <strong>{selectedOption.label}</strong>
          </p>
          <p className="text-gray-400">
            <strong>{selectedOption.raw.num_turmas} turmas</strong>
          </p>
        </>
      )} */}

      {selectedOption && (
        <>
          <CalendarioSemanal horario_id={Number(selectedOption.id)} />
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

            {!loadingDisciplinas &&
              selectedOption &&
              disciplinas.length === 0 && (
                <p className="text-gray-500">Nenhuma disciplina encontrada.</p>
            )}
          </section>
          <section>
            <h3 className="mt-8 mb-2 text-lg font-semibold">Aulas</h3>

            {loadingAulas && <p className="text-gray-500">A carregar aulas...</p>}
            {erroAulas && (
              <p className="text-red-500">Erro ao carregar aulas.</p>
            )}

            {!loadingAulas && aulas && aulas.length > 0 && (
              <div className="space-y-4">
                {aulas.map((aula) => (
                  <AulaCard
                    key={aula.id}
                    disciplina={aula.disciplina}
                    tipo={aula.tipo}
                    docente={aula.docente}
                    sala={aula.sala}
                    dia_semana={aula.dia_semana}
                    hora_inicio={aula.hora_inicio}
                    duracao={aula.duracao} />
                ))}
              </div>
            )}

            {!loadingAulas &&
              selectedOption &&
              aulas &&
              aulas.length === 0 && (
                <p className="text-gray-500">Nenhuma aula encontrada.</p>
              )}
          </section>
        </>
      )}
    </div>
  );
}
