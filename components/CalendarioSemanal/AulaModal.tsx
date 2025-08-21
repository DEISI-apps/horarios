import { useState } from 'react';
import { AulaAPI, SlotForm, Disciplina, DocenteHoras, Sala, AulaIn, Turma } from '@/types/interfaces';
import { DAYS, END_HOUR, START_HOUR } from '@/lib/constants';
import { gerarCorDisciplina, abreviarNomeDisciplina } from '@/lib/utils';
import styles from './CalendarioSemanal.module.css';
import { saveAula, deleteAula } from '@/lib/api/aulas';
import { KeyedMutator } from 'swr';




interface AulaModalProps {
  isOpen: boolean;
  setModalOpen: (open: boolean) => void;
  aulaSelecionada: SlotForm;
  disciplinas: Disciplina[];
  docentesDisciplina: DocenteHoras[];
  turmas: Turma[];
  salas: Sala[];
  isLoadingDisciplinas: boolean;
  isLoadingSalas: boolean;
  horario_id: number;
  setAulaSelecionada: (aula: SlotForm | ((prev: SlotForm) => SlotForm)) => void;
  mutateAulas: KeyedMutator<AulaAPI[]>; // KeyedMutator é o tipo do SWR para a função mutate
  handleDuplicate: () => void;
}

export function apresentaHoras(docente: DocenteHoras): string {

  const teoricas = docente.horas_teoricas ? `T: ${docente.horas_teoricas_lecionadas}/${docente.horas_teoricas}h` : ''
  const praticas = docente.horas_praticas ? `P: ${docente.horas_praticas_lecionadas}/${docente.horas_praticas}h` : ''
  const virgula = (teoricas && praticas) ? ', ' : ''

  return ` (${teoricas}${virgula}${praticas})`
}

export default function AulaModal({
  isOpen,
  setModalOpen,
  aulaSelecionada,
  disciplinas,
  docentesDisciplina,
  turmas,
  salas,
  isLoadingDisciplinas,
  isLoadingSalas,
  horario_id,
  setAulaSelecionada,
  mutateAulas,
  handleDuplicate,
}: AulaModalProps) {

  //
  // A. Gestão de estados do componente
  const [loadingSaving, setLoadingSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);


  //
  // Manipuladores de eventos (event handlers) 

  // Handler para lidar com mudanças nos inputs
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, type, value } = e.target;

    // Trata checkbox de juncao
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setAulaSelecionada(prev => ({
        ...prev,
        [name]: checked
      }));
      return;
    }

    // Trata seleção de disciplina
    if (name === 'disciplina_id') {
      const disciplina = disciplinas?.find(d => d.id === parseInt(value));
      setAulaSelecionada(prev => ({
        ...prev,
        disciplina_id: value,
        disciplina_nome: disciplina?.nome || ''
      }));
      return;
    }

    // Trata seleção de docente
    if (name === 'docente_id') {
      const docente = docentesDisciplina.find(d => d.id === parseInt(value));
      setAulaSelecionada(prev => ({
        ...prev,
        docente_id: value,
        docente_nome: docente?.nome || ''
      }));
      return;
    }

    // Trata seleção de turma
    if (name === 'turma_id') {
      const turma = turmas?.find(t => t.id === parseInt(value));
      setAulaSelecionada(prev => ({
        ...prev,
        turma_id: value,
        turma_nome: turma?.nome || ''
      }));
      return;
    }

    // Trata seleção de tipo
    if (name === 'tipo') {
      setAulaSelecionada(prev => ({
        ...prev,
        tipo: value,
        duracao: value === 'T' ? '90' : '120', // Duração padrão para teórica e prática
      }));
      return;
    }

    // Trata todos os outros inputs
    setAulaSelecionada(prev => ({
      ...prev,
      [name]: value
    }));
  }

  // Handler para lidar com submissão de formulário de aula
  async function handleSubmit(e: React.FormEvent) {
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
        juncao: aulaSelecionada.juncao,
      };

      // validacao
      const docente = docentesDisciplina.find(d => d.id === parseInt(aulaSelecionada.docente_id));
      if (!docente) {
        setError('Professor não encontrado para esta disciplina.');
        setLoadingSaving(false);
        return;
      }

      if (!aulaData.juncao && aulaData.tipo === 'T' && aulaData.duracao/60 + docente.horas_teoricas_lecionadas > docente.horas_teoricas) {
        setError('A duração excede a carga horária disponível para o professor.');
        setLoadingSaving(false);
        return;
      }

      if (!aulaData.juncao && aulaData.tipo === 'P' && aulaData.duracao/60 + docente.horas_praticas_lecionadas > docente.horas_praticas) {
        setError('A duração excede a carga horária disponível para o professor.');
        setLoadingSaving(false);
        return;
      }

      if (aulaSelecionada.id) {
        await saveAula(aulaData, aulaSelecionada.id);
      } else {
        await saveAula(aulaData, null);
      }

      await mutateAulas(); // Importante atualizar os dados após gravar
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gravar aula');
      console.error(err);
    } finally {
      setLoadingSaving(false);
    }
  }

  // Handler para lidar com eliminação de aula
  async function handleDelete() {
    if (!aulaSelecionada.id) return;

    setLoadingSaving(true);
    setError(null);

    try {
      await deleteAula(aulaSelecionada.id);
      await mutateAulas(); // Importante atualizar os dados após deletar
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir aula');
      console.error(err);
    } finally {
      setLoadingSaving(false);
    }
  }

  const handleClose = () => {
    setModalOpen(false);
    setError(null);
    setLoadingSaving(false);
  };


  //
  // F. Lógica de renderização

  // Fallbacks primeiro...
  if (!isOpen) return null;

  // render principal
  return (
    <div className={styles.modal} onClick={handleClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{aulaSelecionada.id ? 'Editar Aula' : 'Nova Aula'}</h2>
          <button onClick={handleClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="slot-turma">Turma</label>
            <select
              id="slot-turma"
              name="turma_id"
              value={aulaSelecionada.turma_id}
              onChange={handleInputChange}
              required
            >
              {turmas.map((turma: Turma) => (
                <option key={turma.id} value={turma.id}>
                  {turma.nome}
                </option>
              ))}
            </select>
          </div>

          <div className={`${styles.formGroup} ${styles.checkboxGroup}`}>
            <label htmlFor="slot-juncao">
              Em junção
            </label>
            <input
              type="checkbox"
              id="slot-juncao"
              name="juncao"
              checked={!!aulaSelecionada.juncao}
              onChange={handleInputChange}
              style={{ marginLeft: '8px', marginBottom: '5px', width: 'auto' }}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="slot-disciplina-id">Disciplina</label>
            <select
              id="slot-disciplina-id"
              name="disciplina_id"
              value={aulaSelecionada.disciplina_id}
              onChange={handleInputChange}
              required
              disabled={isLoadingDisciplinas}
            >
              <option value="">Selecione uma disciplina</option>
              {disciplinas.map((disciplina: Disciplina) => (
                <option key={disciplina.id} value={disciplina.id}>
                  {disciplina.nome.length > 40 ? abreviarNomeDisciplina(disciplina.nome): disciplina.nome}
                </option>
              ))}
            </select>
            {isLoadingDisciplinas && <span>Carregando disciplinas...</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="slot-type">Tipo</label>
            <select
              id="slot-type"
              name="tipo"
              value={aulaSelecionada.tipo}
              onChange={handleInputChange}
              required
            >
              <option value="T">Teórica (T)</option>
              <option value="P">Prática (P)</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="slot-docente-id">
              Professor
            </label>
            <select
              id="slot-docente-id"
              name="docente_id"
              value={aulaSelecionada.docente_id}
              onChange={handleInputChange}
              required
              disabled={!aulaSelecionada.disciplina_id || docentesDisciplina.length === 0}
            >
              <option value="">Selecione um professor</option>
              {docentesDisciplina
                .filter((docente) => (aulaSelecionada.tipo == 'T' && docente.horas_teoricas > 0) || (aulaSelecionada.tipo == 'P' && docente.horas_praticas > 0))
                .map((docente) => (
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
              id="slot-sala"
              name="sala_id"
              value={aulaSelecionada.sala_id}
              onChange={handleInputChange}
              required
              disabled={isLoadingSalas}
            >
              <option key="7" value="7">outra (não DEISI Hub)</option>
              {salas.map((sala: Sala) => (
                <option key={sala.id} value={sala.id}>
                  {sala.nome}
                </option>
              ))}
            </select>
            {isLoadingSalas && <span>Carregando salas...</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="slot-dia-semana">Dia</label>
            <select
              id="slot-dia-semana"
              name="dia_semana"
              value={aulaSelecionada.dia_semana}
              onChange={handleInputChange}
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
            <label htmlFor="slot-hora-inicio">Início</label>
            <select
              id="slot-hora-inicio"
              name="hora_inicio"
              value={aulaSelecionada.hora_inicio}
              onChange={handleInputChange}
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
              onChange={handleInputChange}
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
              onClick={handleClose}
              disabled={loadingSaving}
            >
              Cancelar
            </button>
            {aulaSelecionada.id && (<>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnDuplicate}`}
                onClick={handleDuplicate}
                disabled={loadingSaving}
              >
                {loadingSaving ? 'Duplicando...' : 'Duplicar'}
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnDanger}`}
                onClick={handleDelete}
                disabled={loadingSaving}
              >
                {loadingSaving ? 'Excluindo...' : 'Excluir'}
              </button>
            </>)}
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
