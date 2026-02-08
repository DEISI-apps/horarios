"use client";

import { useEffect, useMemo, useState } from "react";
import SalaModal from "../CalendarioSemanalSala/SalaModal";
import { useSalas } from "@/hooks/useSalas";
import { DoorOpen } from "lucide-react";

interface SalaProps {
    ano_lectivo_id: number;
    semestre: number;
}

export default function SalasSection({ ano_lectivo_id, semestre }: SalaProps) {

    const [isModalSalaOpen, setModalSalaOpen] = useState(false);

    const { salas, isLoadingSalas } = useSalas();

    //
    // A. State

    const [selectedSalaId, setSelectedSalaId] = useState<number | null>(null);


    const sala = useMemo(() => {
        if (!selectedSalaId || !salas) return null;
        return salas.find(s => s.id === selectedSalaId) || null;
    }, [selectedSalaId, salas]);


    //
    // B. Effects

    useEffect(() => {
        if (!isModalSalaOpen) {
            setSelectedSalaId(null);
        }
    }, [isModalSalaOpen]);

    //
    // C. Handlers

    const handleSalaSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = event.target.value;
        setSelectedSalaId(selectedId ? parseInt(selectedId) : null);
        setModalSalaOpen(true);
    };


    //
    // D. Render

    if (isLoadingSalas) return <div className="text-center text-gray-500 py-8">Carregando salas...</div>;
    if (!salas) return <div className="text-center text-gray-500 py-8">Nenhuma sala disponível</div>;

    return (
        <>
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <DoorOpen className="w-5 h-5 text-purple-600" />
                    <label htmlFor="sala-select" className="block text-sm font-semibold text-gray-700">
                        Selecione uma sala para ver o horário
                    </label>
                </div>
                <select
                    id="sala-select"
                    value={selectedSalaId ?? ""}
                    onChange={handleSalaSelection}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 font-medium transition hover:border-gray-400"
                >
                    <option value="">Selecione uma sala...</option>
                    {salas.sort((a, b) => a.nome.localeCompare(b.nome)).map((salaOpcao) => (
                        <option key={salaOpcao.id} value={salaOpcao.id}>
                            {salaOpcao.nome}
                        </option>
                    ))}
                </select>
            </section>
            
            {sala && (
                <SalaModal
                    isOpen={isModalSalaOpen}
                    setModalOpen={setModalSalaOpen}
                    sala_id={sala.id}
                    sala_nome={sala.nome}
                    ano_lectivo_id={ano_lectivo_id}
                    semestre={semestre}
                />
            )}
        </>
    );
}
