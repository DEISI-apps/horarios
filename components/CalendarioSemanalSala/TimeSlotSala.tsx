import { Aula } from '@/types/interfaces';
import { calculateSlotPosition } from '@/lib/calendario';
import { MINUTE_HEIGHT } from '@/lib/constants';
import { gerarCorDisciplina, abreviarNomeDisciplina } from '@/lib/utils';
import styles from './CalendarioSemanalSala.module.css';
import { useEffect, useRef, useState } from 'react';

interface TimeSlotProps {
  slot: Aula;
}


export default function TimeSlotDisciplina({ slot }: TimeSlotProps) {
  const top = calculateSlotPosition(slot.hora_inicio) + 2;
  const height = slot.duracao * MINUTE_HEIGHT - 2;
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
        border: '1px solid white',
      }}
    >
      <div className={styles.slotTitle}>
        {abreviarNomeDisciplina(slot.disciplina_nome, slot.disciplina_nome_abreviado, width, slot.duracao)}
      </div>
      <div className={`${styles.slotDetails}`}>
        {slot.tipo}
        {slot.turma_nome}
        {slot.sala_nome !== 'sala?' ? ', ' + slot.sala_nome : ''}
      </div>
      <div className={`${styles.slotDocente}`} style={{ fontWeight: 'bold' }}>
        {slot.docente_nome}
      </div>
    </div>
  );
}
