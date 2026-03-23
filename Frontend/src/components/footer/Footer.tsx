import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-8 mt-auto relative z-10 border-t border-slate-900/30 bg-slate-950/40 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
        
        {/* Info de Autoría Compacta */}
        <div className="flex items-center gap-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
            Architect: <span className="text-orange-600/50 tracking-tighter">Dani G.D.</span>
          </p>
          <div className="w-[1px] h-3 bg-slate-800 hidden sm:block" />
          <p className="text-[8px] font-bold text-slate-600 uppercase tracking-tight">
            © {currentYear} • Protocol v2.0
          </p>
        </div>

        {/* Enlaces Legales en una sola línea */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => alert('Solo almacenamiento local (LocalStorage).')}
            className="text-[8px] font-black uppercase tracking-widest text-slate-600 hover:text-orange-500 transition-colors"
          >
            Cookies
          </button>
          
          <span className="text-slate-800 text-[8px]">•</span>
          
          <button 
            onClick={() => alert('Datos encriptados localmente.')}
            className="text-[8px] font-black uppercase tracking-widest text-slate-600 hover:text-orange-500 transition-colors"
          >
            Privacidad
          </button>
        </div>

      </div>
    </footer>
  );
};

export default Footer;