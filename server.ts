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
  DEMO_USERS,
} from './src/data/mockData.ts';
import { Poll, ConfigPreset, SupportTicket, ServerStats, ModerationLog } from './src/types.ts';

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// In-memory persistent state (seeded from mock data)
let polls: Poll[] = JSON.parse(JSON.stringify(INITIAL_POLLS));
const featuredMembers = JSON.parse(JSON.stringify(INITIAL_FEATURED_MEMBERS));
let configPresets: ConfigPreset[] = JSON.parse(JSON.stringify(INITIAL_CONFIG_PRESETS));
let tickets: SupportTicket[] = JSON.parse(JSON.stringify(INITIAL_TICKETS));
let serverStats: ServerStats = JSON.parse(JSON.stringify(INITIAL_SERVER_STATS));
let moderationLogs: ModerationLog[] = JSON.parse(JSON.stringify(INITIAL_MODERATION_LOGS));

// Periodic jitter for real-time simulation
setInterval(() => {
  const deltaOnline = Math.floor(Math.random() * 9) - 4;
  const deltaVoice = Math.floor(Math.random() * 5) - 2;
  const deltaVelocity = Math.floor(Math.random() * 11) - 5;
  const deltaPing = Math.floor(Math.random() * 5) - 2;

  serverStats.onlineMembers = Math.max(3200, serverStats.onlineMembers + deltaOnline);
  serverStats.voiceActive = Math.max(380, serverStats.voiceActive + deltaVoice);
  serverStats.messageVelocity = Math.max(90, Math.min(260, serverStats.messageVelocity + deltaVelocity));
  serverStats.pingMs = Math.max(16, Math.min(45, serverStats.pingMs + deltaPing));
}, 4000);

// Helper to determine base URL
function getAppUrl(req: express.Request): string {
  if (process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL') {
    return process.env.APP_URL.replace(/\/$/, '');
  }
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  return `${protocol}://${host}`;
}

// -------------------------------------------------------------
// OAUTH WITH DISCORD ENDPOINTS
// -------------------------------------------------------------

app.get('/api/auth/discord/config', (req, res) => {
  const baseUrl = getAppUrl(req);
  const redirectUri = `${baseUrl}/api/auth/discord/callback`;
  const clientId = process.env.DISCORD_CLIENT_ID || '';
  const isConfigured = Boolean(clientId && process.env.DISCORD_CLIENT_SECRET);

  res.json({
    configured: isConfigured,
    clientId: clientId ? `${clientId.slice(0, 4)}...${clientId.slice(-4)}` : null,
    redirectUri,
    appUrl: baseUrl,
  });
});

app.get('/api/auth/discord/url', (req, res) => {
  const baseUrl = getAppUrl(req);
  const redirectUri = `${baseUrl}/api/auth/discord/callback`;
  const clientId = process.env.DISCORD_CLIENT_ID;

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

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify email guilds',
  });

  const authUrl = `https://discord.com/oauth2/authorize?${params.toString()}`;
  res.json({
    configured: true,
    redirectUri,
    url: authUrl,
  });
});

app.get(['/api/auth/discord/callback', '/api/auth/discord/callback/'], async (req, res) => {
  const code = req.query.code as string;
  const baseUrl = getAppUrl(req);
  const redirectUri = `${baseUrl}/api/auth/discord/callback`;

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

    const avatarUrl = discordProfile.avatar
      ? `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png`
      : 'https://cdn.discordapp.com/embed/avatars/0.png';

    const userPayload = {
      id: discordProfile.id,
      username: discordProfile.username,
      global_name: discordProfile.global_name || discordProfile.username,
      avatar: avatarUrl,
      bannerColor: discordProfile.banner_color || '#5865F2',
      roles: ['Miembro'],
      joinedAt: new Date().toISOString().split('T')[0],
      status: 'online',
      canModerate: false,
      canPostPolls: false,
      isDemoUser: false,
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
          <p style="color:#94a3b8;font-size:14px;">Puedes usar el selector de perfiles de demostración en el portal.</p>
          <button onclick="window.close()" style="background:#5865F2;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;margin-top:20px;">Cerrar Ventana</button>
        </body>
      </html>
    `);
  }
});

// -------------------------------------------------------------
// COMMUNITY API ENDPOINTS
// -------------------------------------------------------------

// Server stats in real-time
app.get('/api/stats/live', (req, res) => {
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

// Demo profiles
app.get('/api/demo-users', (req, res) => {
  res.json(DEMO_USERS);
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
