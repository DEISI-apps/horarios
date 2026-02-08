import { NextResponse } from 'next/server';
import ICAL from 'ical.js';
import { fetchAulasAnoSemestre } from '@/lib/api/aulas';
import { addAulaToCalendar } from '@/lib/aulasCalendar';
import { Aula } from '@/types/interfaces';

// Constantes do semestre
import {
  SEMESTER_START_YEAR,
  SEMESTER_START_MONTH,
  SEMESTER_START_MONTH_NUMBER_OF_DAYS,
} from '@/lib/constants';

export async function GET(
  req: Request,
  { params }: { params: { alunoId: string } }
) {
  const alunoId = Number(params.alunoId);
  if (Number.isNaN(alunoId)) {
    return new NextResponse('Aluno inválido', { status: 400 });
  }

  // --- ler query params ---
  const url = new URL(req.url);
  const anoParam = url.searchParams.get('ano');
  const semParam = url.searchParams.get('sem');
  const tokenParam = url.searchParams.get('token');

  const ANO_LECTIVO = anoParam ? Number(anoParam) : SEMESTER_START_YEAR;
  const SEMESTRE = semParam ? Number(semParam) : 1;

  // --- validar token (opcional, substituir pela tua lógica) ---
  const VALID_TOKEN = process.env.CALENDAR_TOKEN; // definir em .env
  if (VALID_TOKEN && tokenParam !== VALID_TOKEN) {
    return new NextResponse('Token inválido', { status: 401 });
  }

  // --- buscar aulas ---
  const aulas: Aula[] = await fetchAulasAnoSemestre(ANO_LECTIVO, SEMESTRE);

  // --- filtrar aulas do aluno ---
  // aqui deves adaptar para a lógica correta de turmas/aluno
  const aulasAluno = aulas.filter(aula =>
    aula.turma_nome?.includes(String(alunoId))
  );

  // --- criar vcalendar ---
  const vcalendar = new ICAL.Component(['vcalendar', [], []]);
  vcalendar.addPropertyWithValue('version', '2.0');
  vcalendar.addPropertyWithValue('prodid', '-//Horario Aluno DEISI//PT');

  // --- adicionar aulas ---
  aulasAluno.forEach(aula => addAulaToCalendar(vcalendar, aula));

  // --- retornar iCal ---
  return new NextResponse(vcalendar.toString(), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Cache-Control': 'no-cache', // força atualização automática
    },
  });
}
