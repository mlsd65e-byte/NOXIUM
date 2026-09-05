import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DiscordGuildData, ServerStats } from '../types';
import { safeFetchJson } from '../utils/apiClient';
import { useAuth } from './AuthContext';

export interface DiscordApiStatus {
  hasBotToken: boolean;
  hasClientId: boolean;
  hasClientSecret: boolean;
  configuredGuildId: string | null;
  isRealData: boolean;
  source: 'discord_bot_api' | 'discord_widget' | 'oauth_user' | 'mock';
}

interface DiscordServerContextType {
  currentGuild: DiscordGuildData;
  serverStats: ServerStats | null;
  apiStatus: DiscordApiStatus | null;
  isSyncing: boolean;
  isRealData: boolean;
  showServerModal: boolean;
  setShowServerModal: (show: boolean) => void;
  selectGuild: (guildId: string, name?: string, icon?: string) => Promise<boolean>;
  syncGuild: (guildId?: string) => Promise<boolean>;
  clearMockData: () => Promise<boolean>;
  lastSyncedAt: string | null;
}

const DEFAULT_GUILD: DiscordGuildData = {
  id: 'nexus_default',
  name: 'Nexus Community',
  icon: null,
  iconUrl: 'https://cdn.discordapp.com/embed/avatars/0.png',
  description: 'Comunidad principal de Discord sincronizada en tiempo real.',
  splash: null,
  banner: null,
  memberCount: 14892,
  onlineCount: 3418,
  voiceActiveCount: 412,
  boostTier: 3,
  boostCount: 36,
  isRealData: false,
  source: 'mock',
  instantInvite: 'https://discord.gg/nexus-community',
  channels: [
    { id: 'c1', name: 'general-chat', type: 0, position: 1 },
    { id: 'c2', name: 'buscar-grupo', type: 0, position: 2 },
    { id: 'c3', name: 'Sala de Voz Principal', type: 2, position: 3 },
    { id: 'c4', name: 'programacion-devs', type: 0, position: 4 },
  ],
  roles: [
    { id: 'r1', name: 'Staff & Admin', color: 0xe01e5a, hexColor: '#e01e5a', position: 1, membersCount: 18 },
    { id: 'r2', name: 'Server Booster', color: 0xf47fff, hexColor: '#f47fff', position: 2, membersCount: 36 },
    { id: 'r3', name: 'Miembro', color: 0x5865f2, hexColor: '#5865f2', position: 3, membersCount: 12450 },
  ],
  members: [],
  emojis: [],
  lastSyncedAt: new Date().toISOString(),
};

const DiscordServerContext = createContext<DiscordServerContextType | undefined>(undefined);

export const DiscordServerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [currentGuild, setCurrentGuild] = useState<DiscordGuildData>(DEFAULT_GUILD);
  const [serverStats, setServerStats] = useState<ServerStats | null>(null);
  const [apiStatus, setApiStatus] = useState<DiscordApiStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showServerModal, setShowServerModal] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  // Cargar estado inicial del servidor y estado de la API
  const refreshGuildData = useCallback(async () => {
    try {
      const [guildRes, statusRes] = await Promise.all([
        safeFetchJson<{ guild: DiscordGuildData; stats: ServerStats; isRealData: boolean }>(
          '/api/discord/guild/current',
          undefined,
          { guild: DEFAULT_GUILD, stats: {} as any, isRealData: false }
        ),
        safeFetchJson<DiscordApiStatus>('/api/discord/status', undefined, {
          hasBotToken: false,
          hasClientId: false,
          hasClientSecret: false,
          configuredGuildId: null,
          isRealData: false,
          source: 'mock',
        }),
      ]);

      if (guildRes.guild) {
        setCurrentGuild(guildRes.guild);
        if (guildRes.guild.lastSyncedAt) {
          setLastSyncedAt(new Date(guildRes.guild.lastSyncedAt).toLocaleTimeString());
        }
      }
      if (guildRes.stats) {
        setServerStats(guildRes.stats);
      }
      setApiStatus(statusRes);
    } catch (err) {
      console.warn('Error fetching Discord guild status:', err);
    }
  }, []);

  useEffect(() => {
    refreshGuildData();
    const timer = setInterval(refreshGuildData, 30000);
    return () => clearInterval(timer);
  }, [refreshGuildData]);

  // Si el usuario acaba de iniciar sesión y tiene servidores de Discord, sincronizar
  useEffect(() => {
    if (currentUser && currentUser.guilds && currentUser.guilds.length > 0 && !currentGuild.isRealData) {
      const adminGuild = currentUser.guilds.find(g => g.isAdmin || g.isOwner) || currentUser.guilds[0];
      if (adminGuild) {
        selectGuild(adminGuild.id, adminGuild.name, adminGuild.iconUrl);
      }
    }
  }, [currentUser]);

  // Cambiar servidor activo
  const selectGuild = async (guildId: string, name?: string, icon?: string): Promise<boolean> => {
    setIsSyncing(true);
    try {
      const res = await safeFetchJson<{ success: boolean; guild: DiscordGuildData; stats: ServerStats }>(
        '/api/discord/guild/select',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guildId, guildName: name, guildIcon: icon }),
        },
        { success: false, guild: DEFAULT_GUILD, stats: {} as any }
      );

      if (res.success && res.guild) {
        setCurrentGuild(res.guild);
        if (res.stats) setServerStats(res.stats);
        setLastSyncedAt(new Date().toLocaleTimeString());
        await refreshGuildData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error selecting Discord guild:', err);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  // Sincronizar manualmente con Discord API
  const syncGuild = async (guildId?: string): Promise<boolean> => {
    setIsSyncing(true);
    try {
      const res = await safeFetchJson<{ success: boolean; guild: DiscordGuildData; stats: ServerStats }>(
        '/api/discord/guild/sync',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guildId: guildId || currentGuild.id }),
        },
        { success: false, guild: DEFAULT_GUILD, stats: {} as any }
      );

      if (res.success && res.guild) {
        setCurrentGuild(res.guild);
        if (res.stats) setServerStats(res.stats);
        setLastSyncedAt(new Date().toLocaleTimeString());
        await refreshGuildData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error syncing Discord guild:', err);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  // Limpiar datos demo falsos
  const clearMockData = async (): Promise<boolean> => {
    try {
      const res = await safeFetchJson<{ success: boolean; message: string }>(
        '/api/admin/clear-mock-data',
        { method: 'POST' },
        { success: false, message: '' }
      );
      if (res.success) {
        await refreshGuildData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error clearing mock data:', err);
      return false;
    }
  };

  return (
    <DiscordServerContext.Provider
      value={{
        currentGuild,
        serverStats,
        apiStatus,
        isSyncing,
        isRealData: currentGuild.isRealData,
        showServerModal,
        setShowServerModal,
        selectGuild,
        syncGuild,
        clearMockData,
        lastSyncedAt,
      }}
    >
      {children}
    </DiscordServerContext.Provider>
  );
};

export const useDiscordServer = () => {
  const context = useContext(DiscordServerContext);
  if (!context) {
    throw new Error('useDiscordServer must be used within a DiscordServerProvider');
  }
  return context;
};
