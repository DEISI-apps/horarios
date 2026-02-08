import ICAL from 'ical.js';
import { Aula } from '@/types/interfaces';
import {
  SEMESTER_START_YEAR,
  SEMESTER_START_MONTH,
  SEMESTER_START_MONTH_NUMBER_OF_DAYS,
  SEMESTER_CICLE_1_START_DAY,
  SEMESTER_CICLE_23_START_DAY,
  SEMESTER_CICLE_1_HOLIDAYS_WEEKS,
  SEMESTER_CICLE_23_HOLIDAYS_WEEKS,
} from './constants';

/**
 * Adiciona uma aula ao calendário iCal
 * @param vcalendar - objeto ICAL.Component do calendário
 * @param aula - objeto Aula
 */
export function addAulaToCalendar(vcalendar: ICAL.Component, aula: Aula) {
  const tz = ICAL.TimezoneService.get('Europe/Lisbon');

  // --- UID fixo para sincronização ---
  const uid = `aula-${aula.id}@deisi.pt`;

  const vevent = new ICAL.Component('vevent');
  const event = new ICAL.Event(vevent);
  event.uid = uid;

  // --- calcular data de início ---
  const [startHour, startMinute] = aula.hora_inicio.split(':').map(Number);

  const semesterStartDay =
    aula.curso_sigla[0] === 'L'
      ? SEMESTER_CICLE_1_START_DAY
      : SEMESTER_CICLE_23_START_DAY;

  const classDay =
    (semesterStartDay - 1 + aula.dia_semana) %
    SEMESTER_START_MONTH_NUMBER_OF_DAYS;

  const classMonth =
    SEMESTER_START_MONTH +
    Math.floor(
      (semesterStartDay - 1 + aula.dia_semana) /
        SEMESTER_START_MONTH_NUMBER_OF_DAYS
    );

  const startTime = new ICAL.Time(
    {
      year: SEMESTER_START_YEAR,
      month: classMonth,
      day: classDay,
      hour: startHour,
      minute: startMinute,
    },
    tz
  );

  event.startDate = startTime;

  // --- criar endDate com Duration ---
  event.endDate = startTime.clone();
  event.endDate.addDuration(new ICAL.Duration({ minutes: aula.duracao }));

  // --- summary / location / description ---
  vevent.addPropertyWithValue(
    'summary',
    `${aula.disciplina_nome} (${aula.tipo})`
  );

  if (aula.sala_nome && aula.sala_nome !== 'outra') {
    vevent.addPropertyWithValue('location', aula.sala_nome);
  }

  vevent.addPropertyWithValue(
    'description',
    `Docente: ${aula.docente_nome}\nTurma: ${aula.turma_nome}`
  );

  // --- calcular EXDATE (ferias) ---
  const holidays =
    aula.curso_sigla[0] === 'L'
      ? SEMESTER_CICLE_1_HOLIDAYS_WEEKS
      : SEMESTER_CICLE_23_HOLIDAYS_WEEKS;

  const excludingDates = holidays.map(semana => {
    const d = new Date(
      SEMESTER_START_YEAR,
      classMonth - 1,
      classDay,
      startHour,
      startMinute
    );
    d.setDate(d.getDate() + 7 * (semana - 1));
    return [
      d.getFullYear(),
      d.getMonth() + 1,
      d.getDate(),
      d.getHours(),
      d.getMinutes(),
    ] as [number, number, number, number, number];
  });

  // --- RRULE ---
  const totalWeeks = 16 + excludingDates.length;
  vevent.addPropertyWithValue(
    'rrule',
    ICAL.Recur.fromString(`FREQ=WEEKLY;COUNT=${totalWeeks}`)
  );

  // --- adicionar EXDATE ---
  excludingDates.forEach(d => {
    vevent.addPropertyWithValue(
      'exdate',
      new ICAL.Time({
        year: d[0],
        month: d[1],
        day: d[2],
        hour: d[3],
        minute: d[4],
      }, tz)
    );
  });

  // --- adicionar ao vcalendar ---
  vcalendar.addSubcomponent(vevent);
}
