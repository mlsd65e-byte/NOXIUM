import React, { useState, useEffect } from 'react';
import { ConfigPreset, SupportTicket, ModerationLog } from '../types';
import { useAuth } from '../context/AuthContext';
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
  const [activeTab, setActiveTab] = useState<'configs' | 'tickets' | 'logs'>('configs');
  const [configs, setConfigs] = useState<ConfigPreset[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [inspectConfig, setInspectConfig] = useState<ConfigPreset | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [filterConfigStatus, setFilterConfigStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

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
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
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
