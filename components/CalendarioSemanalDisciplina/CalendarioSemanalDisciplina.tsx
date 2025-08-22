'use client';

import { useAulasAnoSemestre } from '@/hooks/useAulasAnoSemestre';
import React, { useMemo } from 'react';
import styles from './CalendarioSemanalDisciplina.module.css';
import TimeMarkers from './TimeMarkers';
import { CALENDAR_HEIGHT } from '@/lib/constants';
import CalendarioGridDisciplina from './CalendarioGridDisciplina';
import { AulaDocente } from '@/types/interfaces';

interface Props {
  disciplina_id: number;
  ano_lectivo_id: number;
  semestre: number;
}

export default function CalendarioSemanalDisciplina({ 
  disciplina_id, 
  ano_lectivo_id, 
  semestre 
}: Props) {

  // 
  // A. Hook de obtenção de dados
  const { aulas, isLoadingAulas } = useAulasAnoSemestre(ano_lectivo_id, semestre);

  //
  // B. Valores computados com useMemo

  const aulasDisciplina = useMemo(() => {
    if (!aulas?.length || !disciplina_id) return;

    const aulasAgrupadas =  aulas
      .filter(aula => aula.disciplina_id === disciplina_id)  // filtra aulas da disciplina
      .reduce((acc, aula) => {
        const timeKey = `${aula.dia_semana}-${aula.hora_inicio}`;  // agrega aulas junção

      if (!acc.has(timeKey)) {
        // Cria nova aula agregada com mapa inicial de turmas 
        acc.set(timeKey, {
          ...aula,
          turmas: new Map([[aula.curso_sigla, [aula.turma_nome]]])
        });
      } else {
        // Adiciona turma ao mapa de turmas existente
        const aulaAgregada = acc.get(timeKey)!;
        const turmasAtuais = aulaAgregada.turmas.get(aula.curso_sigla) || [];
        aulaAgregada.turmas.set(aula.curso_sigla, [...turmasAtuais, aula.turma_nome]);
      }

      return acc;
    }, new Map<string, AulaDocente>());

    // Converte o mapa de aulas agregadas numa lista
    return Array.from(aulasAgrupadas.values());

  }, [aulas, disciplina_id]);

  //
  // F. Lógica de renderização

  // Fallbacks primeiro...
  if (isLoadingAulas) return <p className="text-gray-500">A carregar aulas...</p>;
  if (!aulasDisciplina) return <p className="text-gray-500">A carregar aulas...</p>;
  if (aulasDisciplina.length === 0) return <p className="text-gray-500">Sem aulas para esta disciplina.</p>;

  // render principal
  return (
    <section className="pt-3">
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
          <CalendarioGridDisciplina
            aulas={aulasDisciplina}
            isLoadingAulas={isLoadingAulas}
          />
        </div>

      </div>
    </section>
  );
}

