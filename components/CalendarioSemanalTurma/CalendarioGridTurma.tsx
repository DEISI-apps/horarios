import { Aula } from '@/types/interfaces';
import { DAYS, CALENDAR_HEIGHT } from '@/lib/constants';
import TimeSlotTurma from './TimeSlotTurma';
import TimeMarkers from './TimeMarkers';
import styles from './CalendarioSemanal.module.css';

interface CalendarGridProps {
  aulas: Aula[];
  turma_id: number;
}

export default function CalendarGrid({ 
  aulas, 
  turma_id,
}: CalendarGridProps) {

  const renderizaSlotsDoDia = (dayId: number) => {
    return aulas
      .filter((slot: Aula) => slot.dia_semana === dayId)
      .map((slot: Aula) => (
        <TimeSlotTurma
          key={`slot-${slot.id}`} 
          slot={slot} 
        />
      ));
  };


  //
  // C. renderiza

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.calendarHeader}>
        <div className={styles.timeColumn}></div>
        {DAYS.map(day => (
          <div key={`day-${day.id}`} className={styles.dayHeader}>
            <div className={styles.dayName}>{day.name}</div>
            <div className={styles.classColumns}>
            </div>
          </div>
        ))}
      </div>
      
      <div className={styles.calendarBody}>
        <div 
          className={styles.timeSlots} 
          style={{ height: `${CALENDAR_HEIGHT}px` }}
        >
          <TimeMarkers />
        </div>
        
        <div 
          className={styles.daysContainer} 
          style={{ height: `${CALENDAR_HEIGHT}px` }}
        >
          {DAYS.map(day => (
            <div key={`day-${day.id}`} className={styles.dayColumn}>
              
                <div
                  key={`slot-${day.id}-${turma_id}`}
                  className={styles.classSlotColumn}
                >
                  {renderizaSlotsDoDia( day.id )}
                </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
