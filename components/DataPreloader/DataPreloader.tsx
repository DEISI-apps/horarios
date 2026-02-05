"use client";

import { useEffect } from "react";
import { useHorarios } from "@/hooks/useHorarios";
import { useSalas } from "@/hooks/useSalas";
import { useAnosLectivos } from "@/hooks/useAnosLectivos";

/**
 * Pré-carrega dados essenciais ao login para agilizar navegação posterior.
 * Utiliza SWR que cacheará automaticamente os dados.
 */
export function DataPreloader() {
  // Pré-carrega horários (necessário em cursos, disciplinas, docentes)
  useHorarios();

  // Pré-carrega salas
  useSalas();

  // Pré-carrega anos lectivos
  useAnosLectivos();

  // Log para debug (remover em produção)
  useEffect(() => {
    console.log("📦 Iniciando pré-carregamento de dados...");
    return () => {
      console.log("✅ Pré-carregamento concluído");
    };
  }, []);

  // Este componente não renderiza nada, apenas carrega dados
  return null;
}
