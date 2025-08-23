import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { Sala } from '@/types/interfaces';

export function useSalas() {
  const { data, error, isLoading } = useSWR<Sala[]>(
    `https://dsdeisi.pythonanywhere.com/api/horarios/salas`,
    fetcher
  );

  return {
    salas: data,
    isLoadingSalas: isLoading,
    errorSalas: error,
  };
}
