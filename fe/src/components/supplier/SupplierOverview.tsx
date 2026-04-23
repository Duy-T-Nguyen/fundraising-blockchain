import React from 'react';
import { 
  TrendingUp, 
  Package, 
  CheckCircle2, 
  CreditCard, 
  History,
  ExternalLink,
  ShieldCheck,
  Lock
} from 'lucide-react';
import type { SupplierTask } from '../../types/supplier';

interface SupplierOverviewProps {
  info: any;
  tasks: SupplierTask[];
  isLoading?: boolean;
  onRefresh?: () => Promise<void>;
}

export const SupplierOverview: React.FC<SupplierOverviewProps> = ({
  info,
  tasks,
}) => {
  const activeTasks = tasks.filter(t => !t.complete);
  const settledTasks = tasks.filter(t => t.complete);
  // Compute total revenue from settled tasks (reliable, avoids raw chain data issues)
  const totalRevenue = settledTasks.reduce((acc, t) => acc + parseFloat(t.value || '0'), 0);
  const contractValue = tasks.reduce((acc, t) => acc + parseFloat(t.value || '0'), 0);

  // Chart: bar heights based on task values (max 5 tasks shown)
  const chartTasks = tasks.slice(-8);
  const maxVal = Math.max(...chartTasks.map(t => parseFloat(t.value || '0')), 0.001);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: `${totalRevenue.toFixed(4)} ETH`, icon: <TrendingUp size={18} />, color: 'emerald' },
          { label: 'Active Jobs', value: activeTasks.length.toString().padStart(2, '0'), icon: <Package size={18} />, color: 'blue' },
          { label: 'Settled Tasks', value: settledTasks.length.toString().padStart(2, '0'), icon: <CheckCircle2 size={18} />, color: 'indigo' },
          { label: 'Contract Value', value: `${contractValue.toFixed(4)} ETH`, icon: <CreditCard size={18} />, color: 'slate' }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-slate-200/20 transition-all group">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${stat.color}-50 text-${stat.color}-600`}>
                {stat.icon}
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</div>
            </div>
            <div className="text-2xl font-black text-slate-900">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Chart Card */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-2xl font-black text-slate-900 mb-1">Performance Index</h3>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-[0.2em]">Revenue & Fulfillment Over Time</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-slate-600 uppercase">Synchronized</span>
            </div>
          </div>

          <div className="h-72 w-full relative">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between opacity-10 pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-full h-[1px] bg-slate-300" />
              ))}
            </div>

            {chartTasks.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Waiting for data points</p>
              </div>
            ) : (
              <div className="h-full w-full relative group/chart">
                <svg viewBox="0 0 1000 300" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Generate Path Points */}
                  {(() => {
                    const padding = 100;
                    const width = 1000 - padding * 2;
                    const points = chartTasks.map((t, i) => {
                      const val = parseFloat(t.value || '0');
                      const x = padding + (i * (width / Math.max(chartTasks.length - 1, 1)));
                      const y = 250 - (val / maxVal) * 200;
                      return { x, y, val, id: t.requestId, isSettled: t.complete };
                    });

                    // Area Path
                    let d = `M ${points[0].x} 280 `;
                    points.forEach((p, i) => {
                      if (i === 0) d += `L ${p.x} ${p.y} `;
                      else {
                        const prev = points[i-1];
                        const cx = (prev.x + p.x) / 2;
                        d += `C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y} `;
                      }
                    });
                    d += `L ${points[points.length-1].x} 280 Z`;

                    // Line Path (Trend)
                    let ld = `M ${points[0].x} ${points[0].y} `;
                    points.forEach((p, i) => {
                      if (i > 0) {
                        const prev = points[i-1];
                        const cx = (prev.x + p.x) / 2;
                        ld += `C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y} `;
                      }
                    });

                    return (
                      <>
                        <path d={d} fill="url(#areaGradient)" className="animate-in fade-in duration-1000" />
                        <path d={ld} fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" className="animate-in slide-in-from-left duration-1000" />
                        
                        {/* Data Points */}
                        {points.map((p, i) => (
                          <g key={i} className="group/point cursor-help">
                            <circle 
                              cx={p.x} cy={p.y} r="6" 
                              fill="white" 
                              stroke={p.isSettled ? "#10b981" : "#3b82f6"} 
                              strokeWidth="3"
                              className="transition-all duration-300 group-hover/point:r-8"
                            />
                            <foreignObject x={p.x - 50} y={p.y - 65} width="100" height="50" className="overflow-visible pointer-events-none opacity-0 group-hover/point:opacity-100 transition-opacity">
                              <div className="bg-slate-900 text-white text-[9px] font-black px-2 py-1.5 rounded-lg shadow-xl flex flex-col items-center">
                                <span>{p.val.toFixed(4)} ETH</span>
                                <span className="text-[6px] text-slate-400 uppercase">REQ #{p.id}</span>
                              </div>
                            </foreignObject>
                            {/* X-Axis Labels */}
                            <text x={p.x} y="295" textAnchor="middle" className="text-[12px] font-bold fill-slate-300 uppercase tracking-tighter transition-colors group-hover/point:fill-slate-900">
                              R#{p.id}
                            </text>
                          </g>
                        ))}
                      </>
                    );
                  })()}
                </svg>
              </div>
            )}
          </div>

          <div className="mt-12 flex items-center gap-6 px-4">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue Flow</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Task Node</span>
            </div>
          </div>
        </div>

        {/* Side Actions/History */}
        <div className="lg:col-span-4 space-y-6">

          <div className="bg-white border border-slate-100 p-8 rounded-[3rem] shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <ShieldCheck className="text-emerald-600" size={20} />
              </div>
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Payment Security</h3>
            </div>
            
            <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Lock className="text-emerald-600" size={14} />
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Liquidity Shield On</span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                The campaign budget for your active tasks is automatically reserved (locked) in the smart contract upon request creation.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                On-chain reservation active
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Guaranteed fulfillment funds
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-8 rounded-[3rem] shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                <History className="text-slate-900" size={20} />
              </div>
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Recent Activity</h3>
            </div>
            <div className="space-y-4">
              {settledTasks.slice(0, 3).map(task => (
                <div key={task.requestId} className="flex justify-between items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-100 transition-all hover:bg-white group">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-900">{task.value} ETH</span>
                    <span className="text-[9px] text-slate-400 uppercase tracking-tighter truncate max-w-[100px]">{task.description}</span>
                  </div>
                  <ExternalLink size={12} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              ))}
              {settledTasks.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">No recent jobs</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
