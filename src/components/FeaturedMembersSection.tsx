import React, { useState, useEffect } from 'react';
import { FeaturedMember } from '../types';
import { INITIAL_FEATURED_MEMBERS } from '../data/mockData';
import { safeFetchJson } from '../utils/apiClient';
import { useDiscordServer } from '../context/DiscordServerContext';
import {
  Users,
  ShieldCheck,
  Zap,
  Trophy,
  Flame,
  Sparkles,
  Cpu,
  Code,
  Search,
  Award,
  Tv,
  Palette,
  MessageSquare,
  Star,
  Gamepad2,
  Heart,
  Send,
  X,
  CheckCircle2,
} from 'lucide-react';

export const FeaturedMembersSection: React.FC = () => {
  const { currentGuild } = useDiscordServer();
  const [members, setMembers] = useState<FeaturedMember[]>(INITIAL_FEATURED_MEMBERS);
  const [filter, setFilter] = useState<'all' | 'staff' | 'boosters' | 'creators'>('all');
  const [showNominateModal, setShowNominateModal] = useState(false);
  const [nominateUsername, setNominateUsername] = useState('');
  const [nominateReason, setNominateReason] = useState('');
  const [nominationSent, setNominationSent] = useState(false);

  useEffect(() => {
    safeFetchJson<FeaturedMember[]>('/api/featured-members', undefined, INITIAL_FEATURED_MEMBERS)
      .then(data => setMembers(data))
      .catch(() => setMembers(INITIAL_FEATURED_MEMBERS));
  }, []);

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck':
        return <ShieldCheck className="w-3.5 h-3.5" />;
      case 'Zap':
        return <Zap className="w-3.5 h-3.5" />;
      case 'Trophy':
        return <Trophy className="w-3.5 h-3.5" />;
      case 'Flame':
        return <Flame className="w-3.5 h-3.5" />;
      case 'Sparkles':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'Cpu':
        return <Cpu className="w-3.5 h-3.5" />;
      case 'Code':
        return <Code className="w-3.5 h-3.5" />;
      case 'Search':
        return <Search className="w-3.5 h-3.5" />;
      case 'Award':
        return <Award className="w-3.5 h-3.5" />;
      case 'Tv':
        return <Tv className="w-3.5 h-3.5" />;
      case 'Palette':
        return <Palette className="w-3.5 h-3.5" />;
      default:
        return <Star className="w-3.5 h-3.5" />;
    }
  };

  const filteredMembers = members.filter(m => {
    if (filter === 'staff') return m.isStaff;
    if (filter === 'boosters') return m.isBooster;
    if (filter === 'creators') return !m.isStaff && !m.isBooster;
    return true;
  });

  const handleNominateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nominateUsername.trim() || !nominateReason.trim()) return;

    setNominationSent(true);
    setTimeout(() => {
      setNominationSent(false);
      setShowNominateModal(false);
      setNominateUsername('');
      setNominateReason('');
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161824] border border-slate-800 p-6 rounded-2xl">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            Galería de Miembros Destacados
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Reconociendo a los miembros más activos, boosters leales, staff y creadores que impulsan a {currentGuild.name}.
          </p>
        </div>

        <button
          onClick={() => setShowNominateModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition shrink-0"
        >
          <Sparkles className="w-4 h-4 fill-current" />
          Nominar a un Miembro
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-[#11131c] border border-slate-800/80 p-2 rounded-xl text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition ${
            filter === 'all'
              ? 'bg-[#5865F2] text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Todos ({members.length})
        </button>
        <button
          onClick={() => setFilter('staff')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition ${
            filter === 'staff'
              ? 'bg-[#5865F2] text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Staff & Moderación 🛡️
        </button>
        <button
          onClick={() => setFilter('boosters')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition ${
            filter === 'boosters'
              ? 'bg-[#5865F2] text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Nitro Boosters ⚡
        </button>
        <button
          onClick={() => setFilter('creators')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition ${
            filter === 'creators'
              ? 'bg-[#5865F2] text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Creadores & Devs 💻
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredMembers.map(member => (
          <div
            key={member.id}
            className="bg-[#161824] border border-slate-800/90 rounded-2xl overflow-hidden hover:border-slate-700 transition shadow-xl group flex flex-col justify-between"
          >
            {/* Banner Header */}
            <div className={`h-24 bg-gradient-to-r ${member.bannerGradient} relative p-4 flex items-start justify-end`}>
              {member.isBooster && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 backdrop-blur-md border border-pink-500/40 text-pink-300">
                  <Flame className="w-3 h-3 fill-current text-pink-400" />
                  {member.boostMonths} Meses Booster
                </span>
              )}
            </div>

            {/* Profile Content */}
            <div className="p-6 pt-0 relative flex-1 flex flex-col justify-between">
              {/* Avatar floating */}
              <div className="flex items-end justify-between -mt-12 mb-3">
                <div className="relative">
                  <img
                    src={member.avatar}
                    alt={member.username}
                    className="w-20 h-20 rounded-2xl object-cover border-4 border-[#161824] shadow-lg"
                  />
                  <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#161824]"></span>
                </div>

                <span
                  className="text-xs font-bold px-3 py-1 rounded-full border shadow-sm"
                  style={{
                    backgroundColor: `${member.roleBadgeColor}15`,
                    borderColor: `${member.roleBadgeColor}40`,
                    color: member.roleBadgeColor,
                  }}
                >
                  {member.roleTitle}
                </span>
              </div>

              {/* Names */}
              <div>
                <h3 className="text-lg font-black text-white group-hover:text-indigo-300 transition">
                  {member.username}
                </h3>
                <p className="text-xs text-slate-400 font-mono">{member.handle}</p>
              </div>

              {/* Bio */}
              <p className="text-xs text-slate-300 my-3 leading-relaxed bg-[#11131c] p-3 rounded-xl border border-slate-800/60">
                "{member.bio}"
              </p>

              {/* Badges Bar */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {member.badges.map((b, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#1f2233] border border-slate-700/60"
                    style={{ color: b.color }}
                  >
                    {getBadgeIcon(b.icon)}
                    {b.name}
                  </span>
                ))}
              </div>

              {/* Stats Footer */}
              <div className="pt-3 border-t border-slate-800/70 grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-[#11131c] p-2 rounded-lg">
                  <span className="text-slate-400 text-[10px] block">Nivel</span>
                  <span className="text-white font-mono font-bold text-sm">Lvl {member.level}</span>
                </div>
                <div className="bg-[#11131c] p-2 rounded-lg">
                  <span className="text-slate-400 text-[10px] block">Mensajes</span>
                  <span className="text-white font-mono font-bold text-sm">
                    {(member.messageCount / 1000).toFixed(1)}k
                  </span>
                </div>
                <div className="bg-[#11131c] p-2 rounded-lg">
                  <span className="text-slate-400 text-[10px] block">Reputación</span>
                  <span className="text-amber-400 font-mono font-bold text-sm">+{member.reputation}</span>
                </div>
                <div className="bg-[#11131c] p-2 rounded-lg">
                  <span className="text-slate-400 text-[10px] block">Miembro desde</span>
                  <span className="text-slate-300 text-[10px] font-medium leading-tight block mt-0.5">
                    {member.joinDate}
                  </span>
                </div>
              </div>

              {member.favoriteGame && (
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Gamepad2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Juega habitualmente: <strong className="text-slate-200">{member.favoriteGame}</strong></span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Nominate Member Modal */}
      {showNominateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#161824] border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Nominar Miembro Destacado</h3>
              </div>
              <button
                onClick={() => setShowNominateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {nominationSent ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">¡Nominación Enviada con Éxito!</h4>
                <p className="text-xs text-slate-400">
                  El equipo de Moderación y Staff revisará los aportes del usuario en la próxima reunión semanal.
                </p>
              </div>
            ) : (
              <form onSubmit={handleNominateSubmit} className="space-y-4 mt-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Usuario de Discord (Tag o @handle) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: @usuario_genial o Usuario#0001"
                    value={nominateUsername}
                    onChange={e => setNominateUsername(e.target.value)}
                    className="w-full bg-[#10121a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    ¿Por qué merece ser destacado en el portal? *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe sus aportes, ayuda a nuevos miembros, creación de eventos o configs..."
                    value={nominateReason}
                    onChange={e => setNominateReason(e.target.value)}
                    className="w-full bg-[#10121a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowNominateModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Enviar Nominación
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
