import { Aula, Disciplina, DisciplinaHoras } from "@/types/interfaces";

// Função para gerar cor
export const gerarCorDisciplina = (id: number, claro: boolean = true) => {
  const hue = (id * 137) % 360;
  return `hsl(${hue}, 80%, ${claro ? 75 : 50}%)`;
};

export function abreviarNomeDisciplina(nomeDisciplina: string, largura: number = 100, duracao: number = 120) {

  const palavrasDesprezar = ['de', 'e', 'do', 'da', 'para', 'por', '(LCD)'];
  const caracteres = 8;

  if (duracao > 120) 
      return nomeDisciplina;


  if (largura > 150 && duracao >= 120) {

    if (nomeDisciplina.split(/[\s-]+/).length < 5)
      return nomeDisciplina;

    // abrevia palavras com mais de 6 caracteres
    const nomeAbreviadoDisciplina = nomeDisciplina
      .split(/[\s-]+/)
      .filter(palavra => !palavrasDesprezar.includes(palavra))
      .map(palavra => palavra.length > caracteres ?
        ('áéaeiou'.includes(palavra[5]) ?
          ('áéaeiou'.includes(palavra[4]) ?
            palavra.slice(0, 4) + '.'
            : palavra.slice(0, 4) + '.')
          : palavra.slice(0, 6) + '.'
        )
        : palavra)
      .join(" ")

    return nomeAbreviadoDisciplina;
  }

  if (largura > 105 && nomeDisciplina.length < 20) {
    return nomeDisciplina;
  }

  if ((largura < 105 || duracao < 120) && nomeDisciplina.length > 15) {
    const nomeAbreviadoDisciplina = nomeDisciplina
      .split(/[\s-]+/)
      .filter(palavra => !palavrasDesprezar.includes(palavra))
      .map(palavra => palavra.length > 3 ?
        ('áéaeiou'.includes(palavra[3]) ?
          palavra.slice(0, 3) + '.'
          : palavra.slice(0, 4) + '.'
        )
        : palavra)
      .join(" ")

    if (nomeAbreviadoDisciplina.length < 13)
      return nomeAbreviadoDisciplina;

    else {
      const nomAbreviado2 = nomeAbreviadoDisciplina
      .split(/[\s-]+/)
      .filter(palavra => !palavrasDesprezar.includes(palavra))
      .map(palavra => palavra.length > 3 ?
        ('áéaeiou'.includes(palavra[2]) ?
          palavra.slice(0, 2) + '.'
          : palavra.slice(0, 3) + '.'
        )
        : palavra)
      .join(" ")
      return nomAbreviado2;
    }
  }

  // abrevia palavras com mais de 6 caracteres
  const nomeAbreviadoDisciplina = nomeDisciplina
    .split(/[\s-]+/)
    .filter(palavra => !palavrasDesprezar.includes(palavra))
    .map(palavra => palavra.length > caracteres ?
      ('áéaeiou'.includes(palavra[5]) ?
        palavra.slice(0, 5) + '.'
        : palavra.slice(0, 6) + '.'
      )
      : palavra)
    .join(" ")

  const listaDePalavras = nomeAbreviadoDisciplina.trim().split(/[\s-]+/);

  if (listaDePalavras.length < 5 && listaDePalavras.join(' ').length < caracteres) {
    // abrevia dessa forma o nome de disciplina se tiver menos de 3 palavras e 20 carateres
    return nomeAbreviadoDisciplina;
  }
  else {
    // senão, retira vogais, 'de', e mostra apenas 3 palavras com 3 carateres
    const listaDePalavrasAbreviada = nomeDisciplina
      .split(/[\s-]+/)
      .filter(palavra => !palavrasDesprezar.includes(palavra))
      .map(palavra => palavra.length <= 3 ?
        palavra
        : 'áéaeiou'.includes(palavra[5]) ?
          palavra.slice(0, 5) + '.'
          : palavra.slice(0, 6) + '.'
      );

    // mostra as 2 primeiras e a última palavra
    if (listaDePalavrasAbreviada.length < 4)
      return listaDePalavrasAbreviada.join(' ');
    if (listaDePalavrasAbreviada.length == 4)
      return listaDePalavrasAbreviada.slice(0, 3).join(' ') + ' ' + listaDePalavrasAbreviada.slice(-1).join(' ');
    else
      return listaDePalavrasAbreviada.slice(0, 3).join(' '); // + ' ' + listaDePalavrasAbreviada.slice(-1).join(' ');
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