import React, { useState, useEffect } from 'react';
import { SupportTicket, TicketCategory, TicketPriority, TicketStatus } from '../types';
import { INITIAL_TICKETS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { safeFetchJson } from '../utils/apiClient';
import {
  LifeBuoy,
  PlusCircle,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Send,
  User,
  Shield,
  ChevronRight,
  ChevronDown,
  X,
  Lock,
} from 'lucide-react';

export const SupportSection: React.FC = () => {
  const { currentUser, canModerate } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(0);

  // New ticket state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<TicketCategory>('Dudas & Soporte General');
  const [newPriority, setNewPriority] = useState<TicketPriority>('Media');
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    safeFetchJson<SupportTicket[]>(
      `/api/tickets?userId=${currentUser.id}&role=${currentUser.roles[0]}`,
      undefined,
      INITIAL_TICKETS
    )
      .then(data => {
        setTickets(data);
        if (data.length > 0 && !activeTicket) {
          setActiveTicket(data[0]);
        }
      })
      .catch(() => setTickets(INITIAL_TICKETS));
  }, [currentUser]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) return;

    try {
      const created = await safeFetchJson<SupportTicket>('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          priority: newPriority,
          initialMessage: newMessage,
          author: {
            id: currentUser.id,
            username: currentUser.global_name || currentUser.username,
            avatar: currentUser.avatar,
            role: currentUser.roles[0],
          },
        }),
      });

      setTickets([created, ...tickets]);
      setActiveTicket(created);
      setShowNewTicketModal(false);
      setNewTitle('');
      setNewMessage('');
    } catch (e) {
      console.error('Error creating ticket:', e);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !activeTicket) return;

    const senderPayload = {
      id: currentUser.id,
      username: currentUser.global_name || currentUser.username,
      avatar: currentUser.avatar,
      role: currentUser.roles[0],
    };

    try {
      const updated = await safeFetchJson<SupportTicket>(`/api/tickets/${activeTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyMessage, sender: senderPayload }),
      });

      setTickets(tickets.map(t => (t.id === updated.id ? updated : t)));
      setActiveTicket(updated);
      setReplyMessage('');
    } catch (e) {
      console.error('Error sending reply:', e);
    }
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!activeTicket) return;

    try {
      const updated = await safeFetchJson<SupportTicket>(`/api/tickets/${activeTicket.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          moderator: {
            username: currentUser.global_name || currentUser.username,
            avatar: currentUser.avatar,
            role: currentUser.roles[0],
          },
        }),
      });

      setTickets(tickets.map(t => (t.id === updated.id ? updated : t)));
      setActiveTicket(updated);
    } catch (e) {
      console.error('Error changing ticket status:', e);
    }
  };

  const faqs = [
    {
      q: '¿Cómo reclamo mi rol de Server Booster tras activar Nitro?',
      a: 'La sincronización con la API de Discord suele tardar entre 5 y 15 minutos. Si tras ese tiempo aún no tienes el rol rosa y acceso a salas VIP, abre un ticket en la categoría "Problema de Roles" indicando tu fecha de boost.',
    },
    {
      q: '¿Cuáles son los requisitos para obtener el rol de Streamer / Creador?',
      a: 'Tener al menos nivel 15 de actividad en Discord, contar con canal afiliado en Twitch o YouTube con transmisiones regulares y publicar tu link en el canal #verificacion-creadores.',
    },
    {
      q: '¿Cómo se moderan los archivos de configuración subidos?',
      a: 'Todos los archivos pasan por revisión automática de extensiones seguras y posterior aprobación manual por el equipo de Staff en el Panel de Administración para verificar que no contengan tokens ni código malicioso.',
    },
    {
      q: '¿Cómo apelar una sanción o advertencia (warn)?',
      a: 'Abre un ticket con la categoría "Apelación de Sanción", explica con respeto el motivo del desacuerdo y adjunta capturas si las tienes. El Staff revisará el historial en 24 horas.',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161824] border border-slate-800 p-6 rounded-2xl">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-[#5865F2]" />
            Centro de Soporte & Asistencia Nexus
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Resuelve dudas con nuestro equipo de moderación, consulta guías rápidas o gestiona tus tickets privados.
          </p>
        </div>

        <button
          onClick={() => setShowNewTicketModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold shadow-lg shadow-[#5865F2]/25 transition shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Abrir Ticket Privado
        </button>
      </div>

      {/* Ticket Manager Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Tickets List */}
        <div className="bg-[#161824] border border-slate-800 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {canModerate ? 'Todos los Tickets del Servidor' : 'Mis Tickets de Soporte'}
            </span>
            <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
              {tickets.length}
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[500px] pr-1">
            {tickets.map(ticket => {
              const isSelected = activeTicket?.id === ticket.id;
              const isResolved = ticket.status === 'Resuelto' || ticket.status === 'Cerrado';

              return (
                <button
                  key={ticket.id}
                  onClick={() => setActiveTicket(ticket)}
                  className={`w-full text-left p-3 rounded-xl border transition ${
                    isSelected
                      ? 'border-[#5865F2] bg-[#5865F2]/10'
                      : 'border-slate-800 bg-[#11131c] hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono text-[#5865F2] font-bold">
                      #{ticket.ticketNumber}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        ticket.status === 'Abierto'
                          ? 'bg-blue-500/20 text-blue-400'
                          : ticket.status === 'En Progreso'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-white line-clamp-1">{ticket.title}</p>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                    <span>{ticket.category}</span>
                    <span
                      className={`font-semibold ${
                        ticket.priority === 'Urgente'
                          ? 'text-rose-400'
                          : ticket.priority === 'Alta'
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {ticket.priority}
                    </span>
                  </div>
                </button>
              );
            })}

            {tickets.length === 0 && (
              <div className="py-8 text-center text-slate-500 text-xs">
                No tienes tickets abiertos. Si necesitas ayuda, haz clic en "Abrir Ticket Privado".
              </div>
            )}
          </div>
        </div>

        {/* Right: Active Ticket Thread (2 cols) */}
        <div className="lg:col-span-2 bg-[#161824] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between min-h-[500px]">
          {activeTicket ? (
            <>
              {/* Thread Header */}
              <div className="pb-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#5865F2]">
                      Ticket #{activeTicket.ticketNumber}
                    </span>
                    <span className="text-xs font-medium text-slate-400">• {activeTicket.category}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">{activeTicket.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  {canModerate && (
                    <div className="flex items-center gap-1.5 bg-[#11131c] border border-slate-800 p-1 rounded-xl text-xs">
                      <button
                        onClick={() => handleStatusChange('En Progreso')}
                        className={`px-2.5 py-1 rounded-lg font-medium transition ${
                          activeTicket.status === 'En Progreso' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                        }`}
                      >
                        En Progreso
                      </button>
                      <button
                        onClick={() => handleStatusChange('Resuelto')}
                        className={`px-2.5 py-1 rounded-lg font-medium transition ${
                          activeTicket.status === 'Resuelto' ? 'bg-emerald-500 text-white font-bold' : 'text-slate-400'
                        }`}
                      >
                        Resuelto
                      </button>
                    </div>
                  )}

                  {!canModerate && (
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        activeTicket.status === 'Resuelto'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {activeTicket.status}
                    </span>
                  )}
                </div>
              </div>

              {/* Messages Container */}
              <div className="my-4 space-y-4 overflow-y-auto max-h-[380px] pr-2">
                {activeTicket.messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl ${
                      msg.isStaff
                        ? 'bg-[#1b1e2e] border border-indigo-500/20 ml-4'
                        : 'bg-[#11131c] border border-slate-800/80 mr-4'
                    }`}
                  >
                    <img
                      src={msg.senderAvatar}
                      alt={msg.senderName}
                      className="w-8 h-8 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{msg.senderName}</span>
                          {msg.isStaff && (
                            <span className="text-[10px] bg-[#5865F2] text-white px-1.5 py-0.2 rounded font-bold flex items-center gap-0.5">
                              <Shield className="w-2.5 h-2.5" /> Staff
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              {activeTicket.status !== 'Cerrado' ? (
                <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    placeholder="Escribe una respuesta en este ticket..."
                    value={replyMessage}
                    onChange={e => setReplyMessage(e.target.value)}
                    className="flex-1 bg-[#10121a] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#5865F2]"
                  />
                  <button
                    type="submit"
                    disabled={!replyMessage.trim()}
                    className="px-4 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#5865F2]/20 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Enviar
                  </button>
                </form>
              ) : (
                <div className="text-center py-3 bg-[#11131c] rounded-xl text-xs text-slate-400">
                  Este ticket ha sido cerrado. Si tienes otra consulta, abre un nuevo ticket.
                </div>
              )}
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
              <MessageSquare className="w-10 h-10 text-slate-600" />
              <p className="text-sm font-semibold text-slate-400">Selecciona un ticket para ver la conversación</p>
            </div>
          )}
        </div>
      </div>

      {/* FAQ Accordion Section */}
      <div className="bg-[#161824] border border-slate-800 rounded-2xl p-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-indigo-400" />
          Preguntas Frecuentes & Guías Rápidas
        </h3>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = faqOpenIndex === idx;
            return (
              <div
                key={idx}
                className="bg-[#11131c] border border-slate-800/80 rounded-xl overflow-hidden transition"
              >
                <button
                  onClick={() => setFaqOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left p-4 flex items-center justify-between gap-3"
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-200">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-indigo-400' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#161824] border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-[#5865F2]" />
                <h3 className="text-base font-bold text-white">Abrir Ticket de Soporte Privado</h3>
              </div>
              <button
                onClick={() => setShowNewTicketModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Asunto / Título del Ticket *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Problema con sincronización de rol de Booster"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-[#10121a] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Departamento</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as TicketCategory)}
                    className="w-full bg-[#10121a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                  >
                    <option value="Dudas & Soporte General">Dudas & Soporte General</option>
                    <option value="Reporte de Usuario">Reporte de Usuario</option>
                    <option value="Problema de Roles/Permisos">Problema de Roles/Permisos</option>
                    <option value="Sugerencia del Servidor">Sugerencia del Servidor</option>
                    <option value="Apelación de Sanción">Apelación de Sanción</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Prioridad</label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as TicketPriority)}
                    className="w-full bg-[#10121a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                  >
                    <option value="Baja">Baja</option>
                    <option value="Media">Media</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Descripción Detallada *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Por favor describe tu caso detalladamente para que el Staff pueda ayudarte más rápido..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  className="w-full bg-[#10121a] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold shadow-md shadow-[#5865F2]/20"
                >
                  Crear Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
