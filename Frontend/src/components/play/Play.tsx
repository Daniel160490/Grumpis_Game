import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import grumpisRaw from '../../data/grumpis.json';
import { type Grumpi, type Ataque } from '../../types/grumpi';
import { api } from '../../services/api';

import atacarPrimero from '../../assets/estados_alterados/AtacarPrimero.png';
import envenenar from '../../assets/estados_alterados/ENVENENAR.png';
import envenenarPordos from '../../assets/estados_alterados/ENVENENAR x2.png';
import quemar from '../../assets/estados_alterados/QUEMAR.png';
import paralizar from '../../assets/estados_alterados/PARALIZAR.png';
import confusion from '../../assets/estados_alterados/CONFUSION.png';
import proteger from '../../assets/estados_alterados/PROTEGER.png';
import coin_cara from '../../assets/moneda/coin_cara.png';
import coin_cruz from '../../assets/moneda/coin_cruz.png';

const grumpisData = grumpisRaw as Grumpi[];

type StatusEffect = 'ninguno' | 'paralizado' | 'cegado' | 'envenenado' | 'envenenado_x2' | 'quemado' | 'protegido' | 'prioridad';

const parseDamage = (efecto: string): number => {
  const match = efecto.match(/(\d+)\s*daño/i) || efecto.match(/^(\d+)$/);
  return match ? parseInt(match[1]) : 0;
};

const parseHealing = (efecto: string): number => {
  const match = efecto.match(/(?:cura|recupera)\s*(\d+)/i);
  return match ? parseInt(match[1]) : 0;
};

const detectStatus = (efecto: string): StatusEffect => {
  const e = efecto.toLowerCase();
  if (e.includes('paraliza')) return 'paralizado';
  if (e.includes('ceguera') || e.includes('confunde') || e.includes('ciega') || e.includes('confusión')) return 'cegado';
  if (e.includes('envenena x2')) return 'envenenado_x2';
  if (e.includes('envenena')) return 'envenenado';
  if (e.includes('quema')) return 'quemado';
  if (e.includes('protege')) return 'protegido';
  if (e.includes('atacar primero') || e.includes('prioridad')) return 'prioridad';
  return 'ninguno';
};

const getRandomGrumpi = () => ({ ...grumpisData[Math.floor(Math.random() * grumpisData.length)] });

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
  const username = localStorage.getItem('grumpi_user');
  const [showSettings, setShowSettings] = useState(false);
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [coinFlip, setCoinFlip] = useState<{ show: boolean, callback?: (result: 'cara' | 'cruz') => void, result?: 'cara' | 'cruz' }>({ show: false });

  const [gameState, setGameState] = useState<'versus' | 'playing' | 'gameOver'>('versus');
  const [turn, setTurn] = useState<'player' | 'enemy'>('player');
  const [log, setLog] = useState('¡Comienza la batalla!');

  const [playerTeam, setPlayerTeam] = useState<Grumpi[]>([]);
  const [enemyTeam, setEnemyTeam] = useState<Grumpi[]>([]);
  const [playerIdx, setPlayerIdx] = useState(0);
  const [enemyIdx, setEnemyIdx] = useState(0);
  const [playerHPs, setPlayerHPs] = useState<number[]>([0, 0, 0]);
  const [enemyHPs, setEnemyHPs] = useState<number[]>([0, 0, 0]);

  const [playerEffects, setPlayerEffects] = useState<StatusEffect>('ninguno');
  const [enemyEffects, setEnemyEffects] = useState<StatusEffect>('ninguno');

  // --- NUEVOS ESTADOS PARA ANIMACIÓN ---
  const [isPlayerShaking, setIsPlayerShaking] = useState(false);
  const [isEnemyShaking, setIsEnemyShaking] = useState(false);

  const triggerShake = (target: 'player' | 'enemy') => {
    if (target === 'player') {
      setIsPlayerShaking(true);
      setTimeout(() => setIsPlayerShaking(false), 500);
    } else {
      setIsEnemyShaking(true);
      setTimeout(() => setIsEnemyShaking(false), 500);
    }
  };

  const statusInstructions = [
    { img: envenenar, name: 'Envenenado', effect: 'Pierdes 10 PS por turno.' },
    { img: envenenarPordos, name: 'Veneno Letal', effect: 'Pierdes 20 PS por turno.' },
    { img: quemar, name: 'Quemado', effect: 'Pierdes 15 PS por turno.' },
    { img: paralizar, name: 'Paralizado', effect: 'Lanza moneda para atacar.' },
    { img: confusion, name: 'Cegado', effect: 'Fallo crítico al atacar.' },
    { img: proteger, name: 'Protegido', effect: 'Bloquea el próximo daño.' },
    { img: atacarPrimero, name: 'Prioridad', effect: 'Ataca antes que el rival.' },
  ];

  useEffect(() => {
    const savedTeam = localStorage.getItem('current_battle_team');
    let pTeam = savedTeam ? JSON.parse(savedTeam) : [getRandomGrumpi(), getRandomGrumpi(), getRandomGrumpi()];
    const eTeam = [getRandomGrumpi(), getRandomGrumpi(), getRandomGrumpi()];

    setPlayerTeam(pTeam);
    setEnemyTeam(eTeam);
    setPlayerHPs(pTeam.map((g: any) => g.PS));
    setEnemyHPs(eTeam.map((g: any) => g.PS));

    setGameState('versus');
    setTimeout(() => setGameState('playing'), 3500);
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
    }, 1500);
  };

  const applyOverTimeDamage = (target: 'player' | 'enemy') => {
    const currentStatus = target === 'player' ? playerEffects : enemyEffects;
    let dot = 0;
    if (currentStatus === 'envenenado') dot = 10;
    if (currentStatus === 'envenenado_x2') dot = 20;
    if (currentStatus === 'quemado') dot = 15;

    if (dot > 0) {
      triggerShake(target); // Activamos animación por daño de estado
      if (target === 'player') {
        const newHPs = [...playerHPs];
        newHPs[playerIdx] = Math.max(0, newHPs[playerIdx] - dot);
        setPlayerHPs(newHPs);
        setLog(`¡${playerTeam[playerIdx].nombre} sufre ${dot} por su estado!`);
        if (newHPs[playerIdx] === 0) manejarDerrota('player');
      } else {
        const newHPs = [...enemyHPs];
        newHPs[enemyIdx] = Math.max(0, newHPs[enemyIdx] - dot);
        setEnemyHPs(newHPs);
        setLog(`¡El rival sufre ${dot} por su estado!`);
        if (newHPs[enemyIdx] === 0) manejarDerrota('enemy');
      }
    }
  };

  useEffect(() => {
    if (gameState === 'playing' && turn === 'enemy') {
      const timer = setTimeout(() => {
        applyOverTimeDamage('enemy');
        if (enemyEffects === 'paralizado' || enemyEffects === 'cegado') {
          setLog(`El rival intenta moverse pese a estar ${enemyEffects}...`);
          requestCoinFlip((res) => {
            if (res === 'cara') {
              setLog("¡El rival se recupera y ataca!");
              setEnemyEffects('ninguno');
              const enemy = enemyTeam[enemyIdx];
              const randomAtk = enemy.ataques[Math.floor(Math.random() * enemy.ataques.length)];
              ejecutarAtaque(randomAtk, 'enemy');
            } else {
              setLog("¡El rival sigue impedido!");
              setTurn('player');
            }
          });
        } else {
          const enemy = enemyTeam[enemyIdx];
          const randomAtk = enemy.ataques[Math.floor(Math.random() * enemy.ataques.length)];
          ejecutarAtaque(randomAtk, 'enemy');
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [turn, gameState, enemyIdx]);

  const ejecutarAtaque = (ataque: Ataque, kien: 'player' | 'enemy') => {
    const isPlayer = kien === 'player';
    const currentEffect = isPlayer ? playerEffects : enemyEffects;
    if (currentEffect === 'paralizado' || currentEffect === 'cegado') {
      setLog(`${isPlayer ? playerTeam[playerIdx].nombre : 'El rival'} intenta atacar pese a estar ${currentEffect}...`);
      requestCoinFlip((res) => {
        if (res === 'cara') {
          if (isPlayer) setPlayerEffects('ninguno'); else setEnemyEffects('ninguno');
          procederConAtaque(ataque, kien);
        } else {
          setLog(`¡${isPlayer ? playerTeam[playerIdx].nombre : 'El rival'} falló por ${currentEffect}!`);
          setTurn(isPlayer ? 'enemy' : 'player');
        }
      });
    } else {
      procederConAtaque(ataque, kien);
    }
  };

  const procederConAtaque = (ataque: Ataque, kien: 'player' | 'enemy') => {
    const needsCoin = ataque.efecto.toLowerCase().includes("lanzar moneda");
    if (needsCoin) {
      requestCoinFlip((res) => {
        if (res === 'cara') aplicarTodo(ataque, kien);
        else {
          setLog("¡El lanzamiento de moneda salió cruz! El ataque falló.");
          setTurn(kien === 'player' ? 'enemy' : 'player');
        }
      });
    } else {
      aplicarTodo(ataque, kien);
    }
  };

  const aplicarTodo = (ataque: Ataque, kien: 'player' | 'enemy') => {
    const isPlayer = kien === 'player';
    const dmg = parseDamage(ataque.efecto);
    const heal = parseHealing(ataque.efecto);
    const statusToApply = detectStatus(ataque.efecto);
    const targetEffect = isPlayer ? enemyEffects : playerEffects;

    setLog(`¡${isPlayer ? playerTeam[playerIdx].nombre : 'El rival'} usó ${ataque.nombre}!`);

    if (targetEffect === 'protegido' && dmg > 0) {
      setLog("¡El escudo de energía bloqueó todo el daño!");
      if (isPlayer) setEnemyEffects('ninguno'); else setPlayerEffects('ninguno');
      setTurn(isPlayer ? 'enemy' : 'player');
      return;
    }

    // Activamos animación de impacto si hay daño
    if (dmg > 0) triggerShake(isPlayer ? 'enemy' : 'player');

    if (isPlayer) {
      const newEnemyHPs = [...enemyHPs];
      newEnemyHPs[enemyIdx] = Math.max(0, newEnemyHPs[enemyIdx] - dmg);
      setEnemyHPs(newEnemyHPs);
      const newPlayerHPs = [...playerHPs];
      newPlayerHPs[playerIdx] = Math.min(playerTeam[playerIdx].PS, newPlayerHPs[playerIdx] + heal);
      setPlayerHPs(newPlayerHPs);
      if (statusToApply !== 'ninguno') {
        if (statusToApply === 'protegido' || statusToApply === 'prioridad') {
          setPlayerEffects(statusToApply);
          setLog(`¡${playerTeam[playerIdx].nombre} se ha ${statusToApply}!`);
        } else {
          setEnemyEffects(statusToApply);
          setLog(`¡El rival ahora está ${statusToApply}!`);
        }
      }
      if (newEnemyHPs[enemyIdx] === 0) manejarDerrota('enemy');
      else setTurn(statusToApply === 'prioridad' ? 'player' : 'enemy');
    } else {
      const newPlayerHPs = [...playerHPs];
      newPlayerHPs[playerIdx] = Math.max(0, newPlayerHPs[playerIdx] - dmg);
      setPlayerHPs(newPlayerHPs);
      if (statusToApply !== 'ninguno') {
        if (statusToApply === 'protegido' || statusToApply === 'prioridad') {
          setEnemyEffects(statusToApply);
        } else {
          setPlayerEffects(statusToApply);
          setLog(`¡${playerTeam[playerIdx].nombre} ahora está ${statusToApply}!`);
        }
      }
      if (newPlayerHPs[playerIdx] === 0) manejarDerrota('player');
      else setTurn(statusToApply === 'prioridad' ? 'enemy' : 'player');
    }
  };

  const intentarCuracionManual = () => {
    if (turn !== 'player' || playerEffects === 'ninguno' || coinFlip.show) return;
    requestCoinFlip((result) => {
      if (result === 'cara') {
        setPlayerEffects('ninguno');
        setLog(`¡${playerTeam[playerIdx].nombre} se ha recuperado!`);
      } else {
        setLog(`¡Falló la recuperación! Pierdes el turno.`);
        setTimeout(() => setTurn('enemy'), 1000);
      }
    });
  };

  const manejarDerrota = async (kien: 'player' | 'enemy') => {
    if (kien === 'enemy') {
      if (enemyIdx < 2) {
        setLog(`¡${enemyTeam[enemyIdx].nombre} rival derrotado!`);
        setEnemyEffects('ninguno');
        setTimeout(() => { setEnemyIdx(prev => prev + 1); setTurn('player'); }, 1500);
      } else {
        setGameState('gameOver');
        if (username) await api.updateBattleStats(username, 'win');
      }
    } else {
      setLog(`¡${playerTeam[playerIdx].nombre} ha caído!`);
      setPlayerEffects('ninguno');
      const hasAlive = playerHPs.some((hp, i) => i !== playerIdx && hp > 0);
      if (!hasAlive) {
        setGameState('gameOver');
        if (username) await api.updateBattleStats(username, 'loss');
      } else {
        setTimeout(() => setShowSwitchMenu(true), 1000);
      }
    }
  };

  const switchGrumpi = (index: number) => {
    if (playerHPs[index] > 0 && index !== playerIdx) {
      const isForced = playerHPs[playerIdx] === 0;
      setPlayerIdx(index);
      setPlayerEffects('ninguno');
      setShowSwitchMenu(false);
      setLog(`¡Adelante ${playerTeam[index].nombre}!`);
      setTurn(isForced ? 'player' : 'enemy');
    }
  };

  if (playerTeam.length === 0 || enemyTeam.length === 0 || playerHPs.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-orange-500 font-black animate-pulse uppercase tracking-widest">Preparando Arena...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950 p-6 flex flex-col justify-between overflow-hidden text-white select-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1e293b_0%,_#020617_70%)] opacity-40" />

      {/* --- VS SCREEN --- */}
      {gameState === 'versus' && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-black to-orange-900/20" />
          <div className="relative flex flex-col md:flex-row items-center justify-around w-full max-w-6xl gap-12">
            <div className="flex flex-col items-center animate-in slide-in-from-left-20 duration-1000">
              <div className="relative w-48 h-64 border-4 border-emerald-500 rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.4)] bg-slate-900">
                <img src={playerTeam[0].img_general} className="w-full h-full object-cover" alt="player" />
              </div>
              <h3 className="mt-6 text-3xl font-black italic text-emerald-400 uppercase">{playerTeam[0].nombre}</h3>
            </div>
            <span className="text-7xl md:text-9xl font-black italic text-white select-none">VS</span>
            <div className="flex flex-col items-center animate-in slide-in-from-right-20 duration-1000">
              <div className="relative w-48 h-64 border-4 border-orange-600 rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(234,88,12,0.4)] bg-slate-900">
                <img src={enemyTeam[0].img_general} className="w-full h-full object-cover" alt="enemy" />
              </div>
              <h3 className="mt-6 text-3xl font-black italic text-orange-500 uppercase">{enemyTeam[0].nombre}</h3>
            </div>
          </div>
        </div>
      )}

      {/* --- COIN FLIP MODAL --- */}
      {coinFlip.show && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="bg-slate-900 border-4 border-orange-500 p-8 rounded-[2rem] text-center shadow-[0_0_50px_rgba(234,88,12,0.3)]">
            <h2 className="text-xl font-black mb-6 text-orange-500 italic uppercase tracking-tighter">
              {coinFlip.result === undefined ? 'Lanzando Moneda...' : '¡Resultado!'}
            </h2>
            <div className="w-40 h-40 mx-auto mb-6 relative">
              <img src={coinFlip.result === 'cruz' ? coin_cruz : coin_cara} className={`w-full h-full object-contain transition-all duration-500 ${coinFlip.result === undefined ? 'animate-spin opacity-50' : 'animate-bounce scale-110'}`} alt="coin" />
              <div className="absolute inset-0 bg-orange-500/20 blur-3xl -z-10 rounded-full" />
            </div>
            <p className="text-white font-black text-2xl uppercase tracking-widest italic drop-shadow-lg">{coinFlip.result ? coinFlip.result.toUpperCase() : 'Girando...'}</p>
            {coinFlip.result && <div className={`mt-2 text-[10px] font-bold uppercase ${coinFlip.result === 'cara' ? 'text-emerald-400' : 'text-red-500'}`}>{coinFlip.result === 'cara' ? '✓ Éxito' : '✕ Fallo'}</div>}
          </div>
        </div>
      )}

      {/* --- GAME OVER --- */}
      {gameState === 'gameOver' && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl p-6">
          <div className="bg-slate-900 border-2 border-slate-800 p-8 rounded-[2rem] text-center max-w-sm w-full">
            <h2 className={`text-5xl font-black italic uppercase mb-4 ${enemyHPs.every(hp => hp === 0) ? 'text-emerald-500' : 'text-red-600'}`}>
              {enemyHPs.every(hp => hp === 0) ? '¡Victoria!' : '¡Derrota!'}
            </h2>
            <button onClick={() => navigate('/')} className="w-full bg-orange-600 py-4 rounded-2xl font-black text-lg">SALIR</button>
          </div>
        </div>
      )}

      {/* --- OVERLAY DEL MANUAL (HELP) --- */}
      {showManual && (
        <div className="fixed inset-0 z-[250] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-slate-700 w-full max-w-lg rounded-[2.5rem] overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-black italic uppercase text-orange-500">Guía de Campo</h3>
              <button onClick={() => setShowManual(false)} className="bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center font-bold">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {statusInstructions.map((status, i) => (
                <div key={i} className="flex items-center gap-4 bg-slate-950/50 p-3 rounded-2xl border border-slate-800">
                  <img src={status.img} className="w-12 h-12 rounded-lg object-cover" alt="status" />
                  <div>
                    <h4 className="text-orange-500 font-black uppercase text-[10px]">{status.name}</h4>
                    <p className="text-slate-400 text-[10px] leading-tight font-bold">{status.effect}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-slate-950/50">
              <button onClick={() => setShowManual(false)} className="w-full bg-orange-600 py-3 rounded-xl font-black text-[10px] uppercase">Cerrar Manual</button>
            </div>
          </div>
        </div>
      )}

      {/* --- BATTLE FIELD --- */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col flex-1 justify-between py-10">
        {/* ENEMIGO */}
        <div className="flex justify-center items-start gap-4">
          <div className={`flex-1 max-w-sm bg-slate-900/60 p-4 rounded-2xl border transition-colors ${enemyEffects !== 'ninguno' ? 'border-amber-500' : 'border-slate-800'}`}>
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
              <span>{enemyTeam[enemyIdx].nombre} {enemyEffects !== 'ninguno' && <span className="text-amber-500">[{enemyEffects.toUpperCase()}]</span>}</span>
              <span>HP {enemyHPs[enemyIdx]} / {enemyTeam[enemyIdx].PS}</span>
            </div>
            <HealthBar current={enemyHPs[enemyIdx]} max={enemyTeam[enemyIdx].PS} />
          </div>
          {/* AÑADIMOS CLASE DE ANIMACIÓN CONDICIONAL */}
          <div className={`w-32 h-44 rounded-xl border-4 bg-slate-900 overflow-hidden transition-all ${turn === 'enemy' ? 'border-orange-500 scale-105 shadow-xl' : 'border-slate-700'} ${isEnemyShaking ? 'animate-shake-red' : ''}`}>
            <img src={enemyTeam[enemyIdx].img_general} className="w-full h-full object-cover" alt="enemy" />
          </div>
        </div>

        {/* LOG PANEL */}
        <div className="text-center font-bold text-white text-sm italic py-3 bg-black/40 px-8 rounded-full border border-white/10 backdrop-blur-md self-center min-w-[300px]">{log}</div>

        {/* PLAYER SLOT */}
        <div className="flex justify-center items-end gap-4">
          {/* AÑADIMOS CLASE DE ANIMACIÓN CONDICIONAL */}
          <div className={`relative w-40 h-56 rounded-2xl border-4 bg-slate-900 overflow-hidden transition-all ${turn === 'player' ? 'border-emerald-500 scale-110 shadow-xl' : 'border-slate-700'} ${isPlayerShaking ? 'animate-shake-red' : ''}`}>
            <img src={playerTeam[playerIdx].img_general} className="w-full h-full object-cover" alt="player" />
            {playerEffects !== 'ninguno' && turn === 'player' && !coinFlip.show && (
              <button onClick={intentarCuracionManual} className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center group">
                <span className="text-xs font-black bg-orange-600 px-3 py-1 rounded mb-2">CURAR ESTADO</span>
                <span className="text-[10px] text-white opacity-70 italic">(Lanzar moneda)</span>
              </button>
            )}
          </div>
          <div className={`flex-1 max-w-sm bg-slate-900/90 p-5 rounded-3xl border-2 shadow-2xl transition-colors ${playerEffects !== 'ninguno' ? 'border-amber-500' : 'border-slate-800'}`}>
            <div className="flex justify-between text-orange-500 text-[11px] font-bold mb-2">
              <span>{playerTeam[playerIdx].nombre} {playerEffects !== 'ninguno' && <span className="text-amber-400">[{playerEffects.toUpperCase()}]</span>}</span>
              <span>HP {playerHPs[playerIdx]} / {playerTeam[playerIdx].PS}</span>
            </div>
            <HealthBar current={playerHPs[playerIdx]} max={playerTeam[playerIdx].PS} />
            <div className="grid grid-cols-2 gap-2 mt-4">
              {playerTeam[playerIdx].ataques.map((atk, i) => (
                <button key={i} disabled={turn !== 'player' || gameState !== 'playing' || coinFlip.show} onClick={() => ejecutarAtaque(atk, 'player')} className="bg-slate-800 p-2 rounded-xl text-[10px] font-bold border border-slate-700 hover:border-orange-500 disabled:opacity-30 transition-all text-left">
                  <div className="uppercase text-orange-400 mb-1">{atk.nombre}</div>
                  <div className="text-slate-300 text-[8px] leading-tight">{atk.efecto}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 right-6 z-50 flex flex-col items-end gap-3">
        <button onClick={() => setShowManual(true)} className="w-12 h-12 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-xl hover:border-emerald-500 transition-all shadow-2xl">❓</button>
        <div className="flex flex-col items-end gap-2">
          {showSettings && (
            <div className="flex flex-col gap-2 animate-in slide-in-from-right-4 duration-200">
              <button onClick={() => setShowSwitchMenu(true)} className="bg-slate-800 text-white text-xs px-5 py-2 rounded-full font-bold border border-slate-600 uppercase whitespace-nowrap">🔄 Cambiar</button>
              <button onClick={() => navigate('/')} className="bg-red-950 text-red-200 text-xs px-5 py-2 rounded-full font-bold border border-red-800/50 uppercase whitespace-nowrap">🏳️ Rendirse</button>
            </div>
          )}
          <button onClick={() => setShowSettings(!showSettings)} className={`w-12 h-12 rounded-full bg-slate-900 border-2 flex items-center justify-center text-xl transition-all shadow-2xl ${showSettings ? 'border-orange-500 rotate-90' : 'border-slate-700'}`}>⚙️</button>
        </div>
      </div>

      {showSwitchMenu && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/90 p-4">
          <div className="bg-slate-900 border-2 border-slate-700 p-6 rounded-3xl max-w-md w-full">
            <h3 className="text-xl font-black text-center mb-6 text-orange-500 uppercase italic">Selección de Relevo</h3>
            <div className="flex flex-col gap-3">
              {playerTeam.map((g, i) => (
                <button key={i} disabled={playerHPs[i] === 0 || i === playerIdx} onClick={() => switchGrumpi(i)} className={`flex items-center gap-4 p-3 rounded-2xl border-2 transition-all ${i === playerIdx ? 'border-orange-500 bg-orange-500/10' : 'border-slate-800 bg-slate-800/40'} disabled:opacity-30`}>
                  <img src={g.img_general} className="w-12 h-12 object-cover rounded-lg" alt="thumb" />
                  <div className="flex-1 text-left uppercase font-bold text-xs">{g.nombre}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setShowSwitchMenu(false)} className="mt-6 w-full text-slate-500 font-black text-[10px] uppercase">CANCELAR</button>
          </div>
        </div>
      )}

      {/* --- ESTILOS DE ANIMACIÓN --- */}
      <style>{`
                @keyframes shake-red {
                    0% { transform: translate(1px, 1px) rotate(0deg); filter: brightness(1); }
                    10% { transform: translate(-1px, -2px) rotate(-1deg); filter: brightness(1.5) sepia(1) saturate(5) hue-rotate(-50deg); }
                    20% { transform: translate(-3px, 0px) rotate(1deg); }
                    30% { transform: translate(3px, 2px) rotate(0deg); }
                    40% { transform: translate(1px, -1px) rotate(1deg); filter: brightness(1.2) sepia(0.5); }
                    50% { transform: translate(-1px, 2px) rotate(-1deg); }
                    60% { transform: translate(-3px, 1px) rotate(0deg); }
                    70% { transform: translate(3px, 1px) rotate(-1deg); }
                    80% { transform: translate(-1px, -1px) rotate(1deg); }
                    90% { transform: translate(1px, 2px) rotate(0deg); }
                    100% { transform: translate(1px, -2px) rotate(-1deg); filter: brightness(1); }
                }
                .animate-shake-red {
                    animation: shake-red 0.4s cubic-bezier(.36,.07,.19,.97) both;
                }
            `}</style>
    </div>
  );
};

export default Play;