"use client";

import { useMemo, useState } from "react";
import SalaModal from "../CalendarioSemanalSala/SalaModal";
import { useSalas } from "@/hooks/useSalas";

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
    // B. Handlers

    const handleSalaSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = event.target.value;
        setSelectedSalaId(selectedId ? parseInt(selectedId) : null);
        setModalSalaOpen(true);
    };


    //
    // C. Render

    if (isLoadingSalas) return <div>Loading...</div>;
    if (!salas) return <div>No data available</div>;


    return (<>
        <section className="pt-8">
            <h2 className="mt-4 mb-2 text-lg font-semibold">Ocupação das Salas</h2>
            <p className="text-gray-500 mb-4 text-sm">Informações sobre ocupação das salas.</p>

            <select
                value={selectedSalaId ?? ""}
                onChange={handleSalaSelection}
                className="border rounded p-2 font-bold cursor-pointer mb-2 flex row gap-3 items-center"
                style={{ border: '1px solid lightgray' }}
            >
                <option value="">Selecione uma sala...</option>
                {salas.map((salaOpcao) => (
                    <option key={salaOpcao.id} value={salaOpcao.id}>
                        {salaOpcao.nome}
                    </option>
                ))}
            </select>
        </section>
        
        {sala && (<SalaModal
            isOpen={isModalSalaOpen}
            setModalOpen={setModalSalaOpen}
            sala_id={sala.id}
            sala_nome={sala.nome}
            ano_lectivo_id={ano_lectivo_id}
            semestre={semestre}
        />)}
    </>
    );
}
