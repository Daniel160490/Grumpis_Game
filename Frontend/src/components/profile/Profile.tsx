import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import grumpisRaw from '../../data/grumpis.json';
import { type Grumpi } from '../../types/grumpi';
import confetti from 'canvas-confetti';

const grumpisData = grumpisRaw as Grumpi[];

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [favoriteGrumpi, setFavoriteGrumpi] = useState<Grumpi | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [lastKnownLevel, setLastKnownLevel] = useState<number | null>(null);

  const username = localStorage.getItem('grumpi_user');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) { navigate('/login'); return; }

      try {
        const data = await api.getUserCollection(username);
        
        // --- LÓGICA DE LEVEL UP (ANIMACIÓN) ---
        if (lastKnownLevel !== null && data.level > lastKnownLevel) {
          triggerLevelUpEffect();
        }
        setLastKnownLevel(data.level);
        // --------------------------------------

        setProfileData(data);

        // Cargar favorito
        const favId = data.favorite_grumpi_id || localStorage.getItem('grumpi_favorito');
        if (favId) {
          const found = grumpisData.find(g => Number(g.id) === Number(favId));
          if (found) setFavoriteGrumpi(found);
        }
      } catch (error) {
        console.error("Error cargando perfil:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
    // Refresh automático cada 30s por si el podómetro subió nivel en background
    const interval = setInterval(fetchProfile, 30000);
    return () => clearInterval(interval);
  }, [username, navigate, lastKnownLevel]);

  const triggerLevelUpEffect = () => {
    if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100, 50, 400]);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f97316', '#ffffff', '#fb923c']
    });
  };

  if (isLoading || !profileData) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-orange-500 font-black uppercase tracking-[0.3em] animate-pulse">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
        Sincronizando Perfil...
      </div>
    );
  }

  // Desestructuración segura
  const { level = 1, xp = 0, battles_won = 0, battles_lost = 0, total_steps = 0, unlocked_grumpis = [] } = profileData;
  const xpTarget = level * 1000;
  const winRate = (battles_won + battles_lost) > 0 ? ((battles_won / (battles_won + battles_lost)) * 100).toFixed(1) : "0.0";
  const collectionProgress = ((unlocked_grumpis.length / 160) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center font-sans text-white relative overflow-hidden select-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1e293b_0%,_#020617_70%)] opacity-40" />

      <div className="relative z-10 w-full max-w-2xl bg-slate-900/80 backdrop-blur-xl border-2 border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
        
        {/* CABECERA: AVATAR Y XP */}
        <div className="p-8 bg-gradient-to-b from-slate-800/50 to-transparent flex flex-col items-center">
          <div className="relative">
            <div className={`w-28 h-28 rounded-full border-4 p-1 shadow-lg transition-all duration-500 ${level > (lastKnownLevel || 0) ? 'border-yellow-400 scale-110' : 'border-orange-500'}`}>
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} className="w-full h-full rounded-full bg-slate-800" alt="avatar" />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter whitespace-nowrap shadow-lg">
              RANGO NIVEL {level}
            </div>
          </div>
          
          <h1 className="mt-6 text-3xl font-black italic uppercase tracking-tighter text-white">
            {profileData.username}
          </h1>
          
          {/* BARRA DE XP */}
          <div className="w-64 mt-4">
            <div className="flex justify-between text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">
              <span>PROGRESO NIVEL</span>
              <span>{xp} / {xpTarget} XP</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full border border-slate-700 overflow-hidden p-0.5">
              <div 
                className="h-full bg-orange-500 rounded-full shadow-[0_0_10px_rgba(234,88,12,0.6)] transition-all duration-1000" 
                style={{ width: `${Math.min((xp / xpTarget) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* GRID DE ESTADÍSTICAS */}
        <div className="px-8 grid grid-cols-2 gap-4">
          <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-3xl">
            <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-3 italic">Registro de Duelos</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Victorias</span>
                <span className="text-sm font-mono text-emerald-400 font-bold">{battles_won}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Efectividad</span>
                <span className="text-sm font-mono text-white font-bold">{winRate}%</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-3xl">
            <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3 italic">Exploración</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Pasos Totales</span>
                <span className="text-sm font-mono text-white font-bold">{total_steps.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Capturas</span>
                <span className="text-sm font-mono text-white font-bold">{unlocked_grumpis.length}</span>
              </div>
            </div>
          </div>

          {/* GRUMPI COMPAÑERO */}
          <div className="col-span-2 bg-slate-950/50 border border-slate-800 p-4 rounded-3xl flex items-center gap-6 group hover:border-orange-500/30 transition-all">
            <div className="relative w-20 h-28 bg-slate-900 rounded-xl border-2 border-slate-700 overflow-hidden shrink-0 shadow-lg group-hover:scale-105 transition-transform">
               {favoriteGrumpi ? (
                 <>
                   <img src={favoriteGrumpi.img_general} className="w-full h-full object-cover" alt="favorite" />
                   <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 via-transparent to-white/10" />
                 </>
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-slate-800 text-3xl font-black">?</div>
               )}
            </div>
            <div className="flex-1">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Grumpi Compañero</h4>
              <p className="text-xl font-black text-white uppercase italic tracking-tighter">
                {favoriteGrumpi ? favoriteGrumpi.nombre : "Sin Seleccionar"}
              </p>
              <button 
                onClick={() => navigate('/library')}
                className="mt-2 text-[10px] font-black text-orange-500 border border-orange-500/30 px-3 py-1 rounded-lg uppercase hover:bg-orange-500 hover:text-white transition-all"
              >
                Cambiar
              </button>
            </div>
          </div>
        </div>

        {/* PIE DE PÁGINA */}
        <div className="p-8 mt-4 bg-slate-950/50 flex gap-4 border-t border-slate-800 relative">
          <button onClick={() => navigate('/')} className="flex-1 bg-slate-800 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white">Volver</button>
          <button className="flex-1 bg-orange-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white shadow-lg">Editar Perfil</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;