import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import grumpisRaw from '../../data/grumpis.json';
import { type Grumpi } from '../../types/grumpi';

const grumpisData = grumpisRaw as Grumpi[];

interface MenuOption {
  label: string;
  path: string;
  icon: string;
  isExit?: boolean; 
}

const Home: React.FC = () => {
  const navigate = useNavigate();

  // --- ESTADOS ---
  const [showNotification, setShowNotification] = useState(false);
  const [openingPack, setOpeningPack] = useState(false);
  const [revealedCard, setRevealedCard] = useState<Grumpi | null>(null);
  const [userName, setUserName] = useState('Entrenador');
  const [profile, setProfile] = useState<any>(null);

  const username = localStorage.getItem('grumpi_user');

  useEffect(() => {
    const fetchHomeData = async () => {
      if (!username) {
        navigate('/login');
        return;
      }
      setUserName(username);

      try {
        // Obtenemos datos reales del backend (pasos, última apertura, etc.)
        const data = await api.getUserCollection(username);
        setProfile(data);

        // LÓGICA DE NOTIFICACIÓN (24 HORAS)
        if (data.last_pack_date) {
          const lastOpen = new Date(data.last_pack_date).getTime();
          const now = new Date().getTime();
          const hoursPassed = (now - lastOpen) / (1000 * 60 * 60);

          // Si han pasado 24h y tiene al menos 500 pasos acumulados
          if (hoursPassed >= 24 && data.total_steps >= 500) {
            setShowNotification(true);
          }
        } else {
          // Si es su primera vez después del registro
          setShowNotification(true);
        }
      } catch (e) {
        console.error("Error cargando datos de inicio:", e);
      }
    };

    fetchHomeData();
  }, [username, navigate]);

  const handleOpenFromHome = async () => {
    setShowNotification(false);
    setOpeningPack(true);

    const randomGrumpi = grumpisData[Math.floor(Math.random() * grumpisData.length)];
    
    try {
      // Sincronizamos la nueva carta con el Backend
      await api.addGrumpitoCollection(username!, randomGrumpi.id);
      
      setTimeout(() => {
        setRevealedCard(randomGrumpi);
        if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 300]);
      }, 2000);
    } catch (e) {
      setOpeningPack(false);
      alert("Error de conexión con el servidor");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('grumpi_user'); 
    navigate('/login'); 
  };

  const handleMenuClick = (option: MenuOption) => {
    if (option.isExit) {
      handleLogout();
    } else {
      navigate(option.path);
    }
  };

  const menuOptions: MenuOption[] = [
    { label: 'Jugar', path: '/preplay', icon: '⚔️' },
    { label: 'Biblioteca', path: '/library', icon: '📖' },
    { label: 'Mi perfil', path: '/profile', icon: '👤' },
    { label: 'Ajustes', path: '/settings', icon: '⚙️' },
    { label: 'Cerrar sesión', path: '/logout', icon: '🚪', isExit: true },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 select-none relative overflow-hidden">
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1e293b_0%,_#020617_70%)] opacity-40" />

      {/* --- NOTIFICACIÓN EMERGENTE --- */}
      {showNotification && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[60] w-full max-w-sm px-4 animate-in slide-in-from-top-10 duration-500">
          <button 
            onClick={handleOpenFromHome}
            className="w-full bg-emerald-600 border-2 border-emerald-400 p-4 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center gap-4 group transition-transform active:scale-95"
          >
            <div className="text-3xl animate-bounce">📦</div>
            <div className="text-left flex-1">
              <p className="text-[10px] font-black uppercase text-emerald-200 tracking-widest leading-none mb-1">¡Recompensa Lista!</p>
              <p className="text-sm font-black text-white uppercase italic leading-none">Tienes un sobre nuevo</p>
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-lg text-[10px] font-black text-white">ABRIR</div>
          </button>
        </div>
      )}

      {/* --- MODAL APERTURA --- */}
      {openingPack && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-6 animate-in fade-in">
          <div className="relative flex flex-col items-center">
            {!revealedCard ? (
              <div className="flex flex-col items-center animate-bounce">
                <div className="w-40 h-56 bg-gradient-to-br from-orange-500 to-red-600 rounded-[2rem] border-4 border-white/20 shadow-[0_0_50px_rgba(234,88,12,0.5)] flex items-center justify-center text-5xl text-white">📦</div>
                <h2 className="mt-8 text-xl font-black text-orange-500 animate-pulse uppercase tracking-widest italic">Invocando...</h2>
              </div>
            ) : (
              <div className="flex flex-col items-center animate-in zoom-in duration-500">
                <div className="relative w-64 h-96 rounded-[2.5rem] border-8 border-orange-500 bg-slate-900 overflow-hidden shadow-[0_0_80px_rgba(234,88,12,0.6)]">
                  <img src={revealedCard.img_general} className="w-full h-full object-cover" alt="card" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black p-6">
                    <h3 className="text-2xl font-black uppercase text-white tracking-tighter">{revealedCard.nombre}</h3>
                    <p className="text-orange-500 font-bold text-xs mt-1 uppercase italic">{revealedCard.tipo} • PS {revealedCard.PS}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {setOpeningPack(false); setRevealedCard(null);}} 
                  className="mt-10 bg-white text-black px-12 py-4 rounded-full font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all active:scale-95 shadow-xl"
                >
                  Aceptar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- LOGO / TÍTULO --- */}
      <div className="text-center mb-16 relative z-10">
        <h1 className="text-7xl font-black text-orange-600 italic tracking-tighter drop-shadow-[0_5px_15px_rgba(234,88,12,0.4)]">
          GRUMPIS THE GAME
        </h1>
        <p className="text-slate-400 font-mono tracking-[0.3em] text-xs mt-2 ml-2">
          TRADING CARD GAME
        </p>
      </div>

      {/* --- MENÚ --- */}
      <div className="w-full max-w-sm flex flex-col gap-4 relative z-10">
        {menuOptions.map((option) => (
          <button
            key={option.label}
            onClick={() => handleMenuClick(option)}
            className={`
              relative overflow-hidden group w-full py-5 px-8 rounded-2xl text-xl font-bold 
              transition-all duration-300 flex items-center justify-between
              ${option.isExit 
                ? 'bg-transparent border-2 border-red-900/50 text-red-500 hover:bg-red-600/10 hover:border-red-500' 
                : 'bg-slate-900 border-2 border-slate-800 text-slate-100 hover:border-orange-500 hover:-translate-y-1 hover:shadow-[0_10px_25px_-10px_rgba(234,88,12,0.3)]'
              }
            `}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="z-10">{option.label}</span>
            <span className="text-2xl z-10 filter drop-shadow-sm group-hover:scale-125 transition-transform duration-300">
              {option.icon}
            </span>
          </button>
        ))}
      </div>

      {/* --- INFO DE SESIÓN --- */}
      <div className="absolute bottom-6 w-full px-8 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">
        <div>Logged in as: <span className="text-slate-400">{userName}</span></div>
        <div className="text-center sm:text-right italic">
          Creado por <span className="text-orange-600/50">Dani G.D. 2026</span>
        </div>
      </div>
    </div>
  );
};

export default Home;