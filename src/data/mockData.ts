import { DiscordUser, Poll, FeaturedMember, ConfigPreset, SupportTicket, ServerStats, ModerationLog } from '../types';

export const DEMO_USERS: DiscordUser[] = [
  {
    id: 'user_admin_1',
    username: 'Alex_Admin',
    global_name: 'Alex [Owner]',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bannerColor: '#5865F2',
    roles: ['Admin'],
    joinedAt: '2022-01-15',
    status: 'online',
    customStatus: '👑 Gestionando la comunidad Nexus',
    canModerate: true,
    canPostPolls: true,
    isDemoUser: true,
  },
  {
    id: 'user_mod_2',
    username: 'Elena_Valkyrie',
    global_name: 'Elena (Staff Mod)',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    bannerColor: '#23a55a',
    roles: ['Moderador'],
    joinedAt: '2022-06-10',
    status: 'dnd',
    customStatus: '🛡️ Revisando reportes y configuraciones',
    canModerate: true,
    canPostPolls: true,
    isDemoUser: true,
  },
  {
    id: 'user_booster_3',
    username: 'Kael_Nitro',
    global_name: 'Kael | 18x Booster',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    bannerColor: '#f47fff',
    roles: ['Booster', 'VIP'],
    joinedAt: '2023-02-01',
    status: 'idle',
    customStatus: '✨ Nivel 3 Booster del servidor',
    canModerate: false,
    canPostPolls: false,
    isDemoUser: true,
  },
  {
    id: 'user_member_4',
    username: 'Lucas_Gamer99',
    global_name: 'Lucas G.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bannerColor: '#7289da',
    roles: ['Miembro'],
    joinedAt: '2023-11-20',
    status: 'online',
    customStatus: '🎮 Buscando squad para fin de semana',
    canModerate: false,
    canPostPolls: false,
    isDemoUser: true,
  },
];

export const INITIAL_POLLS: Poll[] = [
  {
    id: 'poll_1',
    title: '¿Qué torneo comunitario prefieres para este fin de semana?',
    description: 'Vota el formato y videojuego principal para el evento del sábado por la noche con premios Nitro y roles exclusivos.',
    category: 'Eventos',
    options: [
      { id: 'opt_1', text: 'Valorant 5v5 (Custom lobby con casteo en vivo)', votes: 248, voterIds: ['user_mod_2', 'user_member_4'] },
      { id: 'opt_2', text: 'Rocket League 2v2 (Eliminatoria directa)', votes: 162, voterIds: [] },
      { id: 'opt_3', text: 'Minecraft Speedrun & Bingo por equipos', votes: 310, voterIds: ['user_admin_1'] },
      { id: 'opt_4', text: 'Noche de Party Games (Gartic, Skribbl, Among Us)', votes: 195, voterIds: ['user_booster_3'] },
    ],
    totalVotes: 915,
    createdAt: '2026-09-01T14:00:00Z',
    endsAt: '2026-09-07T23:59:59Z',
    isClosed: false,
    author: {
      id: 'user_admin_1',
      username: 'Alex_Admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Admin',
    },
  },
  {
    id: 'poll_2',
    title: 'Nuevo bot de música y sonido de alta fidelidad para canales de voz',
    description: 'Estamos evaluando migrar el sistema de audio a un bot dedicado alojado en VPS con soporte para listas compartidas sin cortes.',
    category: 'Actualizaciones',
    options: [
      { id: 'opt_2_1', text: 'Sí, priorizar calidad FLAC/320kbps y cola persistente', votes: 412, voterIds: ['user_admin_1', 'user_booster_3'] },
      { id: 'opt_2_2', text: 'Mantener el sistema actual de bots de Discord oficiales', votes: 78, voterIds: [] },
      { id: 'opt_2_3', text: 'Permitir que los Boosters puedan invitar su propio bot privado', votes: 231, voterIds: ['user_mod_2'] },
    ],
    totalVotes: 721,
    createdAt: '2026-08-28T10:30:00Z',
    endsAt: '2026-09-05T18:00:00Z',
    isClosed: false,
    author: {
      id: 'user_mod_2',
      username: 'Elena_Valkyrie',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      role: 'Moderador',
    },
  },
  {
    id: 'poll_3',
    title: 'Modificación de la norma #4: Enlaces de streaming y autopromoción',
    description: 'Propuesta de la comunidad para crear un canal automatizado #en-vivo que detecte streamers con rol verificado mediante webhook.',
    category: 'Normativa',
    options: [
      { id: 'opt_3_1', text: 'Aprobar canal #en-vivo con webhook automático', votes: 538, voterIds: ['user_admin_1', 'user_booster_3', 'user_member_4'] },
      { id: 'opt_3_2', text: 'Mantener autopromoción solo los domingos en #general', votes: 94, voterIds: [] },
      { id: 'opt_3_3', text: 'Limitar autopromoción únicamente a usuarios con rol VIP/Booster', votes: 142, voterIds: ['user_mod_2'] },
    ],
    totalVotes: 774,
    createdAt: '2026-08-20T12:00:00Z',
    endsAt: '2026-08-27T12:00:00Z',
    isClosed: true,
    author: {
      id: 'user_admin_1',
      username: 'Alex_Admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Admin',
    },
  },
];

export const INITIAL_FEATURED_MEMBERS: FeaturedMember[] = [
  {
    id: 'feat_1',
    discordId: '109823412093849',
    username: 'Valkyrie_Elena',
    handle: '@elena_valk',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    bannerGradient: 'from-purple-900 via-indigo-950 to-slate-900',
    roleTitle: 'Head Moderator & Event Host',
    roleBadgeColor: '#5865F2',
    isStaff: true,
    isBooster: true,
    boostMonths: 14,
    level: 78,
    messageCount: 42190,
    reputation: 980,
    joinDate: 'Junio 2022',
    bio: 'Encargada de mantener el orden y coordinar las noches de torneos y podcast en la comunidad. ¡Siempre disponible en tickets!',
    badges: [
      { name: 'Staff Guardián', icon: 'ShieldCheck', color: '#23a55a' },
      { name: '14x Booster', icon: 'Zap', color: '#f47fff' },
      { name: 'Host del Año', icon: 'Trophy', color: '#f0b232' },
    ],
    favoriteGame: 'Valorant & Helldivers 2',
  },
  {
    id: 'feat_2',
    discordId: '204918239019283',
    username: 'CyberKael',
    handle: '@kael_nitro',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    bannerGradient: 'from-pink-950 via-purple-900 to-slate-950',
    roleTitle: 'Top Server Booster (Nivel 3)',
    roleBadgeColor: '#f47fff',
    isStaff: false,
    isBooster: true,
    boostMonths: 22,
    level: 65,
    messageCount: 31400,
    reputation: 840,
    joinDate: 'Febrero 2023',
    bio: 'Fanático de la optimización de hardware, audio digital y bots de automatización. Autor de los presets de audio para streaming.',
    badges: [
      { name: 'Legendary Booster', icon: 'Flame', color: '#f47fff' },
      { name: 'Donador MVP', icon: 'Sparkles', color: '#f0b232' },
      { name: 'Config Crafter', icon: 'Cpu', color: '#00b0f4' },
    ],
    favoriteGame: 'Cyberpunk 2077 & SimRacing',
  },
  {
    id: 'feat_3',
    discordId: '394827104928172',
    username: 'Sora_Dev',
    handle: '@sora_codes',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bannerGradient: 'from-emerald-950 via-teal-950 to-slate-900',
    roleTitle: 'Creador de Bots & Web Developer',
    roleBadgeColor: '#23a55a',
    isStaff: true,
    isBooster: false,
    level: 82,
    messageCount: 54100,
    reputation: 1250,
    joinDate: 'Enero 2022',
    bio: 'Desarrollador de los bots personalizados de Nexus (NexusBot, NexusTickets). Si encuentras un bug, abre un ticket técnico.',
    badges: [
      { name: 'Bot Architect', icon: 'Code', color: '#23a55a' },
      { name: 'Bug Hunter Pro', icon: 'Search', color: '#5865F2' },
      { name: 'Veterano Nexus', icon: 'Award', color: '#f0b232' },
    ],
    favoriteGame: 'Factorio & Rust',
  },
  {
    id: 'feat_4',
    discordId: '495817203948172',
    username: 'Luna_Aesthetic',
    handle: '@luna_stream',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bannerGradient: 'from-blue-950 via-indigo-900 to-slate-950',
    roleTitle: 'Content Creator & Diseñadora',
    roleBadgeColor: '#00b0f4',
    isStaff: false,
    isBooster: true,
    boostMonths: 8,
    level: 52,
    messageCount: 26800,
    reputation: 720,
    joinDate: 'Octubre 2023',
    bio: 'Diseño de overlays de OBS, banners de servidor y organizadora del concurso de capturas y clips del mes.',
    badges: [
      { name: 'Streamer Afiliada', icon: 'Tv', color: '#9146ff' },
      { name: 'Artista de la Comunidad', icon: 'Palette', color: '#f47fff' },
    ],
    favoriteGame: 'Overwatch 2 & Genshin Impact',
  },
];

export const INITIAL_CONFIG_PRESETS: ConfigPreset[] = [
  {
    id: 'cfg_1',
    title: 'OBS Studio - Cadena de Filtros de Micrófono Pro (RNNoise + Compresor)',
    description: 'Preset optimizado para micrófono en OBS Studio. Elimina ruido de teclado mecánico, eco de sala y nivela el volumen de voz con ecualización de 3 bandas.',
    category: 'Audio & Filtros',
    fileName: 'obs_mic_nexus_filters_v2.json',
    fileSize: '4.8 KB',
    fileExtension: 'json',
    fileContent: JSON.stringify(
      {
        version: "2.4",
        name: "Nexus Voice Filter Stack",
        filters: [
          { type: "noise_suppression", method: "rnnoise", active: true },
          { type: "compressor", ratio: 4.0, threshold: -18.0, attack: 6, release: 60, output_gain: 3.5 },
          { type: "limiter", threshold: -1.5, release: 60 },
          { type: "eq_3band", high_gain: 1.2, mid_gain: -0.5, low_gain: 0.8 }
        ]
      },
      null,
      2
    ),
    author: {
      id: 'user_booster_3',
      username: 'Kael_Nitro',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      role: 'Booster',
    },
    downloads: 1420,
    likes: 312,
    dislikes: 4,
    status: 'approved',
    createdAt: '2026-08-15T12:00:00Z',
    tags: ['OBS', 'Microfono', 'Filtros', 'Streaming', 'SinRuido'],
    version: '2.4.0',
    compatibilityNote: 'Compatible con OBS Studio v29+',
  },
  {
    id: 'cfg_2',
    title: 'Carl-bot - Configuración Completa de Auto-Roles y Bienvenida',
    description: 'Exportación de configuración limpia para Carl-bot con menú de selección de roles por botón o reacción (Juegos, Género, Notificaciones, Región).',
    category: 'Bot & Automatización',
    fileName: 'carlbot_autoroles_nexus_template.json',
    fileSize: '12.3 KB',
    fileExtension: 'json',
    fileContent: JSON.stringify(
      {
        bot: "Carl-bot",
        module: "reaction_roles",
        categories: [
          {
            name: "Juegos Favoritos",
            mode: "multi",
            roles: ["Valorant", "League of Legends", "Minecraft", "Fortnite", "Counter-Strike 2"]
          },
          {
            name: "Alertas y Pings",
            mode: "toggle",
            roles: ["Noticias Nexus", "Torneos", "Sorteos", "Streams en Vivo"]
          }
        ],
        welcome_embed: {
          title: "¡Bienvenido a Nexus Community! 🚀",
          color: 5793266,
          footer: "Lee las reglas en #normativa antes de chatear"
        }
      },
      null,
      2
    ),
    author: {
      id: 'user_admin_1',
      username: 'Alex_Admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Admin',
    },
    downloads: 2180,
    likes: 540,
    dislikes: 7,
    status: 'approved',
    createdAt: '2026-07-20T16:20:00Z',
    tags: ['Carlbot', 'AutoRoles', 'Embeds', 'Moderacion', 'DiscordBot'],
    version: '1.2',
    compatibilityNote: 'Importable directo en panel carl.gg',
  },
  {
    id: 'cfg_3',
    title: 'Elgato Stream Deck - Perfil Dedicado para Discord & Moderación',
    description: 'Perfil completo con 15 botones asignados para mute rápido, deafen, cambio de canal de voz, silenciar participantes problemáticos y control de sonido.',
    category: 'Stream Deck',
    fileName: 'streamdeck_discord_mod_pack.json',
    fileSize: '8.1 KB',
    fileExtension: 'json',
    fileContent: JSON.stringify(
      {
        profile: "Nexus Discord Controller",
        device: "Stream Deck 15-keys",
        actions: [
          { key: 1, action: "Toggle Mute", hotkey: "Ctrl+Shift+M" },
          { key: 2, action: "Toggle Deafen", hotkey: "Ctrl+Shift+D" },
          { key: 3, action: "Push to Talk (Override)", hotkey: "Mouse5" },
          { key: 4, action: "Join Lobby Voice #1", webhook: "discord://voice/1098234" },
          { key: 5, action: "Panic Clear Chat (Mod Only)", macro: "/clean 50" }
        ]
      },
      null,
      2
    ),
    author: {
      id: 'user_mod_2',
      username: 'Elena_Valkyrie',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      role: 'Moderador',
    },
    downloads: 890,
    likes: 195,
    dislikes: 2,
    status: 'approved',
    createdAt: '2026-08-02T09:15:00Z',
    tags: ['StreamDeck', 'Elgato', 'Hotkeys', 'VoiceControl'],
    version: '3.0',
    compatibilityNote: 'Software Stream Deck v6.4+',
  },
  {
    id: 'cfg_4',
    title: 'Ticket Tool v2 - Plantilla de Embeds y Formulario de Soporte',
    description: 'Configuración para Ticket Tool con botones interactivos categorizados (Soporte Técnico, Reporte de Usuario, Postulación Staff) y respuestas automáticas.',
    category: 'Bot & Automatización',
    fileName: 'ticket_tool_v2_nexus_preset.yaml',
    fileSize: '3.4 KB',
    fileExtension: 'yaml',
    fileContent: `ticket_system:
  enabled: true
  channel: "#abrir-ticket"
  panel_embed:
    title: "Centro de Asistencia de Nexus"
    description: "Selecciona el departamento adecuado para abrir tu ticket privado."
    color: "#5865F2"
  categories:
    - name: "Dudas y Soporte"
      emoji: "❓"
      roles_allowed: ["@Staff", "@Helper"]
    - name: "Reportes"
      emoji: "🚨"
      roles_allowed: ["@Moderador", "@Admin"]`,
    author: {
      id: 'user_admin_1',
      username: 'Alex_Admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Admin',
    },
    downloads: 1120,
    likes: 278,
    dislikes: 3,
    status: 'approved',
    createdAt: '2026-08-11T18:00:00Z',
    tags: ['Tickets', 'TicketTool', 'Embeds', 'Soporte'],
    version: '2.1',
  },
  {
    id: 'cfg_5',
    title: 'Vencord / BetterDiscord - Tema Visual "Nexus Cyber-Dark"',
    description: 'Tema CSS minimalista y moderno para clientes modificados de Discord con paleta oscura, bordes redondeados y efectos de resplandor en roles.',
    category: 'Mod & Texturas',
    fileName: 'nexus_cyber_dark.theme.css',
    fileSize: '15.9 KB',
    fileExtension: 'css',
    fileContent: `:root {
  --theme-name: "Nexus Cyber Dark";
  --accent-color: #5865F2;
  --bg-primary: #0e1017;
  --bg-secondary: #161822;
  --card-radius: 12px;
  --glow-intensity: 0 0 12px rgba(88, 101, 242, 0.35);
}
.sidebar-2KPFZ- {
  background-color: var(--bg-secondary) !important;
}`,
    author: {
      id: 'user_member_4',
      username: 'Lucas_Gamer99',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'Miembro',
    },
    downloads: 650,
    likes: 122,
    dislikes: 5,
    status: 'pending', // Pending for moderation demo!
    createdAt: '2026-09-03T11:45:00Z',
    tags: ['CSS', 'Vencord', 'BetterDiscord', 'Theme'],
    version: '1.0.0',
    compatibilityNote: 'Requiere Vencord o BetterDiscord',
  },
];

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'tkt_101',
    ticketNumber: 1042,
    title: 'No he recibido mi rol de Server Booster tras reactivar suscripción Nitro',
    category: 'Problema de Roles/Permisos',
    priority: 'Media',
    status: 'En Progreso',
    author: {
      id: 'user_booster_3',
      username: 'Kael_Nitro',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    },
    assignedTo: {
      id: 'user_mod_2',
      username: 'Elena_Valkyrie',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    },
    messages: [
      {
        id: 'msg_1',
        senderId: 'user_booster_3',
        senderName: 'Kael_Nitro',
        senderAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        isStaff: false,
        role: 'Booster',
        content: 'Hola equipo de Staff, ayer renové mi impulso Nitro en el servidor y aún sigo sin el rol rosa ni los permisos para el canal VIP.',
        timestamp: '2026-09-04T18:10:00Z',
      },
      {
        id: 'msg_2',
        senderId: 'user_mod_2',
        senderName: 'Elena_Valkyrie',
        senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        isStaff: true,
        role: 'Moderador',
        content: '¡Hola Kael! He revisado el log de auditoría del servidor. Discord tuvo un retraso con la API de facturación. Ya sincronicé tus permisos y restauré tu insignia de 18 meses. Por favor confirma si ya ves el canal VIP.',
        timestamp: '2026-09-04T18:32:00Z',
      },
    ],
    createdAt: '2026-09-04T18:10:00Z',
    updatedAt: '2026-09-04T18:32:00Z',
  },
  {
    id: 'tkt_102',
    ticketNumber: 1041,
    title: 'Reporte de spam con enlaces fraudulentos en canal #general',
    category: 'Reporte de Usuario',
    priority: 'Alta',
    status: 'Resuelto',
    author: {
      id: 'user_member_4',
      username: 'Lucas_Gamer99',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    assignedTo: {
      id: 'user_admin_1',
      username: 'Alex_Admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    messages: [
      {
        id: 'msg_3',
        senderId: 'user_member_4',
        senderName: 'Lucas_Gamer99',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        isStaff: false,
        role: 'Miembro',
        content: 'Había una cuenta comprometida enviando enlaces de "Steam Nitro Gratis". Tomé captura antes de que eliminara.',
        timestamp: '2026-09-03T15:20:00Z',
      },
      {
        id: 'msg_4',
        senderId: 'user_admin_1',
        senderName: 'Alex_Admin',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        isStaff: true,
        role: 'Admin',
        content: 'Usuario baneado inmediatamente y enlace añadido a la lista negra del AutoMod. ¡Gracias por el reporte rápido!',
        timestamp: '2026-09-03T15:25:00Z',
      },
    ],
    createdAt: '2026-09-03T15:20:00Z',
    updatedAt: '2026-09-03T15:25:00Z',
  },
];

export const INITIAL_SERVER_STATS: ServerStats = {
  totalMembers: 14892,
  onlineMembers: 3418,
  voiceActive: 412,
  serverBoosts: 36,
  boostTier: 3,
  messageVelocity: 148, // msgs / min
  growthRatePercent: 12.4,
  pingMs: 24,
  channelActivity: [
    { channel: '💬 ｜ general-chat', type: 'text', activeCount: 620, messagesToday: 8420 },
    { channel: '🎮 ｜ buscar-grupo', type: 'text', activeCount: 310, messagesToday: 3190 },
    { channel: '🔊 ｜ Sala de Voz Principal', type: 'voice', activeCount: 28, messagesToday: 0 },
    { channel: '🔊 ｜ Squad Alpha (Valorant)', type: 'voice', activeCount: 5, messagesToday: 0 },
    { channel: '🔊 ｜ Podcast / Stage en Vivo', type: 'voice', activeCount: 142, messagesToday: 0 },
    { channel: '💻 ｜ programacion-devs', type: 'text', activeCount: 190, messagesToday: 1840 },
    { channel: '🎨 ｜ capturas-y-clips', type: 'text', activeCount: 240, messagesToday: 950 },
  ],
  growthHistory: [
    { date: 'Lun', members: 14320, online: 3100, messages: 18400, voice: 360 },
    { date: 'Mar', members: 14450, online: 3210, messages: 19800, voice: 380 },
    { date: 'Mié', members: 14590, online: 3290, messages: 21400, voice: 405 },
    { date: 'Jue', members: 14710, online: 3340, messages: 23100, voice: 420 },
    { date: 'Vie', members: 14820, online: 3650, messages: 29800, voice: 510 },
    { date: 'Sáb', members: 14870, online: 3890, messages: 34200, voice: 590 },
    { date: 'Hoy', members: 14892, online: 3418, messages: 26500, voice: 412 },
  ],
  rolesDistribution: [
    { name: 'Miembros Verificados', count: 12450, color: '#5865F2' },
    { name: 'Server Boosters', count: 36, color: '#f47fff' },
    { name: 'VIP & Donadores', count: 184, color: '#f0b232' },
    { name: 'Creadores de Contenido', count: 42, color: '#9146ff' },
    { name: 'Staff & Moderadores', count: 18, color: '#23a55a' },
  ],
};

export const INITIAL_MODERATION_LOGS: ModerationLog[] = [
  {
    id: 'log_1',
    action: 'CONFIG_APPROVED',
    moderator: {
      username: 'Elena_Valkyrie',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      role: 'Moderador',
    },
    targetName: 'OBS Studio - Filtros de Micrófono Pro',
    details: 'Aprobado tras verificar sintaxis JSON y seguridad del contenido.',
    timestamp: '2026-09-04T12:30:00Z',
  },
  {
    id: 'log_2',
    action: 'TICKET_STATUS',
    moderator: {
      username: 'Alex_Admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Admin',
    },
    targetName: 'Ticket #1041 (Reporte de Spam)',
    details: 'Marcado como Resuelto tras baneo del infractor.',
    timestamp: '2026-09-03T15:25:00Z',
  },
  {
    id: 'log_3',
    action: 'POLL_CREATED',
    moderator: {
      username: 'Alex_Admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Admin',
    },
    targetName: 'Torneo comunitario de fin de semana',
    details: 'Publicada votación en categoría Eventos con 4 opciones.',
    timestamp: '2026-09-01T14:00:00Z',
  },
];
