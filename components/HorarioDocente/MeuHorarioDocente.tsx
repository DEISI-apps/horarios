"use client";

import { ANO_LECTIVO_ID, SEMESTRE } from '@/lib/constants';

import { useCallback, useState } from "react";
import CalendarioSemanalDocente from "../CalendarioSemanalDocente";
import { DocenteBase } from "@/types/interfaces";
import { Download, Info, GraduationCap } from "lucide-react";

interface MeuHorarioDocenteProps {
  docente: DocenteBase;
}

export default function MeuHorarioDocente({ docente }: MeuHorarioDocenteProps) {
  const [downloadFn, setDownloadFn] = useState<(() => void) | null>(null);

  const handleDownloadReady = useCallback((fn: () => void) => {
    setDownloadFn(() => fn);
  }, []);

  return (
    <div className="p-4 flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Info do Docente */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">O Meu Horário</h1>
              <p className="text-sm text-gray-500">{docente.nome}</p>
            </div>
          </div>

          {downloadFn && (
            <div className="flex items-center gap-3">
              <button
                onClick={downloadFn}
                className="px-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 font-bold transition-all shadow-md hover:shadow-lg whitespace-nowrap"
              >
                <Download className="w-5 h-5" />
                <span className="hidden sm:inline">Descarregar</span>
              </button>
              <div className="relative group">
                <div className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center cursor-help transition-colors">
                  <Info className="w-5 h-5 text-gray-500" />
                </div>
                <div className="absolute right-0 top-full mt-2 w-72 p-4 bg-gray-900 text-white text-sm rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <p className="mb-2 font-medium">Exportar para Calendário</p>
                  <p className="text-gray-300">O ficheiro ICS contém o horário completo das semanas lectivas. Pode importar no <strong className="text-white">Google Calendar</strong> ou <strong className="text-white">Outlook</strong>.</p>
                  <div className="absolute right-6 -top-2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-900"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calendário */}
      <div className="p-4 bg-white rounded-2xl shadow-lg border border-gray-100">
        <CalendarioSemanalDocente
          docente_id={docente.id}
          ano_lectivo_id={ANO_LECTIVO_ID}
          semestre={SEMESTRE}
          showDownloadButton={false}
          onDownloadReady={handleDownloadReady}
        />
      </div>
    </div>
  );
}
