import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../footer/Footer';
import { api } from '../../services/api';
import imagenLogin from '../../assets/Portada Juego Grumpi.png'

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // LLAMADA AL BACKEND
      const userData = await api.login(formData.username, formData.password);

      // Guardamos la sesión (Username y Favorito si lo tiene)
      localStorage.setItem('grumpi_user', userData.username);

      if (userData.favorite_grumpi_id) {
        localStorage.setItem('grumpi_favorito', String(userData.favorite_grumpi_id));
      }

      setIsLoading(false);
      navigate('/');

    } catch (err: any) {
      setIsLoading(false);
      setError(err.message);
      if (window.navigator.vibrate) window.navigator.vibrate([50, 50]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans select-none">

      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1e293b_0%,_#020617_70%)] opacity-40" />

      {/* --- PANEL DE ACCESO --- */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border-2 border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-8 duration-500">

        {/* Cabecera de autenticación */}
        <div className="p-10 bg-gradient-to-b from-slate-800/50 to-transparent border-b border-slate-700 text-center">
          <div className="w-24 h-24 bg-slate-950 rounded-2xl border-2 border-orange-500 mx-auto flex items-center justify-center p-2 shadow-[0_0_25px_rgba(234,88,12,0.4)] relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/10 to-transparent h-1/2 w-full animate-scan pointer-events-none" />
            <img
              src={imagenLogin}
              alt="Grumpi Logo"
              className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
            />
          </div>
          <h1 className="text-3xl font-black italic uppercase text-white tracking-tighter">Inicio de sesión</h1>
          <p className="text-[10px] text-orange-500 font-black uppercase tracking-[0.3em] mt-1">Grumpi Identification System</p>
        </div>

        <form onSubmit={handleLogin} className="p-10 space-y-6">

          {/* Usuario */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">ID Entrenador</label>
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              placeholder="NOMBRE DE USUARIO"
              className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl py-4 px-6 text-white placeholder:text-slate-700 focus:border-orange-500 focus:outline-none transition-all uppercase font-black"
            />
          </div>

          {/* Contraseña */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contraseña</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl py-4 px-6 text-white placeholder:text-slate-700 focus:border-orange-500 focus:outline-none transition-all"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-950/30 border border-red-500/50 p-4 rounded-xl text-red-500 text-[10px] font-black uppercase text-center animate-shake">
              ⚠️ {error}
            </div>
          )}

          {/* Botón de Entrada */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-5 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3
              ${isLoading ? 'bg-slate-800 text-slate-600' : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-950/20'}
            `}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'AUTENTICAR'
            )}
          </button>
        </form>

        {/* Link a Registro */}
        <div className="p-8 bg-slate-950/50 text-center border-t border-slate-800">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            ¿Nuevo en el sector? <button onClick={() => navigate('/register')} className="text-orange-500 hover:text-orange-400 font-black">Crear ID</button>
          </p>
        </div>
      </div>

      {/* Marca de agua decorativa */}
      <div className="absolute bottom-10 text-[60px] font-black text-white/[0.02] italic select-none pointer-events-none">
        GRUMPI_SYSTEM_v2.0
      </div>
      <Footer />
    </div>
  );
};

export default Login;