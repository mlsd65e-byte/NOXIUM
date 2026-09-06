import React, { createContext, useContext, useState, useEffect } from 'react';
import { DiscordUser, DiscordRole } from '../types';
import { safeFetchJson } from '../utils/apiClient';

interface OAuthConfig {
  configured: boolean;
  clientId: string | null;
  redirectUri: string;
  appUrl: string;
}

export const GUEST_USER: DiscordUser = {
  id: 'guest',
  username: 'Invitado',
  global_name: 'Invitado',
  avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
  roles: ['Miembro'],
  joinedAt: new Date().toISOString(),
  status: 'offline',
  customStatus: 'Navegando como visitante',
  canModerate: false,
  canPostPolls: false,
};

interface AuthContextType {
  currentUser: DiscordUser;
  isAuthenticated: boolean;
  loginWithDiscord: (overrideRedirectUri?: string) => Promise<void>;
  logout: () => void;
  oauthConfig: OAuthConfig | null;
  isLoadingAuth: boolean;
  hasRole: (role: DiscordRole) => boolean;
  canModerate: boolean;
  canPostPolls: boolean;
  showOAuthModal: boolean;
  setShowOAuthModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<DiscordUser>(() => {
    const saved = localStorage.getItem('nexus_discord_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure old demo users are purged from localStorage
        if (parsed && parsed.id && !parsed.id.startsWith('user_admin') && !parsed.id.startsWith('user_mod') && !parsed.id.startsWith('user_booster') && !parsed.id.startsWith('user_member')) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return GUEST_USER;
  });

  const [oauthConfig, setOauthConfig] = useState<OAuthConfig | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [showOAuthModal, setShowOAuthModal] = useState(false);

  useEffect(() => {
    if (currentUser.id !== 'guest') {
      localStorage.setItem('nexus_discord_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('nexus_discord_user');
    }
  }, [currentUser]);

  // Fetch OAuth config from server
  useEffect(() => {
    const origin = window.location.origin;
    const fallbackConfig: OAuthConfig = {
      configured: false,
      clientId: null,
      redirectUri: `${origin}/api/auth/discord/callback`,
      appUrl: origin,
    };

    safeFetchJson<OAuthConfig>(`/api/auth/discord/config?origin=${encodeURIComponent(origin)}`, undefined, fallbackConfig)
      .then(data => setOauthConfig(data))
      .catch(() => setOauthConfig(fallbackConfig));
  }, []);

  // Listen for Discord OAuth popup success message
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data?.user) {
        setCurrentUser(event.data.user);
        setIsLoadingAuth(false);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const loginWithDiscord = async (overrideRedirectUri?: string) => {
    setIsLoadingAuth(true);
    try {
      const origin = window.location.origin;
      const queryParams = new URLSearchParams({ origin });
      if (overrideRedirectUri) {
        queryParams.set('redirect_uri', overrideRedirectUri);
      }

      const data = await safeFetchJson<{ configured: boolean; url: string | null; redirectUri?: string }>(
        `/api/auth/discord/url?${queryParams.toString()}`,
        undefined,
        { configured: false, url: null }
      );

      if (data.configured && data.url) {
        // Real Discord OAuth popup
        const width = 500;
        const height = 750;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const authWindow = window.open(
          data.url,
          'discord_oauth_popup',
          `width=${width},height=${height},left=${left},top=${top},status=0,toolbar=0,menubar=0`
        );

        if (!authWindow) {
          alert('Por favor habilita las ventanas emergentes (popups) para iniciar sesión con Discord.');
          setIsLoadingAuth(false);
        }
      } else {
        // OAuth credentials not yet set in .env: Show configuration guide modal
        setIsLoadingAuth(false);
        setShowOAuthModal(true);
      }
    } catch (error) {
      console.error('Error initiating Discord OAuth:', error);
      setIsLoadingAuth(false);
      setShowOAuthModal(true);
    }
  };

  const logout = () => {
    localStorage.removeItem('nexus_discord_user');
    setCurrentUser(GUEST_USER);
  };

  const hasRole = (role: DiscordRole) => {
    return currentUser.roles.includes(role);
  };

  const isAuthenticated = currentUser.id !== 'guest';
  const canModerate = currentUser.canModerate || currentUser.roles.includes('Admin') || currentUser.roles.includes('Moderador');
  const canPostPolls = currentUser.canPostPolls || currentUser.roles.includes('Admin') || currentUser.roles.includes('Moderador');

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        loginWithDiscord,
        logout,
        oauthConfig,
        isLoadingAuth,
        hasRole,
        canModerate,
        canPostPolls,
        showOAuthModal,
        setShowOAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
