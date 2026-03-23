import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/home/Home';
import Register from './components/register/Register';
import Play from './components/play/Play';
import PrePlay from './components/prePlay/PrePlay';
import Library from './components/library/Library';
import Profile from './components/profile/Profile';
import Settings from './components/settings/Settings';
import Login from './components/login/Login';
import { pedometer } from './services/PodometerService';
import { useEffect } from 'react';

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

      {/* Redirección por defecto si la ruta no existe */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;