import { DisciplinaHoras } from "@/types/interfaces";

// Função para gerar cor
const gerarCorDisciplina = (id: number) => {
  const hue = (id * 137) % 360;
  return `hsl(${hue}, 80%, 50%)`;
};

export default function DisciplinaCard({ disciplina }: { disciplina: DisciplinaHoras }) {
  
  //
  // A. Renderiza
  return (
    <div className="border rounded-xl p-4 shadow-sm bg-gray-50">
      <h3  style={{ color: gerarCorDisciplina(disciplina.id) }} className="text-lg font-bold">{disciplina.nome}</h3>

      <p className="text-sm">
        {disciplina.horas_teoricas > 0 && (
          <span>
            Teóricas: {disciplina.horas_teoricas_lecionadas}/{disciplina.horas_teoricas}h
          </span>
        )}
        {disciplina.horas_teoricas > 0 && disciplina.horas_praticas > 0 && ", "}
        {disciplina.horas_praticas > 0 && (
          <span>
            Práticas: {disciplina.horas_praticas_lecionadas}/{disciplina.horas_praticas}h
          </span>
        )}
      </p>

      <ul className="list-disc pl-6 mt-2">
        {disciplina.docentes.map((docente, idx) => {
          const partes: string[] = [];
          if (docente.horas_teoricas > 0) partes.push(`teórica:  ${docente.horas_teoricas_lecionadas}/${docente.horas_teoricas}h`);
          if (docente.horas_praticas > 0) partes.push(`prática:  ${docente.horas_praticas_lecionadas}/${docente.horas_praticas}h`);

          return (
            <li key={idx} className="text-gray-500 text-sm">
              <span className="font-semibold">{docente.nome}</span>
              {partes.length > 0 && ` — ${partes.join(" | ")}`}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
