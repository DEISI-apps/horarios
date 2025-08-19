import { MINUTE_HEIGHT, START_HOUR, HOUR_HEIGHT, END_HOUR } from './constants';

export const calculateSlotPosition = (startTime: string): number => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = (hours - START_HOUR) * 60 + minutes;
  return totalMinutes * MINUTE_HEIGHT;
};

export const generateTimeMarkers = () => {
  const markers = [];
  for (let hour = START_HOUR; hour < END_HOUR; hour++) {
    markers.push({
      key: `full-${hour}`,
      top: (hour - START_HOUR) * HOUR_HEIGHT,
      time: `${hour.toString().padStart(2, '0')}:00`,
      isHalf: false
    });
    
    if (hour < END_HOUR) {
      markers.push({
        key: `half-${hour}`,
        top: (hour - START_HOUR) * HOUR_HEIGHT + (HOUR_HEIGHT / 2),
        time: `${hour.toString().padStart(2, '0')}:30`,
        isHalf: true
      });
    }
  }
  return markers;
};

export const calculateClickTime = (clickY: number): string => {
  const clickedMinutes = Math.round(clickY / MINUTE_HEIGHT);
  const snappedMinutes = Math.floor(clickedMinutes / 30) * 30;
  const hours = START_HOUR + Math.floor(snappedMinutes / 60);
  const minutes = snappedMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};
