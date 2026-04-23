import React, { useState, useEffect } from 'react';
import { Cpu, Zap, Activity, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { io } from 'socket.io-client';

interface RelayerStats {
  queueSize: number;
  oldestJobAge: number;
  cumulativeSavings: number;
  lastDecision: string;
  lastActionRatio: number;
  lastState: number[];
  timestamp: number;
}

const FEATURE_LABELS = [
  { name: 'S0: Gas T0', desc: 'Current network base fee' },
  { name: 'S1: Gas T-1', desc: 'Base fee 1 block ago' },
  { name: 'S2: Gas T-2', desc: 'Base fee 2 blocks ago' },
  { name: 'S3: Congestion', desc: 'Network usage vs limit' },
  { name: 'S4: Momentum', desc: 'Gas price change velocity' },
  { name: 'S5: Accel', desc: 'Acceleration of price change' },
  { name: 'S6: Surprise', desc: 'Market anomaly detection' },
  { name: 'S7: Backlog', desc: 'Estimated pending pressure' },
  { name: 'S8: Queue Size', desc: 'Your pending transactions' },
  { name: 'S9: Time Left', desc: 'Time until oldest job deadline' },
  { name: 'S10: Gas Ref', desc: '128-block average base fee' },
];

const AIRelayerStatus: React.FC = () => {
  const [stats, setStats] = useState<RelayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const isProd = import.meta.env.PROD;
    const origin = window.location.origin;

    // In production, we usually proxy through Nginx at /api
    // In dev, we connect directly to port 3001
    // Cấu hình cổng kết nối thâth sự cho môi trường Docker (1609)
    const socketUrl = isProd ? origin : `http://${window.location.hostname}:1609`;
    const socketPath = '/api/socket.io';

    console.log('--- AI RELAYER CONNECTING TO:', socketUrl, 'PATH:', socketPath);

    const socket = io(socketUrl, {
      path: socketPath,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 20,
      reconnectionDelay: 1000
    });

    const apiUrl = isProd ? `${origin}/api` : `http://${window.location.hostname}:1609`;

    const fetchStats = async () => {
      try {
        const response = await fetch(`${apiUrl}/relayer/stats`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Initial stats fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchHistory = async () => {
      try {
        const res = await fetch(`${apiUrl}/relayer/history`);
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (err) {
        console.error('Initial history fetch failed:', err);
      }
    };

    fetchStats();
    fetchHistory();

    socket.on('connect', () => console.log('--- AI RELAYER SOCKET CONNECTED!'));
    socket.on('connect_error', (err) => console.error('--- AI RELAYER SOCKET ERROR:', err));

    socket.on('relayer-stats', (newStats: RelayerStats) => {
      console.log('--- AI RELAYER PULSE RECEIVED ---');
      setStats(newStats);
      setLoading(false);

      setHistory(prev => {
        const newEntry = {
          _id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          decision: newStats.lastDecision,
          actionRatio: newStats.lastActionRatio,
          gasPrice: newStats.lastState ? newStats.lastState[0] : 0,
        };

        // Chỉ thêm nếu có thay đổi thâth sự hoặc sau 10s
        if (prev.length > 0 && prev[0].decision === newEntry.decision &&
          (Date.now() - new Date(prev[0].createdAt).getTime()) < 10000) {
          return prev;
        }
        return [newEntry, ...prev.slice(0, 49)];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const getAiMode = () => {
    if (!stats) return 'OFFLINE';
    if (stats.lastDecision === 'WAIT') return 'ECO / MONITORING';
    if (stats.lastActionRatio >= 0.75) return 'AGGRESSIVE / BATCHING';
    return 'OPTIMIZING';
  };

  const getStatusColor = () => {
    if (!stats) return 'text-gray-400';
    if (stats.lastDecision === 'WAIT') return 'text-emerald-500';
    if (stats.lastActionRatio >= 0.75) return 'text-amber-500';
    return 'text-blue-500';
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl shadow-blue-900/40 relative z-10 group">
      {/* Background Pulse Effect */}
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl animate-pulse pointer-events-none"></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`absolute inset-0 bg-blue-500/20 rounded-2xl blur-lg animate-ping opacity-75 ${!stats && 'hidden'}`}></div>
            <div className="relative w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl">
              <Cpu className="text-blue-400 animate-pulse" size={28} />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">AI Gas Optimizer</h3>
              <span className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-current ${getStatusColor()}`}>
                {getAiMode()}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Reinforcement Learning / EIP-2771</p>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-[9px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded-md"
              >
                <Activity size={10} />
                {showHistory ? 'Close Logs' : 'View History Log'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="px-5 py-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
            <Activity size={18} className="text-blue-400" />
            <div>
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none">Queue Size</p>
              <p className="text-lg font-black text-white">{loading ? '...' : stats?.queueSize || 0} Intents</p>
            </div>
          </div>

          <div className="px-5 py-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
            <Zap size={18} className="text-amber-400" />
            <div>
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none">Savings (ETH)</p>
              <p className="text-lg font-black text-white">{stats?.cumulativeSavings ? stats.cumulativeSavings.toFixed(6) : '0.000000'}</p>
            </div>
          </div>

          <button
            onClick={() => {
              setShowDetails(!showDetails);
            }}
            className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition-all active:scale-90 relative z-20"
          >
            {showDetails ? <ChevronUp size={20} className="text-white/70" /> : <ChevronDown size={20} className="text-white/70" />}
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="mt-8 pt-8 border-t border-white/10 space-y-8">
          {/* 1. Full-Width Market & Decision Monitor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-1">Live Market Monitor & Decision Flow</h4>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div> <span className="text-[10px] font-black text-white/40 uppercase">Wait</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div> <span className="text-[10px] font-black text-white/40 uppercase">Execute</span></div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none">Last System Pulse</p>
                <p className="text-xs font-black text-blue-400 mt-1">{stats?.timestamp ? new Date(stats.timestamp).toLocaleTimeString() : 'Syncing...'}</p>
              </div>
            </div>

            <div className="h-56 w-full bg-white/5 rounded-[2rem] p-6 relative overflow-hidden shadow-2xl border border-white/10">
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
              {history.length > 1 ? (
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Area fill */}
                  <path
                    d={`M 0 100 ${history.slice().reverse().map((h, i) => {
                      const maxGas = Math.max(...history.map(x => x.gasPrice));
                      const minGas = Math.min(...history.map(x => x.gasPrice));
                      const range = (maxGas - minGas) || 1;
                      const x = (i / (history.length - 1)) * 100;
                      const y = 80 - ((h.gasPrice - minGas) / range) * 60;
                      return `L ${x} ${y}`;
                    }).join(' ')} L 100 100 Z`}
                    fill="url(#lineGrad)"
                    vectorEffect="non-scaling-stroke"
                  />
                  {/* The Line */}
                  <path
                    d={history.slice().reverse().map((h, i) => {
                      const maxGas = Math.max(...history.map(x => x.gasPrice));
                      const minGas = Math.min(...history.map(x => x.gasPrice));
                      const range = (maxGas - minGas) || 1;
                      const x = (i / (history.length - 1)) * 100;
                      const y = 80 - ((h.gasPrice - minGas) / range) * 60;
                      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                  {/* Decision Points */}
                  {history.slice().reverse().map((h, i) => {
                    const maxGas = Math.max(...history.map(x => x.gasPrice));
                    const minGas = Math.min(...history.map(x => x.gasPrice));
                    const range = (maxGas - minGas) || 1;
                    const x = (i / (history.length - 1)) * 100;
                    const y = 80 - ((h.gasPrice - minGas) / range) * 60;
                    return (
                      <g key={i} className="group/point">
                        <circle
                          cx={x}
                          cy={y}
                          r={h.decision === 'EXECUTE' ? '1.5' : '1'}
                          fill={h.decision === 'EXECUTE' ? '#3b82f6' : '#10b981'}
                          className="transition-all duration-300"
                          vectorEffect="non-scaling-stroke"
                        />
                        <title>{`Gas: ${(h.gasPrice / 1e9).toFixed(2)} Gwei | Decided: ${h.decision} @ ${new Date(h.createdAt).toLocaleTimeString()}`}</title>
                      </g>
                    );
                  })}
                </svg>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                  <p className="text-[10px] text-white/30 font-black uppercase tracking-widest animate-pulse">Initializing Data Stream...</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* AI Reasoning & State Vector */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/5 rounded-[2rem] p-8 border border-white/10 relative overflow-hidden group/reasoner">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${stats?.lastDecision === 'WAIT' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                    <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">AI State Vector Reasoning</h4>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${stats?.lastDecision === 'WAIT' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                    {stats?.lastDecision || 'INIT'}
                  </div>
                </div>

                {/* AI Quote Block */}
                <div className="mb-8 p-5 bg-white/5 rounded-3xl border border-white/10">
                  <p className="text-sm font-black text-white/70 italic leading-relaxed">
                    &ldquo; {stats?.lastDecision === 'WAIT' ? 'Current gas momentum suggests better entry in upcoming blocks. Holding.' : `Optimal window detected. Executing batch with ${(stats?.lastActionRatio || 0) * 100}% pressure.`} &rdquo;
                  </p>
                </div>

                <div className="relative h-40 mt-10">
                  {/* SVG Line Chart for State Vector */}
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="stateGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* Grid Lines */}
                    {[0, 25, 50, 75, 100].map(p => (
                      <line key={p} x1="0" y1={p} x2="100" y2={p} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    ))}

                    {stats?.lastState && stats.lastState.length > 0 && (
                      <path
                        d={stats.lastState.map((v, i) => {
                          const x = (i / (stats.lastState.length - 1)) * 100;
                          const y = 100 - Math.max(10, Math.min(90, Math.abs(v) / 20));
                          return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="url(#stateGradient)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-all duration-1000"
                        filter="url(#glow)"
                        vectorEffect="non-scaling-stroke"
                      />
                    )}
                  </svg>

                  {/* Interactive Points & Tooltips */}
                  <div className="absolute inset-0 flex items-end justify-between px-0">
                    {stats?.lastState?.map((v, i) => {
                      const y = Math.max(10, Math.min(90, Math.abs(v) / 20));
                      return (
                        <div
                          key={i}
                          className="group/point relative h-full flex flex-col justify-end items-center"
                          style={{ width: '9%' }}
                        >
                          {/* The Point Dot */}
                          <div
                            className="absolute w-4 h-4 bg-white/10 border-4 border-blue-500 rounded-full z-20 transition-all duration-300 group-hover/point:scale-150 group-hover/point:bg-blue-600 group-hover/point:border-white shadow-xl cursor-crosshair"
                            style={{ bottom: `${y}%`, transform: 'translateY(50%)' }}
                          ></div>

                          {/* Label at bottom */}
                          <span className="text-[10px] font-black text-white/40 uppercase tracking-tighter group-hover/point:text-blue-400 transition-colors mt-4">S{i}</span>

                          {/* Tooltip - Strict visibility with higher z-index */}
                          <div className="absolute bottom-full mb-8 left-1/2 -translate-x-1/2 w-56 p-4 bg-slate-900/95 backdrop-blur-2xl rounded-[1.5rem] shadow-2xl invisible group-hover/point:visible opacity-0 group-hover/point:opacity-100 transition-all duration-300 z-[300] translate-y-4 group-hover/point:translate-y-0 border border-white/10 ring-1 ring-white/10">
                            <div className="relative z-10">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.5)]"></div>
                                <p className="text-[11px] font-black text-white uppercase tracking-widest leading-none">{FEATURE_LABELS[i].name}</p>
                              </div>
                              <p className="text-[11px] text-slate-300 leading-relaxed font-bold mb-4">{FEATURE_LABELS[i].desc}</p>
                              <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                                <span className="text-[9px] text-slate-500 uppercase font-black tracking-[0.2em]">Intensity</span>
                                <span className="text-xs text-emerald-400 font-mono font-black">{(v / 1e6).toFixed(3)}</span>
                              </div>
                            </div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[10px] border-transparent border-t-slate-900/95"></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Network Efficiency Metrics */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-3">System Vitals</h4>
              <div className="grid grid-cols-1 gap-4">
                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-between group hover:border-blue-500/30 transition-colors">
                  <div>
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Blockchain Node</p>
                    <p className="text-sm font-black text-white">Sepolia Testnet</p>
                    <p className="text-[9px] font-bold text-blue-400 uppercase mt-1">12s Block Time</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-500/15 rounded-2xl flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Zap size={20} />
                  </div>
                </div>

                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 hover:border-indigo-500/30 transition-colors">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Agent Efficiency</p>
                      <p className="text-sm font-black text-white">Optimal Execution</p>
                    </div>
                    <span className="text-lg font-black text-indigo-400">
                      {stats?.lastState ? Math.max(0, Math.min(100, ((stats.lastState[10] - stats.lastState[0]) / stats.lastState[10]) * 100)).toFixed(0) : '85'}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.3)] transition-all duration-1000"
                      style={{ width: `${stats?.lastState ? Math.max(5, Math.min(100, ((stats.lastState[10] - stats.lastState[0]) / stats.lastState[10]) * 100)) : 85}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* History Table Log */}
          <div className="bg-[#1a1c23]/80 backdrop-blur-xl rounded-[2rem] border border-white/10 overflow-hidden">
            <div className="p-6 bg-white/5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-white/70 shadow-xl">
                  <Activity size={20} />
                </div>
                <div>
                  <h5 className="text-xs font-black text-white uppercase tracking-widest">Decision Activity Stream</h5>
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-tighter">Real-time RL agent event logs</p>
                </div>
              </div>
              <p className="text-[9px] font-black text-white/40 uppercase bg-white/10 px-3 py-1.5 rounded-full border border-white/10">{history.length} Cycles In Cache</p>
            </div>
            <div className="max-h-[400px] overflow-y-auto overflow-x-hidden custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/5 sticky top-0 backdrop-blur-md z-10">
                  <tr>
                    <th className="px-8 py-5 text-[9px] font-black text-white/40 uppercase tracking-[0.2em] border-b border-white/10">Time Cycle</th>
                    <th className="px-8 py-5 text-[9px] font-black text-white/40 uppercase tracking-[0.2em] border-b border-white/10">AI Action</th>
                    <th className="px-8 py-5 text-[9px] font-black text-white/40 uppercase tracking-[0.2em] border-b border-white/10">Execution Pressure</th>
                    <th className="px-8 py-5 text-[9px] font-black text-white/40 uppercase tracking-[0.2em] border-b border-white/10">Network Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {history.length > 0 ? history.map((log, i) => {
                    const date = log.createdAt ? new Date(log.createdAt) : new Date();
                    const timeStr = isNaN(date.getTime()) ? 'Syncing...' : date.toLocaleTimeString();

                    return (
                      <tr key={log._id || i} className="hover:bg-white/5 transition-all group">
                        <td className="px-8 py-5 text-[11px] font-black text-white/50 font-mono tracking-tighter">{timeStr}</td>
                        <td className="px-8 py-5">
                          <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase inline-flex items-center gap-2 border transition-all ${log.decision === 'WAIT' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                            <div className={`w-2 h-2 rounded-full animate-pulse ${log.decision === 'WAIT' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                            {log.decision}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-white/10 rounded-full max-w-[60px] overflow-hidden">
                              <div className="h-full bg-blue-500/50 rounded-full" style={{ width: `${(log.actionRatio * 100) || 0}%` }}></div>
                            </div>
                            <span className="text-[11px] font-black text-white/70">{(log.actionRatio * 100).toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-[11px] font-black text-white">{(log.gasPrice / 1e9).toFixed(2)} <span className="text-[9px] text-white/40">Gwei</span></span>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Awaiting AI Optimization Pulse...</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-6 bg-slate-900 rounded-[2rem] flex items-start gap-5 shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center shrink-0 border border-blue-500/20">
              <Info size={24} className="text-blue-400" />
            </div>
            <div className="space-y-2 relative z-10">
              <p className="text-sm text-white font-black leading-relaxed">
                Autonomous RL Agent active. Evaluating 11 market features every 12s block cycle.
              </p>
              <p className="text-[11px] text-slate-400 font-bold leading-relaxed max-w-2xl">
                The agent balances between gas cost optimization and transaction urgency. Green markers indicate holding periods, while blue markers signal successful batch execution windows.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIRelayerStatus;
