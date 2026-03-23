import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import grumpisRaw from '../../data/grumpis.json';
import { type Grumpi, type Ataque } from '../../types/grumpi';

const grumpisData = grumpisRaw as Grumpi[];

// --- UTILIDADES DE PARSING ---
const parseDamage = (efecto: string): number => {
  const match = efecto.match(/\d+/);
  return match ? parseInt(match[0]) : 0;
};

const parseHealing = (efecto: string): number => {
  const match = efecto.match(/(?:cura|recupera)\s*(\d+)/i);
  return match ? parseInt(match[1]) : 0;
};

const detectStatus = (efecto: string): 'paralizado' | 'cegado' | 'ninguno' => {
  const e = efecto.toLowerCase();
  if (e.includes('paraliza')) return 'paralizado';
  if (e.includes('ceguera') || e.includes('confunde') || e.includes('ciega') || e.includes('confusión')) return 'cegado';
  return 'ninguno';
};

const getRandomGrumpi = () => ({ ...grumpisData[Math.floor(Math.random() * grumpisData.length)] });

// --- COMPONENTES ---
const HealthBar: React.FC<{ current: number; max: number }> = ({ current, max }) => {
  const percentage = Math.max(0, (current / max) * 100);
  const barColor = percentage > 50 ? 'bg-emerald-500' : percentage > 20 ? 'bg-amber-500' : 'bg-red-600';
  return (
    <div className="w-full h-2 bg-slate-800 rounded-full border border-slate-700 overflow-hidden mt-1">
      <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${percentage}%` }} />
    </div>
  );
};

const Play: React.FC = () => {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);
  const [coinFlip, setCoinFlip] = useState<{ show: boolean, callback?: (result: 'cara' | 'cruz') => void, result?: 'cara' | 'cruz' }>({ show: false });

  // Estados de flujo de juego
  const [gameState, setGameState] = useState<'versus' | 'playing' | 'gameOver'>('versus');
  const [turn, setTurn] = useState<'player' | 'enemy'>('player');
  const [log, setLog] = useState('¡Comienza la batalla!');

  // Equipos
  const [playerTeam, setPlayerTeam] = useState<Grumpi[]>([]);
  const [enemyTeam, setEnemyTeam] = useState<Grumpi[]>([]);
  const [playerIdx, setPlayerIdx] = useState(0);
  const [enemyIdx, setEnemyIdx] = useState(0);
  const [playerHPs, setPlayerHPs] = useState<number[]>([0, 0, 0]);
  const [enemyHPs, setEnemyHPs] = useState<number[]>([0, 0, 0]);

  const [playerEffects, setPlayerEffects] = useState<'ninguno' | 'paralizado' | 'cegado'>('ninguno');
  const [enemyEffects, setEnemyEffects] = useState<'ninguno' | 'paralizado' | 'cegado'>('ninguno');

  // --- CARGA DE DATOS ---
  useEffect(() => {
    // Intentar cargar equipo de PrePlay
    const savedTeam = localStorage.getItem('current_battle_team');
    let pTeam: Grumpi[] = [];

    if (savedTeam) {
      pTeam = JSON.parse(savedTeam);
    } else {
      // Fallback aleatorio si no hay equipo guardado
      pTeam = [getRandomGrumpi(), getRandomGrumpi(), getRandomGrumpi()];
    }

    const eTeam = [getRandomGrumpi(), getRandomGrumpi(), getRandomGrumpi()];
    
    setPlayerTeam(pTeam);
    setEnemyTeam(eTeam);
    setPlayerHPs(pTeam.map(g => g.PS));
    setEnemyHPs(eTeam.map(g => g.PS));
    setTurn(Math.random() > 0.5 ? 'player' : 'enemy');

    // Quitar pantalla de versus tras 3.5 segundos
    const vsTimer = setTimeout(() => {
        setGameState('playing');
    }, 3500);

    return () => clearTimeout(vsTimer);
  }, []);

  const requestCoinFlip = (callback: (result: 'cara' | 'cruz') => void) => {
    setCoinFlip({ show: true, callback, result: undefined });
    setTimeout(() => {
      const finalResult = Math.random() > 0.5 ? 'cara' : 'cruz';
      setCoinFlip(prev => ({ ...prev, result: finalResult }));
      setTimeout(() => {
        setCoinFlip({ show: false });
        callback(finalResult);
      }, 1500);
    }, 2000);
  };

  // --- LÓGICA TURNO ENEMIGO ---
  useEffect(() => {
    if (gameState === 'playing' && turn === 'enemy') {
      if (enemyEffects !== 'ninguno') {
        const timer = setTimeout(() => {
          setLog(`El rival intenta recuperarse de ${enemyEffects}...`);
          requestCoinFlip((result) => {
            if (result === 'cara') {
              setEnemyEffects('ninguno');
              setLog(`¡El rival se ha recuperado!`);
            } else {
              setLog(`¡El rival sigue ${enemyEffects} y pierde el turno!`);
              setTimeout(() => setTurn('player'), 1000);
            }
          });
        }, 1200);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          const enemy = enemyTeam[enemyIdx];
          const randomAtk = enemy.ataques[Math.floor(Math.random() * enemy.ataques.length)];
          ejecutarAtaque(randomAtk, 'enemy');
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [turn, gameState, enemyEffects]);

  const ejecutarAtaque = (ataque: Ataque, kien: 'player' | 'enemy') => {
    const damage = parseDamage(ataque.efecto);
    const healing = parseHealing(ataque.efecto);
    const statusToApply = detectStatus(ataque.efecto);
    const needsCoin = ataque.efecto.includes("Lanzar moneda");

    if (needsCoin && kien === 'player') {
      requestCoinFlip((result) => {
        if (result === 'cara') {
          aplicarTodo(damage, healing, statusToApply, kien, ataque.nombre);
        } else {
          setLog(`¡Salió cruz! El ataque de ${playerTeam[playerIdx].nombre} falló.`);
          setTurn('enemy');
        }
      });
    } else {
      aplicarTodo(damage, healing, statusToApply, kien, ataque.nombre);
    }
  };

  const aplicarTodo = (dmg: number, heal: number, status: any, kien: 'player' | 'enemy', name: string) => {
    if (kien === 'player') {
      const newEnemyHPs = [...enemyHPs];
      newEnemyHPs[enemyIdx] = Math.max(0, newEnemyHPs[enemyIdx] - dmg);
      setEnemyHPs(newEnemyHPs);

      const newPlayerHPs = [...playerHPs];
      newPlayerHPs[playerIdx] = Math.min(playerTeam[playerIdx].PS, newPlayerHPs[playerIdx] + heal);
      setPlayerHPs(newPlayerHPs);

      if (status !== 'ninguno' && newEnemyHPs[enemyIdx] > 0) setEnemyEffects(status);
      
      setLog(`¡${playerTeam[playerIdx].nombre} usó ${name}! ${heal > 0 ? '¡Se curó!' : ''}`);
      if (newEnemyHPs[enemyIdx] === 0) manejarDerrota('enemy');
      else setTurn('enemy');
    } else {
      const newPlayerHPs = [...playerHPs];
      newPlayerHPs[playerIdx] = Math.max(0, newPlayerHPs[playerIdx] - dmg);
      setPlayerHPs(newPlayerHPs);

      if (status !== 'ninguno' && newPlayerHPs[playerIdx] > 0) setPlayerEffects(status);

      setLog(`¡El rival usó ${name}!`);
      if (newPlayerHPs[playerIdx] === 0) manejarDerrota('player');
      else setTurn('player');
    }
  };

  const intentarCuracionManual = () => {
    if (turn !== 'player' || playerEffects === 'ninguno' || coinFlip.show) return;
    requestCoinFlip((result) => {
      if (result === 'cara') {
        setPlayerEffects('ninguno');
        setLog(`¡${playerTeam[playerIdx].nombre} se ha recuperado!`);
      } else {
        setLog(`¡Salió cruz! Pierdes el turno.`);
        setTimeout(() => setTurn('enemy'), 1000);
      }
    });
  };

  const manejarDerrota = (kien: 'player' | 'enemy') => {
    if (kien === 'enemy') {
      if (enemyIdx < 2) {
        setLog(`¡${enemyTeam[enemyIdx].nombre} rival derrotado!`);
        setEnemyEffects('ninguno');
        setTimeout(() => { setEnemyIdx(prev => prev + 1); setTurn('player'); }, 1500);
      } else { setGameState('gameOver'); }
    } else {
      setLog(`¡${playerTeam[playerIdx].nombre} ha caído!`);
      setPlayerEffects('ninguno');
      if (playerHPs.every((hp, i) => i === playerIdx ? 0 : hp === 0)) { setGameState('gameOver'); }
      else { setTimeout(() => setShowSwitchMenu(true), 1000); }
    }
  };

  const switchGrumpi = (index: number) => {
    if (playerHPs[index] > 0 && index !== playerIdx) {
      const forced = playerHPs[playerIdx] === 0;
      setPlayerIdx(index);
      setPlayerEffects('ninguno');
      setShowSwitchMenu(false);
      setLog(`¡Adelante ${playerTeam[index].nombre}!`);
      setTurn(forced ? 'player' : 'enemy');
    }
  };

  if (playerTeam.length === 0) return null;

  return (
    <div className="relative min-h-screen bg-slate-950 p-6 flex flex-col justify-between overflow-hidden text-white select-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1e293b_0%,_#020617_70%)] opacity-40" />

      {/* --- PANTALLA VERSUS (VS) --- */}
{gameState === 'versus' && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4">
            {/* Fondo dinámico */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-black to-orange-900/20" />
            
            <div className="relative flex flex-col md:flex-row items-center justify-around w-full max-w-6xl gap-12">
                
                {/* LADO JUGADOR */}
                <div className="flex flex-col items-center animate-in slide-in-from-left-20 duration-1000">
                    <div className="relative w-48 h-64 sm:w-56 sm:h-72 border-4 border-emerald-500 rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.4)] bg-slate-900">
                        <img 
                          src={playerTeam[0].img_general} 
                          // CORRECCIÓN: object-center asegura que el Grumpi esté en medio
                          className="w-full h-full object-cover object-center" 
                          alt="player leader" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    <div className="text-center mt-6">
                      <h3 className="text-3xl font-black italic uppercase text-emerald-400 tracking-tighter drop-shadow-md">
                        {playerTeam[0].nombre}
                      </h3>
                      <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.4em] mt-1">Entrenador Local</p>
                    </div>
                </div>

                {/* VS CENTRAL */}
                <div className="flex flex-col items-center animate-in zoom-in spin-in-12 duration-700 delay-500">
                    <span className="text-7xl md:text-9xl font-black italic text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] select-none">VS</span>
                    <div className="w-32 md:w-48 h-1.5 bg-gradient-to-r from-emerald-500 via-white to-orange-500 mt-4 rounded-full shadow-lg" />
                </div>

                {/* LADO RIVAL */}
                <div className="flex flex-col items-center animate-in slide-in-from-right-20 duration-1000">
                    <div className="relative w-48 h-64 sm:w-56 sm:h-72 border-4 border-orange-600 rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(234,88,12,0.4)] bg-slate-900">
                        <img 
                          src={enemyTeam[0].img_general} 
                          // CORRECCIÓN: object-center para centrado perfecto
                          className="w-full h-full object-cover object-center" 
                          alt="enemy leader" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    <div className="text-center mt-6">
                      <h3 className="text-3xl font-black italic uppercase text-orange-500 tracking-tighter drop-shadow-md">
                        {enemyTeam[0].nombre}
                      </h3>
                      <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.4em] mt-1">IA Adversaria</p>
                    </div>
                </div>

            </div>
        </div>
      )}

      {/* --- MODAL MONEDA --- */}
      {coinFlip.show && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border-4 border-orange-500 p-8 rounded-[2rem] text-center shadow-2xl">
            <h2 className="text-2xl font-black mb-6 text-orange-500 italic uppercase">Lanzando Moneda</h2>
            <div className="w-32 h-32 mx-auto relative mb-8 flex items-center justify-center">
              <img 
                src={coinFlip.result === 'cruz' ? '/MONEDA_GRUMPI_CRUZ.png' : '/MONEDA_GRUMPI_CARA.png'} 
                className={`w-full h-full object-contain ${coinFlip.result === undefined ? 'animate-spin' : 'animate-bounce'}`} 
                alt="coin" 
              />
            </div>
            <p className="text-slate-400 font-mono text-xs tracking-widest uppercase italic">
              {coinFlip.result ? `¡HA SALIDO ${coinFlip.result.toUpperCase()}!` : 'Girando...'}
            </p>
          </div>
        </div>
      )}

      {/* --- MODAL FIN DE JUEGO --- */}
      {gameState === 'gameOver' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-6 animate-in fade-in duration-500">
          <div className="relative max-w-sm w-full bg-slate-900 border-2 border-slate-800 p-8 rounded-[2rem] text-center shadow-2xl">
            <div className={`absolute -top-24 -left-24 w-48 h-48 blur-[100px] opacity-50 ${enemyHPs.every(hp => hp === 0) ? 'bg-emerald-500' : 'bg-red-600'}`} />
            <div className="relative z-10">
              <div className="text-6xl mb-4">{enemyHPs.every(hp => hp === 0) ? '🏆' : '💀'}</div>
              <h2 className={`text-5xl font-black italic uppercase tracking-tighter mb-2 ${enemyHPs.every(hp => hp === 0) ? 'text-emerald-500' : 'text-red-600'}`}>
                {enemyHPs.every(hp => hp === 0) ? '¡Victoria!' : '¡Derrota!'}
              </h2>
              <p className="text-slate-400 font-medium mb-8">
                {enemyHPs.every(hp => hp === 0) ? 'Has demostrado ser el mejor entrenador.' : 'Tus Grumpis necesitan descansar.'}
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={() => navigate('/preplay')} className={`w-full py-4 rounded-2xl font-black text-lg ${enemyHPs.every(hp => hp === 0) ? 'bg-emerald-600' : 'bg-red-700'}`}>NUEVO COMBATE</button>
                <button onClick={() => navigate('/')} className="w-full bg-slate-800 text-slate-300 py-3 rounded-2xl font-bold">VOLVER AL MENÚ</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CAMPO DE BATALLA --- */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col flex-1 justify-between py-10">
        
        {/* ENEMIGO */}
        <div className="flex justify-center items-start gap-4">
          <div className={`flex-1 max-w-sm bg-slate-900/60 p-4 rounded-2xl border ${enemyEffects !== 'ninguno' ? 'border-amber-500 bg-amber-950/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'border-slate-800'}`}>
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-tighter">
                <span>{enemyTeam[enemyIdx].nombre} {enemyEffects !== 'ninguno' && <span className="text-amber-500">[{enemyEffects}]</span>}</span>
                <span>RIVAL {enemyIdx + 1}/3</span>
            </div>
            <HealthBar current={enemyHPs[enemyIdx]} max={enemyTeam[enemyIdx].PS} />
          </div>
          <div className="relative">
            <div className={`w-32 h-44 rounded-xl border-4 bg-slate-900 overflow-hidden transition-all ${turn === 'enemy' ? 'border-orange-500 scale-110 shadow-lg' : 'border-slate-700'}`}>
              <img src={enemyTeam[enemyIdx].img_general} className="w-full h-full object-cover" alt="enemy" />
              {enemyEffects !== 'ninguno' && (
                <div className="absolute inset-0 bg-amber-900/40 backdrop-blur-[1px] flex items-center justify-center">
                   <img src="/MONEDA_GRUMPI_CARA.png" className="w-12 h-12 opacity-80 animate-pulse" alt="paralyzed" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-center font-bold text-slate-400 text-sm italic py-2 max-w-xl self-center bg-black/20 px-6 rounded-full border border-white/5 backdrop-blur-sm transition-all">{log}</div>

        {/* JUGADOR */}
        <div className="flex justify-center items-end gap-4">
          <div className="relative">
            <div className={`w-40 h-56 rounded-2xl border-4 bg-slate-900 overflow-hidden transition-all ${turn === 'player' ? 'border-emerald-500 scale-110 shadow-lg' : 'border-slate-700'}`}>
              <img src={playerTeam[playerIdx].img_general} className="w-full h-full object-cover" alt="player" />
              {playerEffects !== 'ninguno' && turn === 'player' && !coinFlip.show && (
                <button onClick={intentarCuracionManual} className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center group transition-all hover:bg-black/40">
                  <img src="/MONEDA_GRUMPI_CARA.png" className="w-16 h-16 animate-bounce group-hover:scale-110 transition-transform" alt="coin" />
                  <span className="text-[10px] font-black bg-orange-600 px-2 py-1 rounded mt-2 shadow-lg animate-pulse uppercase">¡Lanza para curar!</span>
                </button>
              )}
            </div>
          </div>
          <div className={`flex-1 max-w-sm bg-slate-900/90 p-5 rounded-3xl border-2 shadow-2xl transition-all ${playerEffects !== 'ninguno' ? 'border-amber-500 bg-amber-950/40' : 'border-slate-800'}`}>
            <div className="flex justify-between text-orange-500 text-[11px] font-bold mb-2 uppercase tracking-tighter">
                <span>{playerTeam[playerIdx].nombre} {playerEffects !== 'ninguno' && <span className="text-amber-400">[{playerEffects}]</span>}</span>
                <span>{playerIdx + 1}/3</span>
            </div>
            <HealthBar current={playerHPs[playerIdx]} max={playerTeam[playerIdx].PS} />
            <div className="grid grid-cols-2 gap-2 mt-4">
              {playerTeam[playerIdx].ataques.map((atk, i) => (
                <button 
                    key={i} 
                    disabled={turn !== 'player' || gameState !== 'playing' || coinFlip.show || playerEffects !== 'ninguno'}
                    onClick={() => ejecutarAtaque(atk, 'player')}
                    className="bg-slate-800 p-2 rounded-xl text-[10px] font-bold border border-slate-700 hover:border-orange-500 disabled:opacity-50 transition-all text-left leading-tight"
                >
                  <div className="uppercase mb-1">{atk.nombre}</div>
                  <div className="text-slate-400 font-normal text-[9px]">{atk.efecto}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- BOTONES AJUSTES --- */}
      <div className="absolute top-1/2 -translate-y-1/2 right-6 z-50 flex flex-col items-end gap-3">
        {showSettings && (
          <div className="flex flex-col gap-2 animate-in slide-in-from-right-4 duration-200">
            <button onClick={() => setShowSwitchMenu(true)} className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-5 py-2 rounded-full font-bold border border-slate-600 shadow-xl transition-all active:scale-95 uppercase">🔄 Cambiar</button>
            <button onClick={() => navigate('/')} className="bg-red-950 hover:bg-red-800 text-red-200 text-xs px-5 py-2 rounded-full font-bold border border-red-800/50 shadow-xl transition-all active:scale-95 uppercase tracking-tighter">🏳️ Rendirse</button>
          </div>
        )}
        <button onClick={() => setShowSettings(!showSettings)} className={`w-12 h-12 rounded-full bg-slate-900 border-2 flex items-center justify-center text-xl transition-all shadow-2xl ${showSettings ? 'border-orange-500 rotate-90 scale-110' : 'border-slate-700 hover:border-orange-500'}`}>⚙️</button>
      </div>

      {/* --- OVERLAY CAMBIO --- */}
      {showSwitchMenu && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 border-2 border-slate-700 p-6 rounded-3xl max-w-md w-full shadow-[0_0_40px_rgba(0,0,0,0.7)]">
            <h3 className="text-xl font-black text-center mb-6 uppercase tracking-tighter italic text-orange-500">Selecciona un Grumpi</h3>
            <div className="flex flex-col gap-3">
              {playerTeam.map((g, i) => (
                <button
                  key={i}
                  disabled={playerHPs[i] === 0 || i === playerIdx}
                  onClick={() => switchGrumpi(i)}
                  className={`flex items-center gap-4 p-3 rounded-2xl border-2 transition-all ${i === playerIdx ? 'border-orange-500 bg-orange-500/10' : 'border-slate-800 hover:border-slate-600 bg-slate-800/40'} disabled:opacity-30`}
                >
                  <img src={g.img_general} className="w-12 h-12 object-cover rounded-lg border border-slate-700" alt={g.nombre} />
                  <div className="flex-1 text-left">
                    <div className="font-bold uppercase text-xs">{g.nombre}</div>
                    <HealthBar current={playerHPs[i]} max={g.PS} />
                  </div>
                  {playerHPs[i] === 0 && <span className="text-red-500 text-[10px] font-black uppercase tracking-tighter">K.O.</span>}
                </button>
              ))}
            </div>
            <button onClick={() => setShowSwitchMenu(false)} className="mt-6 w-full text-slate-500 text-[10px] font-black uppercase hover:text-white transition-colors tracking-widest">CERRAR</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Play;