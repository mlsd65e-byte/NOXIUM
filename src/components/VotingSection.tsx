import React, { useState, useEffect } from 'react';
import { Poll } from '../types';
import { INITIAL_POLLS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { safeFetchJson } from '../utils/apiClient';
import confetti from 'canvas-confetti';
import {
  Vote,
  Clock,
  CheckCircle2,
  Users,
  PlusCircle,
  X,
  AlertCircle,
  Tag,
  Sparkles,
  BarChart2,
} from 'lucide-react';

export const VotingSection: React.FC = () => {
  const { currentUser, canPostPolls } = useAuth();
  const [polls, setPolls] = useState<Poll[]>(INITIAL_POLLS);
  const [filterCategory, setFilterCategory] = useState<string>('Todos');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'closed'>('all');
  const [isVoting, setIsVoting] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New poll form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<Poll['category']>('Comunidad');
  const [newOptions, setNewOptions] = useState<string[]>(['', '']);
  const [durationDays, setDurationDays] = useState(7);

  useEffect(() => {
    safeFetchJson<Poll[]>('/api/polls', undefined, INITIAL_POLLS)
      .then(data => setPolls(data))
      .catch(() => setPolls(INITIAL_POLLS));
  }, []);

  const handleVote = async (pollId: string, optionId: string) => {
    setIsVoting(pollId);

    try {
      // Optimistic update
      setPolls(prevPolls =>
        prevPolls.map(poll => {
          if (poll.id !== pollId) return poll;

          const updatedOptions = poll.options.map(opt => {
            const hasVotedThis = opt.voterIds.includes(currentUser.id);
            const isTarget = opt.id === optionId;

            let newVoters = [...opt.voterIds];
            if (hasVotedThis && !isTarget) {
              newVoters = newVoters.filter(id => id !== currentUser.id);
            } else if (!hasVotedThis && isTarget) {
              newVoters.push(currentUser.id);
            }

            return {
              ...opt,
              voterIds: newVoters,
              votes: newVoters.length,
            };
          });

          const total = updatedOptions.reduce((acc, curr) => acc + curr.votes, 0);
          return {
            ...poll,
            options: updatedOptions,
            totalVotes: total,
          };
        })
      );

      // Trigger celebratory confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#5865F2', '#23a55a', '#f0b232', '#f47fff'],
      });

      // API call
      await fetch(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId, userId: currentUser.id }),
      });
    } catch (e) {
      console.error('Error voting:', e);
    } finally {
      setIsVoting(null);
    }
  };

  const handleAddOption = () => {
    if (newOptions.length < 6) {
      setNewOptions([...newOptions, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (newOptions.length > 2) {
      setNewOptions(newOptions.filter((_, i) => i !== index));
    }
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = newOptions.map(o => o.trim()).filter(Boolean);
    if (!newTitle.trim() || validOptions.length < 2) {
      alert('Ingresa un título y al menos 2 opciones.');
      return;
    }

    try {
      const createdPoll = await safeFetchJson<Poll>('/api/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          category: newCategory,
          options: validOptions,
          durationDays,
          author: {
            id: currentUser.id,
            username: currentUser.global_name || currentUser.username,
            avatar: currentUser.avatar,
            role: currentUser.roles[0],
          },
        }),
      });

      setPolls([createdPoll, ...polls]);
      setShowCreateModal(false);
      setNewTitle('');
      setNewDescription('');
      setNewOptions(['', '']);
    } catch (err) {
      console.error('Error creating poll:', err);
    }
  };

  const filteredPolls = polls.filter(p => {
    const matchesCategory = filterCategory === 'Todos' || p.category === filterCategory;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && !p.isClosed) ||
      (filterStatus === 'closed' && p.isClosed);
    return matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161824] border border-slate-800 p-6 rounded-2xl">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <Vote className="w-6 h-6 text-[#5865F2]" />
            Sistema de Votaciones Comunitarias
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tu voz decide el futuro del servidor: vota torneos, bots, normativas y cambios en vivo.
          </p>
        </div>

        {canPostPolls && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold shadow-lg shadow-[#5865F2]/25 transition shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            Crear Nueva Votación
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#11131c] border border-slate-800/80 p-3 rounded-xl">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['Todos', 'Eventos', 'Actualizaciones', 'Normativa', 'Comunidad'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterCategory === cat
                  ? 'bg-[#5865F2] text-white'
                  : 'bg-[#181a26] text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 bg-[#181a26] p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-2.5 py-1 rounded font-medium transition ${
              filterStatus === 'all' ? 'bg-[#5865F2] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Todas ({polls.length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-2.5 py-1 rounded font-medium transition ${
              filterStatus === 'active' ? 'bg-[#5865F2] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Activas
          </button>
          <button
            onClick={() => setFilterStatus('closed')}
            className={`px-2.5 py-1 rounded font-medium transition ${
              filterStatus === 'closed' ? 'bg-[#5865F2] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Finalizadas
          </button>
        </div>
      </div>

      {/* Poll Cards List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredPolls.map(poll => {
          const userVotedOption = poll.options.find(opt => opt.voterIds.includes(currentUser.id));
          const isClosed = poll.isClosed;

          return (
            <div
              key={poll.id}
              className="bg-[#161824] border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 transition shadow-md relative"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <img
                    src={poll.author.avatar}
                    alt={poll.author.username}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{poll.author.username}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#5865F2]/20 text-[#5865F2] font-semibold">
                        {poll.author.role}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(poll.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 mt-0.5">
                      <Tag className="w-3 h-3" /> Categoria: {poll.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      isClosed
                        ? 'bg-slate-800 text-slate-400 border border-slate-700'
                        : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {isClosed ? 'Votación Finalizada' : 'Activa para votar'}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800/50 px-2.5 py-1 rounded-full border border-slate-800">
                    {poll.totalVotes} votos totales
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="mb-5">
                <h3 className="text-lg font-bold text-white leading-snug">{poll.title}</h3>
                {poll.description && (
                  <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">{poll.description}</p>
                )}
              </div>

              {/* Options */}
              <div className="space-y-3">
                {poll.options.map(option => {
                  const percentage =
                    poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
                  const isUserSelection = option.voterIds.includes(currentUser.id);

                  return (
                    <button
                      key={option.id}
                      disabled={isClosed}
                      onClick={() => handleVote(poll.id, option.id)}
                      className={`w-full group text-left relative overflow-hidden rounded-xl p-3.5 border transition ${
                        isUserSelection
                          ? 'border-[#5865F2] bg-[#5865F2]/10 shadow-sm shadow-[#5865F2]/20'
                          : 'border-slate-800/90 bg-[#11131c] hover:border-slate-700 hover:bg-[#141724]'
                      } ${isClosed ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      {/* Animated Progress Fill */}
                      <div
                        className={`absolute top-0 bottom-0 left-0 transition-all duration-500 ${
                          isUserSelection ? 'bg-[#5865F2]/20' : 'bg-slate-800/50 group-hover:bg-slate-800/70'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>

                      {/* Content */}
                      <div className="relative z-10 flex items-center justify-between gap-4 text-xs sm:text-sm">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                              isUserSelection
                                ? 'border-[#5865F2] bg-[#5865F2] text-white'
                                : 'border-slate-600 bg-transparent group-hover:border-slate-400'
                            }`}
                          >
                            {isUserSelection && <CheckCircle2 className="w-3.5 h-3.5 fill-current" />}
                          </div>
                          <span
                            className={`font-semibold truncate ${
                              isUserSelection ? 'text-white' : 'text-slate-300 group-hover:text-white'
                            }`}
                          >
                            {option.text}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {isUserSelection && (
                            <span className="text-[10px] font-bold text-indigo-300 bg-[#5865F2]/30 px-2 py-0.5 rounded-full">
                              Tu voto
                            </span>
                          )}
                          <span className="font-mono text-xs font-bold text-slate-300">
                            {option.votes} ({percentage}%)
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Poll Footer Info */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {poll.options.reduce((acc, o) => acc + o.voterIds.length, 0)} miembros participaron
                </span>
                <span>
                  {isClosed
                    ? 'Concluyó'
                    : `Finaliza el ${new Date(poll.endsAt).toLocaleDateString()}`}
                </span>
              </div>
            </div>
          );
        })}

        {filteredPolls.length === 0 && (
          <div className="bg-[#161824] border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            <Vote className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p className="text-base font-semibold text-white">No se encontraron votaciones</p>
            <p className="text-xs text-slate-400 mt-1">Prueba seleccionando otra categoría o filtro de estado.</p>
          </div>
        )}
      </div>

      {/* Create Poll Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#161824] border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Vote className="w-5 h-5 text-[#5865F2]" />
                <h3 className="text-lg font-bold text-white">Crear Nueva Votación Oficial</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePoll} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Título de la Encuesta / Propuesta *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: ¿Qué torneo realizamos el sábado?"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-[#10121a] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Descripción o contexto adicional
                </label>
                <textarea
                  rows={2}
                  placeholder="Explica las reglas, detalles o motivos de la votación..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full bg-[#10121a] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Categoría</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full bg-[#10121a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                  >
                    <option value="Eventos">Eventos</option>
                    <option value="Actualizaciones">Actualizaciones</option>
                    <option value="Normativa">Normativa</option>
                    <option value="Comunidad">Comunidad</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Duración (Días)</label>
                  <select
                    value={durationDays}
                    onChange={e => setDurationDays(Number(e.target.value))}
                    className="w-full bg-[#10121a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                  >
                    <option value={1}>1 Día (24 Horas)</option>
                    <option value={3}>3 Días</option>
                    <option value={7}>7 Días (1 Semana)</option>
                    <option value={14}>14 Días</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Opciones de Voto (Mínimo 2, Máximo 6)
                </label>
                <div className="space-y-2">
                  {newOptions.map((opt, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={`Opción ${index + 1}`}
                        value={opt}
                        onChange={e => {
                          const copy = [...newOptions];
                          copy[index] = e.target.value;
                          setNewOptions(copy);
                        }}
                        className="flex-1 bg-[#10121a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                      />
                      {newOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(index)}
                          className="p-1.5 text-slate-500 hover:text-rose-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {newOptions.length < 6 && (
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="mt-2 text-xs text-[#5865F2] hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Añadir otra opción
                  </button>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold shadow-md shadow-[#5865F2]/20"
                >
                  Publicar Votación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
