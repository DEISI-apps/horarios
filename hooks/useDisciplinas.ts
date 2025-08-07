import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

export function useDisciplinas(horario_id: number) {
  const { data, error, isLoading } = useSWR(
    `https://dsdeisi.pythonanywhere.com/api/horarios/horarios/${horario_id}/disciplinas`,
    fetcher
  );

  return {
    disciplinas: data || [],
    isLoadingDisciplinas: isLoading,
    errorDisciplinas: error,
  };
}
