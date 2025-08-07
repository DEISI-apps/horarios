import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

export function useSalas() {
  const { data, error, isLoading } = useSWR(
    `https://dsdeisi.pythonanywhere.com/api/horarios/salas`,
    fetcher
  );

  return {
    salas: data || [],
    isLoadingSalas: isLoading,
    errorSalas: error,
  };
}
