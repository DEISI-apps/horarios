import { Aula, Disciplina, DisciplinaHoras } from "@/types/interfaces";


// Função para gerar cor
export const gerarCorDisciplina = (id: number, claro: boolean = true) => {
  const hue = (id * 137) % 360;
  return `hsl(${hue}, 80%, ${claro ? 75 : 50}%)`;
};

export function abreviarNomeDisciplina(nomeDisciplina: string, largura: number = 100) {

  if (largura > 180) {
    return nomeDisciplina; // cabe inteiro
  }

  // abrevia palavras com mais de 6 caracteres
  const nomeAbreviadoDisciplina = nomeDisciplina
    .split(" ")
    .filter(palavra => palavra !== 'de' && palavra !== 'e' && palavra !== 'do' && palavra !== 'da') 
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
      .filter(palavra => palavra !== 'de' && palavra !== 'e' && palavra !== 'do' && palavra !== 'da' && palavra !== '(LCD)') 
//      .map(palavra => palavra.slice(0, 2) + palavra.split('').slice(2).map(letra => 'aeiou'.includes(letra) ? '' : letra).join(''))
      .map(palavra => palavra.slice(0, 3) + '.');

    // mostra as 2 primeiras e a última palavra
    return listaDePalavrasAbreviada.slice(0, 1).join(' ') + ' ' + listaDePalavrasAbreviada.slice(-2).join(' ');

  }


}


export function abreviarNomeDisciplina__(nome: string, largura: number = 100) {
  if (largura > 180) {
    return nome; // cabe inteiro
  } else if (largura > 120) {
    return nome.split(" ").map(p => p.length > 8 ? p.slice(0, 6) + "." : p).join(" ");
  } else {
    return nome.split(" ").map(p => p.slice(0, 3) + ".").join(" ");
  }
}

export function atualizaDisciplinasHoras(disciplinas: Disciplina[], aulas: Aula[]): DisciplinaHoras[] {

  const disciplinasHorasAtualizadas: DisciplinaHoras[] = disciplinas.map((disciplina) => {

    const aulasDaDisciplina = aulas.filter((aula) => aula.disciplina_id === disciplina.id && aula.juncao === false);
    const horasTeoricas = aulasDaDisciplina.filter((aula) => aula.tipo === 'T').reduce((total, aula) => total + aula.duracao / 60, 0);
    const horasPraticas = aulasDaDisciplina.filter((aula) => aula.tipo === 'P').reduce((total, aula) => total + aula.duracao / 60, 0);

    return {
      ...disciplina,
      horas_teoricas_lecionadas: horasTeoricas,
      horas_praticas_lecionadas: horasPraticas,
      docentes: disciplina.docentes.map((docente) => {
        const aulasDoDocente = aulasDaDisciplina.filter((aula) => aula.docente_id === docente.id);
        const horasTeoricasDocente = aulasDoDocente.filter((aula) => aula.tipo === 'T').reduce((total, aula) => total + aula.duracao / 60, 0);
        const horasPraticasDocente = aulasDoDocente.filter((aula) => aula.tipo === 'P').reduce((total, aula) => total + aula.duracao / 60, 0);

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