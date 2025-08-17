

export interface TurmaAPI {
  id: number;
  nome: string;
  horario_id: number;
};

export interface HorarioAPI {
  curso_id: number;
  ano: number;
  ano_lectivo_id: number;
  semestre: number;
  num_turmas: number;
  turmas: TurmaAPI[];
}

// export interface HorarioOption {
//   id: number;
//   label: string;
//   raw: RawHorario;
// }

export interface Docente {
  id: number;
  nome: string;
  horas_teoricas: number;
  horas_praticas: number;
}


export interface RawItem {
  id: number;
  curso: {
    nome: string;
    sigla: string;
  };
  ano: number;
  semestre: number;
  num_turmas?: number; // torna opcional
  ano_lectivo: {
    ano_lectivo: string;
  };
}

export interface Option {
  id: number;
  label: string;
  raw: RawItem;
}


export interface Turma {
  id: number;
  nome: string;
};


export interface Sala {
  id: number;
  nome: string;
};


export interface Disciplina {
  id: number;
  nome: string;
  semestre: number;
  horas_teoricas: number;
  horas_praticas: number;
  docentes: {
    id: number;
    nome: string;
    horas_teoricas: number;
    horas_praticas: number;
  }[];
}

export interface DisciplinaHoras extends Disciplina {
  horas_teoricas_lecionadas: number;
  horas_praticas_lecionadas: number;
  docentes: (Disciplina['docentes'][number] & {
    horas_teoricas_lecionadas: number;
    horas_praticas_lecionadas: number;
  })[];
}

// -----------------------------------------------------------------------------
// Sobre a notação (Disciplina['docentes'][number] & { ... })[]
//
// Esta notação é usada para criar um novo tipo de array de objetos,
// combinando (interseção) o tipo de cada elemento do array 'docentes' da interface Disciplina
// com propriedades adicionais.
//
// - Disciplina['docentes'][number]: obtém o tipo de cada item do array 'docentes'.
// - & { ... }: faz uma interseção de tipos, ou seja, junta o tipo original com novas propriedades.
//
// Exemplo prático:
// type DocenteBase = { id: number; nome: string; horas_teoricas: number; horas_praticas: number; };
// type DocenteComLecionadas = DocenteBase & { horas_teoricas_lecionadas: number; horas_praticas_lecionadas: number; };
//
// Assim, a propriedade 'docentes' em DisciplinaHoras será um array de objetos
// que possuem todas as propriedades do docente original, mais as propriedades extras.
//
// -----------------------------------------------------------------------------

export interface AulaIn {
  horario_id: number;
  turma_id: number;
  disciplina_id: number;
  tipo: string;
  docente_id: number;
  sala_id: number;
  dia_semana: number;
  hora_inicio: string; // Formato "HH:MM"
  duracao: number;
  cor: string;
  juncao: boolean;
}

// Aula herda todos os campos de AulaIn e adiciona os seus próprios
export interface Aula extends AulaIn {
  id: number;
  disciplina_nome: string;
  docente_nome: string;
  sala_nome: string;
}

// SlotForm herda de AulaIn, mas sobrescreve tipos e adiciona campos
export interface SlotForm extends Omit<AulaIn, 
  'horario_id' | 'turma_id' | 'disciplina_id' | 'docente_id' | 'sala_id' | 'dia_semana' | 'hora_inicio' | 'duracao' | 'cor' | 'tipo'> {
  id: number | null;
  turma_id: string;
  disciplina_id: string;
  disciplina_nome: string;
  docente_id: string;
  docente_nome: string;
  sala_id: string;
  sala_nome: string;
  dia_semana: string;
  hora_inicio: string;
  duracao: string;
  color: string;
  tipo: string;
  juncao: boolean;
}

// AulaAPI herda de AulaIn e adiciona/sobrescreve campos para API
export interface AulaAPI extends AulaIn {
  id: number;
  disciplina: string;
  docente: string;
  sala: string;
}