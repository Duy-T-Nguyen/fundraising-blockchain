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
    const socketUrl = isProd ? origin : `http://${window.location.hostname}:3001`;
    // Backend is now configured to always listen on /api/socket.io
    const socketPath = '/api/socket.io';
    
    console.log('--- AI RELAYER CONNECTING TO:', socketUrl, 'PATH:', socketPath);
    
    const socket = io(socketUrl, {
      path: socketPath,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });

    const apiUrl = isProd ? `${origin}/api` : `http://${window.location.hostname}:3001`;

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

    socket.on('connect', () => console.log('--- AI RELAYER SOCKET CONNECTED'));
    socket.on('connect_error', (err) => console.error('--- AI RELAYER SOCKET ERROR:', err));

    socket.on('relayer-stats', (newStats: RelayerStats) => {
      console.log('--- AI RELAYER UPDATE RECEIVED:', newStats.lastDecision);
      setStats(newStats);
      setLoading(false);
      
      // OPTIMIZATION: Instead of full fetch, we can manually prepend the new record 
      // if it represents a new decision cycle (timestamp change)
      setHistory(prev => {
        const newEntry = {
          createdAt: new Date().toISOString(),
          decision: newStats.lastDecision,
          actionRatio: newStats.lastActionRatio,
          gasPrice: newStats.lastState ? newStats.lastState[0] : 0,
        };
        // Avoid duplicate entries if the timestamp hasn't moved much
        if (prev.length > 0 && prev[0].decision === newEntry.decision && 
            Math.abs(new Date(prev[0].createdAt).getTime() - new Date(newEntry.createdAt).getTime()) < 5000) {
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
    <div className="bg-white border border-blue-100 rounded-[2.5rem] p-8 shadow-xl shadow-blue-600/5 relative z-10 group">
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
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">AI Gas Optimizer</h3>
              <span className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-current ${getStatusColor()}`}>
                {getAiMode()}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Reinforcement Learning / EIP-2771</p>
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="text-[9px] font-black text-blue-500 hover:text-blue-700 uppercase tracking-widest flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-md"
              >
                <Activity size={10} />
                {showHistory ? 'Close Logs' : 'View History Log'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="px-5 py-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
            <Activity size={18} className="text-blue-600" />
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Queue Size</p>
              <p className="text-lg font-black text-slate-900">{loading ? '...' : stats?.queueSize || 0} Intents</p>
            </div>
          </div>

          <div className="px-5 py-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
            <Zap size={18} className="text-amber-500" />
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Savings (ETH)</p>
              <p className="text-lg font-black text-slate-900">{stats?.cumulativeSavings ? stats.cumulativeSavings.toFixed(6) : '0.000000'}</p>
            </div>
          </div>

          <button 
            onClick={() => {
              setShowDetails(!showDetails);
            }}
            className="p-3 bg-white hover:bg-slate-50 border border-blue-200 rounded-2xl transition-all shadow-md active:scale-90 relative z-20"
          >
            {showDetails ? <ChevronUp size={20} className="text-blue-600" /> : <ChevronDown size={20} className="text-blue-600" />}
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="mt-8 pt-8 border-t border-slate-100 space-y-8">
          {/* 1. Full-Width Market & Decision Monitor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-1">Live Market Monitor & Decision Flow</h4>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div> <span className="text-[10px] font-black text-slate-400 uppercase">Wait</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div> <span className="text-[10px] font-black text-slate-400 uppercase">Execute</span></div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Last System Pulse</p>
                <p className="text-xs font-black text-blue-600 mt-1">{stats?.timestamp ? new Date(stats.timestamp).toLocaleTimeString() : 'Syncing...'}</p>
              </div>
            </div>

            <div className="h-56 w-full bg-slate-900 rounded-[2rem] p-6 relative overflow-hidden shadow-2xl border border-slate-800">
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
              {history.length > 1 ? (
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
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
                    strokeWidth="2.5"
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
                          cx={`${x}%`} 
                          cy={`${y}`} 
                          r={h.decision === 'EXECUTE' ? '5' : '3'} 
                          fill={h.decision === 'EXECUTE' ? '#3b82f6' : '#10b981'}
                          className="transition-all duration-300"
                        />
                        <title>{`Gas: ${(h.gasPrice/1e9).toFixed(2)} Gwei | Decided: ${h.decision} @ ${new Date(h.createdAt).toLocaleTimeString()}`}</title>
                      </g>
                    );
                  })}
                </svg>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest animate-pulse">Initializing Data Stream...</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* AI Reasoning & State Vector */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">AI Decision Reasoner</h4>
                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest ${stats?.lastDecision === 'WAIT' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                      {stats?.lastDecision || 'INIT'}
                    </div>
                    <p className="text-sm font-black text-slate-700 italic">
                      " {stats?.lastDecision === 'WAIT' ? 'Current gas momentum suggests better entry in upcoming blocks. Holding.' : `Optimal window detected. Executing batch with ${(stats?.lastActionRatio || 0) * 100}% pressure.`} "
                    </p>
                  </div>

                  <div className="flex items-end gap-2 h-24 mt-4 px-2">
                    {stats?.lastState && stats.lastState.length > 0 ? (
                      stats.lastState.map((v, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end">
                          {/* The Bar */}
                          <div 
                            className={`w-full rounded-t-lg transition-all duration-500 bg-gradient-to-t from-blue-600/20 to-blue-500 group-hover:to-blue-400 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]`}
                            style={{ height: `${Math.max(20, Math.min(100, Math.abs(v) / 20))}px` }}
                          ></div>
                          
                          {/* Label */}
                          <span className="text-[8px] font-black text-slate-400 group-hover:text-blue-600 transition-colors uppercase">S{i}</span>
                          
                          {/* Explainer Tooltip - Now centered and cleaner */}
                          <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-48 p-3 bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-[100] translate-y-2 group-hover:translate-y-0 border border-white/10 ring-1 ring-white/5">
                            <div className="relative z-10">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-wider leading-none">{FEATURE_LABELS[i].name}</p>
                              </div>
                              <p className="text-[10px] text-white/90 leading-relaxed font-bold mb-3">{FEATURE_LABELS[i].desc}</p>
                              <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                                <span className="text-[8px] text-slate-500 uppercase font-black">Current Value</span>
                                <span className="text-[10px] text-emerald-400 font-mono font-black">{(v/1e6).toFixed(2)}</span>
                              </div>
                            </div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900/95"></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="w-full h-full border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center bg-white/50">
                         <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest animate-pulse">Synchronizing AI State...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Network Efficiency Metrics */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">System Vitals</h4>
              <div className="grid grid-cols-1 gap-4">
                <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-colors">
                   <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Blockchain Node</p>
                      <p className="text-sm font-black text-slate-900">Sepolia Testnet</p>
                      <p className="text-[9px] font-bold text-blue-500 uppercase mt-1">12s Block Time</p>
                   </div>
                   <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Zap size={20} />
                   </div>
                </div>
                
                <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:border-indigo-200 transition-colors">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Agent Efficiency</p>
                      <p className="text-sm font-black text-slate-900">Optimal Execution</p>
                    </div>
                    <span className="text-lg font-black text-indigo-600">85%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div className="w-[85%] h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.3)]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* History Table Log */}
          <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
            <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                   <Activity size={16} />
                 </div>
                 <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Decision Activity Stream</h5>
               </div>
               <p className="text-[9px] font-black text-slate-400 uppercase bg-white px-3 py-1 rounded-full border border-slate-100">{history.length} Cycles In History</p>
            </div>
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/30 sticky top-0 backdrop-blur-sm">
                  <tr>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Time (PST)</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">AI Action</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Load Intensity</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Network Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((log, i) => (
                    <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 text-[10px] font-black text-slate-500 font-mono">{new Date(log.createdAt).toLocaleTimeString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase inline-flex items-center gap-1.5 ${log.decision === 'WAIT' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${log.decision === 'WAIT' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                          {log.decision}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[11px] font-black text-slate-700">{(log.actionRatio * 100).toFixed(0)}%</td>
                      <td className="px-6 py-4 text-[11px] font-black text-slate-700">{(log.gasPrice / 1e9).toFixed(2)} Gwei</td>
                    </tr>
                  ))}
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
