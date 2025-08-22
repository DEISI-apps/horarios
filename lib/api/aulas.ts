import { AulaIn } from '@/types/interfaces';


// Funções CRUD para aulas
export const saveAula = async (aulaData: AulaIn, aulaId?: number | null): Promise<void> => {

    console.log('saveAula called with:', { aulaData });

  
  const method = aulaId ? 'PUT' : 'POST';
  const url = aulaId
    ? `https://dsdeisi.pythonanywhere.com/api/horarios/aulas/${aulaId}`
    : 'https://dsdeisi.pythonanywhere.com/api/horarios/aulas';

  const response = await fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(aulaData)
  });

  if (!response.ok) {
    throw new Error('Erro ao gravar aula');
  }
};

export const deleteAula = async (aulaId: number): Promise<void> => {
  const response = await fetch(`https://dsdeisi.pythonanywhere.com/api/horarios/aulas/${aulaId}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error('Erro ao excluir aula');
  }
};
