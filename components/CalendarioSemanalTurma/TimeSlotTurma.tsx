import { Aula, Aluno } from '@/types/interfaces';
import { calculateSlotPosition } from '@/lib/calendario';
import { MINUTE_HEIGHT } from '@/lib/constants';
import { gerarCorDisciplina, abreviarNomeDisciplina } from '@/lib/utils';
import styles from './CalendarioSemanal.module.css';
import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { createPortal } from 'react-dom';
import DocenteModal from '../CalendarioSemanalDocente/DocenteModal';
import SalaModal from '../CalendarioSemanalSala/SalaModal';
import DisciplinaModal from '../CalendarioSemanalDisciplina/DisciplinaModal';

interface TimeSlotProps {
  slot: Aula;
  ano_lectivo_id: number;
  semestre: number;
}

export default function TimeSlot({ slot, ano_lectivo_id, semestre }: TimeSlotProps) {

  const { data: session } = useSession();
  const isDocente = (session?.user as { role?: string })?.role === "docente";

  const [width, setWidth] = useState<number>(0);
  const slotRef = useRef<HTMLDivElement | null>(null);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [isModalAlunosOpen, setModalAlunosOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isModalSalaOpen, setModalSalaOpen] = useState(false);
  const [isModalDisciplinaOpen, setModalDisciplinaOpen] = useState(false);

  const fetcher = (url: string) => fetch(url).then(res => res.json());

  const downloadCSV = () => {
    const headers = ['Nome', 'Número', 'Email'];
    const csvContent = [
      headers.join(','),
      ...alunos.map(aluno =>
        [aluno.nome, aluno.numero, aluno.email]
          .map(field => `"${field}"`)
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `alunos_${slot.disciplina_nome}_${slot.turma_nome}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


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

  const top = calculateSlotPosition(slot.hora_inicio);
  const height = slot.duracao * MINUTE_HEIGHT - 5;
  const baseColor = gerarCorDisciplina(slot.disciplina_id, true);

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
          textAlign: 'center',
          paddingLeft: '8px',
        }}
      >
        <div className={styles.slotTitle}>
          {isDocente ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setModalDisciplinaOpen(true);
              }}
              className="underline focus:outline-none text-left"
            >
              {abreviarNomeDisciplina(slot.disciplina_nome, slot.disciplina_nome_abreviado, width, slot.duracao)}
            </button>
          ) : (
            <span>
              {abreviarNomeDisciplina(slot.disciplina_nome, slot.disciplina_nome_abreviado, width, slot.duracao)}
            </span>
          )}
        </div>
        <div className={styles.slotDetails}  >
          {slot.tipo === 'T' ? 'Teórica ' : 'Prática '}

          {slot.sala_nome !== 'sala?' && (
            <>
              <span>· </span>
              {isDocente ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalSalaOpen(true);
                  }}
                  className="underline focus:outline-none cursor-help"
                >
                  {slot.sala_nome}
                </button>
              ) : (
                <span>{slot.sala_nome}</span>
              )}
            </>
          )}

          {!isDocente && <span className="ml-2">({slot.turma_nome})</span>}
        </div>

        <div className={styles.slotDetails} >
          {(!slot.juncao || slot.juncao_visivel) && (
            isDocente ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setModalOpen(true);
                }}
                className="underline focus:outline-none cursor-help text-left"
              >
                {slot.docente_nome}
              </button>
            ) : (
              <span className="text-left ">{slot.docente_nome}</span>
            )
          )}
        </div>

        {isDocente && alunos.length > 0 && (
          <div className={styles.slotDetails} style={{ fontSize: '8px', marginLeft: 'auto', marginRight: '5px', marginTop: '-12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>{alunos.length} alunos LEI</span>
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

      {isDocente && (
        <>
          <DocenteModal
            isOpen={isModalOpen}
            setModalOpen={setModalOpen}
            docente_id={slot.docente_id}
            docente_nome={slot.docente_nome}
            ano_lectivo_id={ano_lectivo_id}
            semestre={semestre}
          />

          <SalaModal
            isOpen={isModalSalaOpen}
            setModalOpen={setModalSalaOpen}
            sala_id={slot.sala_id}
            sala_nome={slot.sala_nome}
            ano_lectivo_id={ano_lectivo_id}
            semestre={semestre}
          />

          <DisciplinaModal
            isOpen={isModalDisciplinaOpen}
            setModalOpen={setModalDisciplinaOpen}
            disciplina_id={slot.disciplina_id}
            disciplina_nome={slot.disciplina_nome}
            disciplina_cursos={slot.curso_sigla}
            ano_lectivo_id={ano_lectivo_id}
            semestre={semestre}
          />
        </>
      )}

      {isDocente && isModalAlunosOpen && typeof document !== 'undefined' && createPortal(
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
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={downloadCSV}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                  }}
                >
                  ⬇ CSV
                </button>
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
            </div>

            <div style={{ backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
              <div><strong>{slot.disciplina_nome}</strong></div>
              <div>Turma: {slot.turma_nome}</div>
              <div>Docente: {slot.docente_nome}</div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '1px solid #ddd' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600' }}>Nome</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600' }}>Número</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600' }}>Email</th>
                </tr>
              </thead>
              <tbody>
                {[...alunos]
                .sort((a, b) => {
                  const numA = parseInt(a.numero.substring(0, 3), 10);
                  const numB = parseInt(b.numero.substring(0, 3), 10);

                  // 1️⃣ Ordenação decrescente pelos 3 primeiros dígitos
                  if (numA !== numB) {
                    return numB - numA;
                  }

                  // 2️⃣ Se forem iguais, ordenar pelo nome crescente
                  return a.nome.localeCompare(b.nome);
                }).map((aluno) => (
                  <tr key={aluno.numero} style={{ borderBottom: '1px solid #eee', backgroundColor: '#fff' }}>
                    <td style={{ padding: '8px 12px' }}>{aluno.nome}</td>
                    <td style={{ padding: '8px 12px', color: '#666' }}>{aluno.numero}</td>
                    <td style={{ padding: '8px 12px', color: '#666', fontSize: '12px', wordBreak: 'break-all' }}>{aluno.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>,
        document.body
      )}

    </>
  );
}
