import { Aula, Turma } from '@/types/interfaces';
import { DAYS, CALENDAR_HEIGHT } from '@/lib/constants';
import { calculateClickTime } from '@/lib/calendario';
import TimeSlot from './TimeSlot';
import TimeMarkers from './TimeMarkers';
import styles from './CalendarioSemanal.module.css';

interface CalendarGridProps {
  turmas: Turma[];
  aulas: Aula[];
  isLoadingAulas: boolean;
  onSlotClick: (day: number, classId: number, startTime?: string) => void;
  onSlotEdit: (slot: Aula) => void;
}

export default function CalendarGrid({ 
  turmas, 
  aulas, 
  isLoadingAulas, 
  onSlotClick, 
  onSlotEdit 
}: CalendarGridProps) {
  
  const renderSlotsForDayAndClass = (dayId: number, classId: number) => {
    if (isLoadingAulas) return <div>A carregar aulas...</div>;
    
    return aulas
      .filter((slot: Aula) => slot.dia_semana === dayId && slot.turma_id === classId)
      .map((slot: Aula) => (
        <TimeSlot key={`slot-${slot.id}`} slot={slot} onEdit={onSlotEdit} />
      ));
  };

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
    <div className={styles.calendarContainer}>
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
                  Turma {turma.nome}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className={styles.calendarBody}>
        <div 
          className={styles.timeSlots} 
          style={{ height: `${CALENDAR_HEIGHT}px`, borderTop: '1px solid green' }}
        >
          <TimeMarkers />
        </div>
        
        <div 
          className={styles.daysContainer} 
          style={{ height: `${CALENDAR_HEIGHT}px` }}
        >
          {DAYS.map(day => (
            <div key={`day-${day.id}`} className={styles.dayColumn}>
              {turmas.map((turma: Turma) => (
                <div
                  key={`slot-${day.id}-${turma.id}`}
                  className={styles.classSlotColumn}
                  onClick={(e) => handleClassSlotClick(day.id, turma.id, e)}
                >
                  {renderSlotsForDayAndClass(day.id, turma.id)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
