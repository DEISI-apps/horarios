import { useEffect, useRef, useState } from 'react';
import { AulaDocente } from '@/types/interfaces';
import { calculateSlotPosition } from '@/lib/calendario';
import { MINUTE_HEIGHT } from '@/lib/constants';
import { gerarCorDisciplina, abreviarNomeDisciplina } from '@/lib/utils';
import styles from './CalendarioSemanalDisciplina.module.css';

interface TimeSlotProps {
  slot: AulaDocente;
}

function formataTurmas(turmas: Map<string, string[]>): string {
  return Array.from(turmas.entries())
    .map(([curso, turmasList]) => {
      turmasList.sort((a, b) => a.localeCompare(b));
      return `${curso} ${turmasList.join('')}`;
    })
    .join(', ');
}

export default function TimeSlotDisciplina({ slot }: TimeSlotProps) {
  const top = calculateSlotPosition(slot.hora_inicio) + 2;
  const height = slot.duracao * MINUTE_HEIGHT - 4;
  const baseColor = gerarCorDisciplina(slot.disciplina_id);

  const [width, setWidth] = useState<number>(0);
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
      className={styles.slot}
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
      <div className={styles.slotTitle}>
        {abreviarNomeDisciplina(slot.disciplina_nome, width)}
      </div>
      <div className={`${styles.slotDetails}`}>
        <span style={{ fontWeight: 'normal' }}>
          {slot.tipo === 'T' ? 'Teórica' : 'Prática'}
        </span>, {formataTurmas(slot.turmas)} {slot.sala_nome !== 'outra' ? '(' + slot.sala_nome + ')' : ''}
      </div>
      <div className={`${styles.slotDocente}`} style={{ fontWeight: 'bold' }}>
        {slot.docente_nome}
      </div>
    </div>
  );
}
