import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDiscordServer } from '../context/DiscordServerContext';
import {
  Shield,
  Flame,
  Activity,
  Vote,
  Users,
  FolderCode,
  LifeBuoy,
  ChevronDown,
  UserCheck,
  ExternalLink,
  Sparkles,
  LogOut,
  HelpCircle,
  Copy,
  Check,
  Server,
  RefreshCw,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'stats' | 'polls' | 'members' | 'configs' | 'support';
  setActiveTab: (tab: 'stats' | 'polls' | 'members' | 'configs' | 'support') => void;
  openAdminPanel: () => void;
  pendingConfigsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  openAdminPanel,
  pendingConfigsCount,
}) => {
  const { currentUser, isAuthenticated, loginWithDiscord, logout, canModerate, setShowOAuthModal } = useAuth();
  const { currentGuild, isRealData, isSyncing, setShowServerModal, syncGuild } = useDiscordServer();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Admin':
        return { bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40', label: 'Admin', icon: '👑' };
      case 'Moderador':
        return { bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', label: 'Staff Mod', icon: '🛡️' };
      case 'Booster':
        return { bg: 'bg-pink-500/20 text-pink-300 border-pink-500/40', label: 'Booster Lvl 3', icon: '⚡' };
      case 'VIP':
        return { bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40', label: 'VIP', icon: '⭐' };
      default:
        return { bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40', label: 'Miembro', icon: '🎮' };
    }
  };

  const currentRoleBadge = getRoleBadge(currentUser.roles[0] || 'Miembro');

  const copyInvite = () => {
    const inviteUrl = currentGuild.instantInvite || 'https://discord.gg/nexus-community';
    navigator.clipboard.writeText(inviteUrl);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#11131c]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          {/* Logo & Server Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowServerModal(true)}
              className="relative group text-left transition focus:outline-none"
              title="Haz clic para administrar el servidor de Discord conectado"
            >
              {currentGuild.iconUrl && currentGuild.icon ? (
                <img
                  src={currentGuild.iconUrl}
                  alt={currentGuild.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl object-cover border border-indigo-500/40 shadow-lg shadow-[#5865F2]/25 group-hover:scale-105 transition"
                />
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#5865F2] to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-[#5865F2]/25 group-hover:scale-105 transition">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 fill-current" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028z" />
                  </svg>
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-400"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 border-2 border-[#11131c] bg-emerald-500"></span>
              </span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowServerModal(true)}
                  className="font-extrabold text-base sm:text-lg text-white tracking-tight leading-none hover:text-[#5865F2] transition text-left flex items-center gap-1.5"
                >
                  <span className="truncate max-w-[150px] sm:max-w-[240px]">{currentGuild.name}</span>
                </button>
                <button
                  onClick={() => setShowServerModal(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25 transition"
                  title="Estado del servidor de Discord"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Discord En Vivo
                </button>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                {currentGuild.onlineCount > 0 ? (
                  <span>{currentGuild.onlineCount.toLocaleString()} en línea</span>
                ) : currentGuild.memberCount > 0 ? (
                  <span>{currentGuild.memberCount.toLocaleString()} miembros</span>
                ) : (
                  <span>Sincronización Discord activa</span>
                )}
                <span className="text-slate-600">•</span>
                <button
                  onClick={copyInvite}
                  className="text-slate-400 hover:text-indigo-300 inline-flex items-center gap-0.5 font-mono text-[10px] transition"
                  title="Copiar invitación al servidor"
                >
                  {copiedInvite ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Check className="w-2.5 h-2.5" /> ¡Copiado!
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      Invitación <Copy className="w-2.5 h-2.5" />
                    </span>
                  )}
                </button>
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#161824] p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'stats'
                  ? 'bg-[#5865F2] text-white shadow-md shadow-[#5865F2]/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-4 h-4" />
              Estadísticas en Vivo
            </button>

            <button
              onClick={() => setActiveTab('polls')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'polls'
                  ? 'bg-[#5865F2] text-white shadow-md shadow-[#5865F2]/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Vote className="w-4 h-4" />
              Votaciones
            </button>

            <button
              onClick={() => setActiveTab('members')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'members'
                  ? 'bg-[#5865F2] text-white shadow-md shadow-[#5865F2]/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              Destacados
            </button>

            <button
              onClick={() => setActiveTab('configs')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'configs'
                  ? 'bg-[#5865F2] text-white shadow-md shadow-[#5865F2]/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FolderCode className="w-4 h-4" />
              Configuraciones
            </button>

            <button
              onClick={() => setActiveTab('support')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'support'
                  ? 'bg-[#5865F2] text-white shadow-md shadow-[#5865F2]/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LifeBuoy className="w-4 h-4" />
              Soporte
            </button>
          </nav>

          {/* Right Action Controls: Admin Panel & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Discord Server Sync Button */}
            <button
              onClick={() => setShowServerModal(true)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold border transition ${
                isRealData
                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-[#5865F2]/15 hover:bg-[#5865F2]/25 text-[#7289da] border-[#5865F2]/30'
              }`}
              title="Vincular servidor de Discord o sincronizar datos reales"
            >
              <Server className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="hidden sm:inline">Servidor Discord</span>
              {isSyncing && <RefreshCw className="w-3 h-3 animate-spin text-indigo-300 ml-0.5" />}
            </button>

            {/* Admin Panel Button */}
            {canModerate && (
              <button
                onClick={openAdminPanel}
                className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition shadow-sm"
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Panel Admin</span>
                {pendingConfigsCount > 0 && (
                  <span className="flex items-center justify-center px-1.5 py-0.5 text-[10px] font-extrabold bg-rose-500 text-white rounded-full leading-none">
                    {pendingConfigsCount}
                  </span>
                )}
              </button>
            )}

            {/* Discord Authentication / User Profile */}
            {!isAuthenticated ? (
              <button
                onClick={() => loginWithDiscord()}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold shadow-md shadow-[#5865F2]/20 transition"
                title="Iniciar sesión con tu cuenta de Discord"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028z" />
                </svg>
                <span className="hidden sm:inline">Iniciar Sesión</span>
                <span className="sm:hidden">Discord</span>
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-[#181a26] hover:bg-[#202334] border border-slate-700/70 transition"
                >
                  <div className="relative">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.username}
                      className="w-8 h-8 rounded-lg object-cover border border-slate-600"
                    />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#181a26] ${
                        currentUser.status === 'online'
                          ? 'bg-emerald-500'
                          : currentUser.status === 'dnd'
                          ? 'bg-rose-500'
                          : 'bg-amber-500'
                      }`}
                    ></span>
                  </div>

                  <div className="hidden md:block text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white max-w-[100px] truncate leading-tight">
                        {currentUser.global_name || currentUser.username}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border leading-none ${currentRoleBadge.bg}`}
                      >
                        {currentRoleBadge.icon} {currentRoleBadge.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                      {currentUser.customStatus || 'Conectado'}
                    </p>
                  </div>

                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-[#161926] border border-slate-700/80 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-2 py-2 border-b border-slate-800/80 mb-2">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cuenta Conectada</p>
                      <div className="flex items-center gap-2.5 mt-2">
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.username}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-white truncate">
                            {currentUser.global_name || currentUser.username}
                          </p>
                          <span
                            className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border mt-0.5 ${currentRoleBadge.bg}`}
                          >
                            {currentRoleBadge.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-800/80 pt-2 space-y-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowServerModal(true);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#181b2a] hover:bg-[#202336] text-indigo-300 rounded-lg text-xs font-semibold transition"
                      >
                        <Server className="w-3.5 h-3.5" />
                        Configurar Servidor de Discord
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowOAuthModal(true);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-slate-400 hover:text-slate-200 text-[11px] transition"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        Guía de configuración OAuth2
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg text-xs transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="lg:hidden flex items-center justify-between overflow-x-auto py-2 border-t border-slate-800 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-semibold ${
              activeTab === 'stats' ? 'bg-[#5865F2] text-white' : 'text-slate-400'
            }`}
          >
            Estadísticas
          </button>
          <button
            onClick={() => setActiveTab('polls')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-semibold ${
              activeTab === 'polls' ? 'bg-[#5865F2] text-white' : 'text-slate-400'
            }`}
          >
            Votaciones
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-semibold ${
              activeTab === 'members' ? 'bg-[#5865F2] text-white' : 'text-slate-400'
            }`}
          >
            Destacados
          </button>
          <button
            onClick={() => setActiveTab('configs')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-semibold ${
              activeTab === 'configs' ? 'bg-[#5865F2] text-white' : 'text-slate-400'
            }`}
          >
            Configuraciones
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-semibold ${
              activeTab === 'support' ? 'bg-[#5865F2] text-white' : 'text-slate-400'
            }`}
          >
            Soporte
          </button>
        </div>
      </div>
    </header>
  );
};
