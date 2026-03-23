import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import atacarPrimero from '../../assets/estados_alterados/AtacarPrimero.png';
import envenenar from '../../assets/estados_alterados/ENVENENAR.png';
import envenenarPordos from '../../assets/estados_alterados/ENVENENAR x2.png';
import quemar from '../../assets/estados_alterados/QUEMAR.png';
import paralizar from '../../assets/estados_alterados/PARALIZAR.png';
import confusion from '../../assets/estados_alterados/CONFUSION.png';
import proteger from '../../assets/estados_alterados/PROTEGER.png';

const Instructions: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'app' | 'game'>('app');
    const [selectedStatus, setSelectedStatus] = useState<null | { img: string, name: string }>(null);

    const statusInstructions = [
        { img: envenenar, name: 'Envenenado', effect: 'Pierdes 10 PS al inicio de cada turno.' },
        { img: envenenarPordos, name: 'Veneno Letal', effect: 'Pierdes 20 PS al inicio de cada turno.' },
        { img: quemar, name: 'Quemado', effect: 'Pierdes 15 PS al inicio de cada turno.' },
        { img: paralizar, name: 'Paralizado', effect: 'Debes lanzar moneda para poder atacar. Cruz pierde el turno.' },
        { img: confusion, name: 'Confundido / Cegado', effect: 'Dificultad extrema para acertar ataques (Lanzamiento de moneda).' },
        { img: proteger, name: 'Protegido', effect: 'El siguiente ataque recibido no causará daño.' },
        { img: atacarPrimero, name: 'Atacar primero', effect: 'Asegura el siguiente movimiento antes que el rival.' },
    ];

    const sections = {
        app: [
            { title: "👣 Movimiento Real", desc: "La app cuenta tus pasos en segundo plano. Camina para ganar XP y desbloquear nuevos sobres de Grumpis." },
            { title: "📦 Apertura de Sobres", desc: "Puedes abrir un sobre cada 24 horas. ¡Asegúrate de tener la app instalada para no perder tu turno!" },
            { title: "⭐ Favoritos", desc: "Marca un Grumpi como favorito en la Biblioteca para que aparezca en tu perfil y sea tu compañero." },
            { title: "📈 Niveles", desc: "Cada 1000 XP subes de nivel. Los niveles altos desbloquearán cartas más raras en el futuro." }
        ],
        game: [
            { title: "⚔️ Sistema de Turnos", desc: "El combate es por turnos. El primer turno se decide al azar entre tú y la IA." },
            { title: "🪙 El Azar (Moneda)", desc: "Algunos ataques requieren lanzar una moneda. ¡Cara aciertas, Cruz fallas!" },
            { title: "🔄 Cambio de Estrategia", desc: "Puedes cambiar tu Grumpi activo desde el menú de ajustes, pero perderás tu turno." }
        ]
    };

    return (
        <div className="min-h-screen bg-slate-950 p-4 sm:p-6 flex items-center justify-center font-sans text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#1e293b_0%,_#020617_70%)] opacity-40" />

            <div className="relative z-10 w-full max-w-2xl bg-slate-900/90 backdrop-blur-2xl border-2 border-slate-800 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh]">

                {/* CABECERA */}
                <div className="p-8 border-b border-slate-800 text-center">
                    <h1 className="text-3xl font-black italic uppercase text-orange-500 tracking-tighter">Manual de Campo</h1>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Grumpi Network Protocol</p>
                </div>

                {/* SELECTOR DE TABS */}
                <div className="flex p-2 bg-slate-950 mx-4 sm:mx-8 mt-6 rounded-2xl border border-slate-800">
                    <button
                        onClick={() => setActiveTab('app')}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'app' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Sistema App
                    </button>
                    <button
                        onClick={() => setActiveTab('game')}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'game' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Reglas de Combate
                    </button>
                </div>

                {/* CONTENIDO SCROLLEABLE */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar">

                    {/* Sección de Texto (App o Reglas Básicas) */}
                    <div className="space-y-6">
                        {sections[activeTab].map((item, index) => (
                            <div key={index} className="bg-slate-800/40 p-5 rounded-3xl border border-slate-700/50">
                                <h3 className="text-orange-500 font-black uppercase italic text-sm mb-2">{item.title}</h3>
                                <p className="text-slate-400 text-xs leading-relaxed font-medium">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* SECCIÓN ESPECIAL DE ESTADOS (Solo aparece en la pestaña 'game') */}
                    {activeTab === 'game' && (
                        <div className="pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-white font-black uppercase tracking-[0.2em] text-xs mb-6 border-l-4 border-orange-500 pl-3">Estados Alterados</h2>
                            <div className="grid grid-cols-1 gap-4">
                                {statusInstructions.map((status, i) => (
                                    <div key={i} onClick={() => setSelectedStatus(status)} className="flex items-center gap-4 bg-slate-950/50 p-3 rounded-[1.5rem] border border-slate-800 group hover:border-orange-500/30 transition-all cursor-pointer active:scale-95">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-700 shrink-0">
                                            <img src={status.img} alt={status.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-orange-500 font-black uppercase text-[11px] mb-1">{status.name}</h4>
                                            <p className="text-slate-500 text-[10px] leading-snug font-bold">{status.effect}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* BOTÓN VOLVER */}
                <div className="p-8 border-t border-slate-800">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full bg-slate-800 hover:bg-slate-700 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl"
                    >
                        Entendido, volver
                    </button>
                </div>
            </div>

            {/* --- MODAL DE IMAGEN GRANDE --- */}
            {selectedStatus && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in duration-300"
                    onClick={() => setSelectedStatus(null)}
                >
                    <div className="relative max-w-sm w-full animate-in zoom-in duration-300">
                        {/* Botón cerrar */}
                        <button className="absolute -top-12 right-0 text-white font-black text-xl bg-orange-600 w-10 h-10 rounded-full flex items-center justify-center shadow-lg">✕</button>

                        <div className="bg-slate-900 border-4 border-orange-500 rounded-[2.5rem] overflow-hidden shadow-[0_0_60px_rgba(234,88,12,0.4)]">
                            <img
                                src={selectedStatus.img}
                                alt={selectedStatus.name}
                                className="w-full h-auto object-contain"
                            />
                            <div className="p-6 bg-slate-950 text-center">
                                <h3 className="text-orange-500 font-black uppercase italic text-xl mb-2">{selectedStatus.name}</h3>
                                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest leading-tight">Pulsa en cualquier lugar para cerrar</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #f97316; }
            `}</style>
        </div>
    );
};

export default Instructions;