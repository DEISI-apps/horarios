import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { Disciplina } from '@/types/interfaces';

export function useDisciplinasAnoSemestre(ano_lectivo_id: number | null, semestre: number | null) {
  const shouldFetch = !!ano_lectivo_id && !!semestre;

  const { data, error, isLoading } = useSWR<Disciplina[]>(
    shouldFetch
      ? `https://dsdeisi.pythonanywhere.com/api/horarios/disciplinas/${ano_lectivo_id}/${semestre}`
      : null,
    fetcher
  );

  return {
    disciplinas: data,
    isLoadingDisciplinas: isLoading,
    errorDisciplinas: error,
  };
}
