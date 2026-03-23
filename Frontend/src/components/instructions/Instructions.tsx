import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Instructions: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'app' | 'game'>('app');

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
            { title: "🌀 Estados Alterados", desc: "Ciertos ataques pueden Paralizar o Cegar al rival. Un Grumpi paralizado debe lanzar moneda para intentar atacar." },
            { title: "🔄 Cambio de Estrategia", desc: "Puedes cambiar tu Grumpi activo en cualquier momento desde el menú de ajustes, pero perderás tu turno." }
        ]
    };

    return (
        <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center font-sans text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#1e293b_0%,_#020617_70%)] opacity-40" />

            <div className="relative z-10 w-full max-w-2xl bg-slate-900/90 backdrop-blur-2xl border-2 border-slate-800 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh]">

                {/* CABECERA */}
                <div className="p-8 border-b border-slate-800 text-center">
                    <h1 className="text-3xl font-black italic uppercase text-orange-500 tracking-tighter">Manual de Campo</h1>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1 text-center">Instrucciones de uso de la aplicación</p>
                </div>

                {/* SELECTOR DE TABS */}
                <div className="flex p-2 bg-slate-950 mx-8 mt-6 rounded-2xl border border-slate-800">
                    <button
                        onClick={() => setActiveTab('app')}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'app' ? 'bg-orange-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Sistema App
                    </button>
                    <button
                        onClick={() => setActiveTab('game')}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'game' ? 'bg-orange-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Reglas de Combate
                    </button>
                </div>

                {/* CONTENIDO SCROLLEABLE */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                    {sections[activeTab].map((item, index) => (
                        <div key={index} className="bg-slate-800/40 p-5 rounded-3xl border border-slate-700/50 hover:border-orange-500/30 transition-colors">
                            <h3 className="text-orange-500 font-black uppercase italic text-sm mb-2">{item.title}</h3>
                            <p className="text-slate-400 text-xs leading-relaxed font-medium">{item.desc}</p>
                        </div>
                    ))}
                </div>

                {/* BOTÓN VOLVER */}
                <div className="p-8 border-t border-slate-800">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full bg-slate-800 hover:bg-slate-700 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95"
                    >
                        Entendido, volver
                    </button>
                </div>
            </div>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
        </div>
    );
};

export default Instructions;