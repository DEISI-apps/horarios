import { Horario } from '@/types/interfaces';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useHorarios() {
  const { 
    data: horarios, 
    error, 
    isLoading, 
    mutate 
  } = useSWR<Horario[]>(
    'https://dsdeisi.pythonanywhere.com/api/horarios/horarios', 
    fetcher
  );

  return {
    horarios,
    isLoading,
    isError: error,
    mutate,
  };
}