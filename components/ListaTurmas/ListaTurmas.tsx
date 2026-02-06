import { useEffect, useState } from 'react';
import { Horario, Turma } from '@/types/interfaces';
import { useAulas } from '@/hooks/useAulas';
import CalendarioSemanalTurma from '@/components/CalendarioSemanalTurma/CalendarioSemanalTurma';

import styles from './CalendarioSemanal.module.css';

interface ListaTurmasProps {
  horario: Horario;
  editar: boolean;
  onTurmaChange?: (turmaId: number) => void;
}

export default function ListaTurmas({ horario, editar, onTurmaChange }: ListaTurmasProps) {

  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null);
  const [turmas, setTurmas] = useState<Turma[]>([])

  const { aulas } = useAulas(horario.id);
  

  useEffect (() => {
    setTurmas(horario.turmas)
    setSelectedTurma(horario.turmas[0])
    if (horario.turmas[0] && onTurmaChange) {
      onTurmaChange(horario.turmas[0].id);
    }
  }, [horario, onTurmaChange])

  const handleTurmaClick = (turma: Turma) => {
    setSelectedTurma(turma);
    if (onTurmaChange) {
      onTurmaChange(turma.id);
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
          />

    </div>
  );
}
