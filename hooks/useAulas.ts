import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

interface Disciplina {
  id: number;
  nome: string;
  docentes: {
    id: number;
    nome: string;
    horas_teoricas: number;
    horas_praticas: number;
  }[];
}

interface AulaIn {
  horario_id: number;
  turma_id: number;
  disciplina_id: number;
  tipo: string;
  docente_id: number;
  sala_id: number;
  dia_semana: number;
  hora_inicio: string; // Formato "HH:MM"
  duracao: number;
  cor: string;
}

interface Aula extends AulaIn {
  juncao: boolean;
  id: number;
  disciplina_nome: string;
  docente_nome: string;
  sala_nome: string;
}


interface AulaAPI {
  id: number;
  horario_id: number;
  turma_id: number;
  disciplina_id: number;
  disciplina: string;
  docente_id: number;
  docente: string;
  sala_id: number;
  sala: string;
  tipo: string;
  dia_semana: number;
  hora_inicio: string;
  duracao: number;
  cor: string;
  juncao: boolean;
}


  // Converter aula da API para Aula
  const convertAulaToSlot = (aula: AulaAPI): Aula => {
      return {
      id: aula.id,
      horario_id: aula.horario_id,
      turma_id: aula.turma_id,
      disciplina_id: aula.disciplina_id,
      disciplina_nome: aula.disciplina,
      docente_id: aula.docente_id,
      docente_nome: aula.docente,
      sala_id: aula.sala_id || 7,
      sala_nome: aula.sala,
      tipo: aula.tipo,
      dia_semana: aula.dia_semana,
      hora_inicio: aula.hora_inicio,
      duracao: aula.duracao,
      cor: '',
      juncao: aula.juncao,
    };
  };

export function useAulas(horario_id: number) {
  const { data, error, isLoading, mutate } = useSWR<AulaAPI[]>(
    `https://dsdeisi.pythonanywhere.com/api/horarios/horarios/${horario_id}/aulas`,
    fetcher
  );

  
  // Transformar dados recebidos da API no formato interno
  const aulas = data ? data.map(convertAulaToSlot) : [];

  return {
    aulas,
    isLoadingAulas: isLoading,
    errorAulas: error,
    mutateAulas: mutate
  };
}
