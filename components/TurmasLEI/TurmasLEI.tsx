"use client";

import { useMemo, useState, useEffect } from "react";
import SelectHorarioLEI from "@/components/SelectHorarioLEI/SelectHorarioLEI";
import ListaTurmas from "../ListaTurmas";
import { useHorarios } from "@/hooks/useHorarios";
import { Loader2 } from "lucide-react";


export default function TurmasLEI() {

  //
  // A. Definição do estado

  const [selectedHorarioId, setSelectedHorarioId] = useState<number | null>(null);
  const { horarios, isLoading } = useHorarios();

  const horario = useMemo(() => {
    if (!selectedHorarioId || !horarios) return null;
    return horarios.find(h => h.id === selectedHorarioId) || null;
  }, [selectedHorarioId, horarios]);

  useEffect(() => {
    function sendHeight() {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage(
        { type: "iframe-turmas-height", height },
        "*"
      );
    }

    window.addEventListener("load", sendHeight);
    window.addEventListener("resize", sendHeight);

    const observer = new MutationObserver(sendHeight);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    return () => {
      window.removeEventListener("load", sendHeight);
      window.removeEventListener("resize", sendHeight);
      observer.disconnect();
    };
  }, []);

  //
  // B. Renderização

  if (isLoading) return <div className="flex justify-center items-center h-32">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      <p className="text-gray-500">A carregar cursos...</p>
    </div>;

  return (
    <div className="p-4">
      <SelectHorarioLEI onSelect={setSelectedHorarioId} />

      {selectedHorarioId && horario && (
        <>
          <ListaTurmas horario={horario} editar={false} />
        </>
      )}
    </div>
  );
}
