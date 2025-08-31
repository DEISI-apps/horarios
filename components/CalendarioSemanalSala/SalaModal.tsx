'use client';

import styles from './CalendarioSemanalSala.module.css';
import CalendarioSemanalSala from './CalendarioSemanalSala';

interface SalaModalProps {
  isOpen: boolean;
  setModalOpen: (open: boolean) => void;
  sala_id: number;
  sala_nome: string,
  ano_lectivo_id: number;
  semestre: number;
}

export default function SalaModal({
  isOpen,
  setModalOpen,
  sala_id,
  sala_nome,
  ano_lectivo_id,
  semestre
}: SalaModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.modal} onClick={() => setModalOpen(false)}>
      <div 
        className={styles.modalContent} 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '90vw', width: '1200px' }}
      >
        <div className={styles.modalHeader}>
          <h2>Horário da sala {sala_nome}</h2>
          <button 
            onClick={() => setModalOpen(false)}
            className={styles.closeButton}
          >
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <CalendarioSemanalSala
            sala_id={sala_id}
            ano_lectivo_id={ano_lectivo_id}
            semestre={semestre}
          />
        </div>
      </div>
    </div>
  );
}