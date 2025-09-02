import { generateTimeMarkers } from '@/lib/calendario';
import styles from './CalendarioSemanal.module.css';
import { text } from 'stream/consumers';


export function TimeLines() {
  const markers = generateTimeMarkers();
  return (
    <>
      {markers
        .map((marker) => (
        <div
          key={`line-${marker.key}`}
          className={`${styles.timeMarkerLine}`}
          style={{ top: `${marker.top}px`, border: marker.isHalf ? '1px dashed lightgray' : '1px solid lightgray' }}
        />
      ))}
    </>
  );
}
