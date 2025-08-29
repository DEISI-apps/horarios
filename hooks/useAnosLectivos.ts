import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { AnoLectivo } from '@/types/interfaces';

export function useAnosLectivos() {
  const { data, error, isLoading } = useSWR<AnoLectivo[]>(
    `https://dsdeisi.pythonanywhere.com/api/horarios/anos-lectivos`,
    fetcher
  );

  return {
    anosLectivos: data,
    isLoadingAnosLectivos: isLoading,
    errorAnosLectivos: error,
  };
}
