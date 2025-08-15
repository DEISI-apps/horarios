import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { HorarioAPI } from '@/types/interfaces';

export function useTurmas(horario_id: number) {
  const { data, error, isLoading } = useSWR<HorarioAPI>(
    `https://dsdeisi.pythonanywhere.com/api/horarios/horarios/${horario_id}`,
    fetcher
  );

  return {
    turmas: data?.turmas || [],
    isLoadingTurmas: isLoading,
    errorTurmas: error,
  };
}
