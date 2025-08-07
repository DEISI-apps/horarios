// export interface RawHorario {
//   id: number;
//   curso: {
//     nome: string;
//     sigla: string;
//   };
//   ano: number;
//   semestre: number;
//   num_turmas: number;
//   ano_lectivo: { ano_lectivo: string };
// }

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

// export interface Disciplina {
//   id: number;
//   nome: string;
//   sigla: string;
//   ects: number;
//   ano: number;
//   semestre: number;
//   horas_teoricas: number;
//   horas_praticas: number;
//   docentes: Docente[];
//   cor: string;
// }

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
  docentes: {
    id: number;
    nome: string;
    horas_teoricas: number;
    horas_praticas: number;
  }[];
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
}

export interface Aula extends AulaIn {
  id: number;
  disciplina_nome: string;
  docente_nome: string;
  sala_nome: string;
}

export interface SlotForm {
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
  type: string;
}

export interface AulaAPI {
  id: number;
  horario_id: number;
  turma_id: number;
  disciplina_id: number;
  disciplina: string;
  docente_id: number;
  docente: string;
  sala_id: number;
  sala: string;
  tipo: string;
  dia_semana: number;
  hora_inicio: string;
  duracao: number;
  cor: string;
}
