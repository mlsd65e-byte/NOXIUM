import React, { useState } from 'react';
import { useDiscordServer } from '../context/DiscordServerContext';
import { useAuth } from '../context/AuthContext';
import {
  Server,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  Layers,
  Users,
  Hash,
  Volume2,
  Trash2,
  Copy,
  Check,
  X,
  Zap,
  Radio,
  Sliders,
  ChevronRight,
} from 'lucide-react';

export const DiscordServerModal: React.FC = () => {
  const {
    currentGuild,
    apiStatus,
    isSyncing,
    isRealData,
    showServerModal,
    setShowServerModal,
    selectGuild,
    syncGuild,
    clearMockData,
    lastSyncedAt,
  } = useDiscordServer();

  const { currentUser, loginWithDiscord } = useAuth();
  const [manualGuildId, setManualGuildId] = useState('');
  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const [clearSuccess, setClearSuccess] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  if (!showServerModal) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVar(label);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  const handleManualConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualGuildId.trim()) return;
    setSyncMessage('Conectando con la API de Discord...');
    const ok = await selectGuild(manualGuildId.trim());
    if (ok) {
      setSyncMessage('¡Servidor conectado exitosamente con Discord!');
      setTimeout(() => setSyncMessage(null), 3000);
    } else {
      setSyncMessage('Sincronizado. Si tu servidor tiene el Widget público activado o el bot configurado, verás todos los datos reales.');
      setTimeout(() => setSyncMessage(null), 4000);
    }
  };

  const handleSyncNow = async () => {
    setSyncMessage('Actualizando métricas con la API de Discord...');
    await syncGuild();
    setSyncMessage('¡Datos actualizados desde Discord!');
    setTimeout(() => setSyncMessage(null), 3000);
  };

  const handleClearMock = async () => {
    if (confirm('¿Deseas eliminar las votaciones, tickets y configuraciones falsas de demostración?')) {
      const ok = await clearMockData();
      if (ok) {
        setClearSuccess(true);
        setTimeout(() => setClearSuccess(false), 3000);
      }
    }
  };

  const userGuilds = currentUser.guilds || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#141622] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#10121b]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5865F2]/20 border border-[#5865F2]/40 flex items-center justify-center text-[#5865F2]">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Conexión & Servidor Real de Discord
              </h2>
              <p className="text-xs text-slate-400">
                Administra qué servidor de Discord está vinculado y visualiza datos reales
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowServerModal(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Scroll */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Status Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${
              isRealData
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            <div className="flex items-start gap-3">
              {isRealData ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="font-semibold text-sm flex items-center gap-2">
                  <span>{isRealData ? 'Conectado a Datos Reales' : 'Modo Demostración / Simulado'}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase ${
                      isRealData
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {currentGuild.source}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  {isRealData
                    ? `Mostrando métricas reales de "${currentGuild.name}". Sincronizado: ${lastSyncedAt || 'hace un momento'}.`
                    : 'Actualmente se muestran datos de prueba. Conecta tu servidor de Discord o agrega tu Bot Token en Render para obtener tus canales, roles y miembros reales.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              Sincronizar
            </button>
          </div>

          {syncMessage && (
            <div className="p-3 rounded-lg bg-[#5865F2]/20 border border-[#5865F2]/40 text-[#5865F2] text-xs font-medium animate-in fade-in">
              {syncMessage}
            </div>
          )}

          {/* Current Active Server Preview */}
          <div className="bg-[#181b2a] border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Servidor Activo en el Portal
            </div>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={currentGuild.iconUrl || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                  alt={currentGuild.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-700 bg-slate-800"
                />
                <div>
                  <h3 className="text-base font-bold text-white">{currentGuild.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">ID: {currentGuild.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="text-center px-3 py-1.5 bg-[#121420] rounded-lg border border-slate-800">
                  <p className="text-slate-400 text-[10px]">Miembros</p>
                  <p className="font-bold text-white">{currentGuild.memberCount.toLocaleString()}</p>
                </div>
                <div className="text-center px-3 py-1.5 bg-[#121420] rounded-lg border border-slate-800">
                  <p className="text-emerald-400 text-[10px]">En Línea</p>
                  <p className="font-bold text-emerald-400">{currentGuild.onlineCount.toLocaleString()}</p>
                </div>
                <div className="text-center px-3 py-1.5 bg-[#121420] rounded-lg border border-slate-800">
                  <p className="text-indigo-400 text-[10px]">Canales</p>
                  <p className="font-bold text-white">{currentGuild.channels?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* User's Discord Servers (if logged in with Discord OAuth) */}
          {userGuilds.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Tus Servidores de Discord ({userGuilds.length})
                </h4>
                <span className="text-[11px] text-indigo-400">Haz clic para conectar</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                {userGuilds.map(g => (
                  <button
                    key={g.id}
                    onClick={() => selectGuild(g.id, g.name, g.iconUrl)}
                    disabled={isSyncing}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition ${
                      currentGuild.id === g.id
                        ? 'bg-[#5865F2]/20 border-[#5865F2] text-white'
                        : 'bg-[#181b2a] border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={g.iconUrl || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                        alt={g.name}
                        className="w-8 h-8 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">{g.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {g.isOwner ? '👑 Propietario' : g.isAdmin ? '🛡️ Administrador' : 'Miembro'}
                        </p>
                      </div>
                    </div>
                    {currentGuild.id === g.id ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#5865F2] text-white shrink-0">
                        Activo
                      </span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#181b2a] border border-slate-800 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-white">¿Quieres ver tus servidores de Discord aquí?</p>
                <p className="text-[11px] text-slate-400">
                  Inicia sesión con tu cuenta de Discord para seleccionar directamente el servidor que administras.
                </p>
              </div>
              <button
                onClick={() => loginWithDiscord()}
                className="px-3.5 py-2 rounded-lg bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-semibold shrink-0 transition"
              >
                Conectar Discord
              </button>
            </div>
          )}

          {/* Connect by Server ID Form */}
          <form onSubmit={handleManualConnect} className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              O ingresa el ID de tu Servidor de Discord (Guild ID)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualGuildId}
                onChange={e => setManualGuildId(e.target.value)}
                placeholder="Ejemplo: 110293847561928374"
                className="flex-1 bg-[#121420] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#5865F2]"
              />
              <button
                type="submit"
                disabled={isSyncing || !manualGuildId.trim()}
                className="px-4 py-2 bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-semibold rounded-lg transition disabled:opacity-50"
              >
                Vincular
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Consejo: Para obtener el ID, activa el Modo Desarrollador en Discord (Ajustes &gt; Avanzado &gt; Modo desarrollador), haz clic derecho en el icono de tu servidor y selecciona "Copiar ID del servidor".
            </p>
          </form>

          {/* Render.com Setup Guide */}
          <div className="bg-[#121420] border border-slate-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Configurar Variables en Render.com para Datos 100% Reales
            </div>
            <p className="text-xs text-slate-400">
              Para que el backend en Render consulte canales, roles, emojis y miembros reales sin límites, añade estas variables en tu panel de Render (<strong>Dashboard &gt; Environment</strong>):
            </p>

            <div className="space-y-2 font-mono text-[11px]">
              <div className="flex items-center justify-between p-2 rounded bg-[#0b0d14] border border-slate-800">
                <span className="text-emerald-400">DISCORD_GUILD_ID={currentGuild.id !== 'nexus_default' ? currentGuild.id : 'TU_SERVER_ID'}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(`DISCORD_GUILD_ID=${currentGuild.id}`, 'guild')}
                  className="text-slate-400 hover:text-white transition"
                >
                  {copiedVar === 'guild' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-[#0b0d14] border border-slate-800">
                <span className="text-indigo-400">DISCORD_BOT_TOKEN=OTQ... (Token de tu Bot en Discord Developer Portal)</span>
                <button
                  type="button"
                  onClick={() => handleCopy('DISCORD_BOT_TOKEN=', 'bot')}
                  className="text-slate-400 hover:text-white transition"
                >
                  {copiedVar === 'bot' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1">
              <p>
                <strong>¿No tienes bot todavía?</strong> Puedes activar el <strong>Widget del Servidor</strong> en Discord:
              </p>
              <p className="text-slate-500">
                En tu Discord: <em>Ajustes del Servidor &gt; Widget &gt; Activar widget del servidor</em>. ¡Esto permite cargar tus canales y miembros conectados de inmediato sin necesidad de bot!
              </p>
            </div>
          </div>

          {/* Clean Mock Data Button */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-300">Eliminar datos simulados</p>
              <p className="text-[11px] text-slate-500">
                Limpia las encuestas y tickets de prueba para empezar solo con tus datos.
              </p>
            </div>
            <button
              onClick={handleClearMock}
              className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {clearSuccess ? '¡Limpiado!' : 'Limpiar datos demo'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#10121b] flex justify-end">
          <button
            onClick={() => setShowServerModal(false)}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
