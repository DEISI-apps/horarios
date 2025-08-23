import { Aula, AulaAPI } from "@/types/interfaces";


// Converter aula da API para Aula
export const convertAulaToSlot = (aula: AulaAPI): Aula => {
    return {
        id: aula.id,
        horario_id: aula.horario_id,
        turma_id: aula.turma_id,
        disciplina_id: aula.disciplina_id,
        disciplina_nome: aula.disciplina,
        docente_id: aula.docente_id,
        docente_nome: aula.docente,
        sala_id: aula.sala_id || 7,
        sala_nome: aula.sala,
        tipo: aula.tipo,
        dia_semana: aula.dia_semana,
        hora_inicio: aula.hora_inicio,
        duracao: aula.duracao,
        cor: '',
        juncao: aula.juncao,
        juncao_visivel: aula.juncao_visivel,

        curso_sigla: aula.curso_sigla,
        turma_nome: aula.turma_nome,
    };
};