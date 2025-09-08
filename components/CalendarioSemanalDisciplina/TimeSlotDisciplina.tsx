import { useEffect, useRef, useState } from 'react';
import { AulaDisciplina } from '@/types/interfaces';
import { calculateSlotPosition } from '@/lib/calendario';
import { MINUTE_HEIGHT } from '@/lib/constants';
import { gerarCorDisciplina } from '@/lib/utils';
import styles from './CalendarioSemanalDisciplina.module.css';

interface TimeSlotProps {
  slot: AulaDisciplina;
}

function formataTurmas(turmas: Map<string, string[]>): string {
  return Array.from(turmas.entries())
    .map(([, turmasList]) => {
      return turmasList
        .sort((a, b) => a.localeCompare(b))
        .map(turma => 'P' + turma)
    })
    .join(', ');
}

export default function TimeSlotDisciplina({ slot }: TimeSlotProps) {
  const top = calculateSlotPosition(slot.hora_inicio) + 2;
  const height = slot.duracao * MINUTE_HEIGHT - 4;
  const baseColor = gerarCorDisciplina(slot.disciplina_id);

  const [, setWidth] = useState<number>(0);
  const slotRef = useRef<HTMLDivElement | null>(null);

  // observar largura do slot dinamicamente
  useEffect(() => {
    if (!slotRef.current || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });

    observer.observe(slotRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={slotRef}
      key={`slot-${slot.id}`}
      className={`${styles.slot} ${slot.tipo === 'T' ? styles.theoretical : styles.practical}`}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        backgroundColor: baseColor,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        textAlign: 'left',
      }}
    >
      {slot.docentes.map((docente) => (
        <div key={`docente-${docente.id}`} className="leading-tight"> 
          <div className={`${styles.slotDocente}`} style={{ fontWeight: 'bold' }}>
            {docente.docente_nome}
          </div>
          <div className={`${styles.slotDetails}  ${styles.slotDisciplinaDocenteDetails}`}>
            <span style={{ fontWeight: 'normal' }}>
              {docente.tipo === 'T' ? 'Teórica' : formataTurmas(docente.turmas)}
            </span> {docente.sala_nome !== 'outra' ? '(' + docente.sala_nome + ')' : ''}
          </div>
        </div>
      ))}

    </div>
  );

}
