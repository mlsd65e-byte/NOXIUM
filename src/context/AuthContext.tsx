import React, { createContext, useContext, useState, useEffect } from 'react';
import { DiscordUser, DiscordRole } from '../types';
import { DEMO_USERS } from '../data/mockData';
import { safeFetchJson } from '../utils/apiClient';

interface OAuthConfig {
  configured: boolean;
  clientId: string | null;
  redirectUri: string;
  appUrl: string;
}

interface AuthContextType {
  currentUser: DiscordUser;
  demoUsers: DiscordUser[];
  switchUser: (userId: string) => void;
  loginWithDiscord: () => Promise<void>;
  logout: () => void;
  oauthConfig: OAuthConfig | null;
  isLoadingAuth: boolean;
  hasRole: (role: DiscordRole) => boolean;
  canModerate: boolean;
  canPostPolls: boolean;
  showDemoModal: boolean;
  setShowDemoModal: (show: boolean) => void;
  showOAuthModal: boolean;
  setShowOAuthModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Alex (Admin) so the user can immediately experience all features including the Admin Panel
  const [currentUser, setCurrentUser] = useState<DiscordUser>(() => {
    const saved = localStorage.getItem('nexus_discord_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEMO_USERS[0]; // Admin by default
  });

  const [oauthConfig, setOauthConfig] = useState<OAuthConfig | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showOAuthModal, setShowOAuthModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('nexus_discord_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // Fetch OAuth config from server
  useEffect(() => {
    const fallbackConfig: OAuthConfig = {
      configured: false,
      clientId: null,
      redirectUri: `${window.location.origin}/api/auth/discord/callback`,
      appUrl: window.location.origin,
    };

    safeFetchJson<OAuthConfig>('/api/auth/discord/config', undefined, fallbackConfig)
      .then(data => setOauthConfig(data))
      .catch(() => setOauthConfig(fallbackConfig));
  }, []);

  // Listen for Discord OAuth popup success message
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin if needed
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data?.user) {
        setCurrentUser(event.data.user);
        setIsLoadingAuth(false);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const switchUser = (userId: string) => {
    const found = DEMO_USERS.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const loginWithDiscord = async () => {
    setIsLoadingAuth(true);
    try {
      const data = await safeFetchJson<{ configured: boolean; url: string | null }>(
        '/api/auth/discord/url',
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
    // Reset to demo member
    setCurrentUser(DEMO_USERS[3]);
  };

  const hasRole = (role: DiscordRole) => {
    return currentUser.roles.includes(role);
  };

  const canModerate = currentUser.canModerate || currentUser.roles.includes('Admin') || currentUser.roles.includes('Moderador');
  const canPostPolls = currentUser.canPostPolls || currentUser.roles.includes('Admin') || currentUser.roles.includes('Moderador');

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        demoUsers: DEMO_USERS,
        switchUser,
        loginWithDiscord,
        logout,
        oauthConfig,
        isLoadingAuth,
        hasRole,
        canModerate,
        canPostPolls,
        showDemoModal,
        setShowDemoModal,
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
