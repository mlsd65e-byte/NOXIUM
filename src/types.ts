export type DiscordRole = 'Admin' | 'Moderador' | 'Booster' | 'VIP' | 'Miembro';

export interface DiscordUser {
  id: string;
  username: string;
  discriminator?: string;
  global_name?: string;
  avatar: string;
  bannerColor?: string;
  roles: DiscordRole[];
  joinedAt: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  customStatus?: string;
  canModerate: boolean;
  canPostPolls: boolean;
  guilds?: {
    id: string;
    name: string;
    icon: string | null;
    iconUrl?: string;
    isOwner: boolean;
    isAdmin: boolean;
    permissions: string;
  }[];
}

export interface DiscordGuildChannel {
  id: string;
  name: string;
  type: number; // 0 = text, 2 = voice, 4 = category, 5 = announcement, 13 = stage
  position?: number;
  parent_id?: string | null;
}

export interface DiscordGuildRole {
  id: string;
  name: string;
  color: number;
  hexColor: string;
  position: number;
  permissions?: string;
  membersCount?: number;
}

export interface DiscordGuildMember {
  id: string;
  username: string;
  global_name?: string;
  nickname?: string | null;
  avatar: string;
  roles: string[];
  joinedAt: string;
  isBot?: boolean;
  status?: 'online' | 'idle' | 'dnd' | 'offline';
  game?: string;
}

export interface DiscordGuildData {
  id: string;
  name: string;
  icon: string | null;
  iconUrl: string;
  description: string | null;
  splash: string | null;
  banner: string | null;
  memberCount: number;
  onlineCount: number;
  voiceActiveCount: number;
  boostTier: number;
  boostCount: number;
  ownerId?: string;
  isOwner?: boolean;
  isRealData: boolean;
  source: 'discord_bot_api' | 'discord_widget' | 'oauth_user' | 'mock';
  instantInvite?: string | null;
  channels: DiscordGuildChannel[];
  roles: DiscordGuildRole[];
  members: DiscordGuildMember[];
  emojis: { id: string; name: string; animated?: boolean; url: string }[];
  lastSyncedAt?: string;
  syncError?: string | null;
  botStatus?: 'connected' | 'not_in_server' | 'unauthorized' | 'not_configured';
  botInviteUrl?: string | null;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  voterIds: string[];
}

export interface Poll {
  id: string;
  title: string;
  description: string;
  category: 'Comunidad' | 'Eventos' | 'Actualizaciones' | 'Juegos' | 'Normativa';
  options: PollOption[];
  totalVotes: number;
  createdAt: string;
  endsAt: string;
  isClosed: boolean;
  allowMultiple?: boolean;
  author: {
    id: string;
    username: string;
    avatar: string;
    role: DiscordRole;
  };
}

export interface FeaturedMember {
  id: string;
  discordId: string;
  username: string;
  handle: string;
  avatar: string;
  bannerGradient: string;
  roleTitle: string;
  roleBadgeColor: string;
  isStaff: boolean;
  isBooster: boolean;
  boostMonths?: number;
  level: number;
  messageCount: number;
  reputation: number;
  joinDate: string;
  bio: string;
  badges: { name: string; icon: string; color: string }[];
  favoriteGame?: string;
}

export type ConfigCategory =
  | 'Bot & Automatización'
  | 'OBS & Streaming'
  | 'Stream Deck'
  | 'Audio & Filtros'
  | 'Macros & Keybinds'
  | 'Canales & Permisos'
  | 'Mod & Texturas';

export interface ConfigPreset {
  id: string;
  title: string;
  description: string;
  category: ConfigCategory;
  fileName: string;
  fileSize: string;
  fileContent: string;
  fileExtension: string;
  author: {
    id: string;
    username: string;
    avatar: string;
    role: DiscordRole;
  };
  downloads: number;
  likes: number;
  dislikes: number;
  userVote?: 'like' | 'dislike';
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  tags: string[];
  version: string;
  compatibilityNote?: string;
}

export type TicketCategory =
  | 'Dudas & Soporte General'
  | 'Reporte de Usuario'
  | 'Problema de Roles/Permisos'
  | 'Sugerencia del Servidor'
  | 'Apelación de Sanción';

export type TicketPriority = 'Baja' | 'Media' | 'Alta' | 'Urgente';
export type TicketStatus = 'Abierto' | 'En Progreso' | 'Resuelto' | 'Cerrado';

export interface TicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  isStaff: boolean;
  role: DiscordRole;
  content: string;
  timestamp: string;
  attachmentName?: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: number;
  title: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  author: {
    id: string;
    username: string;
    avatar: string;
  };
  assignedTo?: {
    id: string;
    username: string;
    avatar: string;
  };
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ServerStats {
  totalMembers: number;
  onlineMembers: number;
  voiceActive: number;
  serverBoosts: number;
  boostTier: number;
  messageVelocity: number; // mensajes por minuto
  growthRatePercent: number;
  pingMs: number;
  channelActivity: {
    channel: string;
    type: 'voice' | 'text';
    activeCount: number;
    messagesToday: number;
  }[];
  growthHistory: {
    date: string;
    members: number;
    online: number;
    messages: number;
    voice: number;
  }[];
  rolesDistribution: {
    name: string;
    count: number;
    color: string;
  }[];
}

export interface ModerationLog {
  id: string;
  action: 'CONFIG_APPROVED' | 'CONFIG_REJECTED' | 'CONFIG_DELETED' | 'TICKET_STATUS' | 'POLL_CREATED' | 'MEMBER_FEATURED';
  moderator: {
    username: string;
    avatar: string;
    role: DiscordRole;
  };
  targetName: string;
  details: string;
  timestamp: string;
}
