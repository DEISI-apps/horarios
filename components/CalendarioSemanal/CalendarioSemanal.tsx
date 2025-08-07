'use client';

import { useState, useEffect } from 'react';
import { useDisciplinas } from '@/hooks/useDisciplinas';
import { useTurmas } from '@/hooks/useTurmas';
import { useSalas } from '@/hooks/useSalas';
import { useAulas } from '@/hooks/useAulas';

import styles from './CalendarioSemanal.module.css';


type TurmaType = {
  id: number;
  nome: string;
};

type SalaType = {
  id: number;
  nome: string;
};


interface Disciplina {
  id: number;
  nome: string;
  docentes: {
    id: number;
    nome: string;
    horas_teoricas: number;
    horas_praticas: number;
  }[];
}

interface AulaIn {
  horario_id: number;
  turma_id: number;
  disciplina_id: number;
  tipo: string;
  docente_id: number;
  sala_id: number;
  dia_semana: number;
  hora_inicio: string; // Formato "HH:MM"
  duracao: number;
  cor: string;
}

interface Aula extends AulaIn {
  id: number;
  disciplina_nome: string;
  docente_nome: string;
  sala_nome: string;
}

interface SlotForm {
  id: number | null;
  turma_id: string;
  disciplina_id: string;
  disciplina_nome: string;
  docente_id: string;
  docente_nome: string;
  sala_id: string;
  sala_nome: string;
  dia_semana: string;
  hora_inicio: string;
  duracao: string;
  color: string;
  type: string;
}

interface AulaAPI {
  id: number;
  horario_id: number;
  turma_id: number;
  disciplina_id: number;
  disciplina: string;
  docente_id: number;
  docente: string;
  sala_id: number;
  sala: string;
  tipo: string;
  dia_semana: number;
  hora_inicio: string;
  duracao: number;
  cor: string;
}

//
// Gerar cor simples para cada disciplina
const gerarCorDisciplina = (id: number) => {
  const hue = (id * 137) % 360; // 137 é um número primo para dispersar cores
  return `hsl(${hue}, 80%, 80%)`;
};


export default function CalendarioSemanal ({ horario_id }: { horario_id: number }){

  //
  // A. Gestão de estados do componente
//  const [aulas, setAulas] = useState<Aula[]>([]);
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
    type: 'T',
  });


  const [docentesDisciplina, setDocentesDisciplina] = useState<Disciplina['docentes']>([]);
  const [loadingSaving, setLoadingSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //
  // A.2. Variáveis de configuração do calendário
  const HOUR_HEIGHT = 60;
  const MINUTE_HEIGHT = HOUR_HEIGHT / 60;
  const START_HOUR = 8;
  const END_HOUR = 24;
  const TOTAL_HOURS = END_HOUR - START_HOUR;
  const CALENDAR_HEIGHT = TOTAL_HOURS * HOUR_HEIGHT;

  const DAYS = [
    { id: 1, name: 'Segunda' },
    { id: 2, name: 'Terça' },
    { id: 3, name: 'Quarta' },
    { id: 4, name: 'Quinta' },
    { id: 5, name: 'Sexta' }
  ];


  //
  // B. Obtenção de dados da API usando SWR

  const { disciplinas, isLoadingDisciplinas, errorDisciplinas } = useDisciplinas(horario_id);
  const { turmas, isLoadingTurmas, errorTurmas } = useTurmas(horario_id);
  const { salas, isLoadingSalas, errorSalas } = useSalas();
  const { aulas, isLoadingAulas, errorAulas, mutateAulas } = useAulas(horario_id);



  // Converter aula da API para Aula
  const convertAulaToSlot = (aula: AulaAPI): Aula => {
      return {
      id: aula.id,
      horario_id: aula.horario_id,
      turma_id: aula.turma_id,
      disciplina_id: aula.disciplina_id,
      disciplina_nome: aula.disciplina,
      docente_id: aula.docente_id,
      docente_nome: aula.docente,
      sala_id: aula.sala_id || 7,
      sala_nome: aula.sala,
      tipo: aula.tipo,
      dia_semana: aula.dia_semana,
      hora_inicio: aula.hora_inicio,
      duracao: aula.duracao,
      cor: gerarCorDisciplina(aula.disciplina_id),
    };
  };


  // C. Efeitos colaterais para carregar dados iniciais
  
  // Atualizar lista de docentes quando a disciplina mudar
  useEffect(() => {
    if (aulaSelecionada.disciplina_id) {
      const disciplinaSelecionada = disciplinas.find(
        (d: Disciplina) => d.id === parseInt(aulaSelecionada.disciplina_id)
      );
      if (disciplinaSelecionada) {
        setDocentesDisciplina(disciplinaSelecionada.docentes);
        setAulaSelecionada(prev => ({
          ...prev,
          docente_id: '',
          docente_nome: '',
          type: 'T'
        }));
      }
    } else {
        setDocentesDisciplina(prev =>
          prev.length === 0 ? prev : []
        );
    }
  }, [aulaSelecionada.disciplina_id, disciplinas]);


 
  const calculateSlotPosition = (startTime: string): number => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = (hours - START_HOUR) * 60 + minutes;
    return totalMinutes * MINUTE_HEIGHT;
  };

  const renderSlotsForDayAndClass = (dayId: number, classId: number) => {
    if (isLoadingAulas) return <div>A carregar aulas...</div>;
    
    return aulas
      .filter((slot:Aula) => slot.dia_semana === dayId && slot.turma_id === classId)
      .map((slot:Aula) => {
        const top = calculateSlotPosition(slot.hora_inicio);
        const height = slot.duracao * MINUTE_HEIGHT;
        
        return (
          <div
            key={`slot-${slot.id}`}
            className={styles.slot}
            style={{
              top: `${top}px`,
              height: `${height}px`,
              backgroundColor: gerarCorDisciplina(slot.disciplina_id),
              display:'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onClick={(e) => {
              e.stopPropagation();
              openEditSlotModal(slot);
            }}
          >
            <div className={styles.slotTitle}>{
              slot.disciplina_nome
              .split(" ")
              .map(palavra => palavra.length > 4 ? palavra.slice(0, 4) + '.' : palavra)
              .join(" ")
          }</div>
            <div className={styles.slotDetails}>{slot.tipo === 'T' ? 'Teórica' : 'Prática'} - {slot.sala_nome}</div>
            <div className={`${styles.slotDetails} pt-2`}>
              {slot.docente_nome}
            </div>
          </div>
        );
      });
  };

  const generateTimeMarkers = () => {
    const markers = [];
    for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
      markers.push(
        <div 
          key={`full-${hour}`}
          className={styles.timeMarker}
          style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT}px` }}
        >
          {`${hour.toString().padStart(2, '0')}:00`}
        </div>
      );
      
      if (hour < END_HOUR) {
        markers.push(
          <div 
            key={`half-${hour}`}
            className={`${styles.timeMarker} ${styles.halfHour}`}
            style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT + (HOUR_HEIGHT / 2)}px` }}
          >
            {`${hour.toString().padStart(2, '0')}:30`}
          </div>
        );
      }
    }
    return markers;
  };

  const openNewSlotModal = (day: number, classId: number, startTime?: string) => {
    setAulaSelecionada({
      id: null,
      turma_id: classId.toString(),
      disciplina_id: '',
      disciplina_nome: '',
      type: 'T',
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
      type: slot.tipo,
      docente_id: slot.docente_id.toString(),
      docente_nome: slot.docente_nome,
      sala_id: slot.sala_id.toString() || '7',
      sala_nome: slot.sala_nome,
      dia_semana: slot.dia_semana.toString(),
      turma_id: slot.turma_id.toString(),
      hora_inicio: slot.hora_inicio,
      duracao: slot.duracao.toString(),
      color: gerarCorDisciplina(slot.disciplina_id),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Se for seleção de disciplina, atualiza a disciplina
    if (name === 'disciplina_id') {
      const disciplina = disciplinas.find(d => d.id === parseInt(value));

      setAulaSelecionada(prev => ({
        ...prev,
        disciplina_id: value,
        disciplina_nome: disciplina?.nome || ''
      }));
    } 

    // Se for seleção de docente, atualiza o docente
    else if (name === 'docente_id') {
      console.log('Docente selecionado:', value);
      const docente = docentesDisciplina.find(d => d.id === parseInt(value));
      setAulaSelecionada(prev => ({
        ...prev,
        docente_id: value,
        docente_nome: docente?.nome || ''
      }));
    }

    // Se for seleção de turma, atualiza a turma
    else if (name === 'turma_id') {
      console.log('Turma selecionada:', value);
      // Encontrar a turma correspondente
      const turma = turmas.find((t: TurmaType) => t.id === parseInt(value));
      console.log('Turma selecionada:', turma);
      setAulaSelecionada(prev => ({
        ...prev,
        turma_id: value,
        turma_nome: turma?.nome || ''
      }));
    }

    else {
      setAulaSelecionada(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const saveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSaving(true);
    setError(null);

    try {
      const aulaData: AulaIn = {
        horario_id: horario_id,
        disciplina_id: parseInt(aulaSelecionada.disciplina_id),
        docente_id: parseInt(aulaSelecionada.docente_id),
        turma_id: parseInt(aulaSelecionada.turma_id),
        sala_id: parseInt(aulaSelecionada.sala_id),
        tipo: aulaSelecionada.type,
        dia_semana: parseInt(aulaSelecionada.dia_semana),
        hora_inicio: aulaSelecionada.hora_inicio,
        duracao: parseInt(aulaSelecionada.duracao),
        cor: gerarCorDisciplina(parseInt(aulaSelecionada.disciplina_id)),
      };

      // Se for uma nova aula, faz POST, caso contrário, PUT
      const method = aulaSelecionada.id ? 'PUT' : 'POST';
      const url = aulaSelecionada.id
        ? `https://dsdeisi.pythonanywhere.com/api/horarios/aulas/${aulaSelecionada.id}`
        : 'https://dsdeisi.pythonanywhere.com/api/horarios/aulas';


      const response = await fetch(url, {
        method:  method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aulaData)
      });

      if (!response.ok) {
        throw new Error('Erro ao gravar aula');
      }

      const savedAula = await response.json();

      await mutateAulas();

      closeModal();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gravar aula');
      console.error(err);
    } finally {
      setLoadingSaving(false);
    }
  };

  const deleteSlot = async () => {
    if (!aulaSelecionada.id) return;

    setLoadingSaving(true);
    setError(null);

    try {
      const response = await fetch(`https://dsdeisi.pythonanywhere.com/api/horarios/aulas/${aulaSelecionada.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir aula');
      }

      await mutateAulas();

      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir aula');
      console.error(err);
    } finally {
      setLoadingSaving(false);
    }
  };

  const handleClassSlotClick = (day: number, classId: number, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const clickedMinutes = Math.round(clickY / MINUTE_HEIGHT);
    const snappedMinutes = Math.floor(clickedMinutes / 30) * 30;
    const hours = START_HOUR + Math.floor(snappedMinutes / 60);
    const minutes = snappedMinutes % 60;
    const startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    openNewSlotModal(day, classId, startTime);
  };

  return (
    <div className={styles.container}>
      <div className={styles.calendarWrapper}>
        <div className={styles.calendarContainer}>
          <div className={styles.calendarHeader}>
            <div className={styles.timeColumn}></div>
            {DAYS.map(day => (
              <div key={`day-${day.id}`} className={styles.dayHeader}>
                <div className={styles.dayName}>{day.name}</div>
                <div className={styles.classColumns}>
                  {turmas.map((turma: TurmaType) => (
                    <div
                      key={`class-${day.id}-${turma.id}`}
                      className={styles.classColumn}
                       onClick={(e) => handleClassSlotClick(day.id, turma.id, e)}
                    >
                      Turma {turma.nome}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className={styles.calendarBody}>
            <div 
              className={styles.timeSlots} 
              style={{ height: `${CALENDAR_HEIGHT}px` }}
            >
              {generateTimeMarkers()}
            </div>
            
            <div 
              className={styles.daysContainer} 
              style={{ height: `${CALENDAR_HEIGHT}px` }}
            >
              {DAYS.map(day => (
                <div key={`day-${day.id}`} className={styles.dayColumn}>
                  {turmas.map((turma: TurmaType) => (
                    <div
                      key={`slot-${day.id}-${turma.id}`}
                      className={styles.classSlotColumn}
                      onClick={(e) => handleClassSlotClick(day.id, turma.id, e)}
                    >
                      {renderSlotsForDayAndClass(day.id, turma.id)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {modalOpen && (
        <div className={styles.modal} onClick={() => setModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{aulaSelecionada.id ? 'Editar Aula' : 'Nova Aula'}</h3>
              <button onClick={() => setModalOpen(false)}>&times;</button>
            </div>
            
            <form onSubmit={saveSlot}>

              <div className={styles.formGroup}>
                <label htmlFor="slot-turma">Turma</label>
                <select
                  id="slot-turma"
                  name="turma_id"
                  value={aulaSelecionada.turma_id}
                  onChange={handleInputChange}
                  required
                >
                  {turmas.map((turma: TurmaType) => (
                    <option key={turma.id} value={turma.id}>
                      {turma.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="slot-disciplina-id">Disciplina</label>
                <select
                  id="slot-disciplina-id"
                  name="disciplina_id"
                  value={aulaSelecionada.disciplina_id}
                  onChange={handleInputChange}
                  required
                  disabled={isLoadingDisciplinas}
                >
                  <option value="">Selecione uma disciplina</option>
                  {disciplinas.map(disciplina => (
                    <option key={disciplina.id} value={disciplina.id}>
                      {disciplina.nome}
                    </option>
                  ))}
                </select>
                {isLoadingDisciplinas && <span>Carregando disciplinas...</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="slot-type">Tipo de aula</label>
                <select
                  id="slot-type"
                  name="type"
                  value={aulaSelecionada.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="T">Teórica</option>
                  <option value="P">Prática</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="slot-docente-id">Professor</label>
                <select
                  id="slot-docente-id"
                  name="docente_id"
                  value={aulaSelecionada.docente_id}
                  onChange={handleInputChange}
                  required
                  disabled={!aulaSelecionada.disciplina_id || docentesDisciplina.length === 0}
                >
                  <option value="">Selecione um professor</option>
                  {docentesDisciplina.map(docente => (
                    <option key={docente.id} value={docente.id}>
                      {docente.nome}
                    </option>
                  ))}
                </select>
                {aulaSelecionada.disciplina_id && docentesDisciplina.length === 0 && (
                  <span>Nenhum professor disponível para esta disciplina</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="slot-sala">Sala</label>
                <select
                  id="slot-sala-id"
                  name="sala_id"
                  value={aulaSelecionada.sala_id}
                  onChange={handleInputChange}
                  required
                  disabled={isLoadingSalas}
                >
                  <option key="7" value="7">Não é lab DEISI Hub</option>
                  {salas.map(sala => (
                    <option key={sala.id} value={sala.id}>
                      {sala.nome}
                    </option>
                  ))}
                </select>
                {isLoadingSalas && <span>Carregando salas...</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="slot-dia-semana">Dia da semana</label>
                <select
                  id="slot-dia-semana"
                  name="dia_semana"
                  value={aulaSelecionada.dia_semana}
                  onChange={handleInputChange}
                  required
                >
                  {DAYS.map(day => (
                    <option key={day.id} value={day.id}>
                      {day.name}-feira
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="slot-hora-inicio">Hora de início</label>
                <select
                  id="slot-hora-inicio"
                  name="hora_inicio"
                  value={aulaSelecionada.hora_inicio}
                  onChange={handleInputChange}
                  required
                >
                  {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => {
                    const hour = START_HOUR + i;
                    return [
                      <option key={`${hour}:00`} value={`${hour.toString().padStart(2, '0')}:00`}>
                        {`${hour.toString().padStart(2, '0')}:00`}
                      </option>,
                      <option key={`${hour}:30`} value={`${hour.toString().padStart(2, '0')}:30`}>
                        {`${hour.toString().padStart(2, '0')}:30`}
                      </option>
                    ];
                  })}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="slot-duracao">Duração (minutos)</label>
                <select
                  id="slot-duracao"
                  name="duracao"
                  value={aulaSelecionada.duracao}
                  onChange={handleInputChange}
                  required
                >
                  <option value="60">1 hora</option>
                  <option value="90">1 hora e 30 minutos</option>
                  <option value="120">2 horas</option>
                  <option value="150">2 horas e 30 minutos</option>
                  <option value="180">3 horas</option>
                  <option value="210">3 horas e 30 minutos</option>
                  <option value="240">4 horas</option>
                </select>
              </div>

              {error && (
                <div className={styles.errorMessage}>
                  {error}
                </div>
              )}

              <div className={styles.formActions}>
                <button 
                  type="button" 
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={() => setModalOpen(false)}
                  disabled={loadingSaving}
                >
                  Cancelar
                </button>
                {aulaSelecionada.id && (
                  <button 
                    type="button" 
                    className={`${styles.btn} ${styles.btnDanger}`}
                    onClick={deleteSlot}
                    disabled={loadingSaving}
                  >
                    {loadingSaving ? 'Excluindo...' : 'Excluir'}
                  </button>
                )}
                <button 
                  type="submit" 
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  disabled={loadingSaving}
                >
                  {loadingSaving ? 'Gravando...' : 'Gravar'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};
