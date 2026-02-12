import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Aula, Aluno } from '@/types/interfaces';
import { calculateSlotPosition } from '@/lib/calendario';
import { MINUTE_HEIGHT } from '@/lib/constants';
import { gerarCorDisciplina, abreviarNomeDisciplina } from '@/lib/utils';
import styles from './CalendarioSemanalSala.module.css';

interface TimeSlotProps {
  slot: Aula;
}

// Converter dia da semana (0-6) para nome em português
function getNomeDia(diaSemana: number): string {
  const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return dias[diaSemana] || 'Desconhecido';
}

// Formatar horário (hora_inicio + duracao)
function formatarHorario(horaInicio: string, duracao: number): string {
  const [horas, minutos] = horaInicio.split(':').map(Number);
  const totalMinutos = horas * 60 + minutos + duracao;
  const horaFim = Math.floor(totalMinutos / 60);
  const minutoFim = totalMinutos % 60;
  
  const horaInicioFormatada = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
  const horaFimFormatada = `${String(horaFim).padStart(2, '0')}:${String(minutoFim).padStart(2, '0')}`;
  
  return `${horaInicioFormatada}-${horaFimFormatada}`;
}

// Fetcher genérico para GET
const fetcher = (url: string) => fetch(url).then(res => res.json());


export default function TimeSlotDisciplina({ slot }: TimeSlotProps) {
  const top = calculateSlotPosition(slot.hora_inicio) + 2;
  const height = slot.duracao * MINUTE_HEIGHT - 2;
  const baseColor = gerarCorDisciplina(slot.disciplina_id);

  const [width, setWidth] = useState<number>(0);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [isModalAlunosOpen, setModalAlunosOpen] = useState(false);
  const slotRef = useRef<HTMLDivElement | null>(null);

  // Buscar lista de alunos do endpoint
  useEffect(() => {
    const fetchAlunos = async () => {
      try {
        const response = await fetcher(
          `https://horariosdeisi.pythonanywhere.com/turma-alunos/${slot.disciplina_id}/${slot.turma_nome}`
        );

        if (response) {
          const todosAlunos = [
            ...(response.alunos || []),
            ...(response.alunos_avulso || [])
          ];

          setAlunos(todosAlunos);
        } else {
          setAlunos([]);
        }

      } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        setAlunos([]);
      }
    };

    if (slot.turma_nome) {
      fetchAlunos();
    }
  }, [slot.disciplina_id, slot.turma_nome]);
  // observar largura do slot dinamicamente
  useEffect(() => {
    if (!slotRef.current || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });

    observer.observe(slotRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
    <div
      ref={slotRef}
      key={`slot-${slot.id}`}
      className={styles.slot}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        backgroundColor: baseColor,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        textAlign: 'left',
        border: '1px solid white',
      }}
    >
      <div className={styles.slotTitle}>
        {abreviarNomeDisciplina(slot.disciplina_nome, slot.disciplina_nome_abreviado, width, slot.duracao)}
      </div>
      <div className={`${styles.slotDetails}`}>
        {slot.tipo}
        {slot.turma_nome}
        {slot.sala_nome !== 'sala?' ? ', ' + slot.sala_nome : ''}
      </div>
      <div className={`${styles.slotDocente}`} style={{ fontWeight: 'bold' }}>
        {slot.docente_nome}
      </div>

      {alunos.length > 0 && (
        <div style={{ fontSize: '8px', marginLeft: 'auto', marginRight: '5px', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>{alunos.length} alunos</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setModalAlunosOpen(true);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '10px',
                fontWeight: 'bold',
                color: 'inherit',
                padding: '0',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255,255,255,0.3)',
              }}
              title="Ver lista de alunos"
            >
              i
            </button>
          </div>
        </div>
      )}
    </div>

    {isModalAlunosOpen && createPortal(
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
        }}
        onClick={() => setModalAlunosOpen(false)}
      >
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0 }}>Alunos ({alunos.length})</h2>
            <button
              onClick={() => setModalAlunosOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666',
              }}
            >
              ×
            </button>
          </div>

          <div style={{ backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
            <div><strong>{slot.disciplina_nome}</strong></div>
            <div style={{ color: '#666', marginTop: '4px' }}>
              Sala: {slot.sala_nome}
            </div>
            <div style={{ color: '#666', marginTop: '4px' }}>
              Turma: {slot.turma_nome}
            </div>
            <div style={{ color: '#666', marginTop: '4px' }}>
              {getNomeDia(slot.dia_semana)}, {formatarHorario(slot.hora_inicio, slot.duracao)}
            </div>
            <div style={{ color: '#666', marginTop: '4px' }}>
              Docente: {slot.docente_nome}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 1fr 1.5fr', gap: '12px', marginBottom: '12px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#666' }}>#</div>
            <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#666' }}>Nome</div>
            <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#666' }}>Número</div>
            <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#666' }}>Email</div>
          </div>

          <div style={{ borderTop: '1px solid #eee', paddingTop: '8px' }}>
            {alunos.map((aluno, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '50px 1fr 1fr 1.5fr', gap: '12px', paddingBottom: '8px', marginBottom: '8px', borderBottom: idx < alunos.length - 1 ? '1px solid #f0f0f0' : 'none', fontSize: '13px' }}>
                <div style={{ fontWeight: 'bold', color: '#999' }}>{idx + 1}</div>
                <div>{aluno.nome}</div>
                <div>{aluno.numero}</div>
                <div style={{ wordBreak: 'break-all' }}>{aluno.email}</div>
              </div>
            ))}
          </div>
        </div>
      </div>,
      document.body
    )}
    </>
  );
}
