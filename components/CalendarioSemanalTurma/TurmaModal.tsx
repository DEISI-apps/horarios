'use client';

import { Aula } from '@/types/interfaces';
import styles from '../CalendarioSemanalDocente/CalendarioSemanalDocente.module.css';
import CalendarioSemanalTurma from './CalendarioSemanalTurma';

interface TurmaModalProps {
  isOpen: boolean;
  setModalOpen: (open: boolean) => void;
  turma_id: number;
  turma_nome: string;
  curso_nome: string;
  curso_sigla: string;
  ano: number;
  aulas: Aula[];
}

export default function TurmaModal({
  isOpen,
  setModalOpen,
  turma_id,
  turma_nome,
  curso_nome,
  curso_sigla,
  ano,
  aulas,
}: TurmaModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.modal} onClick={() => setModalOpen(false)}>
      <div 
        className={styles.modalContent} 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '90vw', width: '1200px' }}
      >
        <div className={styles.modalHeader}>
          <h2>{curso_sigla} - {curso_nome} - {ano}º Ano - Turma {turma_nome}</h2>
          <button 
            onClick={() => setModalOpen(false)}
            className={styles.closeButton}
          >
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <CalendarioSemanalTurma
            aulas={aulas}
            turma_id={turma_id}
          />
        </div>
      </div>
    </div>
  );
}