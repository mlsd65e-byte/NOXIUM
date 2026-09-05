import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, ExternalLink, Copy, Check, Shield, Key, Sparkles } from 'lucide-react';

export const DiscordAuthModal: React.FC = () => {
  const { showOAuthModal, setShowOAuthModal, oauthConfig, switchUser, demoUsers } = useAuth();
  const [copiedDev, setCopiedDev] = useState(false);
  const [copiedShared, setCopiedShared] = useState(false);

  if (!showOAuthModal) return null;

  const devCallback = `${window.location.origin}/api/auth/discord/callback`;
  const sharedCallback = 'https://ais-pre-qvavk7mmq5ceu3fls6ztk6-852863022721.us-east1.run.app/api/auth/discord/callback';

  const copyToClipboard = (text: string, isShared = false) => {
    navigator.clipboard.writeText(text);
    if (isShared) {
      setCopiedShared(true);
      setTimeout(() => setCopiedShared(false), 2000);
    } else {
      setCopiedDev(true);
      setTimeout(() => setCopiedDev(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#161822] border border-slate-700/70 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1f2333] border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5865F2] flex items-center justify-center text-white shadow-lg shadow-[#5865F2]/20">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Configuración de Discord OAuth</h2>
              <p className="text-xs text-slate-400">Conexión oficial con la API de Discord</p>
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
          <div className="bg-[#1f2438] border border-[#5865F2]/30 rounded-xl p-4 flex gap-3">
            <Sparkles className="w-5 h-5 text-[#5865F2] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">¿Quieres probar la experiencia completa de inmediato?</p>
              <p className="text-xs text-slate-300 mt-1">
                Puedes cambiar entre los perfiles de demostración (Admin, Moderador, Booster, Miembro) con un solo clic en la barra superior o abajo sin necesidad de crear una aplicación en Discord.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
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

          <div className="border-t border-slate-800 pt-4">
            <h3 className="font-semibold text-white flex items-center gap-2 mb-3">
              <Key className="w-4 h-4 text-indigo-400" />
              Pasos para conectar tu propia App de Discord:
            </h3>

            <ol className="list-decimal list-inside space-y-3 text-xs leading-relaxed text-slate-300">
              <li>
                Entra en el{' '}
                <a
                  href="https://discord.com/developers/applications"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#5865F2] hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  Discord Developer Portal <ExternalLink className="w-3 h-3 inline" />
                </a>{' '}
                y crea una <strong>New Application</strong>.
              </li>
              <li>
                En el menú lateral, ve a <strong>OAuth2</strong> &gt; <strong>Redirects</strong> y añade estas URLs exactas de retorno:
              </li>
            </ol>

            {/* Callback URLs Boxes */}
            <div className="mt-3 space-y-2">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  URL de Callback (Desarrollo):
                </label>
                <div className="flex items-center gap-2 bg-[#0d0f15] border border-slate-800 rounded-lg px-3 py-2">
                  <code className="text-[11px] text-emerald-400 font-mono truncate flex-1">{devCallback}</code>
                  <button
                    onClick={() => copyToClipboard(devCallback, false)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Copiar URL"
                  >
                    {copiedDev ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  URL de Callback (Producción / Compartido):
                </label>
                <div className="flex items-center gap-2 bg-[#0d0f15] border border-slate-800 rounded-lg px-3 py-2">
                  <code className="text-[11px] text-emerald-400 font-mono truncate flex-1">{sharedCallback}</code>
                  <button
                    onClick={() => copyToClipboard(sharedCallback, true)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Copiar URL"
                  >
                    {copiedShared ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              3. Configura en las variables de entorno de AI Studio (o en <code className="text-slate-300">.env</code>):
            </p>
            <div className="mt-1 bg-[#0d0f15] border border-slate-800 rounded-lg p-2.5 font-mono text-[11px] text-slate-300 space-y-1">
              <p><span className="text-[#5865F2]">DISCORD_CLIENT_ID</span>="tu_client_id_aqui"</p>
              <p><span className="text-[#5865F2]">DISCORD_CLIENT_SECRET</span>="tu_client_secret_aqui"</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#11131c] border-t border-slate-800 flex justify-end">
          <button
            onClick={() => setShowOAuthModal(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
