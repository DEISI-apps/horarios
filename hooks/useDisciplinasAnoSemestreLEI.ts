import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { Disciplina } from '@/types/interfaces';

export function useDisciplinasAnoSemestreLEI(ano_lectivo_id: number | null, semestre: number | null) {
  const shouldFetch = !!ano_lectivo_id && !!semestre;

  const { data, error, isLoading } = useSWR<Disciplina[]>(
    shouldFetch
      ? `https://dsdeisi.pythonanywhere.com/api/horarios/disciplinas/${ano_lectivo_id}/${semestre}`
      : null,
    fetcher
  );

  return {
    disciplinas: data?.filter(d => d.cursos.split(', ').includes('LEI')),
    isLoadingDisciplinas: isLoading,
    errorDisciplinas: error,
  };
}
