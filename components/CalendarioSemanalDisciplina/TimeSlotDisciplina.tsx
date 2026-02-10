import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AulaDisciplina, Aluno } from '@/types/interfaces';
import { calculateSlotPosition } from '@/lib/calendario';
import { MINUTE_HEIGHT } from '@/lib/constants';
import { gerarCorDisciplina } from '@/lib/utils';
import styles from './CalendarioSemanalDisciplina.module.css';
import { useSession } from 'next-auth/react';

interface TimeSlotProps {
  slot: AulaDisciplina;
  showAlunos?: boolean;
}

function formataTurmas(turmas: Map<string, string[]>): string {
  return Array.from(turmas.entries())
    .map(([curso, turmasList]) => {
      turmasList.sort((a, b) => a.localeCompare(b));
      return `${curso} ${turmasList.join(',')}`;
    })
    .join(', ');
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

export default function TimeSlotDisciplina({ slot, showAlunos = true }: TimeSlotProps) {
  const top = calculateSlotPosition(slot.hora_inicio) + 2;
  const height = slot.duracao * MINUTE_HEIGHT - 4;
  const baseColor = gerarCorDisciplina(slot.disciplina_id);

  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [modalAberto, setModalAberto] = useState<boolean>(false);

  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;
  
  if (role === "docente") {
    showAlunos = true;
  } else {
    showAlunos = false;
  }

  // Buscar lista de alunos do endpoint
  useEffect(() => {
    if (!showAlunos) {
      setModalAberto(false);
      setAlunos([]);
      return;
    }

    // Coletar todas as turmas LEI de todos os docentes
    const todasTurmasLEI = new Set<string>();
    slot.docentes.forEach(docente => {
      const turmasLEI = docente.turmas.get("LEI") ?? [];
      turmasLEI.forEach(turma => todasTurmasLEI.add(turma));
    });

    const turmasArray = Array.from(todasTurmasLEI);

    if (turmasArray.length === 0) {
      setAlunos([]);
      return;
    }

    // Buscar alunos para cada turma
    const fetchAlunos = async () => {
      try {
        const todasAlunas: Aluno[] = [];

        for (const turma of turmasArray) {
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
  }, [slot, showAlunos]);

  return (
    <div
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
        paddingLeft: '5px',
        lineHeight: '14px',
      }}
    >
      {slot.docentes.map((docente) => (
        <div key={`docente-${docente.id}`} className="leading-tight"> 
          <div className={`${styles.slotDocente}`} style={{ fontWeight: 'bold' }}>
            {docente.docente_nome}
          </div>
          <div className={`${styles.slotDetails} ${styles.slotDisciplinaDocenteDetails}`}>
            {docente.sala_nome !== 'outra' ?  docente.sala_nome  : ''}
            
            <span className="pl-2" style={{ fontWeight: 'normal' }}>
              ({docente.tipo === 'T' ? 'Teórica' : formataTurmas(docente.turmas)})
            </span> 
          </div>
        </div>
      ))}

      {showAlunos && alunos.length > 0 && (
        <div className={styles.slotDetails} style={{ fontSize: '8px', marginLeft: 'auto', marginRight: '5px', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>{alunos.length} alunos LEI</span>
            <button
              onClick={() => {
                setModalAberto(true);
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

      {showAlunos && modalAberto && createPortal(
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
              {/* <div><strong>{slot.disciplina_nome}</strong></div> */}
              <div style={{ color: '#666', marginTop: '4px' }}>
                {getNomeDia(slot.dia_semana)}, {formatarHorario(slot.hora_inicio, slot.duracao)}
              </div>
              <div style={{ color: '#666', marginTop: '4px' }}>
                Docentes: {slot.docentes.map(d => d.docente_nome).join(', ')}
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
    </div>
  );

}
