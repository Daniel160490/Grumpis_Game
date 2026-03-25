import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/home/Home';
import Register from './components/register/Register';
import Play from './components/play/Play';
import PrePlay from './components/prePlay/PrePlay';
import Library from './components/library/Library';
import Profile from './components/profile/Profile';
import Settings from './components/settings/Settings';
import Login from './components/login/Login';
import { pedometer } from './services/PodometerService';
import { useEffect, useRef } from 'react';
import Instructions from './components/instructions/Instructions';
import backgroundMusic from './assets/audio/Grumpi.mp3';

// Componente Portero (ProtectedRoute)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = localStorage.getItem('grumpi_user');

  // Si no hay usuario en el sistema, mandamos al LOGIN
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      (DeviceMotionEvent as any).requestPermission()
        .then((response: string) => {
          if (response === 'granted') pedometer.start();
        });
    } else {
      pedometer.start();
    }
  }, []);

  useEffect(() => {
    // Inicializar el audio si no existe
    if (!audioRef.current) {
      audioRef.current = new Audio(backgroundMusic);
      audioRef.current.loop = true;
    }

    const updateAudio = () => {
      const isEnabled = localStorage.getItem('grumpi_music_enabled') !== 'false';
      const volume = parseInt(localStorage.getItem('grumpi_music_vol') || '70');

      if (audioRef.current) {
        audioRef.current.volume = volume / 100;
        if (isEnabled) {
          // El navegador requiere una interacción previa para el play()
          audioRef.current.play().catch(() => {
            console.log("Esperando interacción para iniciar música...");
          });
        } else {
          audioRef.current.pause();
        }
      }
    };

    // Actualizar audio al cargar
    updateAudio();

    // Escuchar cambios desde otras pestañas o componentes (como Settings)
    window.addEventListener('storage', updateAudio);

    // También podemos usar un pequeño intervalo para detectar cambios locales 
    // de localStorage si no usamos Context API
    const interval = setInterval(updateAudio, 500);

    return () => {
      window.removeEventListener('storage', updateAudio);
      clearInterval(interval);
    };
  }, []);


  return (
    // Quitamos el <BrowserRouter> de aquí porque ya está en main.tsx
    <Routes>
      {/* --- RUTA PÚBLICA --- */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />


      {/* --- RUTAS PROTEGIDAS --- */}
      <Route path="/" element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />

      <Route path="/library" element={
        <ProtectedRoute>
          <Library />
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />

      <Route path="/preplay" element={
        <ProtectedRoute>
          <PrePlay />
        </ProtectedRoute>
      } />

      <Route path="/play" element={
        <ProtectedRoute>
          <Play />
        </ProtectedRoute>
      } />

      <Route path="/instructions" element={
        <ProtectedRoute>
          <Instructions />
        </ProtectedRoute>
      } />

      {/* Redirección por defecto si la ruta no existe */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;