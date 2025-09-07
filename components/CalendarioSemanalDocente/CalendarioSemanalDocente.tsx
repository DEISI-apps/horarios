'use client';

import { useAulasAnoSemestre } from '@/hooks/useAulasAnoSemestre';
import React, { useMemo } from 'react';
import styles from './CalendarioSemanalDocente.module.css';
import TimeMarkers from './TimeMarkers';
import {
  CALENDAR_HEIGHT,
  SEMESTER_START_YEAR,
  SEMESTER_START_MONTH,
  SEMESTER_START_MONTH_NUMBER_OF_DAYS,
  SEMESTER_CICLE_1_START_DAY,
  SEMESTER_CICLE_23_START_DAY,
  SEMESTER_CICLE_1_HOLIDAYS_WEEKS,
  SEMESTER_CICLE_23_HOLIDAYS_WEEKS,
} from '@/lib/constants';
import CalendarioGridDocente from './CalendarioGridDocente';
import { AulaDocente } from '@/types/interfaces';
import ICAL from 'ical.js';
import { Loader2 } from 'lucide-react';

interface Props {
  docente_id: number;
  ano_lectivo_id: number;
  semestre: number;
}

interface EventProps {
  start: [number, number, number, number, number];
  end: [number, number, number, number, number];
  title: string;
  location?: string;
  description?: string;
  recurrenceRule?: string;
  exdate?: [number, number, number, number, number][];
}

function computeExcludingDates(
  start: [number, number, number, number, number],
  semanasFerias: number[]
): [number, number, number, number, number][] {
  const [ano, mes, dia, hora, minuto] = start;
  const dataInicial = new Date(ano, mes - 1, dia, hora, minuto);

  const datasExcluir: [number, number, number, number, number][] = [];
  for (const semana of semanasFerias) {
    const data = new Date(dataInicial);
    data.setDate(dataInicial.getDate() + 7 * (semana - 1));
    datasExcluir.push([
      data.getFullYear(),
      data.getMonth() + 1,
      data.getDate(),
      data.getHours(),
      data.getMinutes(),
    ]);
  }
  return datasExcluir;
}

function createIcs(events: EventProps[]) {
  const vcalendar = new ICAL.Component(['vcalendar', [], []]);
  vcalendar.addPropertyWithValue('version', '2.0');
  vcalendar.addPropertyWithValue('prodid', '-//Meu Calendário//DEISI//PT');

  events.forEach(event => {
    const vevent = new ICAL.Component('vevent');
    const icalEvent = new ICAL.Event(vevent);

    icalEvent.startDate = new ICAL.Time({
      year: event.start[0],
      month: event.start[1],
      day: event.start[2],
      hour: event.start[3],
      minute: event.start[4],
    }, ICAL.TimezoneService.get('Europe/Lisbon'));

    icalEvent.endDate = new ICAL.Time({
      year: event.end[0],
      month: event.end[1],
      day: event.end[2],
      hour: event.end[3],
      minute: event.end[4],
    }, ICAL.TimezoneService.get('Europe/Lisbon'));

    vevent.addPropertyWithValue('summary', event.title);
    if (event.location) vevent.addPropertyWithValue('location', event.location);
    if (event.description) vevent.addPropertyWithValue('description', event.description);

    if (event.recurrenceRule) {
      vevent.addPropertyWithValue('rrule', ICAL.Recur.fromString(event.recurrenceRule));
    }

    if (event.exdate && event.exdate.length > 0) {
      event.exdate.forEach(dateArr => {
        const exDate = new ICAL.Time({
          year: dateArr[0],
          month: dateArr[1],
          day: dateArr[2],
          hour: dateArr[3],
          minute: dateArr[4],
        }, ICAL.TimezoneService.get('Europe/Lisbon'));
        vevent.addPropertyWithValue('exdate', exDate);
      });
    }

    vcalendar.addSubcomponent(vevent);
  });

  return vcalendar.toString();
}

export default function CalendarioSemanalDocente({
  docente_id,
  ano_lectivo_id,
  semestre
}: Props) {
  const { aulas, isLoadingAulas } = useAulasAnoSemestre(ano_lectivo_id, semestre);

  const aulasDocente = useMemo(() => {
    if (!aulas?.length || !docente_id) return [];

    const aulasAgrupadas = aulas
      .filter(aula => aula.docente_id === docente_id)
      .reduce((acc, aula) => {
        const timeKey = `${aula.dia_semana}-${aula.hora_inicio}`;
        if (!acc.has(timeKey)) {
          acc.set(timeKey, {
            ...aula,
            turmas: new Map([[aula.curso_sigla, [aula.turma_nome]]])
          });
        } else {
          const aulaAgregada = acc.get(timeKey)!;
          const turmasAtuais = aulaAgregada.turmas.get(aula.curso_sigla) || [];
          aulaAgregada.turmas.set(aula.curso_sigla, [...turmasAtuais, aula.turma_nome]);
        }
        return acc;
      }, new Map<string, AulaDocente>());

    return Array.from(aulasAgrupadas.values());
  }, [aulas, docente_id]);

  const events: EventProps[] = useMemo(() => {
    if (!aulasDocente) return [];

    return aulasDocente.map(aula => {
      const [classStartHour, classStartMinute] = aula.hora_inicio.split(':').map(Number);
      let classEndHour = classStartHour + Math.floor((classStartMinute + aula.duracao) / 60);
      let classEndMinute = (classStartMinute + aula.duracao) % 60;
      if (classEndHour >= 24) {
        classEndHour = 23;
        classEndMinute = 59;
      }

      const semesterStartDay = aula.curso_sigla[0] === 'L' ? SEMESTER_CICLE_1_START_DAY : SEMESTER_CICLE_23_START_DAY;
      const classDay = (semesterStartDay - 1 + aula.dia_semana) % SEMESTER_START_MONTH_NUMBER_OF_DAYS;
      const classMonth = SEMESTER_START_MONTH + Math.floor((semesterStartDay - 1 + aula.dia_semana) / SEMESTER_START_MONTH_NUMBER_OF_DAYS);

      const start: [number, number, number, number, number] = [
        SEMESTER_START_YEAR, classMonth, classDay, classStartHour, classStartMinute
      ];

      const end: [number, number, number, number, number] = [
        SEMESTER_START_YEAR, classMonth, classDay, classEndHour, classEndMinute
      ];

      const holidaysWeeks = aula.curso_sigla[0] === 'L'
        ? SEMESTER_CICLE_1_HOLIDAYS_WEEKS
        : SEMESTER_CICLE_23_HOLIDAYS_WEEKS;
      const excludingDates = computeExcludingDates(start, holidaysWeeks);

      const semanas = 15 + excludingDates.length;

      return {
        start,
        end,
        title: `${aula.disciplina_nome} (${aula.tipo})`,
        location: aula.sala_nome !== 'outra' ? aula.sala_nome : '',
        description: `Docente: ${aula.docente_nome}\nCurso(s)/Turma(s): ${aula.curso_sigla} - ${aula.turma_nome}`,
        recurrenceRule: `FREQ=WEEKLY;COUNT=${semanas}`,
        ...(excludingDates.length > 0 && { exdate: excludingDates }),
      };
    });
  }, [aulasDocente]);

  const handleDownload = () => {
    if (!events || events.length === 0) {
      alert("Sem aulas para exportar!");
      return;
    }

    const icsContent = createIcs(events);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'events.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoadingAulas || !aulasDocente)
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-gray-500">A carregar horário...</p>
      </div>
    );

  if (aulasDocente.length === 0) return <p className="text-gray-500">Sem aulas para este docente.</p>;

  return (
    <section>
      <div className={styles.container} style={{ position: 'relative' }}>
        <div className={`${styles.timeSlots} ${styles.timeMarkersFixed}`} style={{ height: `80px`, position: 'absolute', top: 0, left: -1, zIndex: 1 }} />
        <div className={`${styles.timeSlots} ${styles.timeMarkersFixed}`} style={{ height: `${CALENDAR_HEIGHT}px`, position: 'absolute', top: '40px', left: -1, zIndex: 1 }}>
          <TimeMarkers />
        </div>
        <div className={styles.calendarWrapper}>
          <CalendarioGridDocente aulas={aulasDocente} isLoadingAulas={isLoadingAulas} />
        </div>
      </div>
      <div className="mt-4 flex justify-center">
        <button className="py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2" onClick={handleDownload}>
          <span className="font-bold">Descarregar Horário em formato ICS <span className="sup">*</span></span>
        </button>
      </div>
      <div className="text-center mt-2 text-sm">
        <span className="text-gray-500"><span className="sup">*</span> O ficheiro ICS contém o seu horário ao longo das semanas lectivas. Pode ser importado no seu calendário Google/Outlook. Clique no ficheiro para importá-lo automáticamente, ou abra a sua aplicação de calendário e nas definições importe-o. </span>
      </div>
    </section>
  );
}
