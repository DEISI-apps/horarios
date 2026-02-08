"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import CalendarioSemanalAluno from "../CalendarioSemanalAluno";
import { Download, Info, Search, User, Loader2, Calendar } from "lucide-react";


import { AlunoInfo } from "@/types/interfaces";

interface HorarioAlunoProps {
  numeroAlunoInicial?: string;
  esconderPesquisa?: boolean;
}

export default function HorarioAluno({ numeroAlunoInicial, esconderPesquisa }: HorarioAlunoProps) {
  // Estado
  const [numeroAluno, setnumeroAluno] = useState(numeroAlunoInicial ?? "");
  const [alunoInfo, setAlunoInfo] = useState<AlunoInfo | null>(null);
  const [downloadFn, setDownloadFn] = useState<(() => void) | null>(null);
  const [googleCalendarLink, setGoogleCalendarLink] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedAnoLectivo = 35;
  const selectedSemestre = 2;
  const hasAutoLoaded = useRef(false);

  const showPesquisa = !esconderPesquisa;

  // Callback para receber a função de download do CalendarioSemanalAluno
  const handleDownloadReady = useCallback((fn: () => void) => {
    setDownloadFn(() => fn);
  }, []);

  // Callback para receber o link do Google Calendar
  const handleGoogleCalendarLinkReady = useCallback((link: string) => {
    setGoogleCalendarLink(link);
  }, []);

  const fetchTurmas = useCallback((numero: string) => {
    if (!numero.trim()) {
      setError("Por favor, introduza um número de aluno");
      return;
    }
    setError(null);
    setIsLoading(true);
    setDownloadFn(null);
    setAlunoInfo(null);
    fetch(`https://horariosdeisi.pythonanywhere.com/aluno-turmas/${numero}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.erro) {
          setError(data.erro);
          setAlunoInfo(null);
        } else {
          setAlunoInfo(data);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setError("Erro ao carregar dados do aluno");
        setIsLoading(false);
      });
  }, []);

  // handlers
  function descarregaTurmas() {
    fetchTurmas(numeroAluno);
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      descarregaTurmas();
    }
  }

  useEffect(() => {
    if (!numeroAlunoInicial || hasAutoLoaded.current) return;
    hasAutoLoaded.current = true;
    setnumeroAluno(numeroAlunoInicial);
    fetchTurmas(numeroAlunoInicial);
  }, [numeroAlunoInicial, fetchTurmas]);

  // Render
  return (
    <div className="p-4 flex flex-col gap-6 max-w-6xl mx-auto">
      
      {/* Secção Unificada */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Horário de Aluno</h1>
            {!alunoInfo && showPesquisa && (
              <p className="text-sm text-gray-500">Introduza o número de aluno</p>
            )}
          </div>
        </div>

        {showPesquisa && !alunoInfo && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={numeroAluno}
                onChange={(e) => {
                  setnumeroAluno(e.target.value);
                  setError(null);
                }}
                onKeyPress={handleKeyPress}
                placeholder="Introduza o número de aluno..."
                className={`w-full border-2 rounded-xl p-4 pl-12 font-medium text-lg focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-400 placeholder:font-normal ${error ? 'border-red-300 focus:border-red-500' : 'border-gray-200'}`}
                style={{ color: 'black' }}
                autoFocus
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <button
              onClick={descarregaTurmas}
              disabled={isLoading}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[180px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  A carregar...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Ver Horário
                </>
              )}
            </button>
          </div>
        )}

        {error && (
          <p className="mt-3 text-red-500 font-medium text-sm">{error}</p>
        )}

        {/* Info do Aluno - dentro da mesma caixa */}
        {alunoInfo && (
          <div className="mt-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-md">
                  {alunoInfo.aluno.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <h2 className="text-xl font-bold text-gray-900">{alunoInfo.aluno}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                      Nº {alunoInfo.numero}
                    </span>
                  </div>
                </div>
              </div>
              {downloadFn && (
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={downloadFn}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all shadow-sm hover:shadow-md text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Descarregar Horário</span>
                    <span className="sm:hidden">Descarregar</span>
                  </button>
                  <button
                    onClick={() => {
                      if (googleCalendarLink) {
                        window.open(googleCalendarLink, '_blank');
                      }
                    }}
                    disabled={!googleCalendarLink}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg flex items-center justify-center gap-2 font-semibold transition-all shadow-sm hover:shadow-md text-sm"
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="hidden sm:inline">Google Calendar</span>
                    <span className="sm:hidden">Calendar</span>
                  </button>
                  <div className="relative group">
                    <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center cursor-help hover:bg-blue-200 transition-colors">
                      <Info className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="absolute right-0 top-full mt-2 w-72 p-4 bg-gray-900 text-white text-sm rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      <p className="mb-2 font-medium">Exportar para Calendário</p>
                      <p className="text-gray-300"><strong>Descarregar:</strong> O ficheiro ICS contém o horário completo. Pode importar no Google Calendar ou Outlook.</p>
                      <p className="text-gray-300 mt-2"><strong>Google Calendar:</strong> Subscreve-se automaticamente com atualizações em tempo real.</p>
                      <div className="absolute right-6 -top-2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-900"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Calendário */}
      {alunoInfo && (
        <div className="p-4 bg-white rounded-2xl shadow-lg border border-gray-100">
          <CalendarioSemanalAluno
            aluno_info={alunoInfo}
            ano_lectivo_id={selectedAnoLectivo}
            semestre={selectedSemestre}
            showDownloadButton={false}
            onDownloadReady={handleDownloadReady}
            onGoogleCalendarLinkReady={handleGoogleCalendarLinkReady}
          />
        </div>
      )}
    </div>
  );
}
