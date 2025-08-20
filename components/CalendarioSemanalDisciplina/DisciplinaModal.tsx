'use client';

import styles from './CalendarioSemanalDisciplina.module.css';
import CalendarioSemanalDisciplina from './CalendarioSemanalDisciplina';

interface DocenteModalProps {
  isOpen: boolean;
  setModalOpen: (open: boolean) => void;
  disciplina_id: number;
  disciplina_nome: string,
  ano_lectivo_id: number;
  semestre: number;
}

export default function DisciplinaModal({
  isOpen,
  setModalOpen,
  disciplina_id,
  disciplina_nome,
  ano_lectivo_id,
  semestre
}: DocenteModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.modal} onClick={() => setModalOpen(false)}>
      <div 
        className={styles.modalContent} 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '90vw', width: '1200px' }}
      >
        <div className={styles.modalHeader}>
          <h2>Horário de {disciplina_nome}</h2>
          <button 
            onClick={() => setModalOpen(false)}
            className={styles.closeButton}
          >
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <CalendarioSemanalDisciplina
            disciplina_id={disciplina_id}
            ano_lectivo_id={ano_lectivo_id}
            semestre={semestre}
          />
        </div>
      </div>
    </div>
  );
}