import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import grumpisRaw from '../../data/grumpis.json';
import { type Grumpi } from '../../types/grumpi';
import Footer from '../footer/Footer';

const grumpisData = grumpisRaw as Grumpi[];

interface SettingRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

const SettingRow: React.FC<SettingRowProps> = ({ label, description, children }) => (
  <div className="flex items-center justify-between py-4 border-b border-slate-800/50 last:border-0 px-2 rounded-xl transition-colors hover:bg-slate-800/10">
    <div className="flex flex-col flex-1 pr-4">
      <span className="text-sm font-black uppercase tracking-tight text-slate-100">{label}</span>
      {description && <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-0.5">{description}</span>}
    </div>
    <div className="flex items-center gap-3 shrink-0">{children}</div>
  </div>
);

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('grumpi_user');

  // --- ESTADOS DE AUDIO (Persistentes) ---
  const [musicVol, setMusicVol] = useState(() => {
    return parseInt(localStorage.getItem('grumpi_music_vol') || '70');
  });
  const [isMusicEnabled, setIsMusicEnabled] = useState(() => {
    return localStorage.getItem('grumpi_music_enabled') !== 'false';
  });

  // --- ESTADOS DE DATOS Y SOBRES ---
  const [profile, setProfile] = useState<any>(null);
  const [openingPack, setOpeningPack] = useState(false);
  const [revealedCard, setRevealedCard] = useState<Grumpi | null>(null);
  const [canOpenToday, setCanOpenToday] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  // --- EFECTO PARA GUARDAR AJUSTES DE AUDIO ---
  // Al cambiar estos estados, App.tsx detectará el cambio en localStorage y ajustará el audio global
  useEffect(() => {
    localStorage.setItem('grumpi_music_vol', musicVol.toString());
    localStorage.setItem('grumpi_music_enabled', isMusicEnabled.toString());
  }, [musicVol, isMusicEnabled]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!username) return;
    try {
      const data = await api.getUserCollection(username);
      setProfile(data);
      checkAvailability(data.last_pack_date);
    } catch (e) {
      console.error("Error al sincronizar ajustes:", e);
    }
  };

  const checkAvailability = (lastPackDate: string | null) => {
    if (!lastPackDate) {
      setCanOpenToday(true);
      return;
    }

    const lastOpen = new Date(lastPackDate).getTime();
    const nextAvailable = lastOpen + (24 * 60 * 60 * 1000);
    const now = new Date().getTime();

    if (now >= nextAvailable) {
      setCanOpenToday(true);
      setTimeLeft("");
    } else {
      setCanOpenToday(false);
      calculateTimeLeft(nextAvailable);
    }
  };

  const calculateTimeLeft = (targetTime: number) => {
    const update = () => {
      const now = new Date().getTime();
      const diff = targetTime - now;
      if (diff <= 0) {
        setCanOpenToday(true);
        setTimeLeft("");
        return;
      }
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${h}h ${m}m`);
    };
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  };

  const handleOpenPack = async (rarity: 'bronce' | 'solaris') => {
    if (!canOpenToday || !username) return;

    setOpeningPack(true);
    let pool = grumpisData;
    if (rarity === 'solaris') pool = grumpisData.filter(g => g.PS > 120);

    const randomCard = pool[Math.floor(Math.random() * pool.length)];

    try {
      await api.addGrumpitoCollection(username, randomCard.id);

      setTimeout(() => {
        setRevealedCard(randomCard);
        setCanOpenToday(false);
        fetchData();
        if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 300]);
      }, 2000);
    } catch (e) {
      setOpeningPack(false);
      alert("Error de red. No se pudo guardar la carta.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center justify-center font-sans text-white relative overflow-hidden select-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1e293b_0%,_#020617_70%)] opacity-40" />

      {/* --- MODAL APERTURA --- */}
      {openingPack && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="relative flex flex-col items-center">
            {!revealedCard ? (
              <div className="flex flex-col items-center animate-bounce">
                <div className="w-40 h-56 bg-gradient-to-br from-orange-500 to-red-600 rounded-[2rem] border-4 border-white/20 shadow-[0_0_50px_rgba(234,88,12,0.5)] flex items-center justify-center text-5xl">📦</div>
                <h2 className="mt-8 text-xl font-black text-orange-500 animate-pulse uppercase italic">Abriendo...</h2>
              </div>
            ) : (
              <div className="flex flex-col items-center animate-in zoom-in duration-500">
                <div className="relative w-64 h-96 rounded-[2.5rem] border-8 border-orange-500 bg-slate-900 overflow-hidden shadow-[0_0_80px_rgba(234,88,12,0.6)]">
                  <img src={revealedCard.img_general} className="w-full h-full object-cover" alt="card" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black p-6">
                    <h3 className="text-2xl font-black uppercase text-white">{revealedCard.nombre}</h3>
                    <p className="text-orange-500 font-bold text-xs mt-1 uppercase italic">{revealedCard.tipo} • PS {revealedCard.PS}</p>
                  </div>
                </div>
                <button onClick={() => { setOpeningPack(false); setRevealedCard(null); }} className="mt-10 bg-white text-black px-10 py-3 rounded-full font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-lg active:scale-95">Añadir</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- PANEL PRINCIPAL --- */}
      <div className="relative z-10 w-full max-w-lg bg-slate-900/90 backdrop-blur-2xl border-2 border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="bg-slate-800/50 p-8 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black italic uppercase text-orange-500 tracking-tighter">Ajustes</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Gestión de Cuenta</p>
          </div>
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center text-slate-500 hover:text-orange-500 transition-all">✕</button>
        </div>

        <div className="p-8 space-y-6 max-h-[55vh] overflow-y-auto custom-scrollbar">

          {/* SECCIÓN AUDIO */}
          <div className="space-y-1">
            <SettingRow label="Música" description={isMusicEnabled ? "En reproducción" : "Silenciado"}>
              <button
                onClick={() => setIsMusicEnabled(!isMusicEnabled)}
                className={`w-12 h-6 rounded-full border-2 transition-all relative ${isMusicEnabled ? 'bg-orange-600 border-orange-700' : 'bg-slate-700 border-slate-800'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${isMusicEnabled ? 'left-6' : 'left-0.5'}`} />
              </button>
            </SettingRow>

            <SettingRow label="Volumen" description={`${musicVol}%`}>
              <input
                type="range"
                min="0" max="100"
                value={musicVol}
                onChange={(e) => setMusicVol(parseInt(e.target.value))}
                className="w-24 accent-orange-500 cursor-pointer"
              />
            </SettingRow>

            <SettingRow label='Instrucciones' description='Manual de supervivencia'>
              <button onClick={() => navigate('/instructions')}
                className="bg-slate-800 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all active:scale-95 border border-slate-700 hover:border-orange-400 shadow-lg">Ver</button>
            </SettingRow>
          </div>

          {/* EXPLORACIÓN Y SOBRES */}
          <div className="pt-4 border-t border-slate-800/50 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Exploración Física</h2>
              {!canOpenToday && timeLeft && (
                <span className="text-[9px] font-bold text-slate-500 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 uppercase italic">Próximo en: {timeLeft}</span>
              )}
            </div>

            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 shadow-inner">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-black text-emerald-500 uppercase italic">Pasos Hoy: {profile?.total_steps?.toLocaleString() || 0}</span>
                <span className="text-[10px] text-slate-600 font-mono uppercase tracking-tighter">Meta: 2,500</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)] transition-all duration-1000" style={{ width: `${Math.min(((profile?.total_steps || 0) / 2500) * 100, 100)}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                disabled={!canOpenToday || (profile?.total_steps || 0) < 500}
                onClick={() => handleOpenPack('bronce')}
                className={`group p-3 rounded-2xl border flex items-center gap-4 transition-all ${canOpenToday && (profile?.total_steps || 0) >= 500 ? 'bg-emerald-900/10 border-emerald-500/50 hover:bg-emerald-900/20 active:scale-95 shadow-md' : 'bg-slate-800/20 border-slate-800 opacity-50 grayscale cursor-not-allowed'}`}
              >
                <div className="w-12 h-16 bg-gradient-to-br from-slate-400 to-slate-600 rounded-lg flex items-center justify-center text-2xl shadow-lg">📦</div>
                <div className="flex-1 text-left">
                  <div className="text-[10px] font-black text-white uppercase italic">Sobre Bronce</div>
                  <div className="text-[8px] text-slate-500 font-bold mt-1 uppercase tracking-tighter">500 pasos • {canOpenToday ? 'Disponible' : 'Cerrado'}</div>
                </div>
                {canOpenToday && (profile?.total_steps || 0) >= 500 && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
              </button>

              <button
                disabled={!canOpenToday || (profile?.total_steps || 0) < 10000}
                onClick={() => handleOpenPack('solaris')}
                className={`relative group p-3 rounded-2xl border flex items-center gap-4 overflow-hidden transition-all ${canOpenToday && (profile?.total_steps || 0) >= 10000 ? 'bg-orange-900/20 border-orange-500/50 hover:border-orange-500 active:scale-95 shadow-md' : 'bg-slate-800/20 border-slate-800 opacity-30 grayscale cursor-not-allowed'}`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
                <div className="w-12 h-16 bg-gradient-to-br from-orange-500 to-red-700 rounded-lg flex items-center justify-center text-2xl shadow-xl">🔥</div>
                <div className="flex-1 text-left">
                  <div className="text-[10px] font-black text-orange-500 uppercase italic">Sobre Solaris</div>
                  <div className="text-[8px] text-slate-600 font-bold mt-1 uppercase tracking-tighter italic">10,000 pasos • Prob. Legendaria</div>
                </div>
                {!canOpenToday || (profile?.total_steps || 0) < 10000 ? <span className="text-xs">🔒</span> : <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />}
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-950/50 flex flex-col gap-3 border-t border-slate-800">
          <button onClick={() => fetchData()} className="w-full bg-orange-600 hover:bg-orange-500 py-4 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-xl shadow-orange-950/20 uppercase tracking-tighter italic text-white">Sincronizar Dispositivo</button>
        </div>
      </div>
      <Footer />

      <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(249, 115, 22, 0.2); border-radius: 10px; }
                @keyframes shimmer { 100% { transform: translateX(100%); } }
            `}</style>
    </div>
  );
};

export default Settings;