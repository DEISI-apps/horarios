import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

export function useTurmas(horario_id: number) {
  const { data, error, isLoading } = useSWR(
    `https://dsdeisi.pythonanywhere.com/api/horarios/horarios/${horario_id}`,
    fetcher
  );

  return {
    turmas: data?.turmas || [],
    isLoadingTurmas: isLoading,
    errorTurmas: error,
  };
}
