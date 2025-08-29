import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { DocenteBase } from '@/types/interfaces';

export function useDocentes(ano_lectivo_id: number | null, semestre: number | null) {
  const shouldFetch = !!ano_lectivo_id && !!semestre;

  const { data, error, isLoading } = useSWR<DocenteBase[]>(
    shouldFetch
      ? `https://dsdeisi.pythonanywhere.com/api/horarios/docentes/${ano_lectivo_id}/${semestre}`
      : null,
    fetcher
  );

  return {
    docentes: data,
    isLoadingDocentes: isLoading,
    errorDocentes: error,
  };
}
