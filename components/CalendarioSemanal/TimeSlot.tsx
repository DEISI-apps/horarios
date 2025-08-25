import { useState, useEffect, useRef } from 'react';
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

  const [width, setWidth] = useState<number>(0);
  const slotRef = useRef<HTMLDivElement>(null);

  const top = calculateSlotPosition(slot.hora_inicio);
  const height = slot.duracao * MINUTE_HEIGHT - 5;
  const baseColor = gerarCorDisciplina(slot.disciplina_id, true);

  // observar largura do slot dinamicamente
  useEffect(() => {
    if (!slotRef.current) return;

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });

    observer.observe(slotRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div
        ref={slotRef}
        key={`slot-${slot.id}`}
        className={styles.slot}
        style={{
          top: `${top}px`,
          height: `${height}px`,
          backgroundColor: baseColor,
          color: (slot.juncao && !slot.juncao_visivel) ? 'transparent' : 'black',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          textAlign: 'left',
          paddingLeft: '8px',
          lineHeight: '14px',
        }}
        onClick={(e) => {
          e.stopPropagation();
          onEdit(slot);
        }}
      >
        <div className={styles.slotTitle}>
          {abreviarNomeDisciplina(slot.disciplina_nome, width)} 
        </div>

        <div
          className={styles.slotDetails}
          style={{ color: (slot.juncao && !slot.juncao_visivel) ? 'transparent' : 'black' }}
        >
          {slot.tipo === 'T' ? 'Teórica ' : 'Prática '}

          {slot.sala_nome !== 'sala?' && (
            <>
              <span>· </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setModalSalaOpen(true);
                }}
                className="underline focus:outline-none"
              >
                {slot.sala_nome}
              </button>
            </>
          )}
        </div>

        <div
          className={styles.slotDetails}
          style={{ color: (slot.juncao && !slot.juncao_visivel) ? 'transparent' : 'black' }}
        >
          {(!slot.juncao || slot.juncao_visivel) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setModalOpen(true);
              }}
              className="underline focus:outline-none"
            >
              {slot.docente_nome}
            </button>
          )}
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
