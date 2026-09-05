import React, { useState, useEffect } from 'react';
import { ConfigPreset, SupportTicket, ModerationLog } from '../types';
import { useAuth } from '../context/AuthContext';
import { useDiscordServer } from '../context/DiscordServerContext';
import { safeFetchJson } from '../utils/apiClient';
import {
  Shield,
  CheckCircle2,
  XCircle,
  Trash2,
  Eye,
  FileCode,
  LifeBuoy,
  Clock,
  History,
  AlertTriangle,
  X,
  Sparkles,
  Search,
  Filter,
  Check,
  Server,
  RefreshCw,
  Sliders,
  Radio,
  ExternalLink,
} from 'lucide-react';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshConfigs?: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  onRefreshConfigs,
}) => {
  const { currentUser, canModerate } = useAuth();
  const { currentGuild, isRealData, isSyncing, syncGuild, clearMockData, apiStatus, setShowServerModal, lastSyncedAt } = useDiscordServer();
  const [activeTab, setActiveTab] = useState<'configs' | 'tickets' | 'logs' | 'discord'>('configs');
  const [configs, setConfigs] = useState<ConfigPreset[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [inspectConfig, setInspectConfig] = useState<ConfigPreset | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [filterConfigStatus, setFilterConfigStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [cfgData, tktData, logData] = await Promise.all([
        safeFetchJson<ConfigPreset[]>('/api/configs?status=all', undefined, []),
        safeFetchJson<SupportTicket[]>('/api/tickets?role=Admin', undefined, []),
        safeFetchJson<ModerationLog[]>('/api/moderation/logs', undefined, []),
      ]);

      setConfigs(cfgData);
      setTickets(tktData);
      setLogs(logData);
    } catch (e) {
      console.error('Error fetching admin panel data:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApproveConfig = async (id: string) => {
    try {
      const updated = await safeFetchJson<ConfigPreset>(`/api/configs/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'approved',
          moderator: {
            username: currentUser.global_name || currentUser.username,
            avatar: currentUser.avatar,
            role: currentUser.roles[0],
          },
        }),
      });

      setConfigs(configs.map(c => (c.id === id ? updated : c)));
      if (onRefreshConfigs) onRefreshConfigs();
      fetchData();
    } catch (e) {
      console.error('Error approving config:', e);
    }
  };

  const handleRejectConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectTargetId) return;

    try {
      const updated = await safeFetchJson<ConfigPreset>(`/api/configs/${rejectTargetId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          rejectionReason: rejectReason || 'No cumple los requisitos de seguridad o formato.',
          moderator: {
            username: currentUser.global_name || currentUser.username,
            avatar: currentUser.avatar,
            role: currentUser.roles[0],
          },
        }),
      });

      setConfigs(configs.map(c => (c.id === rejectTargetId ? updated : c)));
      setRejectTargetId(null);
      setRejectReason('');
      if (onRefreshConfigs) onRefreshConfigs();
      fetchData();
    } catch (e) {
      console.error('Error rejecting config:', e);
    }
  };

  const handleDeleteConfig = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este archivo de configuración definitivamente?')) return;

    try {
      await safeFetchJson(`/api/configs/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moderator: {
            username: currentUser.global_name || currentUser.username,
            avatar: currentUser.avatar,
            role: currentUser.roles[0],
          },
        }),
      });

      setConfigs(configs.filter(c => c.id !== id));
      if (onRefreshConfigs) onRefreshConfigs();
      fetchData();
    } catch (e) {
      console.error('Error deleting config:', e);
    }
  };

  const handleTicketStatus = async (ticketId: string, status: 'Resuelto' | 'Cerrado') => {
    try {
      const updated = await safeFetchJson<SupportTicket>(`/api/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          moderator: {
            username: currentUser.global_name || currentUser.username,
            avatar: currentUser.avatar,
            role: currentUser.roles[0],
          },
        }),
      });

      setTickets(tickets.map(t => (t.id === ticketId ? updated : t)));
      fetchData();
    } catch (e) {
      console.error('Error changing ticket status:', e);
    }
  };

  const pendingConfigs = configs.filter(c => c.status === 'pending');
  const filteredConfigs = configs.filter(c =>
    filterConfigStatus === 'all' ? true : c.status === filterConfigStatus
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#141624] border border-slate-700/80 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh] my-4">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1b1e30] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Shield className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white">Panel de Administración Nexus</h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30">
                  Staff Only
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Moderación de contenido subido, gestión de soporte y registro de auditoría.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-6 bg-[#11131e] border-b border-slate-800/80">
          <div className="bg-[#181a2b] border border-amber-500/30 rounded-xl p-3">
            <span className="text-[10px] uppercase font-bold text-amber-400 block">Configs Pendientes</span>
            <span className="text-xl font-black text-white font-mono mt-1 block">
              {pendingConfigs.length}
            </span>
          </div>
          <div className="bg-[#181a2b] border border-slate-800 rounded-xl p-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total en Catálogo</span>
            <span className="text-xl font-black text-white font-mono mt-1 block">
              {configs.filter(c => c.status === 'approved').length}
            </span>
          </div>
          <div className="bg-[#181a2b] border border-slate-800 rounded-xl p-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Tickets Abiertos</span>
            <span className="text-xl font-black text-white font-mono mt-1 block">
              {tickets.filter(t => t.status === 'Abierto' || t.status === 'En Progreso').length}
            </span>
          </div>
          <div className="bg-[#181a2b] border border-slate-800 rounded-xl p-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Acciones Registradas</span>
            <span className="text-xl font-black text-white font-mono mt-1 block">
              {logs.length}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 bg-[#141624] border-b border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('configs')}
            className={`pb-3 font-bold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'configs'
                ? 'border-[#5865F2] text-[#5865F2]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-4 h-4" />
            Cola de Moderación de Archivos
            {pendingConfigs.length > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 rounded-full font-bold text-[10px]">
                {pendingConfigs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`pb-3 font-bold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'tickets'
                ? 'border-[#5865F2] text-[#5865F2]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <LifeBuoy className="w-4 h-4" />
            Gestión de Tickets ({tickets.length})
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-3 font-bold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'logs'
                ? 'border-[#5865F2] text-[#5865F2]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            Registro de Auditoría ({logs.length})
          </button>

          <button
            onClick={() => setActiveTab('discord')}
            className={`pb-3 font-bold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'discord'
                ? 'border-[#5865F2] text-[#5865F2]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Server className="w-4 h-4" />
            Servidor Discord & Datos Reales
            <span className={`px-1.5 py-0.5 rounded-full font-bold text-[10px] ${
              isRealData ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {isRealData ? 'API Real' : 'Modo Demo'}
            </span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {actionSuccessMsg && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                {actionSuccessMsg}
              </span>
              <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {/* 1. CONFIGS MODERATION TAB */}
          {activeTab === 'configs' && (
            <div className="space-y-4">
              {/* Filter pills */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 text-[11px] font-semibold">Filtrar por estado:</span>
                {(['pending', 'approved', 'rejected', 'all'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setFilterConfigStatus(st)}
                    className={`px-3 py-1 rounded-lg font-semibold transition ${
                      filterConfigStatus === st
                        ? 'bg-[#5865F2] text-white'
                        : 'bg-[#1a1d2d] text-slate-400 hover:text-white'
                    }`}
                  >
                    {st === 'pending'
                      ? 'Pendientes'
                      : st === 'approved'
                      ? 'Aprobados'
                      : st === 'rejected'
                      ? 'Rechazados'
                      : 'Todos'}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {filteredConfigs.map(cfg => (
                  <div
                    key={cfg.id}
                    className="bg-[#11131f] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
                          .{cfg.fileExtension.toUpperCase()} • {cfg.fileSize}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            cfg.status === 'pending'
                              ? 'bg-amber-500/20 text-amber-300'
                              : cfg.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {cfg.status.toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-400">• {cfg.category}</span>
                      </div>

                      <h4 className="text-sm font-bold text-white truncate">{cfg.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-1">{cfg.description}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                        <span>Autor: <strong>{cfg.author.username}</strong> ({cfg.author.role})</span>
                        <span>Archivo: <code className="text-slate-400">{cfg.fileName}</code></span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setInspectConfig(cfg)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-1.5 transition"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-400" />
                        Ver Código
                      </button>

                      {cfg.status !== 'approved' && (
                        <button
                          onClick={() => handleApproveConfig(cfg.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-sm transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Aprobar
                        </button>
                      )}

                      {cfg.status !== 'rejected' && (
                        <button
                          onClick={() => setRejectTargetId(cfg.id)}
                          className="px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Rechazar
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteConfig(cfg.id)}
                        className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Eliminar definitivamente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {filteredConfigs.length === 0 && (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    No hay archivos en este estado de moderación.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. TICKETS MODERATION TAB */}
          {activeTab === 'tickets' && (
            <div className="space-y-3">
              {tickets.map(ticket => (
                <div
                  key={ticket.id}
                  className="bg-[#11131f] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-[#5865F2]">#{ticket.ticketNumber}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ticket.status === 'Abierto'
                            ? 'bg-blue-500/20 text-blue-300'
                            : ticket.status === 'En Progreso'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {ticket.status}
                      </span>
                      <span className="text-xs text-slate-400">• {ticket.category}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{ticket.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Abierto por: {ticket.author.username} • {ticket.messages.length} mensajes en hilo
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {ticket.status !== 'Resuelto' && (
                      <button
                        onClick={() => handleTicketStatus(ticket.id, 'Resuelto')}
                        className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition"
                      >
                        Marcar Resuelto
                      </button>
                    )}
                    {ticket.status !== 'Cerrado' && (
                      <button
                        onClick={() => handleTicketStatus(ticket.id, 'Cerrado')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                      >
                        Cerrar Ticket
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. AUDIT LOGS TAB */}
          {activeTab === 'logs' && (
            <div className="space-y-2">
              {logs.map(log => (
                <div
                  key={log.id}
                  className="bg-[#11131f] border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 shrink-0">
                      <Shield className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <p className="font-bold text-white">
                        {log.moderator.username}{' '}
                        <span className="text-slate-400 font-normal">ha ejecutado</span> {log.action}{' '}
                        <span className="text-slate-400 font-normal">en</span> "{log.targetName}"
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{log.details}</p>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-500 font-mono shrink-0">
                    {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* 4. DISCORD SERVER & REAL DATA MANAGEMENT TAB */}
          {activeTab === 'discord' && (
            <div className="space-y-6">
              {/* Server Connection Overview */}
              <div className="bg-[#11131f] border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {currentGuild.icon ? (
                      <img
                        src={currentGuild.icon}
                        alt={currentGuild.name}
                        className="w-14 h-14 rounded-2xl border-2 border-[#5865F2]/40 object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-[#5865F2]/20 border border-[#5865F2]/40 flex items-center justify-center text-[#5865F2]">
                        <Server className="w-7 h-7" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white">{currentGuild.name}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          isRealData
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {isRealData ? 'API Oficial Discord' : 'Simulación / Demo'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        Guild ID: <span className="text-slate-200">{currentGuild.id}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Última sincronización: {lastSyncedAt || 'No sincronizado'} • Fuente: {currentGuild.source}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={async () => {
                        const res = await syncGuild();
                        if (res) setActionSuccessMsg('¡Datos sincronizados con éxito desde Discord!');
                      }}
                      disabled={isSyncing}
                      className="px-3.5 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold flex items-center gap-2 transition disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      {isSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}
                    </button>
                    <button
                      onClick={() => setShowServerModal(true)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      Cambiar Servidor
                    </button>
                  </div>
                </div>

                {/* Quick Server Counters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="bg-[#171928] border border-slate-800/80 rounded-xl p-3">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Miembros Reales</span>
                    <span className="text-xl font-black text-white font-mono block mt-0.5">
                      {currentGuild.memberCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-[#171928] border border-slate-800/80 rounded-xl p-3">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">En Línea</span>
                    <span className="text-xl font-black text-emerald-400 font-mono block mt-0.5">
                      {currentGuild.onlineCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-[#171928] border border-slate-800/80 rounded-xl p-3">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">En Canales de Voz</span>
                    <span className="text-xl font-black text-purple-400 font-mono block mt-0.5">
                      {currentGuild.voiceActiveCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-[#171928] border border-slate-800/80 rounded-xl p-3">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Nivel Nitro Boost</span>
                    <span className="text-xl font-black text-pink-400 font-mono block mt-0.5">
                      Nivel {currentGuild.boostTier || 1} ({currentGuild.boostCount || 0} boosts)
                    </span>
                  </div>
                </div>
              </div>

              {/* Render.com Configuration Diagnostic */}
              <div className="bg-[#11131f] border border-slate-800 rounded-2xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#5865F2]" />
                  Variables de Entorno en Render.com
                </h4>
                <p className="text-xs text-slate-400">
                  Para que la app muestre tus datos 100% reales en tu servidor de Render, asegúrate de haber añadido estas variables en el panel de Render:
                </p>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#161828] border border-slate-800 font-mono">
                    <div>
                      <span className="text-indigo-300 font-bold">DISCORD_GUILD_ID</span>
                      <p className="text-[11px] text-slate-400 font-sans">El ID numérico de tu servidor de Discord (Activo para widget y bot)</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      apiStatus?.hasGuildId ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {apiStatus?.hasGuildId ? 'Detectado' : 'Usando Demo'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#161828] border border-slate-800 font-mono">
                    <div>
                      <span className="text-indigo-300 font-bold">DISCORD_BOT_TOKEN</span>
                      <p className="text-[11px] text-slate-400 font-sans">Token del bot en Discord Developer Portal (permite leer canales y roles reales)</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      apiStatus?.hasBotToken ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {apiStatus?.hasBotToken ? 'Configurado' : 'Opcional (Widget activo)'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#161828] border border-slate-800 font-mono">
                    <div>
                      <span className="text-indigo-300 font-bold">DISCORD_CLIENT_ID & SECRET</span>
                      <p className="text-[11px] text-slate-400 font-sans">Credenciales OAuth2 para login con Discord y asignación automática de roles</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      apiStatus?.hasClientId ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {apiStatus?.hasClientId ? 'Configurado' : 'Opcional'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Reset & Cleaning */}
              <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  Limpiar Datos Falsos de Demostración
                </h4>
                <p className="text-xs text-rose-200/70 leading-relaxed">
                  Si ya conectaste tu servidor real o vas a lanzar el portal para tus miembros, puedes vaciar con un clic las encuestas de prueba y tickets simulados de muestra para empezar desde cero.
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={async () => {
                      if (confirm('¿Deseas vaciar los tickets falsos de soporte para dejar la bandeja limpia?')) {
                        const ok = await clearMockData(true, false, false);
                        if (ok) {
                          setActionSuccessMsg('Bandeja de tickets limpiada con éxito.');
                          fetchData();
                        }
                      }
                    }}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    Vaciar Tickets de Prueba
                  </button>

                  <button
                    onClick={async () => {
                      if (confirm('¿Deseas vaciar las encuestas falsas de prueba?')) {
                        const ok = await clearMockData(false, true, false);
                        if (ok) {
                          setActionSuccessMsg('Encuestas de prueba eliminadas con éxito.');
                          fetchData();
                        }
                      }
                    }}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    Vaciar Encuestas de Prueba
                  </button>

                  <button
                    onClick={async () => {
                      if (confirm('¿Confirmas que deseas reiniciar TODO (tickets y encuestas de muestra) para dejar el portal completamente limpio?')) {
                        const ok = await clearMockData(true, true, false);
                        if (ok) {
                          setActionSuccessMsg('¡Portal reiniciado a estado limpio con éxito!');
                          fetchData();
                        }
                      }
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Limpiar Todos los Datos Demo
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Inspect Code Modal Sub-dialog */}
        {inspectConfig && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 p-4">
            <div className="bg-[#141624] border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
              <div className="px-5 py-3.5 bg-[#1a1d2e] border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-[#5865F2]" />
                  <span className="text-xs font-bold text-white">{inspectConfig.fileName}</span>
                </div>
                <button onClick={() => setInspectConfig(null)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 bg-[#0c0d14] max-h-96 overflow-auto font-mono text-xs text-slate-300">
                <pre>{inspectConfig.fileContent}</pre>
              </div>
              <div className="px-5 py-3 bg-[#141624] border-t border-slate-800 flex justify-end gap-2">
                <button
                  onClick={() => setInspectConfig(null)}
                  className="px-4 py-1.5 bg-slate-800 text-xs text-white rounded-lg"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Reason Modal Sub-dialog */}
        {rejectTargetId && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 p-4">
            <form
              onSubmit={handleRejectConfig}
              className="bg-[#161826] border border-slate-700 rounded-2xl w-full max-w-md p-5 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4"
            >
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Motivo del Rechazo de la Configuración
              </h3>
              <p className="text-xs text-slate-400">
                Este mensaje será visible para el autor para que pueda corregir el archivo y volver a enviarlo.
              </p>
              <textarea
                required
                rows={3}
                placeholder="Ej: Contiene tokens de webhook no ofuscados o sintaxis JSON corrupta..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                className="w-full bg-[#10121a] border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectTargetId(null);
                    setRejectReason('');
                  }}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold"
                >
                  Confirmar Rechazo
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
