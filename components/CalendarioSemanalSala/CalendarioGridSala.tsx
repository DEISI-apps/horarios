import { Aula } from '@/types/interfaces';
import { DAYS, CALENDAR_HEIGHT } from '@/lib/constants';
import TimeMarkers from './TimeMarkers';
import styles from './CalendarioSemanalSala.module.css';
import TimeSlotSala from './TimeSlotSala';

interface CalendarGridProps {
  aulas: Aula[];
  isLoadingAulas: boolean;
}

export default function CalendarioGridSala({ 
  aulas, 
  isLoadingAulas, 
}: CalendarGridProps) {
  
  const renderSlotsForDayAndClass = ( dayId: number ) => {
    if (isLoadingAulas) return <div>A carregar aulas...</div>;
    
    return aulas
      .filter((slot: Aula) => slot.dia_semana === dayId )
      .map((slot: Aula) => (
        <TimeSlotSala key={`slot-${slot.id}`} slot={slot} />
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
            <div className={styles.classColumns}> </div>
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
                  key={`slot-${day.id}`}
                  className={styles.classSlotColumn}
                >
                  {renderSlotsForDayAndClass(day.id)}
                </div>
              
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
