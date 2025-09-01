import React from 'react'


export default function page() {
  return <div className="flex items-center justify-center h-80 text-2xl">
    <div>
      Esta aplicação permite:
      <ul className="list-disc pl-6">
        <li>Consultar horários de cursos, docentes, disciplinas e salas.</li>
        <li>Editar horários.</li>
      </ul>
    </div>
  </div>
}
