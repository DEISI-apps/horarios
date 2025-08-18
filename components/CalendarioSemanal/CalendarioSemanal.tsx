'use client';

import { useState, useMemo } from 'react';
import { useDisciplinas } from '@/hooks/useDisciplinas';
import { useTurmas } from '@/hooks/useTurmas';
import { useSalas } from '@/hooks/useSalas';
import { useAulas } from '@/hooks/useAulas';
import {
  SlotForm,
  Disciplina,
  Aula,
} from "@/types/interfaces";
import { gerarCorDisciplina, atualizaDisciplinasHoras } from '@/lib/utils';
import CalendarGrid from './CalendarioGrid';
import AulaModal from './AulaModal';
import styles from './CalendarioSemanal.module.css';

export default function CalendarioSemanal({ horario_id }: { horario_id: number }) {

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
  });

  // 
  // B. Hooks de obtenção de dados
  const { disciplinas, isLoadingDisciplinas } = useDisciplinas(horario_id);
  const { turmas, isLoadingTurmas } = useTurmas(horario_id);
  const { salas, isLoadingSalas } = useSalas();
  const { aulas, isLoadingAulas, mutateAulas } = useAulas(horario_id);

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
    const disciplinasAtualizadas = atualizaDisciplinasHoras([disciplinaSelecionada], aulas);

    // Retorna os docentes da disciplina atualizada
    return disciplinasAtualizadas[0]?.docentes || [];

  }, [aulaSelecionada.disciplina_id, disciplinas, aulas]);


  //
  // D. Manipuladores de eventos (event handlers) 

  const openNewSlotModal = (day: number, classId: number, startTime?: string) => {
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
    });
    setModalOpen(true);
  };

  const openEditSlotModal = (slot: Aula): void => {

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
    });
    setModalOpen(true);
  };


  //
  // F. Lógica de renderização

  // Fallbacks primeiro...
  if (isLoadingDisciplinas) return <p className="text-gray-500">A carregar disciplinas...</p>;
  if (isLoadingTurmas) return <p className="text-gray-500">A carregar turmas...</p>;
  if (!turmas) return <p className="text-red-500">Erro ao carregar turmas.</p>;
  if (!disciplinas) return <p className="text-red-500">Erro ao carregar disciplinas.</p>;

  // render principal
  return (
    <section className="pt-8">
      <h3 className="mt-4 mb-2 text-lg font-semibold">Marcação de Aulas</h3>
      <p className="pb-4 text-sm text-gray-500">
        Marque o horário semanal das aulas de cada turma, de acordo com as necessidades listadas em baixo.
      </p>

      <div className="pb-4 text-sm text-gray-500">
        <details className="cursor-pointer">
          <summary className="font-bold">Nota sobre aulas em junção</summary>
          <ul className="ml-6 mt-2 list-disc space-y-1 text-green-500">
            <li>Aulas em junção são aulas em que estão presentes na mesma sala várias turmas.</li>
            <li>Uma das aulas deve estar sem junção, para ser contabilizada</li>
            <li>As restantes aulas devem ser marcadas em junção, e aparecem a tracejado e sem detalhes.</li>
            <li>Aulas em junção não são contabilizadas no número de horas lecionadas do docente.</li>
          </ul>
        </details>
      </div>

      <div className={styles.container}>
        <div className={styles.calendarWrapper}>
          <CalendarGrid
        turmas={turmas}
        aulas={aulas}
        isLoadingAulas={isLoadingAulas}
        onSlotClick={openNewSlotModal}
        onSlotEdit={openEditSlotModal}
          />
        </div>

        <AulaModal
          isOpen={modalOpen}
          setModalOpen={setModalOpen}
          aulaSelecionada={aulaSelecionada}
          disciplinas={disciplinas}
          docentesDisciplina={docentesDisciplina}
          turmas={turmas}
          salas={salas}
          isLoadingDisciplinas={isLoadingDisciplinas}
          isLoadingSalas={isLoadingSalas}
          horario_id={horario_id}
          setAulaSelecionada={setAulaSelecionada}
          mutateAulas={mutateAulas}
        />
      </div>
    </section>
  );
}
