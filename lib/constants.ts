export const HOUR_HEIGHT = 40;
export const MINUTE_HEIGHT = HOUR_HEIGHT / 60;
export const START_HOUR = 8;
export const END_HOUR = 24;
export const TOTAL_HOURS = END_HOUR - START_HOUR;
export const CALENDAR_HEIGHT = TOTAL_HOURS * HOUR_HEIGHT;

// Configurações do inicio do semestre
export const SEMESTER_CICLE_1_START_DAY = 9;
export const SEMESTER_CICLE_23_START_DAY = 9;
export const SEMESTER_START_MONTH = 2;
export const SEMESTER_START_YEAR = 2026;
export const SEMESTER_START_MONTH_NUMBER_OF_DAYS = 28; // Fevereiro tem 28
export const SEMESTER_CICLE_1_HOLIDAYS_WEEKS = [8, 9]; // Semanas de ferias Pascoa
export const SEMESTER_CICLE_23_HOLIDAYS_WEEKS = [8, 9]; // Semanas de ferias Pascoa

export const DAYS = [
  { id: 1, name: '2ª Feira' },
  { id: 2, name: '3ª Feira' },
  { id: 3, name: '4ª Feira' },
  { id: 4, name: '5ª Feira' },
  { id: 5, name: '6ª Feira' }
];
