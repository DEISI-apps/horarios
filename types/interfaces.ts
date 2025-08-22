export interface Turma {
  id: number;
  nome: string;
  horario_id: number;
};

export interface Horario {
  id: number;
  curso_id: number;
  ano: number;
  ano_lectivo_id: number;
  semestre: number;
  num_turmas: number;
  curso: {
    id: number;
    nome: string;
    sigla: string;
  };
  ano_lectivo: {
    id: number;
    ano_lectivo: string;
  };
  turmas: Turma[];
}

export interface Docente {
  id: number;
  nome: string;
  horas_teoricas: number;
  horas_praticas: number;
}

export interface DocenteHoras extends Docente {
  horas_teoricas_lecionadas: number;
  horas_praticas_lecionadas: number;
}

export interface Sala {
  id: number;
  nome: string;
};

export interface Disciplina {
  id: number;
  nome: string;
  semestre: number;
  cursos: string;
  aula_teorica_duracao: number;
  aula_pratica_duracao: number;
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
  docentes: DocenteHoras[];
}


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
  juncao_visivel: boolean;
}


// AulaAPI herda de AulaIn e adiciona/sobrescreve campos para API
export interface AulaAPI extends AulaIn {
  id: number;
  disciplina: string;
  docente: string;
  sala: string;
  docente_nome: string;
  sala_nome: string;
  curso_sigla: string;
  turma_nome: string;
}

// Aula herda todos os campos de AulaIn e adiciona os seus próprios
export interface Aula extends AulaIn {
  id: number;
  disciplina_nome: string;
  docente_nome: string;
  sala_nome: string;
  curso_sigla: string;
  turma_nome: string;
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
  curso_sigla: string;
  turma_nome: string;
  juncao_visivel: boolean;
}




export interface AulaDocente {
  id: number | null;

  turmas: Map<string, string[]>;

  disciplina_id: number;
  disciplina_nome: string;
  docente_id: number;
  docente_nome: string;
  sala_id: number;
  sala_nome: string;

  tipo: string;

  dia_semana: number;
  hora_inicio: string; // Formato "HH:MM"
  duracao: number;
  cor: string;
  juncao: boolean;

  curso_sigla: string;
  turma_nome: string;
}