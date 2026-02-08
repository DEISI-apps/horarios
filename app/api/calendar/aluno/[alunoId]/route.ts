import { NextResponse } from 'next/server';
import ICAL from 'ical.js';
import { fetchAulasAnoSemestre } from '@/lib/api/aulas';
import { addAulaToCalendar } from '@/lib/aulasCalendar';
import { Aula, AlunoInfo, TurmaAluno } from '@/types/interfaces';
import { SEMESTER_START_YEAR } from '@/lib/constants';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ alunoId: string }> }
) {
  const { alunoId: alunoIdParam } = await params;
  const alunoId = Number(alunoIdParam);
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

  // --- validar token (opcional) ---
  const VALID_TOKEN = process.env.CALENDAR_TOKEN;
  // Se existir um token configurado E o token fornecido não corresponder, rejeitar
  if (VALID_TOKEN && tokenParam && tokenParam !== VALID_TOKEN) {
    return new NextResponse('Token inválido', { status: 401 });
  }

  // --- buscar turmas do aluno ---
  const alunoResponse = await fetch(
    `https://horariosdeisi.pythonanywhere.com/aluno-turmas/${alunoIdParam}`
  );
  
  if (!alunoResponse.ok) {
    return new NextResponse('Aluno não encontrado', { status: 404 });
  }
  
  const alunoInfo: AlunoInfo = await alunoResponse.json();
  
  if ('erro' in alunoInfo) {
    return new NextResponse('Aluno não encontrado', { status: 404 });
  }

  // --- buscar aulas ---
  const aulas: Aula[] = await fetchAulasAnoSemestre(ANO_LECTIVO, SEMESTRE);

  // --- filtrar aulas do aluno usando turma + disciplina_id ---
  const aulasAluno: Aula[] = [];
  
  alunoInfo.turmas.forEach((turma: TurmaAluno) => {
    const matchingAulas = aulas.filter(
      a => a.turma_nome === turma.turma && a.disciplina_id === Number(turma.id_dsdeisi)
    );
    aulasAluno.push(...matchingAulas);
  });

  // Verificar se encontrou aulas
  if (aulasAluno.length === 0) {
    return new NextResponse('Nenhuma aula encontrada para este aluno', { status: 404 });
  }

  // --- criar vcalendar ---
  const vcalendar = new ICAL.Component(['vcalendar', [], []]);
  vcalendar.addPropertyWithValue('version', '2.0');
  vcalendar.addPropertyWithValue('prodid', '-//Horario Aluno DEISI//PT');
  vcalendar.addPropertyWithValue('calscale', 'GREGORIAN');
  vcalendar.addPropertyWithValue('method', 'PUBLISH');
  vcalendar.addPropertyWithValue('x-wr-calname', `Horário ${alunoInfo.aluno}`);
  vcalendar.addPropertyWithValue('x-wr-timezone', 'Europe/Lisbon');

  // --- adicionar aulas ---
  aulasAluno.forEach(aula => addAulaToCalendar(vcalendar, aula));

  // Validar que o calendário tem eventos
  const icalString = vcalendar.toString();
  
  // Debug log (remover em produção)
  console.log(`[Calendar API] Aluno: ${alunoIdParam}, Aulas: ${aulasAluno.length}, iCal tamanho: ${icalString.length} bytes`);

  // --- retornar iCal ---
  return new NextResponse(icalString, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `inline; filename="horario-aluno-${alunoIdParam}.ics"`,
      'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
      'Access-Control-Allow-Origin': '*', // Permite acesso do Google Calendar
    },
  });
}
