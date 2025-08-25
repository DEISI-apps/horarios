import { Aula } from '@/types/interfaces';
import { calculateSlotPosition } from '@/lib/calendario';
import { MINUTE_HEIGHT } from '@/lib/constants';
import { gerarCorDisciplina, abreviarNomeDisciplina } from '@/lib/utils';
import styles from './CalendarioSemanalSala.module.css';

interface TimeSlotProps {
  slot: Aula;
}


export default function TimeSlotDisciplina({ slot }: TimeSlotProps) {
  const top = calculateSlotPosition(slot.hora_inicio);
  const height = slot.duracao * MINUTE_HEIGHT - 5;
  const baseColor = gerarCorDisciplina(slot.disciplina_id);


  return (
    <div
      key={`slot-${slot.id}`}
      className={styles.slot}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        backgroundColor: baseColor,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <div className={styles.slotTitle}>
        {abreviarNomeDisciplina(slot.disciplina_nome)}
      </div>
      <div className={`${styles.slotDetails}`}>
        {slot.tipo === 'T' ? 'Teórica' : 'Prática'}{slot.sala_nome !== 'sala?' ? ', ' + slot.sala_nome : ''}
      </div>
      <div className={`${styles.slotDocente}`}>
         {slot.docente_nome}
      </div>
    </div>
  );
}
