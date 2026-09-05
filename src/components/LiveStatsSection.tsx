import React, { useState, useEffect } from 'react';
import { ServerStats } from '../types';
import { INITIAL_SERVER_STATS } from '../data/mockData';
import { safeFetchJson } from '../utils/apiClient';
import {
  Users,
  Wifi,
  Mic,
  MessageSquare,
  Flame,
  ArrowUpRight,
  TrendingUp,
  Volume2,
  Hash,
  Shield,
  Clock,
  Sparkles,
  Server,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const LiveStatsSection: React.FC = () => {
  const [stats, setStats] = useState<ServerStats>(INITIAL_SERVER_STATS);
  const [activeRange, setActiveRange] = useState<'7d' | '30d' | '24h'>('7d');
  const [lastUpdated, setLastUpdated] = useState<string>('ahora mismo');

  // Poll stats from API or simulate live ticking
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await safeFetchJson<ServerStats>('/api/stats/live');
        setStats(data);
        setLastUpdated('hace 2s');
      } catch (err) {
        // Fallback to local live jitter
        setStats(prev => ({
          ...prev,
          onlineMembers: Math.max(3200, prev.onlineMembers + Math.floor(Math.random() * 7) - 3),
          voiceActive: Math.max(390, prev.voiceActive + Math.floor(Math.random() * 5) - 2),
          messageVelocity: Math.max(90, Math.min(240, prev.messageVelocity + Math.floor(Math.random() * 9) - 4)),
          pingMs: Math.max(18, Math.min(42, prev.pingMs + Math.floor(Math.random() * 3) - 1)),
        }));
      }
    };

    const interval = setInterval(fetchStats, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero Banner for Stats */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#171926] via-[#1a1e30] to-[#161a29] border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#5865F2]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Sincronización en Tiempo Real Activa • WebSocket 3.5s
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Métricas & Crecimiento de Nexus Community
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl">
              Monitoreo continuo de miembros activos, velocidad de mensajería, canales de voz y salud general de la comunidad de Discord.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[#12141f]/80 border border-slate-700/80 rounded-2xl px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-extrabold text-white">NIVEL 3</span>
                  <span className="text-[10px] bg-pink-500/30 text-pink-300 font-bold px-1.5 py-0.5 rounded">
                    36 Boosts
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Audio 384kbps • Vanity URL</p>
              </div>
            </div>

            <div className="bg-[#12141f]/80 border border-slate-700/80 rounded-2xl px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-extrabold text-white">{stats.pingMs} ms</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded">
                    Óptimo
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Madrid / EU-Central</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Members */}
        <div className="bg-[#161824] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Miembros Totales</span>
            <div className="p-2 rounded-xl bg-[#5865F2]/10 text-[#5865F2]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {stats.totalMembers.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{stats.growthRatePercent}% este mes</span>
          </div>
        </div>

        {/* Online Members */}
        <div className="bg-[#161824] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Usuarios en Línea</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Wifi className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {stats.onlineMembers.toLocaleString()}
            </span>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
            <span>22.9% de presencia simultánea</span>
          </div>
        </div>

        {/* Voice Active */}
        <div className="bg-[#161824] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">En Canales de Voz</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Mic className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {stats.voiceActive.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-purple-400">
            <span>En 12 salas activas y Stage</span>
          </div>
        </div>

        {/* Message Velocity */}
        <div className="bg-[#161824] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Velocidad del Chat</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {stats.messageVelocity}
            </span>
            <span className="text-xs text-slate-400">msgs/min</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-amber-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Actividad muy alta en #general</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Growth Area Chart (2 cols) */}
        <div className="lg:col-span-2 bg-[#161824] border border-slate-800/80 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#5865F2]" />
                Tendencia de Miembros y Usuarios en Línea
              </h3>
              <p className="text-xs text-slate-400">Evolución de registros e interacción durante la semana</p>
            </div>

            <div className="flex items-center gap-1 bg-[#0f111a] p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setActiveRange('24h')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  activeRange === '24h' ? 'bg-[#5865F2] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                24h
              </button>
              <button
                onClick={() => setActiveRange('7d')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  activeRange === '7d' ? 'bg-[#5865F2] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                7 Días
              </button>
              <button
                onClick={() => setActiveRange('30d')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  activeRange === '30d' ? 'bg-[#5865F2] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                30 Días
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.growthHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5865F2" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#5865F2" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorOnline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#23a55a" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#23a55a" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#232738" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} domain={['dataMin - 500', 'dataMax + 500']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1d2d',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="members"
                  name="Miembros Totales"
                  stroke="#5865F2"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorMembers)"
                />
                <Area
                  type="monotone"
                  dataKey="online"
                  name="En Línea"
                  stroke="#23a55a"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorOnline)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Roles Distribution Pie Chart */}
        <div className="bg-[#161824] border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-pink-400" />
              Distribución de Roles Principales
            </h3>
            <p className="text-xs text-slate-400 mb-4">Composición jerárquica del servidor</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.rolesDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {stats.rolesDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1d2d',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 mt-2">
            {stats.rolesDistribution.map(role => (
              <div key={role.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: role.color }}></span>
                  <span className="text-slate-300 font-medium">{role.name}</span>
                </div>
                <span className="text-slate-400 font-mono">{role.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Channels Activity Live Table */}
      <div className="bg-[#161824] border border-slate-800/80 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              Monitor de Canales en Vivo
            </h3>
            <p className="text-xs text-slate-400">Tráfico en tiempo real en canales de texto y voz de Nexus</p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            Actualizado {lastUpdated}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {stats.channelActivity.map((ch, idx) => (
            <div
              key={idx}
              className="bg-[#11131c] border border-slate-800/70 hover:border-slate-700 rounded-xl p-3.5 flex items-center justify-between transition"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    ch.type === 'voice' ? 'bg-purple-500/15 text-purple-400' : 'bg-indigo-500/15 text-indigo-400'
                  }`}
                >
                  {ch.type === 'voice' ? <Mic className="w-4 h-4" /> : <Hash className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-200 truncate">{ch.channel}</p>
                  <p className="text-[10px] text-slate-400">
                    {ch.type === 'voice' ? 'Canal de Voz / Sala' : `${ch.messagesToday.toLocaleString()} mensajes hoy`}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  <Users className="w-3 h-3" />
                  {ch.activeCount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
