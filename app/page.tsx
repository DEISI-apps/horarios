import React from "react";
import Image from "next/image";
import calendarImage from "@/public/calendar.png"; // Coloque a imagem na pasta public

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center h-[550px] text-center px-4 md:px-0">
      {/* Imagem ilustrativa */}
      <div className="mb-6">
        {/* <Image
          src={calendarImage}
          alt="Calendário"
          width={120}
          height={120}
          className="mx-auto"
        /> */}
      </div>

      {/* Título */}
      <h1 className="text-3xl font-semibold mb-4">
        Bem-vindo à aplicação de horários
      </h1>

      {/* Descrição */}
      <p className="text-gray-700 mb-8">
        Esta aplicação permite gerir e consultar horários de forma rápida e intuitiva.
      </p>

      {/* Lista de funcionalidades */}
      <div className="text-left mb-6">
        <p className="font-medium mb-2">Funcionalidades principais:</p>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>Consultar horários de cursos, docentes, disciplinas e salas.</li>
          <li>Editar horários existentes.</li>
          <li>Exportar horários em PDF.</li>
          <li>Exportar horário para calendário Google.</li>
        </ul>
      </div>

      {/* Call to Action */}
      <a
        href="/cursos"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition-colors"
      >
        Ver Horário dum Curso
      </a>
    </div>
  );
}
