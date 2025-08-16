import { useState } from 'react';
import { SlotForm, Disciplina, DisciplinaHoras, Turma, Sala, AulaIn } from '@/types/interfaces';
import { DAYS, END_HOUR, START_HOUR } from '@/lib/constants';
import { gerarCorDisciplina, apresentaHoras } from '@/lib/utils';
import styles from './CalendarioSemanal.module.css';

interface AulaModalProps {
  isOpen: boolean;
  aulaSelecionada: SlotForm;
  disciplinas: Disciplina[];
  docentesDisciplina: DisciplinaHoras['docentes'];
  turmas: Turma[];
  salas: Sala[];
  isLoadingDisciplinas: boolean;
  isLoadingSalas: boolean;
  horario_id: number;
  onClose: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSave: (aulaData: AulaIn) => Promise<void>;
  onDelete: () => Promise<void>;
}

export default function AulaModal({
  isOpen,
  aulaSelecionada,
  disciplinas,
  docentesDisciplina,
  turmas,
  salas,
  isLoadingDisciplinas,
  isLoadingSalas,
  horario_id,
  onClose,
  onInputChange,
  onSave,
  onDelete
}: AulaModalProps) {
  const [loadingSaving, setLoadingSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSaving(true);
    setError(null);

    try {
      const aulaData: AulaIn = {
        horario_id: horario_id,
        disciplina_id: parseInt(aulaSelecionada.disciplina_id),
        docente_id: parseInt(aulaSelecionada.docente_id),
        turma_id: parseInt(aulaSelecionada.turma_id),
        sala_id: parseInt(aulaSelecionada.sala_id),
        tipo: aulaSelecionada.tipo,
        dia_semana: parseInt(aulaSelecionada.dia_semana),
        hora_inicio: aulaSelecionada.hora_inicio,
        duracao: parseInt(aulaSelecionada.duracao),
        cor: gerarCorDisciplina(parseInt(aulaSelecionada.disciplina_id)),
      };

      await onSave(aulaData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gravar aula');
      console.error(err);
    } finally {
      setLoadingSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!aulaSelecionada.id) return;

    setLoadingSaving(true);
    setError(null);

    try {
      await onDelete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir aula');
      console.error(err);
    } finally {
      setLoadingSaving(false);
    }
  };

  return (
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{aulaSelecionada.id ? 'Editar Aula' : 'Nova Aula'}</h2>
          <button onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="slot-turma">Turma</label>
            <select
              id="slot-turma"
              name="turma_id"
              value={aulaSelecionada.turma_id}
              onChange={onInputChange}
              required
            >
              {turmas.map((turma: Turma) => (
                <option key={turma.id} value={turma.id}>
                  {turma.nome}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="slot-disciplina-id">Disciplina</label>
            <select
              id="slot-disciplina-id"
              name="disciplina_id"
              value={aulaSelecionada.disciplina_id}
              onChange={onInputChange}
              required
              disabled={isLoadingDisciplinas}
            >
              <option value="">Selecione uma disciplina</option>
              {disciplinas.map((disciplina: Disciplina) => (
                <option key={disciplina.id} value={disciplina.id}>
                  {disciplina.nome}
                </option>
              ))}
            </select>
            {isLoadingDisciplinas && <span>Carregando disciplinas...</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="slot-type">Tipo de aula</label>
            <select
              id="slot-type"
              name="tipo"
              value={aulaSelecionada.tipo}
              onChange={onInputChange}
              required
            >
              <option value="T">Teórica</option>
              <option value="P">Prática</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="slot-docente-id">
              Professor <span className="font-normal text-gray-500">(horas lecionadas/atribuídas, não exceder atribuídas)</span>
            </label>
            <select
              id="slot-docente-id"
              name="docente_id"
              value={aulaSelecionada.docente_id}
              onChange={onInputChange}
              required
              disabled={!aulaSelecionada.disciplina_id || docentesDisciplina.length === 0}
            >
              <option value="">Selecione um professor</option>
              {docentesDisciplina.map((docente) => (
                <option key={docente.id} value={docente.id}>
                  {docente.nome} {apresentaHoras(docente)}
                </option>
              ))}
            </select>
            {aulaSelecionada.disciplina_id && docentesDisciplina.length === 0 && (
              <span>Nenhum professor disponível para esta disciplina</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="slot-sala">Sala</label>
            <select
              id="slot-sala-id"
              name="sala_id"
              value={aulaSelecionada.sala_id}
              onChange={onInputChange}
              required
              disabled={isLoadingSalas}
            >
              <option key="7" value="7">Não é lab DEISI Hub</option>
              {salas.map((sala: Sala) => (
                <option key={sala.id} value={sala.id}>
                  {sala.nome}
                </option>
              ))}
            </select>
            {isLoadingSalas && <span>Carregando salas...</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="slot-dia-semana">Dia da semana</label>
            <select
              id="slot-dia-semana"
              name="dia_semana"
              value={aulaSelecionada.dia_semana}
              onChange={onInputChange}
              required
            >
              {DAYS.map(day => (
                <option key={day.id} value={day.id}>
                  {day.name}-feira
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="slot-hora-inicio">Hora de início</label>
            <select
              id="slot-hora-inicio"
              name="hora_inicio"
              value={aulaSelecionada.hora_inicio}
              onChange={onInputChange}
              required
            >
              {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => {
                const hour = START_HOUR + i;
                return [
                  <option key={`${hour}:00`} value={`${hour.toString().padStart(2, '0')}:00`}>
                    {`${hour.toString().padStart(2, '0')}:00`}
                  </option>,
                  <option key={`${hour}:30`} value={`${hour.toString().padStart(2, '0')}:30`}>
                    {`${hour.toString().padStart(2, '0')}:30`}
                  </option>
                ];
              })}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="slot-duracao">Duração</label>
            <select
              id="slot-duracao"
              name="duracao"
              value={aulaSelecionada.duracao}
              onChange={onInputChange}
              required
            >
              <option value="60">1h</option>
              <option value="90">1h 30m</option>
              <option value="120">2h</option>
              <option value="150">2h 30m</option>
              <option value="180">3h</option>
              <option value="210">3h 30m</option>
              <option value="240">4h</option>
            </select>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <div className={styles.formActions}>
            <button 
              type="button" 
              className={`${styles.btn} ${styles.btnSecondary}`}
              onClick={onClose}
              disabled={loadingSaving}
            >
              Cancelar
            </button>
            {aulaSelecionada.id && (
              <button 
                type="button" 
                className={`${styles.btn} ${styles.btnDanger}`}
                onClick={handleDelete}
                disabled={loadingSaving}
              >
                {loadingSaving ? 'Excluindo...' : 'Excluir'}
              </button>
            )}
            <button 
              type="submit" 
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={loadingSaving}
            >
              {loadingSaving ? 'Gravando...' : 'Gravar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
