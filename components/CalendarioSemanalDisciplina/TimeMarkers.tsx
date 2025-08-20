import { generateTimeMarkers } from '@/lib/calendario';
import styles from './CalendarioSemanalDisciplina.module.css';

export default function TimeMarkers() {
  const markers = generateTimeMarkers();

  return (
    <>
      {markers.map((marker) => (
        <div 
          key={marker.key}
          className={`${styles.timeMarker} ${marker.isHalf ? styles.halfHour : ''}`}
          style={{ top: `${marker.top}px` }}
        >
          {marker.time}
        </div>
      ))}
    </>
  );
}
