import { Aula, Disciplina, DisciplinaHoras } from "@/types/interfaces";


export const gerarCorDisciplina = (id: number) => {
  const hue = (id * 137) % 360;
  return `hsl(${hue}, 80%, 80%)`;
};

export function abreviarNomeDisciplina(nomeDisciplina: string) {

  // abrevia palavras com mais de 6 caracteres
  const nomeAbreviadoDisciplina = nomeDisciplina
    .split(" ")
    .filter(palavra => palavra !== 'de')
    .map(palavra => palavra.length > 6 ?
      ('aeiou'.includes(palavra[3]) ?
        palavra.slice(0, 3) + '.'
        : palavra.slice(0, 4) + '.'
      )
      : palavra)
    .join(" ")

  const listaDePalavras = nomeAbreviadoDisciplina.trim().split(/\s+/);

  if (listaDePalavras.length <= 3 && listaDePalavras.join(' ').length < 15) {
    // abrevia dessa forma o nome de disciplina se tiver menos de 3 palavras e 15 carateres 
    return nomeAbreviadoDisciplina;
  } 
  else {  
    // senão, retira vogais, 'de', e mostra apenas 3 palavras com 3 carateres
    const listaDePalavrasAbreviada = nomeDisciplina
      .split(" ")
      .filter(palavra => palavra !== 'de')
      .map(palavra => palavra.slice(0, 2) + palavra.split('').slice(2).map(letra => 'aeiou'.includes(letra) ? '' : letra).join(''))
      .map(palavra => palavra.slice(0, 3) + '.');

    // mostra as 2 primeiras e a última palavra
    return listaDePalavrasAbreviada.slice(0, 1).join(' ') + ' ' + listaDePalavrasAbreviada.slice(-2).join(' ');

  }


}

export function atualizaDisciplinasHoras(disciplinas: Disciplina[], aulas: Aula[]): DisciplinaHoras[] {

  const disciplinasHorasAtualizadas: DisciplinaHoras[] = disciplinas.map((disciplina) => {

    const aulasDaDisciplina = aulas.filter((aula) => aula.disciplina_id === disciplina.id && aula.juncao === false);
    const horasTeoricas = aulasDaDisciplina.filter((aula) => aula.tipo === 'T').reduce((total, aula) => total + aula.duracao / 60, 0);
    const horasPraticas = aulasDaDisciplina.filter((aula) => aula.tipo === 'P').reduce((total, aula) => total + aula.duracao / 60, 0);

    // if (disciplina.nome === "Bases de Dados") console.log(
    //   'com juncoes:',
    //   aulasDaDisciplina.filter((aula) => aula.tipo === 'T').reduce((total, aula) => total + aula.duracao / 60, 0),
    //   "sem juncoes",
    //   aulas.filter((aula) => aula.disciplina_id === disciplina.id).filter((aula) => aula.tipo === 'T').reduce((total, aula) => total + aula.duracao / 60, 0)
    // );


    return {
      ...disciplina,
      horas_teoricas_lecionadas: horasTeoricas,
      horas_praticas_lecionadas: horasPraticas,
      docentes: disciplina.docentes.map((docente) => {
        const aulasDoDocente = aulasDaDisciplina.filter((aula) => aula.docente_id === docente.id);
        const horasTeoricasDocente = aulasDoDocente.filter((aula) => aula.tipo === 'T').reduce((total, aula) => total + aula.duracao / 60, 0);
        const horasPraticasDocente = aulasDoDocente.filter((aula) => aula.tipo === 'P').reduce((total, aula) => total + aula.duracao / 60, 0);

        // if (docente.nome === "Rui Ribeiro") console.log(
        //   'Rui Ribeiro: com juncoes:',
        //   aulasDoDocente.filter((aula) => aula.tipo === 'T').reduce((total, aula) => total + aula.duracao / 60, 0),
        //   "sem juncoes",
        //   aulas.filter((aula) => aula.disciplina_id === disciplina.id && aula.docente_id === docente.id).filter((aula) => aula.tipo === 'T').reduce((total, aula) => total + aula.duracao / 60, 0)
        // );


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

  const teoricas = docente.horas_teoricas ? `T: ${docente.horas_teoricas_lecionadas}/${docente.horas_teoricas}h` : ''
  const praticas = docente.horas_praticas ? `P: ${docente.horas_praticas_lecionadas}/${docente.horas_praticas}h` : ''
  const virgula = (teoricas && praticas) ? ', ' : ''

  return ` (${teoricas}${virgula}${praticas})`
}


export function formataTurmas(turmas: Map<string, string[]>): string {
  return Array.from(turmas.entries())
    .map(([curso, turmasList]) => {
      turmasList.sort((a, b) => a.localeCompare(b));
      return `${curso} T${turmasList.join('&')}`;
    })
    .join(', ');
}