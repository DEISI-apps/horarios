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

const fetcher = (url: string) => fetch(url).then(res => res.json());

function getNomeDia(diaSemana: number): string {
  const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return dias[diaSemana] || 'Desconhecido';
}

function formatarHorario(horaInicio: string, duracao: number): string {
  const [horas, minutos] = horaInicio.split(':').map(Number);
  const totalMinutos = horas * 60 + minutos + duracao;
  const horaFim = Math.floor(totalMinutos / 60);
  const minutoFim = totalMinutos % 60;

  return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')} - 
          ${String(horaFim).padStart(2, '0')}:${String(minutoFim).padStart(2, '0')}`;
}

export default function TimeSlotDisciplina({ slot, showAlunos = true }: TimeSlotProps) {
  const top = calculateSlotPosition(slot.hora_inicio) + 2;
  const height = slot.duracao * MINUTE_HEIGHT - 4;
  const baseColor = gerarCorDisciplina(slot.disciplina_id);

  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;
  const podeVerAlunos = role === "docente";

  const [alunosPorDocente, setAlunosPorDocente] = useState<Record<number, Aluno[]>>({});
  const [modalAberto, setModalAberto] = useState(false);
  const [docenteSelecionado, setDocenteSelecionado] = useState<number | null>(null);

  useEffect(() => {
    if (!podeVerAlunos || !showAlunos) {
      setAlunosPorDocente({});
      setModalAberto(false);
      return;
    }

    const fetchAlunos = async () => {
      try {
        const resultado: Record<number, Aluno[]> = {};

        await Promise.all(
          slot.docentes.map(async (docente) => {
            const turmasLEI = docente.turmas.get("LEI") ?? [];
            const todasAlunas: Aluno[] = [];

            await Promise.all(
              turmasLEI.map(async (turma) => {
                const response = await fetcher(
                  `https://horariosdeisi.pythonanywhere.com/turma-alunos/${slot.disciplina_id}/${turma}`
                );

                if (response?.alunos) {
                  todasAlunas.push(...response.alunos);
                }

                if (response?.alunos_avulso) {
                  todasAlunas.push(...response.alunos_avulso);
                }
              })
            );

            if (docente.id !== null && docente.id !== undefined) {
              resultado[docente.id] = todasAlunas;
            }
          })
        );

        setAlunosPorDocente(resultado);
      } catch (error) {
        console.error("Erro ao buscar alunos:", error);
        setAlunosPorDocente({});
      }
    };

    fetchAlunos();
  }, [slot, podeVerAlunos, showAlunos]);

  const alunosSelecionados =
    docenteSelecionado !== null
      ? alunosPorDocente[docenteSelecionado] ?? []
      : [];

  return (
    <>
      <div
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
        {slot.docentes.map((docente) => {
          const alunos = docente.id !== null && docente.id !== undefined ? alunosPorDocente[docente.id] ?? [] : [];

          return (
            <div key={docente.id} className="leading-tight">
              <div className={styles.slotDocente} style={{ fontWeight: 'bold' }}>
                {docente.docente_nome}
              </div>

              <div className={`${styles.slotDetails} ${styles.slotDisciplinaDocenteDetails}`}>
                {docente.sala_nome !== 'outra' ? docente.sala_nome : ''}

                <span className="pl-2">
                  ({docente.tipo === 'T' ? 'Teórica' : formataTurmas(docente.turmas)})
                </span>
              </div>

              {podeVerAlunos && alunos.length > 0 && (
                <div style={{ fontSize: '8px', marginTop: '-2px', color: '#666' }}>
                  <span>{alunos.length} LEI</span>
                  <button
                    onClick={() => {
                      setDocenteSelecionado(docente.id);
                      setModalAberto(true);
                    }}
                    style={{
                      marginLeft: '6px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: '#666',
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {podeVerAlunos && modalAberto && docenteSelecionado !== null &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
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
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ margin: 0 }}>
                  {slot.docentes.find(d => d.id === docenteSelecionado)?.docente_nome}
                  {" — "}
                  {alunosSelecionados.length} alunos
                </h2>
                <button
                  onClick={() => setModalAberto(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ fontSize: '13px', marginBottom: '16px', color: '#666' }}>
                {getNomeDia(slot.dia_semana)}, {formatarHorario(slot.hora_inicio, slot.duracao)}
              </div>

              {[...alunosSelecionados]
                .sort((a, b) => {
                  const numA = parseInt(a.numero.substring(0, 3), 10);
                  const numB = parseInt(b.numero.substring(0, 3), 10);

                  // 1️⃣ Ordenação decrescente pelos 3 primeiros dígitos
                  if (numA !== numB) {
                    return numB - numA;
                  }

                  // 2️⃣ Se forem iguais, ordenar pelo nome crescente
                  return a.nome.localeCompare(b.nome);
                })
                .map((aluno, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '40px 1fr 1fr 1.5fr',
                      gap: '10px',
                      padding: '6px 0',
                      borderBottom: '1px solid #eee',
                      fontSize: '13px',
                    }}
                  >
                    <div>{idx + 1}</div>
                    <div>{aluno.nome}</div>
                    <div>{aluno.numero}</div>
                    <div style={{ wordBreak: 'break-all' }}>{aluno.email}</div>
                  </div>
                ))}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
