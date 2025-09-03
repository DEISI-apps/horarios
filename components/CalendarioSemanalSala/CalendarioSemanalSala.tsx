'use client';

import { useAulasAnoSemestre } from '@/hooks/useAulasAnoSemestre';
import React, { useMemo } from 'react';
import styles from './CalendarioSemanalSala.module.css';
import TimeMarkers from './TimeMarkers';
import { CALENDAR_HEIGHT } from '@/lib/constants';
import CalendarioGridSala from './CalendarioGridSala';


interface Props {
  sala_id: number;
  ano_lectivo_id: number;
  semestre: number;
}

export default function CalendarioSemanalSala({ 
  sala_id, 
  ano_lectivo_id, 
  semestre 
}: Props) {

  // 
  // A. Hook de obtenção de dados
  const { aulas, isLoadingAulas } = useAulasAnoSemestre(ano_lectivo_id, semestre);

  //
  // B. Valores computados com useMemo

  const aulasSala = useMemo(() => {
    if (!aulas?.length || !sala_id) return;

    return aulas
      .filter(aula => aula.sala_id === sala_id)  // filtra aulas da sala
      
  }, [aulas, sala_id]);

  //
  // F. Lógica de renderização

  // Fallbacks primeiro...
  if (isLoadingAulas) return <p className="text-gray-500">A carregar aulas...</p>;
  if (!aulasSala) return <p className="text-gray-500">A carregar aulas...</p>;
  if (aulasSala.length === 0) return <p className="text-gray-500">Sem aulas para esta disciplina.</p>;

  // render principal
  return (
    <section>
      <div className={styles.container} style={{ position: 'relative' }}>
        <div
          className={`${styles.timeSlots} ${styles.timeMarkersFixed}`}
          style={{ height: `80px`, position: 'absolute', top: 0, left: -1, zIndex: 1, borderRight: '1px solid #dddada' }}
        >
        </div>
        <div
          className={`${styles.timeSlots} ${styles.timeMarkersFixed}`}
          style={{ height: `${CALENDAR_HEIGHT}px`, position: 'absolute', top: '40px', left: -1, zIndex: 1, borderRight: '1px solid #dddada' }}
        >
          <TimeMarkers />
        </div>
        <div className={styles.calendarWrapper}>
          <CalendarioGridSala
            aulas={aulasSala}
            isLoadingAulas={isLoadingAulas}
          />
        </div>

      </div>
    </section>
  );
}

