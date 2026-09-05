// configurações do ano e semestre 
export const ANO_LECTIVO = '26-27';
export const ANO_LECTIVO_ID = 36;
export const SEMESTRE = 1;


// configurações de visualização do calendario
export const HOUR_HEIGHT = 40;
export const MINUTE_HEIGHT = HOUR_HEIGHT / 60;
export const START_HOUR = 8;
export const END_HOUR = 24;
export const TOTAL_HOURS = END_HOUR - START_HOUR;
export const CALENDAR_HEIGHT = TOTAL_HOURS * HOUR_HEIGHT;


// // Configurações do 2º semestre para o ano letivo 2025/2026
// export const SEMESTER_CICLE_1_START_DAY = 9;
// export const SEMESTER_CICLE_23_START_DAY = 9;
// export const SEMESTER_START_MONTH = 2;
// export const SEMESTER_START_YEAR = 2026;
// export const SEMESTER_START_MONTH_NUMBER_OF_DAYS = 28; // Fevereiro tem 28
// export const SEMESTER_CICLE_1_HOLIDAYS_WEEKS = [8, 9]; // Semanas de ferias Pascoa
// export const SEMESTER_CICLE_23_HOLIDAYS_WEEKS = [8, 9]; // Semanas de ferias Pascoa
// export const SEMESTER_CICLE_1_NUMBER_OF_WEEKS = 16; // Número total de semanas no semestre
// export const SEMESTER_CICLE_23_NUMBER_OF_WEEKS = 16; // Número total de semanas no semestre


// Configurações do 1º semestre para o ano letivo 2026/2027
export const SEMESTER_CICLE_1_START_DAY = 7;
export const SEMESTER_CICLE_1_YEAR1_START_DAY = 14;  // para o 1º ano do 1º ciclo as aulas começam mais tarde, a 14 de Setembro
export const SEMESTER_CICLE_23_START_DAY = 28;  // para o 2º e 3º ciclo as aulas começam mais tarde, a 28 de Setembro
export const SEMESTER_START_MONTH = 9;
export const SEMESTER_START_YEAR = 2026;
export const SEMESTER_START_MONTH_NUMBER_OF_DAYS = 30; // Setembro tem 30 dias
export const SEMESTER_CICLE_1_HOLIDAYS_WEEKS = [15, 16]; // nao ha interrupcao lectiva no 1º ciclo
// export const SEMESTER_CICLE_1_YEAR1_HOLIDAYS_WEEKS = [15, 16]; // nao ha interrupcao lectiva no 1º ciclo
export const SEMESTER_CICLE_23_HOLIDAYS_WEEKS = [14, 15]; // interrupcao lectiva no 2º e 3º ciclo (Natal)
export const SEMESTER_NUMBER_OF_WEEKS = 16; // Número total de semanas no semestre


export const DAYS = [
  { id: 1, name: '2ª Feira' },
  { id: 2, name: '3ª Feira' },
  { id: 3, name: '4ª Feira' },
  { id: 4, name: '5ª Feira' },
  { id: 5, name: '6ª Feira' }
];
