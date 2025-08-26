'use client';

import { useState, useMemo } from 'react';
import { useDisciplinas } from '@/hooks/useDisciplinas';
import { useTurmas } from '@/hooks/useTurmas';
import { useSalas } from '@/hooks/useSalas';
import { useAulas } from '@/hooks/useAulas';
import { useAulasAnoSemestre } from '@/hooks/useAulasAnoSemestre';
import {
  SlotForm,
  Disciplina,
  Aula,
  Horario,
} from "@/types/interfaces";
import { gerarCorDisciplina, atualizaDisciplinasHoras } from '@/lib/utils';
import CalendarGrid from './CalendarioGrid';
import AulaModal from './AulaModal';
import styles from './CalendarioSemanal.module.css';
import TimeMarkers from './TimeMarkers';
import { CALENDAR_HEIGHT } from '@/lib/constants';

export default function CalendarioSemanal({ horario }: { horario: Horario }) {

  //
  // A. Gestão de estados do componente
  const [modalOpen, setModalOpen] = useState(false);
  const [aulaSelecionada, setAulaSelecionada] = useState<SlotForm>({
    id: null,
    turma_id: '1',
    disciplina_id: '',
    disciplina_nome: '',
    docente_id: '',
    docente_nome: '',
    sala_id: '7',
    sala_nome: '',
    dia_semana: '1',
    hora_inicio: '08:00',
    duracao: '90',
    color: '#3a87ad',
    tipo: 'T',
    juncao: false,
    curso_sigla: '',
    turma_nome: '',
    juncao_visivel: false,
  });

  // 
  // B. Hooks de obtenção de dados
  const { disciplinas, isLoadingDisciplinas } = useDisciplinas(horario.id);
  const { turmas, isLoadingTurmas } = useTurmas(horario.id);
  const { salas, isLoadingSalas } = useSalas();
  const { aulas, isLoadingAulas, mutateAulas } = useAulas(horario.id);
  const { aulas: aulasAnoSemestre } = useAulasAnoSemestre(horario.ano_lectivo_id, horario.semestre);

  //
  // C. Computação de dados

  // Para uma disciplina selecionada, computação de docentes com info de horas lecionadas
  const docentesDisciplina = useMemo(() => {
    if (!aulaSelecionada.disciplina_id || !disciplinas || !aulas) return [];

    const disciplinaSelecionada = disciplinas.find(
      (d: Disciplina) => d.id === parseInt(aulaSelecionada.disciplina_id)
    );

    if (!disciplinaSelecionada) return [];

    // Usa a função existente para calcular horas
    const disciplinasAtualizadas = atualizaDisciplinasHoras([disciplinaSelecionada], aulasAnoSemestre);

    // Retorna os docentes da disciplina atualizada
    return disciplinasAtualizadas[0]?.docentes || [];

  }, [aulaSelecionada.disciplina_id, disciplinas, aulasAnoSemestre, aulas]);


  //
  // D. Manipuladores de eventos (event handlers) 

  function openNewSlotModal(day: number, classId: number, startTime?: string) {
    setAulaSelecionada({
      id: null,
      turma_id: classId.toString(),
      disciplina_id: '',
      disciplina_nome: '',
      tipo: 'T',
      docente_id: '',
      docente_nome: '',
      sala_id: '7',
      sala_nome: '',
      dia_semana: day.toString(),
      hora_inicio: startTime || '08:00',
      duracao: '90',
      color: '#3a87ad',
      juncao: false,
      curso_sigla: '',
      turma_nome: '',
      juncao_visivel: false,
    });
    setModalOpen(true);
  }

  function openEditSlotModal(slot: Aula): void {

    //
    // A. Definição de estado
    setAulaSelecionada({
      id: slot.id,
      disciplina_id: slot.disciplina_id.toString(),
      disciplina_nome: slot.disciplina_nome,
      tipo: slot.tipo,
      docente_id: slot.docente_id.toString(),
      docente_nome: slot.docente_nome,
      sala_id: slot.sala_id.toString() || '7',
      sala_nome: slot.sala_nome,
      dia_semana: slot.dia_semana.toString(),
      turma_id: slot.turma_id.toString(),
      hora_inicio: slot.hora_inicio.toString().slice(0, -3),
      duracao: slot.duracao.toString(),
      color: gerarCorDisciplina(slot.disciplina_id),
      juncao: slot.juncao || false,
      curso_sigla: slot.curso_sigla || '',
      turma_nome: slot.turma_nome || '',
      juncao_visivel: slot.juncao_visivel || false,
    });
    setModalOpen(true);
  }

  // Handler para lidar com duplicação de aula
  function handleDuplicate() {
    // Cria uma nova aula baseada na atual, mas sem ID
    setAulaSelecionada(prev => ({
      ...prev,
      id: null  // Marca como nova aula
    }));
  }

  //
  // F. Lógica de renderização

  // Fallbacks primeiro...
  if (isLoadingDisciplinas) return <p className="text-gray-500">A carregar disciplinas...</p>;
  if (isLoadingTurmas) return <p className="text-gray-500">A carregar turmas...</p>;
  if (!turmas) return <p className="text-red-500">Erro ao carregar turmas.</p>;
  if (!disciplinas) return <p className="text-red-500">Erro ao carregar disciplinas.</p>;

  // render principal
  return (
    <section className="pt-3">
      <h3 className="mt-4 mb-2 text-2xl font-semibold">Marcação de Aulas</h3>
      <p className="pb-2 text-sm text-gray-500">
        Marque o horário semanal das aulas de cada turma, de acordo com as necessidades apresentadas nas tabelas em baixo.
      </p>

      <div className={styles.container} style={{ position: 'relative' }}>
        <CalendarGrid
          turmas={turmas}
          aulas={aulas}
          isLoadingAulas={isLoadingAulas}
          ano_lectivo_id={horario.ano_lectivo.id}
          semestre={horario.semestre}
          onSlotClick={openNewSlotModal}
          onSlotEdit={openEditSlotModal}
        />

        <AulaModal
          isOpen={modalOpen}
          setModalOpen={setModalOpen}
          aulaSelecionada={aulaSelecionada}
          disciplinas={disciplinas}
          docentesDisciplina={docentesDisciplina}
          turmas={turmas}
          salas={salas ?? []}
          isLoadingDisciplinas={isLoadingDisciplinas}
          isLoadingSalas={isLoadingSalas}
          horario={horario}
          setAulaSelecionada={setAulaSelecionada}
          mutateAulas={mutateAulas}
          handleDuplicate={handleDuplicate}
        />
      </div>

      <div className="mt-4 text-sm text-emerald-700">
        <details className="cursor-pointer">
          <summary className="font-bold">Notas sobre aulas em junção</summary>
          <ul className="ml-6 mt-2 list-disc space-y-1">
            <li>Aulas em junção são aulas em que estão presentes na mesma sala várias turmas.</li>
            <li>Uma das aulas deve estar sem junção, para ser contabilizada</li>
            <li>As restantes aulas devem ser marcadas em junção, e aparecem sem texto.</li>
            <li>Se quiser, tem a opção de mostrar o texto de uma aula em junção.</li>
            <li>Aulas em junção não são contabilizadas no número de horas lecionadas do docente.</li>
          </ul>
        </details>
      </div>

    </section>
  );
}
