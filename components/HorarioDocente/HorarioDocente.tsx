"use client";


import CalendarioSemanalDocente from "../CalendarioSemanalDocente/CalendarioSemanalDocente";


export default function HorarioDocente() {


  const docente_id = 26
  const ano_lectivo_id = 35
  const semestre = 1

  return (
    <div className="p-4">
      <CalendarioSemanalDocente docente_id={docente_id} ano_lectivo_id={ano_lectivo_id} semestre={semestre} />
    </div>
  );
}
