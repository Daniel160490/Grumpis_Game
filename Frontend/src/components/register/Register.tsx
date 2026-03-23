import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import grumpisRaw from '../../data/grumpis.json';
import { type Grumpi } from '../../types/grumpi';
import Footer from '../footer/Footer';
import { api } from '../../services/api';

const grumpisData = grumpisRaw as Grumpi[];

const Register: React.FC = () => {
  const navigate = useNavigate();
  
  // --- ESTADOS DEL FORMULARIO Y REGISTRO ---
  const [formData, setFormData] = useState({ username: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // --- ESTADOS DE LA APERTURA DEL SOBRE DE BIENVENIDA ---
  const [openingPack, setOpeningPack] = useState(false);
  const [unlockedGrumpis, setUnlockedGrumpis] = useState<Grumpi[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  if (!formData.username || !formData.password) { setError('Campos obligatorios'); return; }
  if (formData.password !== formData.confirmPassword) { setError('Las contraseñas no coinciden'); return; }

  setIsLoading(true);

  try {
    // 2. LLAMADA REAL AL BACKEND
    const userData = await api.register(formData.username, formData.password);

    // 3. Persistimos los datos que nos devuelve Python (ID, Grumpis iniciales, etc.)
    localStorage.setItem('grumpi_user', userData.username);
    localStorage.setItem('unlocked_grumpis', JSON.stringify(userData.unlocked_grumpis));
    
    // 4. Preparamos la animación del sobre de bienvenida
    // Necesitamos convertir los IDs en objetos Grumpi del JSON local
    const starterGrumpis = grumpisData.filter(g => userData.unlocked_grumpis.includes(g.id));
    
    setUnlockedGrumpis(starterGrumpis);
    setIsLoading(false);
    setRegisterSuccess(true);
    
    // Iniciar animación tras un breve delay
    setTimeout(() => {
      setOpeningPack(true);
      if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100]);
    }, 1500);

  } catch (err: any) {
    setIsLoading(false);
    setError(err.message);
  }
};

  const nextCard = () => {
    if (currentCardIndex < unlockedGrumpis.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      if (window.navigator.vibrate) window.navigator.vibrate(50);
    } else {
      // Fin de la apertura, ir al Home
      navigate('/'); 
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans select-none">
      
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1e293b_0%,_#020617_70%)] opacity-40" />

      {/* --- OVERLAY DE APERTURA DEL SOBRE DE BIENVENIDA --- */}
      {openingPack && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-3xl animate-in fade-in duration-500">
          <div className="flex flex-col items-center">
            
            <h2 className="absolute top-16 text-3xl font-black italic uppercase text-orange-500 animate-pulse uppercase tracking-tighter">¡TU EQUIPO INICIAL!</h2>
            
            {/* Carta actual (con animación de entrada) */}
            <div key={currentCardIndex} className="relative w-72 h-[26rem] rounded-[2.5rem] border-8 border-orange-500 bg-slate-900 overflow-hidden shadow-[0_0_80px_rgba(234,88,12,0.6)] animate-in zoom-in duration-500">
              <img src={unlockedGrumpis[currentCardIndex].img_general} className="w-full h-full object-cover" alt="card" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black p-6">
                <h3 className="text-3xl font-black uppercase text-white leading-tight">{unlockedGrumpis[currentCardIndex].nombre}</h3>
                <p className="text-orange-500 font-bold text-sm mt-1 uppercase italic">{unlockedGrumpis[currentCardIndex].tipo} • PS {unlockedGrumpis[currentCardIndex].PS}</p>
              </div>
              <div className="absolute top-4 right-4 bg-orange-600 px-3 py-1 rounded-full text-xs font-black uppercase shadow-md border border-white/20">{currentCardIndex + 1} / 3</div>
            </div>

            {/* Botón para ver la siguiente carta o finalizar */}
            <button 
              onClick={nextCard} 
              className="mt-12 bg-white text-black px-14 py-4 rounded-full font-black text-lg uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all active:scale-95 shadow-xl shadow-white/10"
            >
              {currentCardIndex < unlockedGrumpis.length - 1 ? 'Siguiente Carta' : 'Entrar al Juego'}
            </button>
          </div>
        </div>
      )}

      {/* --- FORMULARIO DE REGISTRO / PANEL DE "CUENTA CREADA" --- */}
      <div className={`relative z-10 w-full max-w-md bg-slate-900/80 backdrop-blur-xl border-2 border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500 transition-opacity ${openingPack ? 'opacity-0' : 'opacity-100'}`}>
        
        {registerSuccess ? (
          // Fase 2: Mensaje de Éxito y Regalo
          <div className="p-12 text-center flex flex-col items-center gap-6 animate-in fade-in">
             <div className="w-24 h-24 rounded-full bg-emerald-600 border-4 border-emerald-400 flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(16,185,129,0.5)]">✓</div>
             <h2 className="text-3xl font-black italic uppercase text-emerald-400 tracking-tighter">¡CUENTA CREADA!</h2>
             <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Bienvenido, Entrenador <span className="text-white">{formData.username}</span>. Tu ID ha sido dado de alta en la red Grumpi.</p>
             <div className="flex flex-col items-center gap-2 mt-4 text-orange-500 animate-pulse">
                <p className="text-[10px] font-black uppercase tracking-widest">Generando Regalo de Bienvenida</p>
                <span className="text-5xl animate-bounce">🎁</span>
             </div>
          </div>
        ) : (
          // Fase 1: Formulario de Registro Normal
          <>
            <div className="p-8 bg-slate-800/50 border-b border-slate-700 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-orange-500/50 animate-[scan_2s_linear_infinite]" />
              <h1 className="text-3xl font-black italic uppercase text-orange-500 tracking-tighter decoration-orange-500/10 underline decoration-2 offset-4">Crea tu entrenador</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">Crea tu ID en la red Grumpi</p>
            </div>

            <form onSubmit={handleRegister} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">ID de Entrenador / Usuario</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="EJ: DANI_REX_99" className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl py-4 px-6 text-white placeholder:text-slate-700 focus:border-orange-500 focus:outline-none transition-all uppercase font-black" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contraseña</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl py-4 px-6 text-white placeholder:text-slate-700 focus:border-orange-500 focus:outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Repetir contraseña</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl py-4 px-6 text-white placeholder:text-slate-700 focus:border-orange-500 focus:outline-none transition-all" />
              </div>

              {error && <div className="bg-red-950/30 border border-red-500/50 p-3 rounded-xl text-red-500 text-[10px] font-black uppercase text-center shake">⚠️ {error}</div>}

              <button type="submit" disabled={isLoading} className={`w-full py-5 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3 ${isLoading ? 'bg-slate-800 text-slate-600' : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-950/20'}`}>
                {isLoading ? (<><div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />PROCESANDO...</>) : ('CREAR CUENTA')}
              </button>
            </form>

            <div className="p-6 bg-slate-950/50 text-center border-t border-slate-800">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">¿Ya tienes un ID? <button onClick={() => navigate('/')} className="text-orange-500 hover:underline">Acceder</button></p>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes scan { 0% { transform: translateY(0); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(80px); opacity: 0; } }
        .shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
      `}</style>

      <Footer/>
    </div>
  );
};

export default Register;