'use client';

import styles from '@/components/CalendarioSemanalDocente/CalendarioSemanalDocente.module.css';
import CalendarioSemanalDocente from '@/components/CalendarioSemanalDocente/CalendarioSemanalDocente';

interface DocenteModalProps {
  isOpen: boolean;
  setModalOpen: (open: boolean) => void;
  docente_id: number;
  docente_nome: string,
  ano_lectivo_id: number;
  semestre: number;
}

export default function DocenteModal({
  isOpen,
  setModalOpen,
  docente_id,
  docente_nome,
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
          <h2>Horário de {docente_nome}</h2>
          <button 
            onClick={() => setModalOpen(false)}
            className={styles.closeButton}
          >
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <CalendarioSemanalDocente
            docente_id={docente_id}
            ano_lectivo_id={ano_lectivo_id}
            semestre={semestre}
          />
        </div>
      </div>
    </div>
  );
}