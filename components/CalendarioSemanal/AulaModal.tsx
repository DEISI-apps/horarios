import { useState } from 'react';
import { AulaAPI, SlotForm, Disciplina, DocenteHoras, Sala, AulaIn, Turma, Horario } from '@/types/interfaces';
import { DAYS, END_HOUR, START_HOUR } from '@/lib/constants';
import { gerarCorDisciplina, abreviarNomeDisciplina } from '@/lib/utils';
import styles from './CalendarioSemanal.module.css';
import { saveAula, deleteAula } from '@/lib/api/aulas';
import { KeyedMutator } from 'swr';
import { useAulasAnoSemestre } from '@/hooks/useAulasAnoSemestre';


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
  horario: Horario;
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
  horario,
  setAulaSelecionada,
  mutateAulas,
  handleDuplicate,
}: AulaModalProps) {

  //
  // A. Gestão de estados do componente
  const [loadingSaving, setLoadingSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);



  // B. Hook de obtenção de dados
  const { aulas, isLoadingAulas } = useAulasAnoSemestre(horario.ano_lectivo_id, horario.semestre);


  //
  // C. Manipuladores de eventos (event handlers) 

  // Handler para lidar com mudanças nos inputs
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, type, value } = e.target;

    // Trata checkbox de juncao e de juncao_visivel
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

    await mutateAulas();

    try {
      const aulaData: AulaIn = {
        horario_id: horario.id,
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
        juncao_visivel: aulaSelecionada.juncao_visivel,
      };

      // validacao
      const docente = docentesDisciplina.find(d => d.id === parseInt(aulaSelecionada.docente_id));
      if (!docente) {
        setError('Professor não encontrado para esta disciplina.');
        setLoadingSaving(false);
        return;
      }

      let aulaExistente_horas_teoricas_lecionadas = 0
      let aulaExistente_horas_praticas_lecionadas = 0

      // se for alteração de uma aula que já existe, retirar info dessa aula
      const aulaExistente = aulas.find(aula => aula.id === aulaSelecionada.id);
      if (aulaExistente) {
        aulaExistente_horas_teoricas_lecionadas = aulaExistente.duracao / 60;
        aulaExistente_horas_praticas_lecionadas = aulaExistente.duracao / 60;
      }

      if (!aulaData.juncao && aulaData.tipo === 'T' && aulaData.duracao / 60 + docente.horas_teoricas_lecionadas - aulaExistente_horas_teoricas_lecionadas > docente.horas_teoricas) {
        setError('A duração excede a carga horária disponível para o professor.');
        setLoadingSaving(false);
        return;
      }

      if (!aulaData.juncao && aulaData.tipo === 'P' && aulaData.duracao / 60 + docente.horas_praticas_lecionadas - aulaExistente_horas_praticas_lecionadas > docente.horas_praticas) {
        setError('A duração excede a carga horária disponível para o professor.');
        setLoadingSaving(false);
        return;
      }

      // garantir que docente não está a dar aula noutra turma nesse horário
      const aulaInicio = parseFloat(aulaData.hora_inicio.split(':')[0]) + parseFloat(aulaData.hora_inicio.split(':')[1]) / 60;
      const aulaFim = aulaInicio + aulaData.duracao / 60;

      const aulasConflitantes = aulas.filter(aula => {

        const outraInicio = parseFloat(aula.hora_inicio.split(':')[0]) + parseFloat(aula.hora_inicio.split(':')[1]) / 60;
        const outraFim = outraInicio + aula.duracao / 60;
        const temSobreposicao = outraInicio < aulaFim && outraFim > aulaInicio;

        const mesmoDocente = aula.docente_id === docente.id;
        const mesmoDia = aula.dia_semana === aulaData.dia_semana;
        const naoEhMesmaAula = aula.id !== aulaSelecionada.id;
        const naoEhJuncao = aulaData.juncao === false;

        return mesmoDocente && mesmoDia && naoEhMesmaAula && temSobreposicao && naoEhJuncao && !aula.juncao;
      });

      if (aulasConflitantes.length > 0) {

        aulasConflitantes.map(aula => console.log(aula))

        setError('O docente já está a dar neste horário uma aula noutra turma sem junção.');
        setLoadingSaving(false);
        return;
      }

      // garantir que a aula não se sobrepõe a outra aula da mesma turma
      const aulasTurmaConflitantes = aulas.filter(aula => {

        const outraInicio = parseFloat(aula.hora_inicio.split(':')[0]) + parseFloat(aula.hora_inicio.split(':')[1]) / 60;
        const outraFim = outraInicio + aula.duracao / 60;
        const temSobreposicao = outraInicio < aulaFim && outraFim > aulaInicio;

        const mesmaTurma = aula.turma_id === aulaData.turma_id;
        const mesmoDia = aula.dia_semana === aulaData.dia_semana;
        const naoEhMesmaAula = aula.id !== aulaSelecionada.id;

        return mesmaTurma && mesmoDia && naoEhMesmaAula && temSobreposicao;
      });

      if (aulasTurmaConflitantes.length > 0) {
        setError('A aula não pode se sobrepor a outra aula da mesma turma.');
        setLoadingSaving(false);
        return;
      }

      // garantir que não existe uma aula dessa disciplina e tipo na turma
      const aulasConflitantesTurma = aulas.filter(aula => {

        const mesmaTurma = aula.turma_id === aulaData.turma_id;
        const mesmaDisciplina = aula.disciplina_id === aulaData.disciplina_id;
        const mesmoTipo = aula.tipo === aulaData.tipo;
        const mesmaAula = aula.id === aulaSelecionada.id;

        return mesmaTurma && mesmaDisciplina && mesmoTipo && !mesmaAula;
      });

      if (aulasConflitantesTurma.length > 0) {
        setError('Já existe uma aula dessa disciplina e tipo na turma.');
        setLoadingSaving(false);
        return;
      }

      // garantir que não existe uma aula dessa disciplina e tipo numa sala em que está a decorrer uma aula
      const aulasConflitantesSala = aulas.filter(aula => {
        const ehLabDEISI = aula.sala_id !== 7; // Sala do DEISI Hub
        const mesmaSala = aula.sala_id === aulaData.sala_id;
        const mesmoTipo = aula.tipo === aulaData.tipo;
        const naoEhMesmaAula = aula.id !== aulaSelecionada.id;
        const mesmoDia = aula.dia_semana === aulaData.dia_semana;
        const naoEhJuncao = aulaData.juncao === false;

        const outraInicio = parseFloat(aula.hora_inicio.split(':')[0]) + parseFloat(aula.hora_inicio.split(':')[1]) / 60;
        const outraFim = outraInicio + aula.duracao / 60;
        const temSobreposicao = outraInicio < aulaFim && outraFim > aulaInicio;

        return ehLabDEISI && mesmaSala && mesmoDia && temSobreposicao && mesmoTipo && naoEhMesmaAula && naoEhJuncao;
      });

      if (aulasConflitantesSala.length > 0) {
        setError('Já existe uma aula dessa disciplina e tipo na sala.');
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
  if (isLoadingAulas) return <p>Carregando aulas...</p>;

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

          {aulaSelecionada.juncao && (<div className={`${styles.formGroup} ${styles.checkboxGroup}`}>
            <label htmlFor="slot-juncao-visivel">
              Texto visível
            </label>
            <input
              type="checkbox"
              id="slot-juncao-visivel"
              name="juncao_visivel"
              checked={!!aulaSelecionada.juncao_visivel}
              onChange={handleInputChange}
              style={{ marginLeft: '8px', marginBottom: '5px', width: 'auto' }}
            />
          </div>)}

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
              {disciplinas
                .sort((a, b) => a.nome.localeCompare(b.nome))
                .map((disciplina: Disciplina) => (
                  <option key={disciplina.id} value={disciplina.id}>
                    {disciplina.nome.length > 40 ? abreviarNomeDisciplina(disciplina.nome) : disciplina.nome}
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
                .sort((a, b) => a.nome.localeCompare(b.nome))
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
              {salas.sort((a,b) => a.nome.localeCompare(b.nome)).map((sala: Sala) => (
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
            <div className="flex justify-between w-full">
              {/* Grupo da esquerda */}
              <div className="space-x-2">
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={handleClose}
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
              </div>

              {/* Grupo da direita */}
              <div className="space-x-2">
                {aulaSelecionada.id && (
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnDuplicate}`}
                    onClick={handleDuplicate}
                    disabled={loadingSaving}
                  >
                    {loadingSaving ? 'Duplicando...' : 'Duplicar'}
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
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
