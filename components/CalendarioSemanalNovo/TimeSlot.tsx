import { Aula } from '@/types/interfaces';
import { calculateSlotPosition } from '@/lib/calendario';
import { MINUTE_HEIGHT } from '@/lib/constants';
import { gerarCorDisciplina, abreviarNomeDisciplina } from '@/lib/utils';
import styles from './CalendarioSemanal.module.css';

interface TimeSlotProps {
  slot: Aula;
  onEdit: (slot: Aula) => void;
}

export default function TimeSlot({ slot, onEdit }: TimeSlotProps) {
  const top = calculateSlotPosition(slot.hora_inicio);
  const height = slot.duracao * MINUTE_HEIGHT;

  return (
    <div
      key={`slot-${slot.id}`}
      className={styles.slot}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        backgroundColor: gerarCorDisciplina(slot.disciplina_id),
        color: 'black',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        filter: slot.tipo === 'T' ? 'brightness(1)' : ''
      }}
      onClick={(e) => {
        e.stopPropagation();
        onEdit(slot);
      }}
    >
      <div className={styles.slotTitle}>
        {abreviarNomeDisciplina(slot.disciplina_nome)}
      </div>
      <div className={styles.slotDetails}>
        {slot.tipo === 'T' ? 'Teórica' : 'Prática'} - {slot.sala_nome}
      </div>
      <div className={styles.slotDetails}>
        {slot.docente_nome}
      </div>
    </div>
  );
}
