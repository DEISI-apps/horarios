"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import SelectHorario from "@/components/SelectHorario/SelectHorario";
import ListaTurmas from "../ListaTurmas";
import { useHorarios } from "@/hooks/useHorarios";
import { useAulas } from "@/hooks/useAulas";
import { Loader2, Download, Info } from "lucide-react";
import ICAL from 'ical.js';
import {
  SEMESTER_START_YEAR,
  SEMESTER_START_MONTH,
  SEMESTER_START_MONTH_NUMBER_OF_DAYS,
  SEMESTER_CICLE_1_START_DAY,
  SEMESTER_CICLE_23_START_DAY,
  SEMESTER_CICLE_1_HOLIDAYS_WEEKS,
  SEMESTER_CICLE_23_HOLIDAYS_WEEKS,
} from '@/lib/constants';

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


export default function TurmasAlunos() {

  //
  // A. Definição do estado

  const [selectedHorarioId, setSelectedHorarioId] = useState<number | null>(null);
  const [selectedTurmaId, setSelectedTurmaId] = useState<number | null>(null);
  const { horarios, isLoading } = useHorarios();
  const { aulas } = useAulas(selectedHorarioId || 0);

  const horario = useMemo(() => {
    if (!selectedHorarioId || !horarios) return null;
    return horarios.find(h => h.id === selectedHorarioId) || null;
  }, [selectedHorarioId, horarios]);

  // Aulas filtradas pela turma selecionada
  const aulasTurma = useMemo(() => {
    if (!aulas || !selectedTurmaId) return [];
    return aulas.filter(aula => aula.turma_id === selectedTurmaId);
  }, [aulas, selectedTurmaId]);

  // Eventos ICAL
  const events: EventProps[] = useMemo(() => {
    if (!aulasTurma || aulasTurma.length === 0) return [];

    return aulasTurma.map(aula => {
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
        description: `Docente: ${aula.docente_nome}\nTurma: ${aula.turma_nome}`,
        recurrenceRule: `FREQ=WEEKLY;COUNT=${semanas}`,
        ...(excludingDates.length > 0 && { exdate: excludingDates }),
      };
    });
  }, [aulasTurma]);

  const handleDownload = useCallback(() => {
    if (!events || events.length === 0) {
      alert("Selecione uma turma primeiro!");
      return;
    }

    const icsContent = createIcs(events);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const turma = horario?.turmas.find(t => t.id === selectedTurmaId);
    const filename = turma ? `horario_${horario?.curso.sigla}_${turma.nome}.ics` : 'horario.ics';

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [events, horario, selectedTurmaId]);

  // Callback para receber a turma selecionada do ListaTurmas
  const handleTurmaChange = useCallback((turmaId: number) => {
    setSelectedTurmaId(turmaId);
  }, []);

  useEffect(() => {
    function sendHeight() {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage(
        { type: "iframe-turmas-height", height },
        "*"
      );
    }

    window.addEventListener("load", sendHeight);
    window.addEventListener("resize", sendHeight);

    const observer = new MutationObserver(sendHeight);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    return () => {
      window.removeEventListener("load", sendHeight);
      window.removeEventListener("resize", sendHeight);
      observer.disconnect();
    };
  }, []);

  // Reset turma quando muda o horário
  useEffect(() => {
    if (horario && horario.turmas.length > 0) {
      setSelectedTurmaId(horario.turmas[0].id);
    } else {
      setSelectedTurmaId(null);
    }
  }, [horario]);

  //
  // B. Renderização

  if (isLoading) return <div className="flex justify-center items-center h-32">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      <p className="text-gray-500">A carregar cursos...</p>
    </div>;

  return (
    <div className="p-4">
      <SelectHorario onSelect={setSelectedHorarioId}>
        {selectedHorarioId && horario && selectedTurmaId && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 font-bold"
            >
              <Download className="w-4 h-4" />
              Descarregar Horário
            </button>
            <div className="relative group">
              <Info className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-help" />
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 p-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <p className="mb-2">O ficheiro ICS contém o horário completo das semanas lectivas.</p>
                <p>Pode importar no <strong>Google Calendar</strong> ou <strong>Outlook</strong>: clique no ficheiro descarregado ou importe-o nas definições do calendário.</p>
                <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-800"></div>
              </div>
            </div>
          </div>
        )}
      </SelectHorario>

      {selectedHorarioId && horario && (
        <>
          <ListaTurmas horario={horario} onTurmaChange={handleTurmaChange} />
        </>
      )}
    </div>
  );
}
