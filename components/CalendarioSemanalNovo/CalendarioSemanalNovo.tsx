'use client';

import { useState, useEffect, useMemo } from 'react';
import { useDisciplinas } from '@/hooks/useDisciplinas';
import { useTurmas } from '@/hooks/useTurmas';
import { useSalas } from '@/hooks/useSalas';
import { useAulas } from '@/hooks/useAulas';
import { 
  SlotForm,
  Disciplina,
  DisciplinaHoras,
  Aula,
  AulaIn,
} from "@/types/interfaces"; 
import { gerarCorDisciplina, atualizaDisciplinasHoras } from '@/lib/utils';
import { saveAula, deleteAula } from '@/lib/api/aulas';
import CalendarGrid from './CalendarioGrid';
import AulaModal from './AulaModal';
import styles from './CalendarioSemanal.module.css';

export default function CalendarioSemanal({ horario_id }: { horario_id: number }) {
  // Estados do componente
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
  });
  
  // Hooks para obtenção de dados
  const { disciplinas, isLoadingDisciplinas } = useDisciplinas(horario_id);
  const { turmas } = useTurmas(horario_id);
  const { salas, isLoadingSalas } = useSalas();
  const { aulas, isLoadingAulas, mutateAulas } = useAulas(horario_id);

  // Computação de disciplinasHoras
  const disciplinasHoras: DisciplinaHoras[] = useMemo(() => {
    if (!disciplinas || !Array.isArray(disciplinas) || !aulas || !Array.isArray(aulas)) return [];
    return atualizaDisciplinasHoras(disciplinas, aulas);
  }, [disciplinas, aulas]);

  // Computação de docentes da disciplina selecionada
  const docentesDisciplina = useMemo(() => {
    if (!aulaSelecionada.disciplina_id || !disciplinas || !aulas) return [];
    
    const disciplinaSelecionada = disciplinas.find(
      (d: Disciplina) => d.id === parseInt(aulaSelecionada.disciplina_id)
    );
    
    if (!disciplinaSelecionada) return [];

    return disciplinaSelecionada.docentes.map((docente) => {
      const aulasDaDisciplina = aulas.filter((aula) => aula.disciplina_id === disciplinaSelecionada.id);
      const aulasDoDocente = aulasDaDisciplina.filter((aula) => aula.docente_id === docente.id);
      const horasTeoricasDocente = aulasDoDocente.filter((aula) => aula.tipo === 'T').reduce((total, aula) => total + aula.duracao/60, 0);
      const horasPraticasDocente = aulasDoDocente.filter((aula) => aula.tipo === 'P').reduce((total, aula) => total + aula.duracao/60, 0);

      return {
        ...docente,
        horas_teoricas_lecionadas: horasTeoricasDocente,
        horas_praticas_lecionadas: horasPraticasDocente,
      };
    });
  }, [aulaSelecionada.disciplina_id, disciplinas, aulas]);

  // Abrir modal quando aula é selecionada
  useEffect(() => {
    if (aulaSelecionada.id) {
      setModalOpen(true);
    }
  }, [aulaSelecionada]);

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
    });
    setModalOpen(true);
  };

  const openEditSlotModal = (slot: Aula): void => {
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
    });
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'disciplina_id') {
      const disciplina = disciplinas.find((d: Disciplina) => d.id === parseInt(value));
      setAulaSelecionada(prev => ({
        ...prev,
        disciplina_id: value,
        disciplina_nome: disciplina?.nome || ''
      }));
    } else if (name === 'docente_id') {
      const docente = docentesDisciplina.find(d => d.id === parseInt(value));
      setAulaSelecionada(prev => ({
        ...prev,
        docente_id: value,
        docente_nome: docente?.nome || ''
      }));
    } else if (name === 'turma_id') {
      const turma = turmas.find((t) => t.id === parseInt(value));
      setAulaSelecionada(prev => ({
        ...prev,
        turma_id: value,
        turma_nome: turma?.nome || ''
      }));
    } else if (name === 'tipo') {
      setAulaSelecionada(prev => ({
        ...prev,
        tipo: value
      }));
    } else {
      setAulaSelecionada(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSaveAula = async (aulaData: AulaIn) => {
    await saveAula(aulaData, aulaSelecionada.id);
    await mutateAulas();
  };

  const handleDeleteAula = async () => {
    if (!aulaSelecionada.id) return;
    await deleteAula(aulaSelecionada.id);
    await mutateAulas();
  };

  return (
    <section className="pt-8">
      <h3 className="mt-4 mb-2 text-lg font-normal">Marcação de Aulas</h3>
      <p className="pb-4">
        Marque o horário semanal das aulas de cada turma, de acordo com as necessidades listadas em baixo.
      </p>
      
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
          aulaSelecionada={aulaSelecionada}
          disciplinas={disciplinas}
          docentesDisciplina={docentesDisciplina}
          turmas={turmas}
          salas={salas}
          isLoadingDisciplinas={isLoadingDisciplinas}
          isLoadingSalas={isLoadingSalas}
          horario_id={horario_id}
          onClose={closeModal}
          onInputChange={handleInputChange}
          onSave={handleSaveAula}
          onDelete={handleDeleteAula}
        />
      </div>
    </section>
  );
}
