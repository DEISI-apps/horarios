import { AulaIn } from '@/types/interfaces';


// Funções CRUD para aulas
export const saveAula = async (aulaData: AulaIn, aulaId?: number | null): Promise<void> => {
  
  const method = aulaId ? 'PUT' : 'POST';
  const url = aulaId
    ? `https://dsdeisi.pythonanywhere.com/api/horarios/aulas/${aulaId}`
    : 'https://dsdeisi.pythonanywhere.com/api/horarios/aulas';

  const response = await fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(aulaData),
    credentials: 'include'
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new Error(errorData.message || `Erro ao gravar aula: ${response.status}`);
  }
};

export const deleteAula = async (aulaId: number): Promise<void> => {
  const response = await fetch(`https://dsdeisi.pythonanywhere.com/api/horarios/aulas/${aulaId}`, {
    method: 'DELETE',
    credentials: 'include'
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new Error(errorData.message || `Erro ao excluir aula: ${response.status}`);
  }
};

// lib/api/aulas.ts
import { Aula, AulaAPI } from '@/types/interfaces';
import { convertAulaToSlot } from '@/lib/aulas';

const API_BASE =
  'https://dsdeisi.pythonanywhere.com/api/horarios/aulas';

export async function fetchAulasAnoSemestre(
  ano_lectivo_id: number,
  semestre: number
): Promise<Aula[]> {
  const res = await fetch(
    `${API_BASE}/${ano_lectivo_id}/${semestre}`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    throw new Error('Erro ao obter aulas');
  }

  const data: AulaAPI[] = await res.json();
  return data.map(convertAulaToSlot);
}
