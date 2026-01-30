import { useEffect, useState } from 'react';
import { Horario, Turma } from '@/types/interfaces';
import { useAulas } from '@/hooks/useAulas';
import CalendarioSemanalTurma from '@/components/CalendarioSemanalTurma/CalendarioSemanalTurma';

import styles from './CalendarioSemanal.module.css';


export default function ListaTurmas({ horario }: { horario: Horario, editar: boolean }) {

  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null);
  const [turmas, setTurmas] = useState<Turma[]>([])

  const { aulas } = useAulas(horario.id);
  

  useEffect (() => {
    setTurmas(horario.turmas)
    setSelectedTurma(horario.turmas[0])
  }, [horario])

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
                        setSelectedTurma(turma);
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
