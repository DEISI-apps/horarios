import { Aula, Aluno } from '@/types/interfaces';
import { calculateSlotPosition } from '@/lib/calendario';
import { MINUTE_HEIGHT } from '@/lib/constants';
import { gerarCorDisciplina, abreviarNomeDisciplina } from '@/lib/utils';
import styles from './CalendarioSemanal.module.css';
import { useEffect, useRef, useState } from 'react';
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

  const [width, setWidth] = useState<number>(0);
  const slotRef = useRef<HTMLDivElement | null>(null);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [isModalAlunosOpen, setModalAlunosOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isModalSalaOpen, setModalSalaOpen] = useState(false);
  const [isModalDisciplinaOpen, setModalDisciplinaOpen] = useState(false);

  const fetcher = (url: string) => fetch(url).then(res => res.json());

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

  useEffect(() => {
    const fetchAlunos = async () => {
      try {
        const response = await fetcher(
          `https://horariosdeisi.pythonanywhere.com/turma-alunos/${slot.disciplina_id}/${slot.turma_nome}`
        );

        if (response && response.alunos) {
          setAlunos(response.alunos);
        } else if (response && Array.isArray(response)) {
          setAlunos(response);
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              setModalDisciplinaOpen(true);
            }}
            className="underline focus:outline-none text-left"
          >
            {abreviarNomeDisciplina(slot.disciplina_nome, slot.disciplina_nome_abreviado, width, slot.duracao)}
          </button>
        </div>
        <div className={styles.slotDetails}  >
          {slot.tipo === 'T' ? 'Teórica ' : 'Prática '}

          {slot.sala_nome !== 'sala?' && (
            <>
              <span>· </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setModalSalaOpen(true);
                }}
                className="underline focus:outline-none cursor-help"
              >
                {slot.sala_nome}
              </button>
            </>
          )}
        </div>

        <div className={styles.slotDetails} >
          {(!slot.juncao || slot.juncao_visivel) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setModalOpen(true);
              }}
              className="underline focus:outline-none cursor-help text-left"
            >
              {slot.docente_nome}
            </button>
          )}
        </div>

        {alunos.length > 0 && (
          <div className={styles.slotDetails} style={{ fontSize: '8px', marginLeft: 'auto', marginRight: '5px', marginTop: 'auto' }}>
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
              <div>Turma: {slot.turma_nome}</div>
              <div>Docente: {slot.docente_nome}</div>
            </div>

            <div style={{ display: 'grid', gap: '8px' }}>
              {alunos.map((aluno) => (
                <div key={aluno.numero} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                  <span>{aluno.nome}</span>
                  <span style={{ color: '#666', fontSize: '12px' }}>{aluno.numero}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </>
  );
}
