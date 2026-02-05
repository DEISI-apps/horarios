import { useEffect, useRef, useState } from 'react';
import { AulaDocente, Aluno } from '@/types/interfaces';
import { calculateSlotPosition } from '@/lib/calendario';
import { MINUTE_HEIGHT } from '@/lib/constants';
import { gerarCorDisciplina, abreviarNomeDisciplina } from '@/lib/utils';
import styles from './CalendarioSemanalDocente.module.css';


interface TimeSlotProps {
  slot: AulaDocente;
}


export function formataTurmas(turmas: Map<string, string[]>): string {
  return Array.from(turmas.entries())
    .map(([curso, turmasList]) => {
      turmasList.sort((a, b) => a.localeCompare(b));
      return `${curso} ${turmasList.join(',')}`;
    })
    .join(', ');
}


export function extraiTurmas(turmas: Map<string, string[]>): string {

  const turmasLEI = turmas.get("LEI") ?? [];
  return turmasLEI.join(', ');
}


// Fetcher genérico para GET
const fetcher = (url: string) => fetch(url).then(res => res.json());

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


export default function TimeSlotDocente({ slot }: TimeSlotProps) {
  const top = calculateSlotPosition(slot.hora_inicio) + 2;
  const height = slot.duracao * MINUTE_HEIGHT - 4;
  const baseColor = gerarCorDisciplina(slot.disciplina_id);
  
  const [width, setWidth] = useState<number>(0);
  const slotRef = useRef<HTMLDivElement | null>(null);

  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [modalAberto, setModalAberto] = useState<boolean>(false);

  // Buscar lista de alunos do endpoint
  useEffect(() => {
    const turmasLEI = slot.turmas.get("LEI") ?? [];

    console.log("vou buscar alunos para as turmas:", turmasLEI);

    if (turmasLEI.length === 0) {
      setAlunos([]);
      return;
    }

    // Buscar alunos para cada turma
    const fetchAlunos = async () => {
      try {
        const todasAlunas: Aluno[] = [];

        for (const turma of turmasLEI) {
          const response = await fetcher(
            `https://horariosdeisi.pythonanywhere.com/turma-alunos/${slot.disciplina_id}/${turma}`
          );

          // A resposta é uma TurmaComAlunos
          if (response && response.alunos) {
            todasAlunas.push(...response.alunos);
          }

          // Adicionar alunos avulsos também, se existirem
          if (response && response.alunos_avulso) {
            todasAlunas.push(...response.alunos_avulso);
          }
        }

        setAlunos(todasAlunas);
      } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        setAlunos([]);
      }
    };

    fetchAlunos();
  }, [slot]);





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
    <div
      ref={slotRef}
      key={`slot-${slot.id}`}
      className={`${styles.slot} ${slot.tipo === 'T' ? styles.theoretical : styles.practical}`}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        backgroundColor: baseColor,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        textAlign: 'left',
        paddingLeft:'5px',
        lineHeight: '14px',
      }}
    >
      <div className={styles.slotTitle}>
        {abreviarNomeDisciplina(slot.disciplina_nome, slot.disciplina_nome_abreviado, width, slot.duracao)}
      </div>
      <div className={styles.slotDetails}  >
        {slot.tipo === 'T' ? 'Teórica' : 'Prática'} {slot.sala_nome !== 'sala?' ? ' - ' + slot.sala_nome : ''}
      </div>
      <div className={styles.slotDetails} style={{ fontSize: '8px' }}>
        {slot.tipo === 'T' ? slot.curso_sigla : formataTurmas(slot.turmas)}
      </div>
      <div className={styles.slotDetails} style={{ fontSize: '8px', marginLeft:'auto', marginRight:"5px" }}>
        {alunos.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>{alunos.length} alunos LEI</span>
            <button
              onClick={() => setModalAberto(true)}
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
        ) : (
          ''
        )}
      </div>

      {modalAberto && (
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
            zIndex: 1000,
          }}
          onClick={() => setModalAberto(false)}
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
              <h2 style={{ margin: 0 }}>Alunos LEI ({alunos.length})</h2>
              <button
                onClick={() => setModalAberto(false)}
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
                Turma: {slot.turma_nome} • {getNomeDia(slot.dia_semana)}, {formatarHorario(slot.hora_inicio, slot.duracao)}
              </div>
              <div style={{ color: '#666', marginTop: '4px' }}>
                Professor: {slot.docente_nome}
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
        </div>
      )}
    </div>
  );
}
