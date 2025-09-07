"use client";

import React from "react";
import Image from "next/image";

export default function Page() {

  return (
    <div className="flex flex-col items-center justify-between text-center px-4 md:px-0 mt-10 sm:mt-5">
      <div>


        {/* Imagem ilustrativa */}
        <div className="mb-6">
          <Image
            src="/horario.png"
            alt="Calendário"
            width={200}
            height={200}
            className="mx-auto rounded-lg shadow-lg"
          />
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
          <p className="font-medium font-semibold">Funcionalidades disponíveis:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Consultar horários de cursos, docentes, disciplinas e salas do DEISI.</li>
            <li>Editar horários existentes (restrito).</li>
            <li>Exportar horário em formato ICS para importar no calendário Google/Outlook.</li>
          </ul>

          <p className="font-medium  font-semibold mt-6">Funcionalidades futuras:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Autenticação.</li>
            <li>Especificação de salas de aula teóricas.</li>
            <li>Exportar horário em PDF.</li>
            <li>Exportar horário de curso em formato ICS para alunos.</li>
            <li>Integração com sistemas académicos da universidade.</li>
            <li>Integração com Class Ping.</li>
          </ul>
        </div>
      </div>


      <div className="text-center mt-10 mb-4 font-semibold">Ver Horário de: </div>
      <div className="flex flex-col sm:flex-row gap-4 mb-10">
        <a
          href="/cursos"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition-colors"
        >
          Curso
        </a>
        <a
          href="/disciplinas"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition-colors"
        >
          Disciplina
        </a>
        <a
          href="/docentes"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition-colors"
        >
          Docente
        </a>
        <a
          href="/salas"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition-colors"
        >
          Sala
        </a>
      </div>

    </div>
  );
}