import { DisciplinaHoras, Horario } from "@/types/interfaces";
import { useState } from "react";
import DocenteModal from "../CalendarioSemanalDocente/DocenteModal";
import DisciplinaModal from "../CalendarioSemanalDisciplina/DisciplinaModal";
import { gerarCorDisciplina } from "@/lib/utils";


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
    <div className="border  rounded-lg shadow-sm bg-gray-50">
      <div className="rounded-t-lg p-4" style={{ background: gerarCorDisciplina(disciplina.id, true) }} >
        <h3 className="text-lg font-bold">

          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedDisciplina(disciplina);
              setModalDisciplinaOpen(true);
            }}
            className=" underline focus:outline-none text-left"
          >
            {disciplina.nome}
          </button>
        </h3>
        <p className="text-sm">
          Cursos: <span className="font-semibold">{disciplina.cursos}</span>
        </p>
        <p className="text-sm">
          {disciplina.horas_teoricas > 0 && (
            <span>
              Total Teóricas: <span className="font-semibold">{disciplina.horas_teoricas_lecionadas}/{disciplina.horas_teoricas}h</span>
            </span>
          )}
          {disciplina.horas_teoricas > 0 && disciplina.horas_praticas > 0 && ", "}
          {disciplina.horas_praticas > 0 && (
            <span>
              Total Práticas: <span className="font-semibold">{disciplina.horas_praticas_lecionadas}/{disciplina.horas_praticas}h</span>
            </span>
          )}
        </p>
      </div>

      {/* <p className="text-sm ml-2 mt-2">Disponibilidade dos docentes (agregada, no caso de disciplina em funcionamento em vários cursos)</p> */}
      {/* <ul className="list-disc pl-6 pb-4 mt-2 rounded-b-lg">
        {disciplina.docentes.map((docente, idx) => {
          const partes: string[] = [];
          if (docente.horas_teoricas > 0) partes.push(`teórica:  ${docente.horas_teoricas_lecionadas}/${docente.horas_teoricas}h`);
          if (docente.horas_praticas > 0) partes.push(`prática:  ${docente.horas_praticas_lecionadas}/${docente.horas_praticas}h`);

          // Condição para destacar em vermelho
          const needsAttention =
            docente.horas_praticas > 0 &&
            docente.horas_praticas_lecionadas !== docente.horas_praticas ||
            docente.horas_teoricas > 0 &&
            docente.horas_teoricas_lecionadas !== docente.horas_teoricas;

          return (
            <li 
              key={idx} 
              className="text-sm"
               style={needsAttention ? { color: "red", fontWeight: 'bold' } : {}}
            >
              <button
                onClick={() => setSelectedDocente(docente)}
                className="font-bold underline focus:outline-none"
              >
                {docente.nome}
              </button>
              <span>
              {partes.length > 0 && ` — ${partes.join(" | ")}`}
              </span>
            </li>
          );
        })}
      </ul> */}
    </div>
    {selectedDocente && (
      <DocenteModal
        isOpen={!!selectedDocente}
        setModalOpen={() => setSelectedDocente(null)}
        docente_id={selectedDocente.id}
        docente_nome={selectedDocente.nome}
        ano_lectivo_id={horario.ano_lectivo_id} 
        semestre={horario.semestre}     
      />
    )}

    {selectedDisciplina && (
      <DisciplinaModal
        isOpen={isModalDisciplinaOpen}
        setModalOpen={setModalDisciplinaOpen}
        disciplina_id={selectedDisciplina.id}
        disciplina_nome={selectedDisciplina.nome}
        disciplina_cursos={selectedDisciplina.cursos}
        ano_lectivo_id={horario.ano_lectivo_id}
        semestre={horario.semestre}
      />)
    }
  </>
  );
}
