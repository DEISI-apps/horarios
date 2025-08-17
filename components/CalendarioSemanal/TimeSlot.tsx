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
  const baseColor = gerarCorDisciplina(slot.disciplina_id);


  return (
    <div
      key={`slot-${slot.id}`}
      className={styles.slot}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        backgroundColor: baseColor,
        borderRight: slot.juncao ? '5px dashed white' : 'none',
        borderLeft: slot.juncao ? '5px dashed white' : 'none',
        color:  slot.juncao ? 'transparent': 'black',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onEdit(slot);
      }}
    >
      <div className={styles.slotTitle}>
        {abreviarNomeDisciplina(slot.disciplina_nome)}
      </div>
      <div className={styles.slotDetails} style={{ color:  slot.juncao ? 'transparent': 'rgb(100, 98, 98)' }} >
        {slot.tipo === 'T' ? 'Teórica' : 'Prática'} - {slot.sala_nome}
      </div>
      <div className={styles.slotDetails} style={{ color:  slot.juncao ? 'transparent': 'rgb(100, 98, 98)' }}>
        {slot.docente_nome}
      </div>
    </div>
  );
}
