export const HOUR_HEIGHT = 40;
export const MINUTE_HEIGHT = HOUR_HEIGHT / 60;
export const START_HOUR = 8;
export const END_HOUR = 24;
export const TOTAL_HOURS = END_HOUR - START_HOUR;
export const CALENDAR_HEIGHT = TOTAL_HOURS * HOUR_HEIGHT;

// Configurações do inicio do semestre
export const SEMESTER_CICLE_1_START_DAY = 8;
export const SEMESTER_CICLE_23_START_DAY = 29;
export const SEMESTER_START_MONTH = 9;
export const SEMESTER_START_YEAR = 2025;
export const SEMESTER_START_MONTH_NUMBER_OF_DAYS = 30; // Setembro tem 30 dias
export const SEMESTER_CICLE_1_HOLIDAYS_WEEKS = []; // Semanas de ferias
export const SEMESTER_CICLE_23_HOLIDAYS_WEEKS = [13, 14]; // Semanas de ferias (Natal)

export const DAYS = [
  { id: 1, name: 'Segunda' },
  { id: 2, name: 'Terça' },
  { id: 3, name: 'Quarta' },
  { id: 4, name: 'Quinta' },
  { id: 5, name: 'Sexta' }
];
