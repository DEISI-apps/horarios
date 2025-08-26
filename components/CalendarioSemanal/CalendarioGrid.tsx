import { useState } from 'react';
import { Aula, Turma } from '@/types/interfaces';
import { DAYS, CALENDAR_HEIGHT } from '@/lib/constants';
import { calculateClickTime } from '@/lib/calendario';
import TimeSlot from './TimeSlot';
import TimeMarkers from './TimeMarkers';
import styles from './CalendarioSemanal.module.css';
import TurmaModal from '../CalendarioSemanalTurma/TurmaModal';
import { TimeLines } from './TimeLines';

interface CalendarGridProps {
  turmas: Turma[];
  aulas: Aula[];
  isLoadingAulas: boolean;
  ano_lectivo_id: number;
  semestre: number;
  onSlotClick: (day: number, classId: number, startTime?: string) => void;
  onSlotEdit: (slot: Aula) => void;
}


export default function CalendarGrid({
  turmas,
  aulas,
  isLoadingAulas,
  ano_lectivo_id,
  semestre,
  onSlotClick,
  onSlotEdit
}: CalendarGridProps) {

  const [isModalTurmaOpen, setModalTurmaOpen] = useState(false);
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null);

  const renderizaSlotsDoDiaETurma = (dayId: number, classId: number, ano_lectivo_id: number, semestre: number) => {
    if (isLoadingAulas) return <div>A carregar aulas...</div>;

    return aulas
      .filter((slot: Aula) => slot.dia_semana === dayId && slot.turma_id === classId)
      .map((slot: Aula) => (
        <TimeSlot
          key={`slot-${slot.id}`}
          slot={slot}
          ano_lectivo_id={ano_lectivo_id}
          semestre={semestre}
          onEdit={onSlotEdit}
        />
      ));
  };

  // detecta clique de um slot
  const handleClassSlotClick = (day: number, classId: number, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const startTime = calculateClickTime(clickY);
    onSlotClick(day, classId, startTime);
  };



  //
  // C. renderiza
  if (!turmas) return <p className="text-gray-500">A carregar turmas...</p>;

  return (
    <div className={styles.calendarWrapper}>
      
      {/* quadrado no topo esquerdo do horario (podemos eventualmente por cor do fundo cinza) */}
      <div
        className={`${styles.timeSlots} ${styles.timeMarkersFixed}`}
        style={{ height: `82px`, position: 'absolute', top: 0, left: -1, zIndex: 1, borderRight: '1px solid #dddada' }}
      >
      </div>
      
      {/* linhas horizontais das horas */}
      <div
        className={`${styles.timeSlots} ${styles.timeMarkersFixed}`}
        style={{ height: `${CALENDAR_HEIGHT}px`, position: 'absolute', top: '67px', left: -1, zIndex: 1, borderRight: '1px solid #dddada' }}
      >
        <TimeMarkers />
      </div>


      <div className={styles.calendarContainer}>
        
        {/* cabeçalho das colunas com info do dia e turma */}
        <div className={styles.calendarHeader}>
          <div className={styles.timeColumn}></div>
          {DAYS.map(day => (
            <div key={`day-${day.id}`} className={styles.dayHeader}>
              <div className={styles.dayName}>{day.name}</div>
              <div className={styles.classColumns}>
                {turmas.map((turma: Turma) => (
                  <div
                    key={`class-${day.id}-${turma.id}`}
                    className={styles.classColumn}
                    onClick={(e) => handleClassSlotClick(day.id, turma.id, e)}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTurma(turma);
                        setModalTurmaOpen(true);
                      }}
                      className="underline focus:outline-none"
                    >
                      Turma {turma.nome}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.calendarBody}>

          <div
            className={styles.daysContainer}
            style={{ height: `${CALENDAR_HEIGHT}px`, marginLeft: '78px' }}
          >
            {/* linhas horizontais das horas */}
            <TimeLines />

            {/* para cada coluna-dia...  */}
            {DAYS.map(day => (
              <div key={`day-${day.id}`} className={styles.dayColumn}>
                {/* e para cada coluna-turma... renderiza as aulas que existem */}
                {turmas.map((turma: Turma) => (
                  <div
                    key={`slot-${day.id}-${turma.id}`}
                    className={styles.classSlotColumn}
                    onClick={(e) => handleClassSlotClick(day.id, turma.id, e)}
                  >
                    {renderizaSlotsDoDiaETurma(day.id, turma.id, ano_lectivo_id, semestre)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      {selectedTurma && (
        <TurmaModal
          isOpen={isModalTurmaOpen}
          setModalOpen={setModalTurmaOpen}
          turma_id={selectedTurma.id}
          turma_nome={selectedTurma.nome}
          aulas={aulas}
        />
      )}
    </div>
  );
}
