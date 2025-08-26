import { generateTimeMarkers } from '@/lib/calendario';
import styles from './CalendarioSemanal.module.css';


export function TimeLines() {
  const markers = generateTimeMarkers();
  return (
    <>
      {markers
        .filter((map) => map.isHalf === false) // só linhas inteiras  
        .map((marker) => (
        <div
          key={`line-${marker.key}`}
          className={styles.timeMarkerLine}
          style={{ top: `${marker.top}px` }}
        />
      ))}
    </>
  );
}
