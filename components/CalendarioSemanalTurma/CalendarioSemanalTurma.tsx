'use client';

import { useMemo } from 'react';
import { Aula } from "@/types/interfaces";
import CalendarGridTurma from './CalendarioGridTurma';
import styles from './CalendarioSemanal.module.css';
import TimeMarkers from './TimeMarkers';
import { CALENDAR_HEIGHT } from '@/lib/constants';

export default function CalendarioSemanalTurma({ turma_id, aulas }: { turma_id: number, aulas: Aula[] }) {

  //
  // C. Computação de dados

  // Para uma turma selecionada, computação de aulas com info de horas lecionadas
  const aulasTurma = useMemo(() => {
    if (!aulas) return [];

    return aulas.filter(aula => aula.turma_id === turma_id);
  }, [ aulas, turma_id]);

  if (!turma_id) return [];

//
// F. Lógica de renderização

// render principal       
return (
  <section className="pt-3">
    <div className={styles.container} style={{ position: 'relative' }}>
      <div
        className={`${styles.timeSlots} ${styles.timeMarkersFixed}`}
        style={{ height: `40px`, position: 'absolute', top: 0, left: -1, zIndex: 1, borderRight: '1px solid #dddada' }}
      >
      </div>
      <div
        className={`${styles.timeSlots} ${styles.timeMarkersFixed}`}
        style={{ height: `${CALENDAR_HEIGHT}px`, position: 'absolute', top: '43px', left: -1, zIndex: 1, borderRight: '1px solid #dddada' }}
      >
        <TimeMarkers />
      </div>
      <div className={styles.calendarWrapper}>
        <CalendarGridTurma
          aulas={aulasTurma}
          turma_id={turma_id}
        />
      </div>
    </div>
  </section>
);
}
