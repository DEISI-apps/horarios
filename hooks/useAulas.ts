import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { Aula, AulaAPI } from '@/types/interfaces';



  // Converter aula da API para Aula
  const convertAulaToSlot = (aula: AulaAPI): Aula => {
      return {
      id: aula.id,
      horario_id: aula.horario_id,
      turma_id: aula.turma_id,
      disciplina_id: aula.disciplina_id,
      disciplina_nome: aula.disciplina,
      disciplina_nome_abreviado: aula.disciplina_nome_abreviado,
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
      curso_sigla: aula.curso_sigla,
      turma_nome: aula.turma_nome,
      juncao_visivel: aula.juncao_visivel,
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
