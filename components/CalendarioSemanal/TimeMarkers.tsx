import { generateTimeMarkers } from '@/lib/calendario';
import styles from './CalendarioSemanal.module.css';

export default function TimeMarkers() {
  const markers = generateTimeMarkers();

  return (
    <>
      {markers.map((marker) => (
        <div 
          key={marker.key}
          className={`${styles.timeMarker} ${marker.isHalf ? styles.halfHour : styles.timeMarkerLine}`}
          style={{ top: `${marker.top +2 }px` }}
        >
          {marker.time}
        </div>
      ))}
    </>
  );
}
