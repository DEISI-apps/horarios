'use client'; // necessário para usar hooks no Next.js

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useState } from 'react';

type Tarefa = {
  id: number;
  nome: string;
};

// Fetcher genérico para GET
const fetcher = (url: string) => fetch(url).then(res => res.json());

// Fetcher para mutações (POST, PUT, DELETE)
type MutacaoArgs = { method: 'POST' | 'PUT' | 'DELETE'; body: Tarefa };

const fetcherMutacao = async (url: string, { arg }: { arg: MutacaoArgs }) => {
  const { method, body } = arg;
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error('Erro na requisição');
  return method === 'DELETE' ? body.id : (res.json() as Promise<Tarefa>);
};

export default function ListaTarefas() {
  const { data: tarefas = [], mutate } = useSWR<Tarefa[]>('/api/tarefas', fetcher);
  const { trigger: mutacao } = useSWRMutation('/api/tarefas', fetcherMutacao);

  const [novaTarefaNome, setNovaTarefaNome] = useState('');

  const executarCRUD = async (args: MutacaoArgs) => {
    const { method, body } = args;

    // Optimistic update
    if (method === 'POST') mutate([...tarefas, body], false);
    if (method === 'PUT') mutate(tarefas.map(t => (t.id === body.id ? body : t)), false);
    if (method === 'DELETE') mutate(tarefas.filter(t => t.id !== body.id), false);

    await mutacao(args);
    mutate(); // Revalida a lista
  };

  const handleAdicionar = () => {
    if (!novaTarefaNome.trim()) return;
    executarCRUD({ method: 'POST', body: { id: Date.now(), nome: novaTarefaNome } });
    setNovaTarefaNome('');
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 text-center">Lista de Tarefas</h2>
      
      <div className="flex mb-4 gap-2">
        <input
          type="text"
          value={novaTarefaNome}
          onChange={e => setNovaTarefaNome(e.target.value)}
          placeholder="Nome da nova tarefa"
          className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAdicionar}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Adicionar
        </button>
      </div>

      <ul className="space-y-2">
        {tarefas.map(t => (
          <li
            key={t.id}
            className="flex justify-between items-center p-2 bg-gray-100 rounded"
          >
            <span>{t.nome}</span>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  executarCRUD({ method: 'PUT', body: { ...t, nome: t.nome + ' ✔' } })
                }
                className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                ✔
              </button>
              <button
                onClick={() =>
                  executarCRUD({ method: 'DELETE', body: { id: t.id, nome: t.nome } })
                }
                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                ❌
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
