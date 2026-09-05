import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, ExternalLink, Copy, Check, Key, Sparkles, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export const DiscordAuthModal: React.FC = () => {
  const { showOAuthModal, setShowOAuthModal, oauthConfig, switchUser, demoUsers, loginWithDiscord } = useAuth();
  const [copiedCurrent, setCopiedCurrent] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [selectedRedirect, setSelectedRedirect] = useState<string>('');

  if (!showOAuthModal) return null;

  const currentCallback = `${window.location.origin}/api/auth/discord/callback`;
  const devCallback = 'https://ais-dev-qvavk7mmq5ceu3fls6ztk6-852863022721.us-east1.run.app/api/auth/discord/callback';
  const sharedCallback = 'https://ais-pre-qvavk7mmq5ceu3fls6ztk6-852863022721.us-east1.run.app/api/auth/discord/callback';

  const allRedirects = [
    currentCallback,
    `${currentCallback}/`,
    devCallback,
    sharedCallback,
  ].filter((v, i, a) => a.indexOf(v) === i);

  const copyToClipboard = (text: string, type: 'current' | 'all') => {
    navigator.clipboard.writeText(text);
    if (type === 'current') {
      setCopiedCurrent(true);
      setTimeout(() => setCopiedCurrent(false), 2000);
    } else {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  const handleTestLogin = (customUrl?: string) => {
    setShowOAuthModal(false);
    loginWithDiscord(customUrl || selectedRedirect || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#141622] border border-slate-700/70 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1b1f30] border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5865F2] flex items-center justify-center text-white shadow-lg shadow-[#5865F2]/25">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Solución a &quot;redirect_uri no válido&quot;</h2>
              <p className="text-xs text-slate-400">Guía paso a paso para verificar tu configuración de Discord</p>
            </div>
          </div>
          <button
            onClick={() => setShowOAuthModal(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-sm text-slate-300">
          {/* Diagnostic Info Box */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-white text-sm">
                  ¿Por qué Discord muestra la pantalla negra &quot;redirect_uri de OAuth2 no válido&quot;?
                </h3>
                <p className="text-xs text-amber-200/90 mt-1 leading-relaxed">
                  Discord compara <strong>letra por letra</strong> la URL que envía la web con la lista en tu panel. Si hay una pequeña diferencia, si no se guardaron los cambios, o si el Client ID pertenece a otra app, Discord bloquea el acceso.
                </p>
              </div>
            </div>

            {/* Configured Client ID check */}
            <div className="bg-[#0c0e16] border border-slate-700/60 rounded-lg p-3 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">1. Revisa tu Client ID configurado:</span>
                <span className="font-mono text-emerald-400 font-medium">
                  {oauthConfig?.clientId ? oauthConfig.clientId : 'No detectado (falta DISCORD_CLIENT_ID)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Asegúrate de que estás en la misma aplicación en Discord Developer Portal con este ID (no uses el Bot Token ni la Public Key).
              </p>
            </div>

            {/* The exact URL to add */}
            <div className="bg-[#0c0e16] border border-slate-700/60 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">
                  2. URL exacta que debes tener en Redirects:
                </span>
                <span className="text-[10px] text-indigo-300 font-mono">Recomendada</span>
              </div>
              <div className="flex items-center gap-2 bg-[#141724] rounded-lg px-3 py-2 border border-slate-700">
                <code className="text-xs text-amber-300 font-mono select-all truncate flex-1">
                  {currentCallback}
                </code>
                <button
                  onClick={() => copyToClipboard(currentCallback, 'current')}
                  className="px-2.5 py-1 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded text-xs flex items-center gap-1 font-medium transition shrink-0"
                >
                  {copiedCurrent ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCurrent ? '¡Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            {/* Checklist of Common Causes */}
            <div className="space-y-1.5 pt-1 text-xs text-slate-300">
              <p className="font-semibold text-white">Lista de verificación de errores habituales:</p>
              <ul className="space-y-1 pl-1">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>¿Hiciste clic en &quot;Save Changes&quot;?</strong> En Discord Developers, al pulsar <em>Add Redirect</em> y pegar la URL, aparece un banner abajo con el botón <strong>&quot;Save Changes&quot;</strong>. Si no lo pulsas, no se guarda.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>¿Incluye toda la ruta?</strong> Debe terminar en <code className="text-indigo-300">/api/auth/discord/callback</code> (no pongas solo el nombre de dominio).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Agrega ambas versiones (con y sin barra final):</strong> Discord a veces requiere <code className="text-indigo-300">.../callback/</code>. Puedes registrar ambas en Discord.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Quick link to Developer Portal */}
          <div className="bg-[#1a1d2e] border border-slate-700/60 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-white text-xs">Abrir panel de Discord Developer Portal</p>
              <p className="text-[11px] text-slate-400">Ve directamente a Applications &gt; Tu App &gt; OAuth2 &gt; Redirects</p>
            </div>
            <a
              href="https://discord.com/developers/applications"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
            >
              <span>Ir a Discord Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Quick Demo Mode */}
          <div className="bg-[#1f2438] border border-[#5865F2]/30 rounded-xl p-4 flex gap-3">
            <Sparkles className="w-5 h-5 text-[#5865F2] shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <div>
                <p className="font-semibold text-white">¿Prefieres no configurar Discord ahora?</p>
                <p className="text-xs text-slate-300 mt-0.5">
                  Puedes entrar inmediatamente con perfiles simulados (Admin, Mod, Booster) para probar todas las funciones:
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {demoUsers.map(user => (
                  <button
                    key={user.id}
                    onClick={() => {
                      switchUser(user.id);
                      setShowOAuthModal(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#282d44] hover:bg-[#343a57] text-xs font-medium text-white flex items-center gap-2 border border-slate-600/40 transition"
                  >
                    <img src={user.avatar} alt={user.username} className="w-4 h-4 rounded-full" />
                    <span>{user.global_name || user.username}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-[#5865F2]/40 rounded text-indigo-200">
                      {user.roles[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#10121a] border-t border-slate-800 flex justify-between items-center">
          <button
            onClick={() => handleTestLogin()}
            className="px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition shadow-md shadow-[#5865F2]/20"
          >
            <span>Reintentar inicio de sesión</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowOAuthModal(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
