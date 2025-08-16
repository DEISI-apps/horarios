import { Aula, Disciplina, DisciplinaHoras } from "@/types/interfaces";


export const gerarCorDisciplina = (id: number) => {
  const hue = (id * 137) % 360;
  return `hsl(${hue}, 80%, 80%)`;
};


export function abreviarNomeDisciplina(nomeDisciplina: string) {

  const nomeAbreviadoDisciplina = nomeDisciplina  
              .split(" ")
              .map(palavra => palavra.length > 6 ? palavra.slice(0, 4) + '.' : palavra)
              .join(" ")

  const listaDePalavras = nomeAbreviadoDisciplina.trim().split(/\s+/);
  if (listaDePalavras.length <= 5) {
    return nomeAbreviadoDisciplina;
  }
  const primeiras = listaDePalavras.slice(0, 3);
  const ultimas = listaDePalavras.slice(-2);
  return [...primeiras, '...', ...ultimas].join(' ');
}


export function atualizaDisciplinasHoras(disciplinas: Disciplina[], aulas: Aula[]): DisciplinaHoras[] {
  
    const disciplinasHorasAtualizadas: DisciplinaHoras[] = disciplinas.map((disciplina) => {
      const aulasDaDisciplina = aulas.filter((aula) => aula.disciplina_id === disciplina.id);
      const horasTeoricas = aulasDaDisciplina.filter((aula) => aula.tipo === 'T').reduce((total, aula) => total + aula.duracao/60, 0);
      const horasPraticas = aulasDaDisciplina.filter((aula) => aula.tipo === 'P').reduce((total, aula) => total + aula.duracao/60, 0);

      return {
        ...disciplina,
        horas_teoricas_lecionadas: horasTeoricas,
        horas_praticas_lecionadas: horasPraticas,
        docentes: disciplina.docentes.map((docente) => {
          const aulasDoDocente = aulasDaDisciplina.filter((aula) => aula.docente_id === docente.id);
          const horasTeoricasDocente = aulasDoDocente.filter((aula) => aula.tipo === 'T').reduce((total, aula) => total + aula.duracao/60, 0);
          const horasPraticasDocente = aulasDoDocente.filter((aula) => aula.tipo === 'P').reduce((total, aula) => total + aula.duracao/60, 0);

          return {
            ...docente,
            horas_teoricas_lecionadas: horasTeoricasDocente,
            horas_praticas_lecionadas: horasPraticasDocente,
          };
        }),
      };
    });

    return disciplinasHorasAtualizadas;
}

export function apresentaHoras(docente: DisciplinaHoras['docentes'][number]): string {

  const teoricas = docente.horas_teoricas ? `Teórica: ${docente.horas_teoricas_lecionadas}/${docente.horas_teoricas}h` : ''
  const praticas = docente.horas_praticas ? `Prática: ${docente.horas_praticas_lecionadas}/${docente.horas_praticas}h` : ''
  const virgula = (teoricas && praticas) ? ', ' : ''

  return ` (${teoricas}${virgula}${praticas})`
}