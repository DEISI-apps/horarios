import { DisciplinaHoras, Horario } from "@/types/interfaces";
import { useState } from "react";
import DocenteModal from "../CalendarioSemanalDocente/DocenteModal";
import DisciplinaModal from "../CalendarioSemanalDisciplina/DisciplinaModal";
import {gerarCorDisciplina} from "@/lib/utils";


export default function DisciplinaCard({ 
  disciplina, horario
}: { disciplina: DisciplinaHoras, horario: Horario }
) {

  //
  // A. Gestão de estado
  const [selectedDocente, setSelectedDocente] = useState<{ id: number, nome: string } | null>(null);
  const [isModalDisciplinaOpen, setModalDisciplinaOpen] = useState(false);
  const [selectedDisciplina, setSelectedDisciplina] = useState<DisciplinaHoras>();

  //
  // B. Renderiza
  return (<>
    <div className="border rounded-xl p-4 shadow-sm bg-gray-50">
      <h3 style={{ color: gerarCorDisciplina(disciplina.id) }} className="text-lg font-bold">

        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedDisciplina(disciplina);
            setModalDisciplinaOpen(true);
          }}
          className="font-semibold underline focus:outline-none"
        >
          {disciplina.nome}
        </button>
      </h3>

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
              <button
                onClick={() => setSelectedDocente(docente)}
                className="font-semibold underline focus:outline-none"
              >
                {docente.nome}
              </button>
              {partes.length > 0 && ` — ${partes.join(" | ")}`}
            </li>
          );
        })}
      </ul>
    </div>
    {selectedDocente && (
      <DocenteModal
        isOpen={!!selectedDocente}
        setModalOpen={() => setSelectedDocente(null)}
        docente_id={selectedDocente.id}
        docente_nome={selectedDocente.nome}
        ano_lectivo_id={35} // You might want to pass this as a prop
        semestre={1}      // You might want to pass this as a prop
      />
    )}

    {selectedDisciplina && (
      <DisciplinaModal
        isOpen={isModalDisciplinaOpen}
        setModalOpen={setModalDisciplinaOpen}
        disciplina_id={selectedDisciplina.id}
        disciplina_nome={selectedDisciplina.nome}
        ano_lectivo_id={horario.ano_lectivo_id}
        semestre={horario.semestre}
      />)
    }
  </>
  );
}
