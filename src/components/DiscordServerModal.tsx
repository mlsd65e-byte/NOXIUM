import React, { useState } from 'react';
import { useDiscordServer } from '../context/DiscordServerContext';
import { useAuth } from '../context/AuthContext';
import {
  Server,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
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
  Bot,
  HelpCircle,
  Sparkles,
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
  const [activeTab, setActiveTab] = useState<'server' | 'bot' | 'render'>('server');
  const [manualGuildId, setManualGuildId] = useState('');
  const [customClientId, setCustomClientId] = useState('');
  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const [clearSuccess, setClearSuccess] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  if (!showServerModal) return null;

  // Derive effective bot Client ID
  const effectiveClientId = customClientId.trim() || apiStatus?.clientId || '';
  
  // Construct dynamic bot invite URL
  const targetGuildId = currentGuild.id !== 'nexus_default' ? currentGuild.id : (manualGuildId.trim() || '');
  const botInviteUrl = effectiveClientId
    ? `https://discord.com/oauth2/authorize?client_id=${effectiveClientId}&permissions=8&scope=bot%20applications.commands${
        targetGuildId && /^\d{17,20}$/.test(targetGuildId) ? `&guild_id=${targetGuildId}&disable_guild_select=true` : ''
      }`
    : (apiStatus?.botInviteUrl || 'https://discord.com/oauth2/authorize?client_id=TU_CLIENT_ID&permissions=8&scope=bot%20applications.commands');

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
      setSyncMessage('Sincronización intentada. Revisa los mensajes de estado y la pestaña "Invitar Bot".');
      setTimeout(() => setSyncMessage(null), 4000);
    }
  };

  const handleSyncNow = async () => {
    setSyncMessage('Consultando API de Discord en vivo...');
    await syncGuild();
    setSyncMessage('¡Sincronización completada!');
    setTimeout(() => setSyncMessage(null), 3000);
  };

  const handleClearMock = async () => {
    if (confirm('¿Deseas vaciar los tickets y encuestas iniciales para dejar el portal completamente limpio?')) {
      const ok = await clearMockData();
      if (ok) {
        setClearSuccess(true);
        setTimeout(() => setClearSuccess(false), 3000);
      }
    }
  };

  const userGuilds = currentUser.guilds || [];
  const hasSyncError = Boolean(currentGuild.syncError || apiStatus?.syncError);

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
                Administra tu servidor, invita tu Bot y verifica métricas en vivo
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

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 border-b border-slate-800 bg-[#0d0f18] text-xs font-semibold gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('server')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'server'
                ? 'border-[#5865F2] text-white bg-[#141622]/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            Servidor & Estado
          </button>

          <button
            onClick={() => setActiveTab('bot')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'bot'
                ? 'border-[#5865F2] text-white bg-[#141622]/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span>🤖 Invitar Bot & Resolver "No se une"</span>
            {hasSyncError && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('render')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'render'
                ? 'border-[#5865F2] text-white bg-[#141622]/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Variables Render.com
          </button>
        </div>

        {/* Content Scroll */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Active Sync Error Alert Notice */}
          {hasSyncError && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-sm">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  Atención: El bot no se encuentra en el servidor
                </span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-mono uppercase font-bold">
                  {apiStatus?.botStatus || 'no_unido'}
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {currentGuild.syncError || apiStatus?.syncError}
              </p>
              <div className="pt-2 flex flex-wrap gap-2">
                <a
                  href={botInviteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 bg-[#5865F2] hover:bg-[#4752c4] text-white rounded-lg font-bold inline-flex items-center gap-1.5 shadow-md shadow-[#5865F2]/20 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Invitar Bot al Servidor con 1 Clic
                </a>
                <button
                  type="button"
                  onClick={() => setActiveTab('bot')}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
                >
                  Ver Solución y Guía de Intents
                </button>
              </div>
            </div>
          )}

          {syncMessage && (
            <div className="p-3 rounded-lg bg-[#5865F2]/20 border border-[#5865F2]/40 text-[#5865F2] text-xs font-medium animate-in fade-in">
              {syncMessage}
            </div>
          )}

          {/* TAB 1: SERVER & STATE */}
          {activeTab === 'server' && (
            <div className="space-y-6">
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
                      <span>{isRealData ? 'Conectado a la API de Discord' : 'Servidor de la Comunidad'}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase ${
                          isRealData
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        }`}
                      >
                        {currentGuild.source}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      {isRealData
                        ? `Mostrando métricas reales de "${currentGuild.name}". Sincronizado: ${lastSyncedAt || 'hace un momento'}.`
                        : 'Actualmente se muestran datos de prueba. Para vincular tu servidor, invítalo con el enlace de autorización o añade tus variables en Render.'}
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

                  <div className="flex items-center gap-3 text-xs">
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

              {/* Connect by Server ID Form */}
              <form onSubmit={handleManualConnect} className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Ingresa o cambia el ID de tu Servidor de Discord (Guild ID)
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
                    Vincular Servidor
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Para obtener el ID: En Discord ve a <em>Ajustes &gt; Avanzado &gt; Activar Modo Desarrollador</em>, luego haz clic derecho en el icono de tu servidor y selecciona <strong>«Copiar ID del servidor»</strong>.
                </p>
              </form>

              {/* User's Discord Servers (if logged in with Discord OAuth) */}
              {userGuilds.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Tus Servidores Administrados ({userGuilds.length})
                    </h4>
                    <span className="text-[11px] text-indigo-400">Selecciona para cambiar</span>
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
                    <p className="text-xs font-semibold text-white">¿Quieres seleccionar tus servidores con 1 clic?</p>
                    <p className="text-[11px] text-slate-400">
                      Inicia sesión con tu cuenta de Discord para ver la lista de servidores donde eres administrador.
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
            </div>
          )}

          {/* TAB 2: BOT INVITE & WHY BOT DOESN'T JOIN */}
          {activeTab === 'bot' && (
            <div className="space-y-5">
              {/* Essential Concept Explanation */}
              <div className="p-4 rounded-2xl bg-[#181b2a] border border-indigo-500/30 space-y-3">
                <div className="flex items-center gap-3 text-white">
                  <div className="w-9 h-9 rounded-xl bg-[#5865F2]/20 text-[#5865F2] flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">¿Por qué el bot no se une al servidor?</h3>
                    <p className="text-xs text-slate-400">
                      En Discord, los bots <strong>NO</strong> se unen automáticamente por crear el bot o configurar el token en Render.
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed bg-[#11131e] p-3 rounded-xl border border-slate-800">
                  Un bot es una aplicación externa: <strong>un administrador del servidor debe abrir el enlace de autorización oficial de Discord y hacer clic en «Autorizar»</strong> para que el bot ingrese al servidor de Discord.
                </p>
              </div>

              {/* 1-Click Bot Invite Generator */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1b1e30] to-[#141624] border border-[#5865F2]/40 space-y-4 shadow-xl">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-bold text-white">Enlace Oficial de Invitación del Bot</h4>
                  </div>
                  {effectiveClientId && (
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                      Client ID Detectado
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-300 font-semibold block">
                    Application ID / Client ID de tu Bot (en Discord Developer Portal):
                  </label>
                  <input
                    type="text"
                    value={customClientId || apiStatus?.clientId || ''}
                    onChange={e => setCustomClientId(e.target.value)}
                    placeholder="Ejemplo: 120938475618293041"
                    className="w-full bg-[#0d0f17] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-[#5865F2]"
                  />
                  <p className="text-[11px] text-slate-400">
                    Si no está detectado, búscalo en <a href="https://discord.com/developers/applications" target="_blank" rel="noreferrer" className="text-[#5865F2] underline">Discord Developer Portal</a> &gt; tu aplicación &gt; <em>General Information &gt; Application ID</em>.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <a
                    href={botInviteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 px-4 py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#5865F2]/25 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    ➕ Abrir Enlace Oficial para Unir el Bot a mi Servidor
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopy(botInviteUrl, 'bot_invite')}
                    className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition shrink-0"
                  >
                    {copiedVar === 'bot_invite' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    {copiedVar === 'bot_invite' ? '¡Copiado!' : 'Copiar URL'}
                  </button>
                </div>
              </div>

              {/* 3 Step Diagnostic Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  3 Pasos Cruciales para que el Bot se Conecte al 100%
                </h4>

                <div className="grid grid-cols-1 gap-2.5 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#181b2a] border border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#5865F2]/20 text-[#5865F2] flex items-center justify-center font-bold shrink-0 text-xs">
                      1
                    </span>
                    <div className="space-y-1">
                      <p className="font-bold text-white">Haz clic en «Abrir Enlace Oficial» y autorízalo</p>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Selecciona el servidor en el desplegable (debes ser Administrador o Propietario en Discord), confirma los permisos y completa el captcha. Verás al bot aparecer en la lista de miembros de Discord.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#181b2a] border border-amber-500/30 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold shrink-0 text-xs">
                      2
                    </span>
                    <div className="space-y-1">
                      <p className="font-bold text-amber-300">¡Muy importante! Activa los Privileged Gateway Intents</p>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        Entra en <a href="https://discord.com/developers/applications" target="_blank" rel="noreferrer" className="text-[#5865F2] underline font-semibold">Discord Developer Portal</a> &gt; tu Bot &gt; pestaña <strong>Bot</strong>. Desplaza hacia abajo hasta <strong>Privileged Gateway Intents</strong> y activa:
                      </p>
                      <ul className="list-disc list-inside text-[11px] text-amber-200/90 font-medium pl-1">
                        <li>✅ <strong>SERVER MEMBERS INTENT</strong> (Sin esto, Discord prohíbe al bot leer miembros y roles)</li>
                        <li>✅ <strong>MESSAGE CONTENT INTENT</strong></li>
                      </ul>
                      <p className="text-[10px] text-slate-400">Recuerda hacer clic en <em>Save Changes</em> al pie de página.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#181b2a] border border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#5865F2]/20 text-[#5865F2] flex items-center justify-center font-bold shrink-0 text-xs">
                      3
                    </span>
                    <div className="space-y-1">
                      <p className="font-bold text-white">Regresa al portal y pulsa «Sincronizar»</p>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Una vez que el bot esté dentro y los intents guardados, haz clic en el botón Sincronizar de arriba. Las métricas, canales y roles pasarán de inmediato a <strong>Vivo (Discord REST API)</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instant Alternative: Server Widget */}
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                  <Radio className="w-4 h-4 text-indigo-400" />
                  ¿Alternativa rápida sin invitar ningún bot?
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Puedes conectar datos en vivo en 15 segundos activando el Widget de Discord:
                </p>
                <p className="text-[11px] text-slate-400">
                  En Discord ve a <em>Ajustes del Servidor &gt; Widget &gt; Activar «Habilitar widget del servidor»</em>. Luego coloca tu ID del servidor en la pestaña "Servidor". ¡El portal cargará tus canales de voz y miembros conectados de inmediato sin requerir bot!
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: RENDER.COM VARIABLES */}
          {activeTab === 'render' && (
            <div className="space-y-4">
              <div className="bg-[#121420] border border-slate-800/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  Configurar Variables en Render.com para Datos 100% Reales
                </div>
                <p className="text-xs text-slate-400">
                  Para que tu aplicación en Render consulte los canales, roles, emojis y miembros reales de forma permanente, añade estas variables en tu panel de Render (<strong>Dashboard &gt; Environment</strong>):
                </p>

                <div className="space-y-2 font-mono text-[11px]">
                  <div className="flex items-center justify-between p-2.5 rounded bg-[#0b0d14] border border-slate-800">
                    <div>
                      <span className="text-slate-400 text-[10px] block font-sans">ID de tu servidor de Discord:</span>
                      <span className="text-emerald-400">DISCORD_GUILD_ID={currentGuild.id !== 'nexus_default' ? currentGuild.id : 'TU_SERVER_ID'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(`DISCORD_GUILD_ID=${currentGuild.id}`, 'guild')}
                      className="text-slate-400 hover:text-white transition"
                    >
                      {copiedVar === 'guild' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded bg-[#0b0d14] border border-slate-800">
                    <div>
                      <span className="text-slate-400 text-[10px] block font-sans">Bot Token (Discord Developer Portal &gt; Bot &gt; Reset Token):</span>
                      <span className="text-indigo-400">DISCORD_BOT_TOKEN=OTQ...</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('DISCORD_BOT_TOKEN=', 'bot')}
                      className="text-slate-400 hover:text-white transition"
                    >
                      {copiedVar === 'bot' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded bg-[#0b0d14] border border-slate-800">
                    <div>
                      <span className="text-slate-400 text-[10px] block font-sans">Client ID para OAuth y generación automática de invitaciones:</span>
                      <span className="text-indigo-400">DISCORD_CLIENT_ID={apiStatus?.clientId || 'TU_CLIENT_ID'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(`DISCORD_CLIENT_ID=${apiStatus?.clientId || ''}`, 'cid')}
                      className="text-slate-400 hover:text-white transition"
                    >
                      {copiedVar === 'cid' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Clean Mock Data Button */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-300">Vaciar registros iniciales</p>
                  <p className="text-[11px] text-slate-500">
                    Limpia las encuestas y tickets iniciales para empezar solo con tus propios datos.
                  </p>
                </div>
                <button
                  onClick={handleClearMock}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {clearSuccess ? '¡Limpiado!' : 'Limpiar registros'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#10121b] flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            {isRealData ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Conectado en vivo a Discord
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Portal Comunitario Activo
              </span>
            )}
          </div>

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
