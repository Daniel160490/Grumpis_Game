import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api'; 
import grumpisRaw from '../../data/grumpis.json';
import { type Grumpi } from '../../types/grumpi';

const grumpisData = grumpisRaw as Grumpi[];

const PrePlay: React.FC = () => {
  const navigate = useNavigate();
  const [myTeam, setMyTeam] = useState<Grumpi[]>([]);
  const [leaderIdx, setLeaderIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const username = localStorage.getItem('grumpi_user');

  useEffect(() => {
    const fetchTeam = async () => {
      if (!username) { navigate('/login'); return; }
      try {
        const data = await api.getUserCollection(username);
        const unlockedIds = data.unlocked_grumpis.map(Number);
        
        const team = grumpisData.filter(g => unlockedIds.includes(Number(g.id)));
        // Asegurar que solo tomamos 3, o los que haya si son menos
        setMyTeam(team.slice(0, 3));
      } catch (error) {
        console.error("Error cargando equipo:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeam();
  }, [username, navigate]);

  const handleStartBattle = () => {
    if (myTeam.length === 0) return;
    const finalTeam = [...myTeam];
    const [selectedLeader] = finalTeam.splice(leaderIdx, 1);
    finalTeam.unshift(selectedLeader);
    localStorage.setItem('current_battle_team', JSON.stringify(finalTeam));
    navigate('/play');
  };

  if (isLoading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-orange-500 font-black uppercase italic animate-pulse">
      Preparando Arena...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center justify-center font-sans text-white relative overflow-hidden select-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#1e293b_0%,_#020617_70%)] opacity-40" />

      {/* CABECERA TÁCTICA */}
      <div className="relative z-10 text-center mb-10">
        <h1 className="text-4xl font-black italic uppercase text-orange-500 tracking-tighter drop-shadow-lg">Preparar Combate</h1>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-2 italic">Selecciona a tu Grumpi Líder</p>
      </div>

      {/* --- GRID DE SELECCIÓN DE EQUIPO (SOLUCIÓN DE CENTRADO) --- */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-8 mb-12 px-4">
        {myTeam.map((grumpi, index) => (
          <button
            key={grumpi.id}
            onClick={() => {
              setLeaderIdx(index);
              if (window.navigator.vibrate) window.navigator.vibrate(20);
            }}
            // SOLUCIÓN: Usamos h-[400px] (o el alto que quieras) y aspect-[3/4]. 
            // Eliminamos 'w-full' para que el ancho se calcule SOLO en base al alto y la proporción.
            className={`relative group transition-all duration-500 rounded-[2.5rem] border-4 flex flex-col items-center overflow-hidden h-[380px] sm:h-[420px] md:h-[450px] aspect-[3/4]
              ${leaderIdx === index 
                ? 'border-orange-500 scale-105 shadow-[0_0_50px_rgba(234,88,12,0.4)] z-20' 
                : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-600 z-10'
              }`}
          >
            {/* Tag de Líder */}
            {leaderIdx === index && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-orange-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase italic shadow-lg animate-bounce whitespace-nowrap">
                ★ LÍDER ★
              </div>
            )}

            {/* Imagen del Grumpi (CORREGIDO EL DESPLAZAMIENTO) */}
            <div className="w-full h-full bg-slate-900 relative">
              <img 
                src={grumpi.img_general} 
                //object-cover y object-center aseguran que si la imagen es distinta, se corte y centre perfectamente
                className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-110" 
                alt={grumpi.nombre} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10" />
            </div>

            {/* Info de la Carta */}
            <div className="absolute inset-x-0 bottom-0 p-6 text-left z-20">
              <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-1 italic">{grumpi.tipo}</p>
              <h3 className="text-2xl font-black uppercase text-white leading-tight drop-shadow-md truncate">{grumpi.nombre}</h3>
              <div className="mt-2 inline-block bg-slate-950/80 px-3 py-1 rounded-xl border border-emerald-500/30">
                <span className="text-[10px] font-mono text-emerald-400 font-bold whitespace-nowrap">PS {grumpi.PS}</span>
              </div>
            </div>
            
            {/* Overlay de selección para no elegidos */}
            {leaderIdx !== index && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px] z-30">
                <span className="bg-white text-black px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl">Desplegar</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* --- BOTÓN DE LANZAMIENTO (IGUAL) --- */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
        <button 
          onClick={handleStartBattle}
          disabled={myTeam.length === 0}
          className="w-full bg-orange-600 hover:bg-orange-500 py-5 rounded-[2rem] font-black text-xl italic uppercase tracking-tighter transition-all active:scale-95 shadow-2xl shadow-orange-900/40 flex items-center justify-center gap-4 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>¡AL CAMPO DE BATALLA!</span>
          <span className="text-2xl animate-pulse">⚔️</span>
        </button>
        
        <button 
          onClick={() => navigate('/')}
          className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] hover:text-white transition-colors"
        >
          Abortar Misión
        </button>
      </div>

      <div className="absolute top-1/2 left-0 w-full h-px bg-orange-500/5 -rotate-12 pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-full h-px bg-orange-500/5 rotate-12 pointer-events-none" />
    </div>
  );
};

export default PrePlay;