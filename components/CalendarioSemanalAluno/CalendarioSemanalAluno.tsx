'use client';

import { useAulasAnoSemestre } from '@/hooks/useAulasAnoSemestre';
import React, { useMemo, useEffect, useCallback, useRef, useState } from 'react';
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
import CalendarioGridTurma from '@/components/CalendarioSemanalTurma/CalendarioGridTurma';
import { Aula, AlunoInfo } from '@/types/interfaces';
import ICAL from 'ical.js';
import { Loader2, Download, Info, Calendar } from 'lucide-react';

interface Props {
  aluno_info: AlunoInfo;
  ano_lectivo_id: number;
  semestre: number;
  showDownloadButton?: boolean;
  onDownloadReady?: (downloadFn: () => void) => void;
  onGoogleCalendarLinkReady?: (link: string) => void;
}

/**
 * Gera o link de subscrição para o Google Calendar
 */
function generateGoogleCalendarLink(alunoId: string, anoLectivo: number, semestre: number): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://horarios-phi.vercel.app';
  
  // Usar webcal:// que é o protocolo padrão para subscrição de calendários
  // Converte https:// para webcal://
  const webcalUrl = `${baseUrl}/api/calendar/aluno/${alunoId}?ano=${anoLectivo}&sem=${semestre}`.replace('https://', 'webcal://').replace('http://', 'webcal://');
  
  return webcalUrl;
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

export default function CalendarioSemanalAluno({
  aluno_info,
  ano_lectivo_id,
  semestre,
  showDownloadButton = true,
  onDownloadReady,
  onGoogleCalendarLinkReady,
}: Props) {
  
  const { aulas, isLoadingAulas } = useAulasAnoSemestre(ano_lectivo_id, semestre);

  const [googleCalendarLink, setGoogleCalendarLink] = useState<string>('');

  // Gerar link do Google Calendar quando o componente for montado
  useEffect(() => {
    const alunoId = aluno_info.numero || aluno_info.numeroAluno;
    if (alunoId) {
      const link = generateGoogleCalendarLink(alunoId, ano_lectivo_id, semestre);
      setGoogleCalendarLink(link);
      // Notificar o componente pai do link
      if (onGoogleCalendarLinkReady) {
        onGoogleCalendarLinkReady(link);
      }
    }
  }, [aluno_info.numero, aluno_info.numeroAluno, ano_lectivo_id, semestre, onGoogleCalendarLinkReady]);

  const aulasAluno = useMemo(() => {
    if (!aulas?.length) return [];

    const aulas_aluno: Aula[] = [];

    aluno_info.turmas.forEach(turma => {
      const matchingAulas = aulas.filter(a => a.turma_nome === turma.turma && a.disciplina_id === Number(turma.id_dsdeisi));
      aulas_aluno.push(...matchingAulas);
    });

    return aulas_aluno

  }, [aulas, aluno_info]);

  
  
  
  const events: EventProps[] = useMemo(() => {
    if (!aulasAluno) return [];

    return aulasAluno.filter(a => a != null).map(aula => {
      
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

      const semanas = 16 + excludingDates.length;

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
  }, [aulasAluno]);

  // Usar ref para evitar loop infinito no useEffect
  const eventsRef = useRef(events);
  eventsRef.current = events;

  const handleDownload = useCallback(() => {
    const currentEvents = eventsRef.current;
    if (!currentEvents || currentEvents.length === 0) {
      alert("Sem aulas para exportar!");
      return;
    }

    const icsContent = createIcs(currentEvents);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'events.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const handleAddToGoogleCalendar = useCallback(() => {
    if (googleCalendarLink) {
      console.log('=== Subscrição via webcal:// ===');
      console.log('Link:', googleCalendarLink);
      
      // webcal:// abre diretamente a aplicação de calendário do sistema
      // Funciona com Google Calendar (web), Apple Calendar, Outlook, etc.
      window.location.href = googleCalendarLink;
    } else {
      console.error('Link do calendário não gerado');
    }
  }, [googleCalendarLink]);

  // Notifica o componente pai quando a função de download está pronta
  const hasCalledOnDownloadReady = useRef(false);
  
  // Reset quando o docente muda
  useEffect(() => {
    hasCalledOnDownloadReady.current = false;
  }, [aluno_info]);
  
  useEffect(() => {
    if (onDownloadReady && events.length > 0 && !hasCalledOnDownloadReady.current) {
      hasCalledOnDownloadReady.current = true;
      onDownloadReady(handleDownload);
    }
  }, [onDownloadReady, handleDownload, events.length]);

  if (isLoadingAulas || !aulasAluno)
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-gray-500">A carregar horário...</p>
      </div>
    );

  if (!aulasAluno || aulasAluno.length === 0) return <p className="text-gray-500">Sem aulas para este aluno.</p>;

  return (
    <section>
      {showDownloadButton && (
        <div className="mb-4 flex justify-center items-center gap-2">
          <button className="py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 font-bold" onClick={handleDownload}>
            <Download className="w-4 h-4" />
            Descarregar Horário
          </button>
          <button
            onClick={handleAddToGoogleCalendar}
            disabled={!googleCalendarLink}
            className="py-2 px-4 bg-red-500 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg flex items-center gap-2 font-bold"
          >
            <Calendar className="w-4 h-4" />
            Subscrever Calendário
          </button>
          <div className="relative group">
            <Info className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-help" />
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-80 p-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <p className="mb-2"><strong>Descarregar Horário:</strong> Ficheiro ICS para importar manualmente no Google Calendar, Outlook, etc.</p>
              <p><strong>Subscrever Calendário:</strong> Adiciona ao seu calendário com atualizações automáticas. Funciona com todos os calendários (Google, Apple, Outlook).</p>
              <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-800"></div>
            </div>
          </div>
        </div>
      )}
      <div className={styles.container} style={{ position: 'relative' }}>
        <div className={`${styles.timeSlots} ${styles.timeMarkersFixed}`} style={{ height: `80px`, position: 'absolute', top: 0, left: -1, zIndex: 1 }} />
        <div className={`${styles.timeSlots} ${styles.timeMarkersFixed}`} style={{ height: `${CALENDAR_HEIGHT}px`, position: 'absolute', top: '40px', left: -1, zIndex: 1 }}>
          <TimeMarkers />
        </div>
        <div className={styles.calendarWrapper}>
          <CalendarioGridTurma
            aulas={aulasAluno}
            turma_id={0}
            ano_lectivo_id={ano_lectivo_id}
            semestre={semestre}
          />
        </div>
      </div>
    </section>
  );
}
