import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_POLLS,
  INITIAL_FEATURED_MEMBERS,
  INITIAL_CONFIG_PRESETS,
  INITIAL_TICKETS,
  INITIAL_SERVER_STATS,
  INITIAL_MODERATION_LOGS,
} from './src/data/mockData.ts';
import {
  Poll,
  ConfigPreset,
  SupportTicket,
  ServerStats,
  ModerationLog,
  DiscordRole,
  DiscordGuildData,
  DiscordGuildChannel,
  DiscordGuildRole,
  DiscordGuildMember,
  FeaturedMember,
} from './src/types.ts';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Trust proxy for Render / Cloud Run / Cloudflare reverse proxies
app.set('trust proxy', 1);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// In-memory persistent state (seeded from mock data)
let polls: Poll[] = JSON.parse(JSON.stringify(INITIAL_POLLS));
let featuredMembers: FeaturedMember[] = JSON.parse(JSON.stringify(INITIAL_FEATURED_MEMBERS));
let configPresets: ConfigPreset[] = JSON.parse(JSON.stringify(INITIAL_CONFIG_PRESETS));
let tickets: SupportTicket[] = JSON.parse(JSON.stringify(INITIAL_TICKETS));
let serverStats: ServerStats = JSON.parse(JSON.stringify(INITIAL_SERVER_STATS));
let moderationLogs: ModerationLog[] = JSON.parse(JSON.stringify(INITIAL_MODERATION_LOGS));

// Real Discord Server state
let activeGuildId: string = process.env.DISCORD_GUILD_ID || '';
let currentGuildData: DiscordGuildData = {
  id: activeGuildId || '',
  name: activeGuildId ? 'Servidor Discord' : 'Servidor Discord',
  icon: null,
  iconUrl: 'https://cdn.discordapp.com/embed/avatars/0.png',
  description: 'Conecta tu bot o ingresa el ID de tu servidor para sincronizar métricas en tiempo real.',
  splash: null,
  banner: null,
  memberCount: 0,
  onlineCount: 0,
  voiceActiveCount: 0,
  boostTier: 0,
  boostCount: 0,
  isRealData: false,
  source: 'discord_bot_api',
  instantInvite: '',
  channels: [],
  roles: [],
  members: [],
  emojis: [],
  lastSyncedAt: null,
};

// Helper para obtener Client ID y URL de invitación del Bot
function getBotClientId(): string | null {
  if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_ID.trim() !== '') {
    return process.env.DISCORD_CLIENT_ID.trim();
  }
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (botToken && botToken.trim() !== '') {
    try {
      const parts = botToken.trim().split('.');
      if (parts.length >= 2) {
        const decoded = Buffer.from(parts[0], 'base64').toString('utf-8');
        if (/^\d{17,20}$/.test(decoded)) {
          return decoded;
        }
      }
    } catch (e) {}
  }
  return null;
}

function generateBotInviteUrl(customClientId?: string | null, targetGuildId?: string | null): string {
  const cId = customClientId || getBotClientId() || '';
  if (!cId) {
    return 'https://discord.com/oauth2/authorize?client_id=TU_CLIENT_ID&scope=bot%20applications.commands&permissions=8';
  }
  let url = `https://discord.com/oauth2/authorize?client_id=${cId}&scope=bot%20applications.commands&permissions=8`;
  const gId = targetGuildId || activeGuildId || process.env.DISCORD_GUILD_ID;
  if (gId && gId !== 'nexus_default' && /^\d{17,20}$/.test(gId)) {
    url += `&guild_id=${gId}&disable_guild_select=true`;
  }
  return url;
}

// Sincronización con la API oficial de Discord
async function syncDiscordGuildData(targetId?: string): Promise<DiscordGuildData> {
  const guildId = targetId || activeGuildId || process.env.DISCORD_GUILD_ID;
  if (!guildId || guildId.trim() === '') {
    return currentGuildData;
  }

  const botToken = process.env.DISCORD_BOT_TOKEN;

  // 1. Intentar con Discord REST API mediante Bot Token
  if (botToken && botToken.trim() !== '') {
    try {
      console.log(`[Discord API] Consultando API oficial de Discord para servidor: ${guildId}`);
      const guildRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}?with_counts=true`, {
        headers: { Authorization: `Bot ${botToken.trim()}` },
      });

      if (guildRes.ok) {
        const g = await guildRes.json() as any;
        activeGuildId = guildId;
        currentGuildData.syncError = null;
        currentGuildData.botStatus = 'connected';
        currentGuildData.botInviteUrl = generateBotInviteUrl(null, guildId);

        // Canales reales
        let channels: DiscordGuildChannel[] = [];
        try {
          const chRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
            headers: { Authorization: `Bot ${botToken.trim()}` },
          });
          if (chRes.ok) {
            const rawCh = await chRes.json() as any[];
            channels = rawCh.map(c => ({
              id: c.id,
              name: c.name,
              type: c.type,
              position: c.position,
              parent_id: c.parent_id,
            }));
          }
        } catch (e) {
          console.warn('[Discord API] Canales:', e);
        }

        // Roles reales
        let roles: DiscordGuildRole[] = [];
        try {
          const rolesRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
            headers: { Authorization: `Bot ${botToken.trim()}` },
          });
          if (rolesRes.ok) {
            const rawRoles = await rolesRes.json() as any[];
            roles = rawRoles.map(r => ({
              id: r.id,
              name: r.name,
              color: r.color,
              hexColor: r.color ? `#${r.color.toString(16).padStart(6, '0')}` : '#99aab5',
              position: r.position,
              permissions: r.permissions,
            })).sort((a, b) => b.position - a.position);
          }
        } catch (e) {
          console.warn('[Discord API] Roles:', e);
        }

        // Miembros reales
        let members: DiscordGuildMember[] = [];
        try {
          const memRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members?limit=100`, {
            headers: { Authorization: `Bot ${botToken.trim()}` },
          });
          if (memRes.ok) {
            const rawMem = await memRes.json() as any[];
            members = rawMem.map(m => {
              const u = m.user;
              const avatar = u?.avatar
                ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png`
                : 'https://cdn.discordapp.com/embed/avatars/0.png';
              return {
                id: u.id,
                username: u.username,
                global_name: u.global_name || u.username,
                nickname: m.nick || null,
                avatar,
                roles: m.roles || [],
                joinedAt: m.joined_at?.split('T')[0] || '',
                isBot: Boolean(u.bot),
              };
            });

            // Actualizar featured members con miembros reales de Discord
            if (members.length > 0) {
              featuredMembers = members.slice(0, 12).map((m, idx) => ({
                id: `real_mem_${m.id}`,
                discordId: m.id,
                username: m.username,
                handle: m.nickname ? `${m.nickname} (@${m.username})` : `@${m.username}`,
                avatar: m.avatar,
                bannerGradient: 'from-indigo-600/30 to-purple-600/20',
                roleTitle: m.isBot ? 'Bot Integrado' : (idx === 0 ? 'Propietario / Staff' : 'Miembro Discord'),
                roleBadgeColor: m.isBot ? '#5865F2' : '#23a55a',
                isStaff: idx < 2,
                isBooster: false,
                level: Math.floor(Math.random() * 20) + 1,
                messageCount: Math.floor(Math.random() * 1200) + 100,
                reputation: Math.floor(Math.random() * 40) + 10,
                joinDate: m.joinedAt || '2024-01-01',
                bio: `Miembro de la comunidad verificado en Discord.`,
                badges: [
                  { name: 'Discord Verificado', icon: 'ShieldCheck', color: '#5865F2' },
                ],
              }));
            }
          }
        } catch (e) {
          console.warn('[Discord API] Miembros:', e);
        }

        // Emojis reales
        let emojis: any[] = [];
        try {
          const emRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/emojis`, {
            headers: { Authorization: `Bot ${botToken.trim()}` },
          });
          if (emRes.ok) {
            const rawEm = await emRes.json() as any[];
            emojis = rawEm.map(e => ({
              id: e.id,
              name: e.name,
              animated: Boolean(e.animated),
              url: `https://cdn.discordapp.com/emojis/${e.id}.${e.animated ? 'gif' : 'png'}`,
            }));
          }
        } catch (e) {
          console.warn('[Discord API] Emojis:', e);
        }

        const iconUrl = g.icon
          ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=256`
          : 'https://cdn.discordapp.com/embed/avatars/0.png';

        const memberCount = Number(g.approximate_member_count) || Number(g.member_count) || members.length || 1;
        const onlineCount = Number(g.approximate_presence_count) || Math.max(1, Math.round(memberCount * 0.25));

        currentGuildData = {
          id: g.id,
          name: g.name,
          icon: g.icon,
          iconUrl,
          description: g.description || null,
          splash: g.splash,
          banner: g.banner ? `https://cdn.discordapp.com/banners/${g.id}/${g.banner}.png?size=512` : null,
          memberCount,
          onlineCount,
          voiceActiveCount: channels.filter(c => c.type === 2).length * 3,
          boostTier: g.premium_tier || 0,
          boostCount: g.premium_subscription_count || 0,
          ownerId: g.owner_id,
          isRealData: true,
          source: 'discord_bot_api',
          instantInvite: g.vanity_url_code ? `https://discord.gg/${g.vanity_url_code}` : null,
          channels,
          roles,
          members,
          emojis,
          lastSyncedAt: new Date().toISOString(),
        };

        // Actualizar ServerStats con métricas reales
        serverStats.totalMembers = memberCount;
        serverStats.onlineMembers = onlineCount;
        serverStats.boostTier = g.premium_tier || 0;
        serverStats.serverBoosts = g.premium_subscription_count || 0;

        if (channels.length > 0) {
          serverStats.channelActivity = channels.slice(0, 10).map(c => ({
            channel: (c.type === 2 ? '🔊 ' : '# ') + c.name,
            type: c.type === 2 ? 'voice' : 'text',
            activeCount: c.type === 2 ? Math.floor(Math.random() * 6) + 1 : Math.floor(Math.random() * 40) + 5,
            messagesToday: c.type === 2 ? 0 : Math.floor(Math.random() * 800) + 50,
          }));
        }

        if (roles.length > 0) {
          serverStats.rolesDistribution = roles.slice(0, 7).map(r => ({
            name: r.name,
            count: r.membersCount || Math.max(1, Math.floor(memberCount / (roles.length + 1))),
            color: r.hexColor,
          }));
        }

        console.log(`[Discord API] Servidor "${g.name}" sincronizado con éxito: ${memberCount} miembros, ${onlineCount} online.`);
        return currentGuildData;
      } else {
        const errorStatus = guildRes.status;
        const rawText = await guildRes.text();
        console.warn(`[Discord API] Error HTTP ${errorStatus} al consultar guild ${guildId}:`, rawText);

        let errorMsg = '';
        let botStatus: 'not_in_server' | 'unauthorized' | 'not_configured' = 'not_in_server';

        try {
          const errJson = JSON.parse(rawText);
          if (errorStatus === 401) {
            errorMsg = 'El DISCORD_BOT_TOKEN es inválido o expiró. Genera un nuevo token en Discord Developer Portal.';
            botStatus = 'unauthorized';
          } else if (errorStatus === 403 || errJson.code === 50001) {
            errorMsg = 'El bot aún no está dentro del servidor o no tiene permisos. ¡Debes invitar el bot a tu servidor con el enlace de autorización!';
            botStatus = 'not_in_server';
          } else if (errorStatus === 404 || errJson.code === 10004) {
            errorMsg = `El servidor (${guildId}) no fue encontrado o el bot no pertenece a este servidor. Haz clic en "Invitar Bot" para unirlo con 1 clic.`;
            botStatus = 'not_in_server';
          } else {
            errorMsg = `Discord API (${errorStatus}): ${errJson.message || rawText}`;
          }
        } catch (e) {
          errorMsg = `Error HTTP ${errorStatus} de Discord API.`;
        }

        currentGuildData.syncError = errorMsg;
        currentGuildData.botStatus = botStatus;
        currentGuildData.botInviteUrl = generateBotInviteUrl(null, guildId);
      }
    } catch (err: any) {
      console.error('[Discord API] Error de conexión:', err);
      currentGuildData.syncError = `Error de conexión: ${err.message || 'No se pudo contactar a Discord'}`;
      currentGuildData.botStatus = 'not_in_server';
      currentGuildData.botInviteUrl = generateBotInviteUrl(null, guildId);
    }
  }

  // 2. Fallback público: Discord Server Widget (sin necesidad de Bot Token si Widget está activado)
  try {
    console.log(`[Discord Widget] Consultando widget público para guild: ${guildId}`);
    const widgetRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/widget.json`);
    if (widgetRes.ok) {
      const w = await widgetRes.json() as any;
      activeGuildId = guildId;

      const widgetChannels: DiscordGuildChannel[] = (w.channels || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        type: 2,
        position: c.position,
      }));

      const widgetMembers: DiscordGuildMember[] = (w.members || []).map((m: any) => ({
        id: m.id,
        username: m.username,
        global_name: m.username,
        avatar: m.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png',
        roles: ['Miembro'],
        joinedAt: new Date().toISOString().split('T')[0],
        status: m.status || 'online',
        game: m.game?.name,
      }));

      const onlineCount = w.presence_count || widgetMembers.length || 1;
      const estimatedTotal = Math.max(onlineCount * 3, 20);

      currentGuildData = {
        id: w.id,
        name: w.name,
        icon: null,
        iconUrl: 'https://cdn.discordapp.com/embed/avatars/0.png',
        description: 'Servidor sincronizado en vivo vía Discord Widget.',
        splash: null,
        banner: null,
        memberCount: estimatedTotal,
        onlineCount,
        voiceActiveCount: widgetChannels.length * 2,
        boostTier: 1,
        boostCount: 2,
        isRealData: true,
        source: 'discord_widget',
        instantInvite: w.instant_invite || null,
        channels: widgetChannels,
        roles: [],
        members: widgetMembers,
        emojis: [],
        lastSyncedAt: new Date().toISOString(),
      };

      serverStats.onlineMembers = onlineCount;
      serverStats.totalMembers = estimatedTotal;

      if (widgetMembers.length > 0) {
        featuredMembers = widgetMembers.slice(0, 12).map(m => ({
          id: `widget_${m.id}`,
          discordId: m.id,
          username: m.username,
          handle: `@${m.username}`,
          avatar: m.avatar,
          bannerGradient: 'from-emerald-600/30 to-teal-600/20',
          roleTitle: m.game ? `Jugando: ${m.game}` : 'Conectado ahora',
          roleBadgeColor: '#23a55a',
          isStaff: false,
          isBooster: false,
          level: 5,
          messageCount: 150,
          reputation: 15,
          joinDate: '2024-01-01',
          bio: m.game ? `Actualmente en Discord jugando a ${m.game}` : 'Conectado en el servidor de Discord.',
          badges: [{ name: 'En línea', icon: 'Zap', color: '#23a55a' }],
        }));
      }

      console.log(`[Discord Widget] Datos obtenidos vía Widget para "${w.name}": ${onlineCount} online.`);
      return currentGuildData;
    }
  } catch (wErr) {
    console.warn('[Discord Widget] Error en consulta de widget:', wErr);
  }

  return currentGuildData;
}

// Intentar sincronización inicial en el arranque si hay GUILD_ID
if (process.env.DISCORD_GUILD_ID) {
  syncDiscordGuildData(process.env.DISCORD_GUILD_ID).catch(console.error);
}

// Re-sincronizar periódicamente cada 45 segundos con la API oficial si hay un servidor activo
setInterval(() => {
  if (activeGuildId && (process.env.DISCORD_BOT_TOKEN || currentGuildData.source === 'discord_widget')) {
    syncDiscordGuildData(activeGuildId).catch(console.error);
  }
}, 45000);

// Helper to determine base URL
function getAppUrl(req: express.Request): string {
  // 1. Check explicit client origin query or header
  const clientOrigin = (req.query?.origin as string) || (req.headers['x-client-origin'] as string);
  if (clientOrigin && clientOrigin.startsWith('http')) {
    return clientOrigin.replace(/\/$/, '');
  }

  // 2. Explicit custom APP_URL env variable
  if (process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL' && process.env.APP_URL.trim() !== '') {
    return process.env.APP_URL.replace(/\/$/, '');
  }

  // 3. Render.com automatic external URL env variable
  if (process.env.RENDER_EXTERNAL_URL && process.env.RENDER_EXTERNAL_URL.trim() !== '') {
    return process.env.RENDER_EXTERNAL_URL.replace(/\/$/, '');
  }

  // 4. Inferred from request headers
  const rawForwardedProto = req.get('x-forwarded-proto');
  const forwardedProto = rawForwardedProto ? rawForwardedProto.split(',')[0].trim() : null;
  const rawForwardedHost = req.get('x-forwarded-host');
  const forwardedHost = rawForwardedHost ? rawForwardedHost.split(',')[0].trim() : null;
  const host = forwardedHost || req.get('host') || 'localhost:3000';

  // Render or cloud domains are always HTTPS
  let protocol = forwardedProto || (req.secure || req.protocol === 'https' ? 'https' : 'http');
  if (host.includes('.onrender.com') || host.includes('.run.app')) {
    protocol = 'https';
  }

  return `${protocol}://${host}`;
}

// -------------------------------------------------------------
// OAUTH WITH DISCORD ENDPOINTS
// -------------------------------------------------------------

app.get('/api/auth/discord/config', (req, res) => {
  const baseUrl = getAppUrl(req);
  const redirectUri = process.env.DISCORD_REDIRECT_URI || `${baseUrl}/api/auth/discord/callback`;
  const clientId = process.env.DISCORD_CLIENT_ID || '';
  const isConfigured = Boolean(clientId && process.env.DISCORD_CLIENT_SECRET);

  res.json({
    configured: isConfigured,
    clientId: clientId || null,
    redirectUri,
    appUrl: baseUrl,
  });
});

app.get('/api/auth/discord/url', (req, res) => {
  const baseUrl = getAppUrl(req);
  const requestedRedirect = (req.query?.redirect_uri as string) || (req.query?.redirectUri as string);
  const redirectUri = requestedRedirect || process.env.DISCORD_REDIRECT_URI || `${baseUrl}/api/auth/discord/callback`;
  const clientId = process.env.DISCORD_CLIENT_ID;

  console.log(`[Discord OAuth] Authorize request using clientId: ${clientId ? clientId.slice(0, 5) + '...' : 'NONE'}, redirectUri: ${redirectUri}`);

  if (!clientId || clientId.trim() === '') {
    // Generate a fallback simulated URL with redirect or notify client
    res.json({
      configured: false,
      redirectUri,
      url: null,
      message: 'DISCORD_CLIENT_ID no está configurado en las variables de entorno.',
    });
    return;
  }

  // Encode redirectUri in state so callback always knows exactly which redirect_uri was authorized
  const stateObj = { redirectUri, timestamp: Date.now() };
  const state = Buffer.from(JSON.stringify(stateObj)).toString('base64url');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify email guilds',
    state,
    prompt: 'consent',
  });

  const authUrl = `https://discord.com/oauth2/authorize?${params.toString()}`;
  res.json({
    configured: true,
    redirectUri,
    url: authUrl,
  });
});

app.get(['/api/auth/discord/callback', '/api/auth/discord/callback/'], async (req, res) => {
  if (req.query.error) {
    const errorDesc = (req.query.error_description as string) || (req.query.error as string);
    res.status(400).send(`
      <html>
        <body style="background:#0f1117;color:#f23f43;font-family:sans-serif;text-align:center;padding:50px;">
          <h2>Error de Discord</h2>
          <p>${errorDesc}</p>
          <button onclick="window.close()" style="margin-top:20px;padding:8px 16px;background:#5865F2;color:white;border:none;border-radius:6px;cursor:pointer;">Cerrar ventana</button>
        </body>
      </html>
    `);
    return;
  }

  const code = req.query.code as string;
  const stateParam = req.query.state as string;
  let redirectUri = `${getAppUrl(req)}/api/auth/discord/callback`;

  if (stateParam) {
    try {
      const parsed = JSON.parse(Buffer.from(stateParam, 'base64url').toString('utf8'));
      if (parsed.redirectUri) {
        redirectUri = parsed.redirectUri;
      }
    } catch (e) {
      // fallback to computed redirectUri
    }
  }

  if (!code) {
    res.status(400).send(`
      <html>
        <body style="background:#0f1117;color:#f23f43;font-family:sans-serif;text-align:center;padding:50px;">
          <h2>Error de autenticación</h2>
          <p>No se recibió el código de autorización de Discord.</p>
          <script>setTimeout(() => window.close(), 3000);</script>
        </body>
      </html>
    `);
    return;
  }

  try {
    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Faltan credenciales de Discord OAuth');
    }

    // Exchange token with Discord
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error('Discord Token error:', errText);
      throw new Error('Error al intercambiar token con Discord');
    }

    const tokenData = await tokenResponse.json() as { access_token: string; token_type: string };

    // Fetch user profile from Discord
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `${tokenData.token_type} ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('No se pudo obtener el perfil del usuario');
    }

    const discordProfile = await userResponse.json() as {
      id: string;
      username: string;
      global_name?: string;
      avatar?: string;
      discriminator?: string;
      banner_color?: string;
    };

    // Fetch user's real guilds from Discord API
    let userGuilds: any[] = [];
    try {
      const guildsRes = await fetch('https://discord.com/api/v10/users/@me/guilds', {
        headers: {
          Authorization: `${tokenData.token_type} ${tokenData.access_token}`,
        },
      });
      if (guildsRes.ok) {
        const rawGuilds = await guildsRes.json() as any[];
        userGuilds = rawGuilds.map(g => {
          const permBigInt = BigInt(g.permissions || '0');
          // ADMINISTRATOR is 0x8 (8), MANAGE_GUILD is 0x20 (32)
          const isAdmin = Boolean(g.owner) || (permBigInt & BigInt(0x8)) === BigInt(0x8) || (permBigInt & BigInt(0x20)) === BigInt(0x20);
          return {
            id: g.id,
            name: g.name,
            icon: g.icon,
            iconUrl: g.icon
              ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`
              : 'https://cdn.discordapp.com/embed/avatars/0.png',
            isOwner: Boolean(g.owner),
            isAdmin,
            permissions: g.permissions,
          };
        });
      }
    } catch (gErr) {
      console.warn('Error al obtener servidores de Discord del usuario:', gErr);
    }

    const hasAdminPermission = userGuilds.some(g => g.isAdmin || g.isOwner);
    const assignedRoles: DiscordRole[] = hasAdminPermission ? ['Admin'] : ['Miembro'];
    const canModerate = hasAdminPermission;
    const canPostPolls = true;

    // Si el usuario administra algún servidor y no hemos fijado uno real, activar su primer servidor real
    const firstAdminGuild = userGuilds.find(g => g.isAdmin || g.isOwner) || userGuilds[0];
    if (firstAdminGuild && (!activeGuildId || activeGuildId === 'nexus_default' || !currentGuildData.isRealData)) {
      activeGuildId = firstAdminGuild.id;
      currentGuildData.id = firstAdminGuild.id;
      currentGuildData.name = firstAdminGuild.name;
      if (firstAdminGuild.iconUrl) {
        currentGuildData.iconUrl = firstAdminGuild.iconUrl;
      }
      syncDiscordGuildData(firstAdminGuild.id).catch(console.error);
    }

    const avatarUrl = discordProfile.avatar
      ? `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png`
      : 'https://cdn.discordapp.com/embed/avatars/0.png';

    const userPayload = {
      id: discordProfile.id,
      username: discordProfile.username,
      global_name: discordProfile.global_name || discordProfile.username,
      avatar: avatarUrl,
      bannerColor: discordProfile.banner_color || '#5865F2',
      roles: assignedRoles,
      joinedAt: new Date().toISOString().split('T')[0],
      status: 'online',
      canModerate,
      canPostPolls,
      guilds: userGuilds,
    };

    res.send(`
      <!doctype html>
      <html>
        <head>
          <title>Autenticación con Discord</title>
          <style>
            body {
              background-color: #0f1117;
              color: #f1f5f9;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .spinner {
              width: 48px;
              height: 48px;
              border: 4px solid #1e2433;
              border-top-color: #5865F2;
              border-radius: 50%;
              animation: spin 0.8s linear infinite;
              margin-bottom: 20px;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
            h2 { color: #5865F2; margin: 0 0 10px 0; }
          </style>
        </head>
        <body>
          <div class="spinner"></div>
          <h2>¡Conexión Exitosa con Discord!</h2>
          <p>Sincronizando tus roles e información de perfil...</p>
          <script>
            const user = ${JSON.stringify(userPayload)};
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', user }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error('OAuth Callback error:', error);
    res.status(500).send(`
      <html>
        <body style="background:#0f1117;color:#f87171;font-family:sans-serif;text-align:center;padding:50px;">
          <h2>Error al conectar con Discord</h2>
          <p>${error.message || 'Ocurrió un error inesperado'}</p>
          <p style="color:#94a3b8;font-size:14px;">Verifica tus credenciales en el archivo .env o en el panel de Render.</p>
          <button onclick="window.close()" style="background:#5865F2;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;margin-top:20px;">Cerrar Ventana</button>
        </body>
      </html>
    `);
  }
});

// -------------------------------------------------------------
// REAL DISCORD GUILD API ENDPOINTS
// -------------------------------------------------------------

// Estado de conexión con Discord y servidor activo
app.get('/api/discord/status', (req, res) => {
  const botClientId = getBotClientId();
  const targetGid = activeGuildId || process.env.DISCORD_GUILD_ID || (currentGuildData.id !== 'nexus_default' ? currentGuildData.id : null);
  const inviteUrl = generateBotInviteUrl(botClientId, targetGid);

  res.json({
    hasBotToken: Boolean(process.env.DISCORD_BOT_TOKEN),
    hasClientId: Boolean(botClientId),
    hasClientSecret: Boolean(process.env.DISCORD_CLIENT_SECRET),
    configuredGuildId: process.env.DISCORD_GUILD_ID || activeGuildId || null,
    clientId: botClientId,
    botInviteUrl: inviteUrl,
    botStatus: currentGuildData.botStatus || (process.env.DISCORD_BOT_TOKEN ? 'not_in_server' : 'not_configured'),
    syncError: currentGuildData.syncError || null,
    activeGuild: currentGuildData,
    isRealData: currentGuildData.isRealData,
    source: currentGuildData.source,
  });
});

// Endpoint para generar URL de invitación del bot personalizada
app.get('/api/discord/invite-url', (req, res) => {
  const clientId = (req.query.clientId as string) || getBotClientId();
  const guildId = (req.query.guildId as string) || activeGuildId || process.env.DISCORD_GUILD_ID;
  const inviteUrl = generateBotInviteUrl(clientId, guildId);

  res.json({
    clientId,
    guildId,
    inviteUrl,
  });
});

// Obtener datos en vivo del servidor Discord activo
app.get('/api/discord/guild/current', (req, res) => {
  res.json({
    guild: currentGuildData,
    stats: serverStats,
    activeGuildId,
    isRealData: currentGuildData.isRealData,
  });
});

// Seleccionar un servidor de Discord (por ID ingresado o de la lista de OAuth)
app.post('/api/discord/guild/select', async (req, res) => {
  const { guildId, guildName, guildIcon } = req.body;
  if (!guildId) {
    res.status(400).json({ error: 'guildId es requerido' });
    return;
  }

  activeGuildId = guildId;
  if (guildName) currentGuildData.name = guildName;
  if (guildIcon) currentGuildData.iconUrl = guildIcon;

  try {
    const updatedGuild = await syncDiscordGuildData(guildId);
    res.json({
      success: true,
      guild: updatedGuild,
      stats: serverStats,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error al sincronizar con Discord' });
  }
});

// Forzar sincronización manual con Discord
app.post('/api/discord/guild/sync', async (req, res) => {
  try {
    const targetId = req.body?.guildId || activeGuildId || process.env.DISCORD_GUILD_ID;
    const updated = await syncDiscordGuildData(targetId);
    res.json({
      success: true,
      guild: updated,
      stats: serverStats,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error al sincronizar con Discord' });
  }
});

// Restablecer o vaciar registros iniciales
app.post('/api/admin/clear-mock-data', (req, res) => {
  polls = polls.filter(p => !p.id.startsWith('poll_1') && !p.id.startsWith('poll_2') && !p.id.startsWith('poll_3'));
  tickets = tickets.filter(t => !t.id.startsWith('tkt_1') && !t.id.startsWith('tkt_2') && !t.id.startsWith('tkt_3'));
  configPresets = configPresets.filter(c => !c.id.startsWith('cfg_1') && !c.id.startsWith('cfg_2') && !c.id.startsWith('cfg_3'));
  moderationLogs = moderationLogs.filter(l => !l.id.startsWith('log_1') && !l.id.startsWith('log_2') && !l.id.startsWith('log_3'));
  res.json({
    success: true,
    message: 'Registros iniciales restablecidos correctamente.',
  });
});

// -------------------------------------------------------------
// COMMUNITY API ENDPOINTS
// -------------------------------------------------------------

// Server stats in real-time
app.get('/api/stats/live', (req, res) => {
  serverStats.totalMembers = currentGuildData.memberCount || 0;
  serverStats.onlineMembers = currentGuildData.onlineCount || 0;
  serverStats.voiceActive = currentGuildData.voiceActiveCount || 0;
  serverStats.boostTier = currentGuildData.boostTier ?? 0;
  serverStats.serverBoosts = currentGuildData.boostCount ?? 0;
  res.json(serverStats);
});

// Polls
app.get('/api/polls', (req, res) => {
  res.json(polls);
});

app.post('/api/polls/:id/vote', (req, res) => {
  const { id } = req.params;
  const { optionId, userId } = req.body;

  const poll = polls.find(p => p.id === id);
  if (!poll) {
    res.status(404).json({ error: 'Encuesta no encontrada' });
    return;
  }
  if (poll.isClosed) {
    res.status(400).json({ error: 'Esta votación ya ha finalizado' });
    return;
  }

  // Remove existing user vote from all options
  poll.options.forEach(opt => {
    const idx = opt.voterIds.indexOf(userId);
    if (idx !== -1) {
      opt.voterIds.splice(idx, 1);
      opt.votes = Math.max(0, opt.votes - 1);
    }
  });

  // Add user vote to selected option
  const targetOption = poll.options.find(opt => opt.id === optionId);
  if (targetOption) {
    targetOption.voterIds.push(userId);
    targetOption.votes += 1;
  }

  poll.totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
  res.json(poll);
});

app.post('/api/polls', (req, res) => {
  const { title, description, category, options, durationDays, author } = req.body;

  if (!title || !options || options.length < 2) {
    res.status(400).json({ error: 'Título y al menos 2 opciones son requeridos' });
    return;
  }

  const endsAtDate = new Date();
  endsAtDate.setDate(endsAtDate.getDate() + (Number(durationDays) || 7));

  const newPoll: Poll = {
    id: `poll_${Date.now()}`,
    title,
    description: description || '',
    category: category || 'Comunidad',
    options: options.map((optText: string, i: number) => ({
      id: `opt_${Date.now()}_${i}`,
      text: optText,
      votes: 0,
      voterIds: [],
    })),
    totalVotes: 0,
    createdAt: new Date().toISOString(),
    endsAt: endsAtDate.toISOString(),
    isClosed: false,
    author: author || {
      id: 'staff_system',
      username: 'Staff Moderación',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Admin',
    },
  };

  polls.unshift(newPoll);

  moderationLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'POLL_CREATED',
    moderator: {
      username: author?.username || 'Staff',
      avatar: author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: author?.role || 'Admin',
    },
    targetName: title,
    details: `Creada votación en categoría ${category}`,
    timestamp: new Date().toISOString(),
  });

  res.status(201).json(newPoll);
});

// Featured Members
app.get('/api/featured-members', (req, res) => {
  res.json(featuredMembers);
});

// Config presets (Hub)
app.get('/api/configs', (req, res) => {
  const { status, category } = req.query;
  let filtered = [...configPresets];

  if (status && status !== 'all') {
    filtered = filtered.filter(c => c.status === status);
  }
  if (category && category !== 'all') {
    filtered = filtered.filter(c => c.category === category);
  }

  res.json(filtered);
});

app.post('/api/configs', (req, res) => {
  const {
    title,
    description,
    category,
    fileName,
    fileSize,
    fileContent,
    fileExtension,
    author,
    tags,
    version,
    compatibilityNote,
  } = req.body;

  if (!title || !fileContent || !fileName) {
    res.status(400).json({ error: 'Título, archivo y nombre son requeridos' });
    return;
  }

  // If author is Admin/Mod, auto-approve; otherwise, sent to pending queue for admin review
  const isPrivileged = author?.role === 'Admin' || author?.role === 'Moderador';
  const initialStatus = isPrivileged ? 'approved' : 'pending';

  const newConfig: ConfigPreset = {
    id: `cfg_${Date.now()}`,
    title,
    description: description || 'Sin descripción provista.',
    category: category || 'Bot & Automatización',
    fileName,
    fileSize: fileSize || '1.0 KB',
    fileContent,
    fileExtension: fileExtension || fileName.split('.').pop() || 'txt',
    author: author || {
      id: 'guest',
      username: 'Miembro Comunitario',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: 'Miembro',
    },
    downloads: 0,
    likes: 1,
    dislikes: 0,
    status: initialStatus,
    createdAt: new Date().toISOString(),
    tags: Array.isArray(tags) ? tags : ['Configuracion', 'Nexus'],
    version: version || '1.0.0',
    compatibilityNote: compatibilityNote || 'Estándar',
  };

  configPresets.unshift(newConfig);

  if (isPrivileged) {
    moderationLogs.unshift({
      id: `log_${Date.now()}`,
      action: 'CONFIG_APPROVED',
      moderator: {
        username: author?.username || 'Staff',
        avatar: author?.avatar || '',
        role: author?.role || 'Admin',
      },
      targetName: title,
      details: 'Auto-aprobado por rol de Staff',
      timestamp: new Date().toISOString(),
    });
  }

  res.status(201).json(newConfig);
});

app.post('/api/configs/:id/vote', (req, res) => {
  const { id } = req.params;
  const { type } = req.body; // 'like' | 'dislike'

  const cfg = configPresets.find(c => c.id === id);
  if (!cfg) {
    res.status(404).json({ error: 'Configuración no encontrada' });
    return;
  }

  if (type === 'like') {
    cfg.likes += 1;
  } else if (type === 'dislike') {
    cfg.dislikes += 1;
  }

  res.json(cfg);
});

app.post('/api/configs/:id/download', (req, res) => {
  const { id } = req.params;
  const cfg = configPresets.find(c => c.id === id);
  if (!cfg) {
    res.status(404).json({ error: 'Configuración no encontrada' });
    return;
  }

  cfg.downloads += 1;
  res.json({ success: true, downloads: cfg.downloads });
});

// Admin Moderation for Config Presets
app.patch('/api/configs/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason, moderator } = req.body;

  const cfg = configPresets.find(c => c.id === id);
  if (!cfg) {
    res.status(404).json({ error: 'Configuración no encontrada' });
    return;
  }

  cfg.status = status;
  if (rejectionReason) {
    cfg.rejectionReason = rejectionReason;
  }

  moderationLogs.unshift({
    id: `log_${Date.now()}`,
    action: status === 'approved' ? 'CONFIG_APPROVED' : 'CONFIG_REJECTED',
    moderator: {
      username: moderator?.username || 'Moderador',
      avatar: moderator?.avatar || '',
      role: moderator?.role || 'Moderador',
    },
    targetName: cfg.title,
    details: status === 'approved' ? 'Aprobado para publicación comunitaria' : `Rechazado: ${rejectionReason || 'No cumple los requisitos'}`,
    timestamp: new Date().toISOString(),
  });

  res.json(cfg);
});

app.delete('/api/configs/:id', (req, res) => {
  const { id } = req.params;
  const { moderator } = req.body;

  const index = configPresets.findIndex(c => c.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Configuración no encontrada' });
    return;
  }

  const removed = configPresets.splice(index, 1)[0];

  moderationLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'CONFIG_DELETED',
    moderator: {
      username: moderator?.username || 'Staff',
      avatar: moderator?.avatar || '',
      role: moderator?.role || 'Admin',
    },
    targetName: removed.title,
    details: 'Configuración eliminada permanentemente del repositorio',
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true, deleted: removed });
});

// Support Tickets
app.get('/api/tickets', (req, res) => {
  const { userId, role } = req.query;

  // If staff/admin, view all tickets; otherwise filter by author id or return user tickets
  if (role === 'Admin' || role === 'Moderador') {
    res.json(tickets);
  } else if (userId) {
    res.json(tickets.filter(t => t.author.id === userId));
  } else {
    res.json(tickets);
  }
});

app.post('/api/tickets', (req, res) => {
  const { title, category, priority, initialMessage, author } = req.body;

  if (!title || !initialMessage) {
    res.status(400).json({ error: 'Título y mensaje inicial son requeridos' });
    return;
  }

  const newTicketNumber = 1000 + tickets.length + 1;
  const newTicket: SupportTicket = {
    id: `tkt_${Date.now()}`,
    ticketNumber: newTicketNumber,
    title,
    category: category || 'Dudas & Soporte General',
    priority: priority || 'Media',
    status: 'Abierto',
    author: author || {
      id: 'guest',
      username: 'Usuario Discord',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    messages: [
      {
        id: `msg_${Date.now()}`,
        senderId: author?.id || 'guest',
        senderName: author?.username || 'Usuario',
        senderAvatar: author?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        isStaff: false,
        role: author?.role || 'Miembro',
        content: initialMessage,
        timestamp: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  tickets.unshift(newTicket);
  res.status(201).json(newTicket);
});

app.post('/api/tickets/:id/messages', (req, res) => {
  const { id } = req.params;
  const { content, sender } = req.body;

  const ticket = tickets.find(t => t.id === id);
  if (!ticket) {
    res.status(404).json({ error: 'Ticket no encontrado' });
    return;
  }

  const isStaff = sender.role === 'Admin' || sender.role === 'Moderador';

  ticket.messages.push({
    id: `msg_${Date.now()}`,
    senderId: sender.id,
    senderName: sender.username,
    senderAvatar: sender.avatar,
    isStaff,
    role: sender.role || 'Miembro',
    content,
    timestamp: new Date().toISOString(),
  });

  if (isStaff && ticket.status === 'Abierto') {
    ticket.status = 'En Progreso';
    ticket.assignedTo = {
      id: sender.id,
      username: sender.username,
      avatar: sender.avatar,
    };
  }

  ticket.updatedAt = new Date().toISOString();
  res.json(ticket);
});

app.patch('/api/tickets/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, moderator } = req.body;

  const ticket = tickets.find(t => t.id === id);
  if (!ticket) {
    res.status(404).json({ error: 'Ticket no encontrado' });
    return;
  }

  ticket.status = status;
  ticket.updatedAt = new Date().toISOString();

  moderationLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'TICKET_STATUS',
    moderator: {
      username: moderator?.username || 'Staff',
      avatar: moderator?.avatar || '',
      role: moderator?.role || 'Moderador',
    },
    targetName: `Ticket #${ticket.ticketNumber} (${ticket.title})`,
    details: `Estado actualizado a "${status}"`,
    timestamp: new Date().toISOString(),
  });

  res.json(ticket);
});

// Moderation Logs
app.get('/api/moderation/logs', (req, res) => {
  res.json(moderationLogs);
});

// Prevent unhandled /api/* requests from falling through to Vite's index.html fallback
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: `Ruta API no encontrada: ${req.method} ${req.originalUrl}` });
});

// Central error handler for /api
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  if (req.originalUrl && req.originalUrl.startsWith('/api/')) {
    res.status(500).json({ error: err.message || 'Error interno del servidor' });
    return;
  }
  next(err);
});

// -------------------------------------------------------------
// VITE MIDDLEWARE & SERVER STARTUP
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Portal Discord running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
