import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { Horario } from '@/types/interfaces';

export function useTurmas(horario_id: number) {
  const { data, error, isLoading } = useSWR<Horario>(
    `https://dsdeisi.pythonanywhere.com/api/horarios/horarios/${horario_id}`,
    fetcher
  );

  return {
    turmas: data?.turmas,
    isLoadingTurmas: isLoading,
    errorTurmas: error,
  };
}
