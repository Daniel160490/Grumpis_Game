import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import grumpisRaw from '../../data/grumpis.json';
import { type Grumpi } from '../../types/grumpi';

const grumpisData = grumpisRaw as Grumpi[];

const PrePlay: React.FC = () => {
  const navigate = useNavigate();
  const [myTeam, setMyTeam] = useState<Grumpi[]>([]);
  const [leaderIdx, setLeaderIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Cargamos los IDs que el usuario tiene desbloqueados (del Registro)
    const unlockedIds = JSON.parse(localStorage.getItem('unlocked_grumpis') || '[]');
    
    // 2. Filtramos el JSON para obtener los objetos completos de esos Grumpis
    const team = grumpisData.filter(g => unlockedIds.includes(g.id));
    
    // Tomamos los 3 primeros (o los que tenga) para el combate
    setMyTeam(team.slice(0, 3));
    setIsLoading(false);
  }, []);

  const handleStartBattle = () => {
    // Reordenamos el equipo para que el líder vaya en la posición 0
    const finalTeam = [...myTeam];
    const [selectedLeader] = finalTeam.splice(leaderIdx, 1);
    finalTeam.unshift(selectedLeader);

    // Guardamos el equipo listo para la batalla en el storage para que Play.tsx lo lea
    localStorage.setItem('current_battle_team', JSON.stringify(finalTeam));
    
    navigate('/play');
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center justify-center font-sans text-white relative overflow-hidden select-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#1e293b_0%,_#020617_70%)] opacity-40" />

      {/* CABECERA TÁCTICA */}
      <div className="relative z-10 text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-black italic uppercase text-orange-500 tracking-tighter">Preparar Combate</h1>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-2">Selecciona a tu Grumpi Líder</p>
      </div>

      {/* --- GRID DE SELECCIÓN DE EQUIPO --- */}
      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {myTeam.map((grumpi, index) => (
          <button
            key={grumpi.id}
            onClick={() => setLeaderIdx(index)}
            className={`relative group transition-all duration-500 rounded-[2.5rem] overflow-hidden border-4 
              ${leaderIdx === index 
                ? 'border-orange-500 scale-105 shadow-[0_0_40px_rgba(234,88,12,0.4)]' 
                : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-600'
              }`}
          >
            {/* Tag de Líder */}
            {leaderIdx === index && (
              <div className="absolute top-4 left-4 z-20 bg-orange-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase italic animate-pulse">
                Líder de Equipo
              </div>
            )}

            {/* Imagen del Grumpi */}
            <div className="aspect-[3/4] relative">
              <img src={grumpi.img_general} className="w-full h-full object-cover" alt={grumpi.nombre} />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            </div>

            {/* Info de la Carta */}
            <div className="absolute inset-x-0 bottom-0 p-6 text-left">
              <h3 className="text-2xl font-black uppercase text-white leading-tight">{grumpi.nombre}</h3>
              <div className="flex justify-between items-center mt-2">
                <span className="text-orange-500 font-bold text-xs uppercase italic">{grumpi.tipo}</span>
                <span className="bg-slate-900/80 px-2 py-1 rounded text-[10px] font-mono text-emerald-400 border border-emerald-500/30">PS {grumpi.PS}</span>
              </div>
            </div>
            
            {/* Overlay de selección */}
            {leaderIdx !== index && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="bg-white text-black px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest">Elegir como Líder</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* --- BOTÓN DE LANZAMIENTO --- */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-4">
        <button 
          onClick={handleStartBattle}
          className="w-full bg-orange-600 hover:bg-orange-500 py-5 rounded-[2rem] font-black text-xl italic uppercase tracking-tighter transition-all active:scale-95 shadow-2xl shadow-orange-900/40 flex items-center justify-center gap-4"
        >
          <span>¡AL CAMPO DE BATALLA!</span>
          <span className="text-2xl">⚔️</span>
        </button>
        
        <button 
          onClick={() => navigate('/')}
          className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] hover:text-white transition-colors"
        >
          Cancelar Despliegue
        </button>
      </div>

      {/* Estilo para las barras de fondo (opcional) */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-orange-500/10 -rotate-12 pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-full h-px bg-orange-500/10 rotate-12 pointer-events-none" />
    </div>
  );
};

export default PrePlay;