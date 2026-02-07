import { useEffect, useState } from 'react';
import { Horario, Turma } from '@/types/interfaces';
import { useAulas } from '@/hooks/useAulas';
import CalendarioSemanalTurma from '@/components/CalendarioSemanalTurma/CalendarioSemanalTurma';

import styles from './CalendarioSemanal.module.css';

interface ListaTurmasProps {
  horario: Horario;
  editar?: boolean;
  initialTurma?: string;
  onTurmaChange?: (turmaId: number, turmaNome: string) => void;
}

export default function ListaTurmas({ horario, initialTurma, onTurmaChange }: ListaTurmasProps) {

  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null);
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [initialized, setInitialized] = useState(false);

  const { aulas } = useAulas(horario.id);
  

  useEffect (() => {
    setTurmas(horario.turmas)
    
    // Só define a turma inicial na primeira vez
    if (!initialized) {
      let turmaToSelect = horario.turmas[0];
      if (initialTurma) {
        const foundTurma = horario.turmas.find(t => t.nome === initialTurma);
        if (foundTurma) {
          turmaToSelect = foundTurma;
        }
      }
      
      setSelectedTurma(turmaToSelect)
      if (turmaToSelect && onTurmaChange) {
        onTurmaChange(turmaToSelect.id, turmaToSelect.nome);
      }
      setInitialized(true);
    }
  }, [horario, initialTurma, initialized, onTurmaChange])

  const handleTurmaClick = (turma: Turma) => {
    setSelectedTurma(turma);
    if (onTurmaChange) {
      onTurmaChange(turma.id, turma.nome);
    }
  };

  //
  // C. renderiza

  if (!turmas || !selectedTurma) return <p className="text-gray-500">A carregar turmas...</p>;

  return (
    <div className={styles.calendarWrapper}>
      
      
      <h2 className="text-lg font-bold mt-6">Horário da turma:</h2>
      <div className = "flex flex-wrap">
                {horario.turmas.map((turma: Turma, i) => (
                 
                    
                  
                    <button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTurmaClick(turma);
                      }}
                      className= {  `focus:outline-none hover:underlined m-2 p-2 rounded ${ turma === selectedTurma ? "bg-blue-500 text-white font-bold" : "bg-gray-200" }`}
                    >
                     {turma.nome}
                    </button>
                  
                ))}
              </div >
        <CalendarioSemanalTurma
            aulas={aulas}
            turma_id={selectedTurma.id}
            ano_lectivo_id={horario.ano_lectivo_id}
            semestre={horario.semestre}
          />

    </div>
  );
}
