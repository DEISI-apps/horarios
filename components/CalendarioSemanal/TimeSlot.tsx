import { useState } from 'react';
import { Aula } from '@/types/interfaces';
import { calculateSlotPosition } from '@/lib/calendario';
import { MINUTE_HEIGHT } from '@/lib/constants';
import { gerarCorDisciplina, abreviarNomeDisciplina } from '@/lib/utils';
import styles from './CalendarioSemanal.module.css';
import DocenteModal from '../CalendarioSemanalDocente/DocenteModal';
import SalaModal from '../CalendarioSemanalSala/SalaModal';

interface TimeSlotProps {
  slot: Aula;
  ano_lectivo_id: number;
  semestre: number;
  onEdit: (slot: Aula) => void;
}

export default function TimeSlot({ slot, ano_lectivo_id, semestre, onEdit }: TimeSlotProps) {

  const [isModalOpen, setModalOpen] = useState(false);
  const [isModalSalaOpen, setModalSalaOpen] = useState(false);

  const top = calculateSlotPosition(slot.hora_inicio);
  const height = slot.duracao * MINUTE_HEIGHT - 3;
  const baseColor = gerarCorDisciplina(slot.disciplina_id);

  return (
    <>
      <div
        key={`slot-${slot.id}`}
        className={styles.slot}
        style={{
          top: `${top}px`,
          height: `${height}px`,
          backgroundColor: baseColor,
          color: slot.juncao ? 'transparent' : 'black',
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
        <div className={styles.slotDetails} style={{ color: slot.juncao ? 'transparent' : 'rgb(100, 98, 98)' }} >
          {slot.tipo === 'T' ? 'Teórica ' : 'Prática '}

          {slot.sala_nome !== 'sala?' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setModalSalaOpen(true);
              }}
              className="underline focus:outline-none font-bold"
              style={{ background: 'whitesmoke', padding: '0 5px', borderRadius:'5px', opacity: '0.7'  }}
            >
              {slot.sala_nome}
            </button>
          )}
        </div>
        <div className={styles.slotDetails} style={{ color: slot.juncao ? 'transparent' : 'rgb(100, 98, 98)' }}>
          {!slot.juncao && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setModalOpen(true);
              }}
              className="underline focus:outline-none font-bold"
              style={{ background: 'whitesmoke', padding: '0 5px', marginTop: '2px', borderRadius:'5px', opacity: '0.7' }}
            >
              {slot.docente_nome}
            </button>
          )}
          {slot.juncao && slot.docente_nome}
        </div>
      </div>

      <DocenteModal
        isOpen={isModalOpen}
        setModalOpen={setModalOpen}
        docente_id={slot.docente_id}
        docente_nome={slot.docente_nome}
        ano_lectivo_id={ano_lectivo_id}
        semestre={semestre}
      />

      <SalaModal
        isOpen={isModalSalaOpen}
        setModalOpen={setModalSalaOpen}
        sala_id={slot.sala_id}
        sala_nome={slot.sala_nome}
        ano_lectivo_id={ano_lectivo_id}
        semestre={semestre}
      />


    </>
  );
}