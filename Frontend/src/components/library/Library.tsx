import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import grumpisRaw from '../../data/grumpis.json';
import { type Grumpi } from '../../types/grumpi';

const grumpisData = grumpisRaw as Grumpi[];

const Library: React.FC = () => {
  const navigate = useNavigate();
  const [unlockedIds, setUnlockedIds] = useState<number[]>([]); 
  const [favoriteId, setFavoriteId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'todos' | 'conseguidos' | 'faltantes'>('todos');
  const [isLoading, setIsLoading] = useState(true);
  const username = localStorage.getItem('grumpi_user');

  useEffect(() => {
    const fetchPlayerData = async () => {
      if (!username) { navigate('/login'); return; }
      
      // 1. Carga rápida desde LocalStorage para evitar el efecto "vacío"
      const localFav = localStorage.getItem('grumpi_favorito');
      if (localFav) setFavoriteId(Number(localFav));

      try {
        const data = await api.getUserCollection(username);
        
        // Sincronizar IDs
        const ids = data.unlocked_grumpis.map((id: any) => Number(id));
        setUnlockedIds(ids);

        // 2. Sincronizar Favorito del Servidor (manda sobre el local)
        if (data.favorite_grumpi_id) {
          const serverFavId = Number(data.favorite_grumpi_id);
          setFavoriteId(serverFavId);
          localStorage.setItem('grumpi_favorito', String(serverFavId));
        }
      } catch (error) {
        console.error("Error al sincronizar biblioteca:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlayerData();
  }, [username, navigate]);

  const marcarComoFavorito = async (id: number) => {
    // Actualización optimista de la UI
    setFavoriteId(id);
    localStorage.setItem('grumpi_favorito', String(id));
    
    if (window.navigator.vibrate) window.navigator.vibrate(50);
    
    try {
      if (username) {
        await api.updateFavorite(username, id);
      }
    } catch (error) {
      console.error("Error al guardar en el servidor:", error);
    }
  };

  const displayedGrumpis = grumpisData.filter(g => {
    const isUnlocked = unlockedIds.includes(Number(g.id));
    if (filter === 'conseguidos') return isUnlocked;
    if (filter === 'faltantes') return !isUnlocked;
    return true;
  });

  if (isLoading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-black italic uppercase tracking-widest animate-pulse">
      <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
      Sincronizando biblioteca...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-8 font-sans text-white relative flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#1e293b_0%,_#020617_70%)] opacity-40" />

      {/* CABECERA */}
      <div className="relative z-20 max-w-6xl w-full mx-auto flex flex-col sm:flex-row justify-between items-center mb-8 gap-6">
        <div>
          <h1 className="text-4xl font-black italic uppercase text-orange-500 tracking-tighter">Biblioteca</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">
            Colección: <span className="text-white">{unlockedIds.length}</span> / {grumpisData.length}
          </p>
        </div>

        <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
          {(['todos', 'conseguidos', 'faltantes'] as const).map((f) => (
            <button 
              key={f} 
              onClick={() => setFilter(f)} 
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${filter === f ? 'bg-orange-600 text-white' : 'text-slate-500'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <button onClick={() => navigate('/')} className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center hover:border-orange-500 text-xl shadow-lg">✕</button>
      </div>

      {/* GRID */}
      <div className="relative z-10 max-w-6xl w-full mx-auto flex-1 overflow-y-auto custom-scrollbar pr-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 pb-24">
          {displayedGrumpis.map((grumpi) => {
            const currentId = Number(grumpi.id);
            const isUnlocked = unlockedIds.includes(currentId);
            const isFavorite = favoriteId === currentId;

            return (
              <div key={grumpi.id} className="relative group">
                {/* BOTÓN FAVORITO - Posición corregida (un poco más a la izquierda) */}
                {isUnlocked && (
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      marcarComoFavorito(currentId);
                    }}
                    style={{ zIndex: 50 }}
                    className={`absolute -top-2 right-1 w-9 h-9 rounded-xl flex items-center justify-center transition-all border-2 shadow-2xl
                      ${isFavorite 
                        ? 'bg-orange-500 border-white text-white scale-110 shadow-orange-500/50' 
                        : 'bg-black/80 border-slate-700 text-slate-500 hover:text-white'
                      }`}
                  >
                    <span className="text-lg">{isFavorite ? '★' : '☆'}</span>
                  </button>
                )}

                {/* CONTENEDOR DE CARTA */}
                <div 
                  className={`relative aspect-[3/4] rounded-2xl border-2 transition-all duration-500 overflow-hidden
                    ${isUnlocked 
                      ? 'border-slate-800 bg-slate-900 shadow-xl' 
                      : 'border-slate-900 bg-black/40 grayscale brightness-[0.2]'
                    }`}
                >
                  <img src={grumpi.img_general} alt={grumpi.nombre} className="w-full h-full object-cover" />
                  
                  {isUnlocked && (
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/20 to-transparent">
                      <p className="text-[9px] font-black uppercase text-white text-right tracking-widest">{grumpi.nombre}</p>
                    </div>
                  )}

                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl opacity-10">🔒</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #f97316; }
      `}</style>
    </div>
  );
};

export default Library;