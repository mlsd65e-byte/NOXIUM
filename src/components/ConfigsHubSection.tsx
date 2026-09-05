import React, { useState, useEffect } from 'react';
import { ConfigPreset, ConfigCategory } from '../types';
import { INITIAL_CONFIG_PRESETS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { safeFetchJson } from '../utils/apiClient';
import {
  FolderCode,
  Upload,
  Download,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Search,
  FileCode,
  Tag,
  Copy,
  Check,
  X,
  FileText,
  AlertTriangle,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface ConfigsHubSectionProps {
  onOpenUploadModal?: () => void;
}

export const ConfigsHubSection: React.FC<ConfigsHubSectionProps> = () => {
  const { currentUser, canModerate } = useAuth();
  const [configs, setConfigs] = useState<ConfigPreset[]>(INITIAL_CONFIG_PRESETS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [previewConfig, setPreviewConfig] = useState<ConfigPreset | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadCategory, setUploadCategory] = useState<ConfigCategory>('Bot & Automatización');
  const [uploadVersion, setUploadVersion] = useState('1.0.0');
  const [uploadCompatibility, setUploadCompatibility] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: string;
    content: string;
    extension: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    safeFetchJson<ConfigPreset[]>('/api/configs', undefined, INITIAL_CONFIG_PRESETS)
      .then(data => setConfigs(data))
      .catch(() => setConfigs(INITIAL_CONFIG_PRESETS));
  }, []);

  const handleDownload = async (config: ConfigPreset) => {
    try {
      await fetch(`/api/configs/${config.id}/download`, { method: 'POST' });
      setConfigs(prev =>
        prev.map(c => (c.id === config.id ? { ...c, downloads: c.downloads + 1 } : c))
      );

      // Create downloadable file blob
      const blob = new Blob([config.fileContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = config.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error downloading config:', e);
    }
  };

  const handleVote = async (configId: string, type: 'like' | 'dislike') => {
    try {
      setConfigs(prev =>
        prev.map(c => {
          if (c.id !== configId) return c;
          if (type === 'like') {
            return { ...c, likes: c.likes + 1, userVote: 'like' };
          } else {
            return { ...c, dislikes: c.dislikes + 1, userVote: 'dislike' };
          }
        })
      );

      await fetch(`/api/configs/${configId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
    } catch (e) {
      console.error('Error voting config:', e);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const ext = file.name.split('.').pop() || 'txt';
    const sizeFormatted = `${(file.size / 1024).toFixed(1)} KB`;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      setUploadedFile({
        name: file.name,
        size: sizeFormatted,
        content: content || '',
        extension: ext,
      });
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    };
    reader.readAsText(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFile || !uploadTitle.trim()) {
      alert('Por favor selecciona un archivo y asigna un título.');
      return;
    }

    const newConfigData = {
      title: uploadTitle,
      description: uploadDescription,
      category: uploadCategory,
      fileName: uploadedFile.name,
      fileSize: uploadedFile.size,
      fileContent: uploadedFile.content,
      fileExtension: uploadedFile.extension,
      tags: uploadTags.split(',').map(t => t.trim()).filter(Boolean),
      version: uploadVersion,
      compatibilityNote: uploadCompatibility,
      author: {
        id: currentUser.id,
        username: currentUser.global_name || currentUser.username,
        avatar: currentUser.avatar,
        role: currentUser.roles[0],
      },
    };

    try {
      const created = await safeFetchJson<ConfigPreset>('/api/configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfigData),
      });

      setConfigs([created, ...configs]);
      setShowUploadModal(false);
      // Reset form
      setUploadedFile(null);
      setUploadTitle('');
      setUploadDescription('');
      setUploadTags('');
      setUploadCompatibility('');
    } catch (err) {
      console.error('Error uploading config:', err);
    }
  };

  const copyFileContent = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Regular members only see approved configs or their own pending ones; Staff can see all
  const filteredConfigs = configs.filter(cfg => {
    const isVisibleStatus =
      cfg.status === 'approved' ||
      canModerate ||
      cfg.author.id === currentUser.id;

    if (!isVisibleStatus) return false;

    const matchesCategory =
      selectedCategory === 'Todos' || cfg.category === selectedCategory;

    const matchesSearch =
      searchQuery.trim() === '' ||
      cfg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cfg.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cfg.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      cfg.author.username.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161824] border border-slate-800 p-6 rounded-2xl">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <FolderCode className="w-6 h-6 text-[#5865F2]" />
            Hub Comunitario de Configuraciones
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Descarga y comparte presets para OBS, Stream Deck, bots de Discord, perfiles de audio y macros creados por la comunidad.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold shadow-lg shadow-[#5865F2]/25 transition shrink-0"
        >
          <Upload className="w-4 h-4" />
          Subir Configuración
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="space-y-3 bg-[#11131c] border border-slate-800/80 p-4 rounded-xl">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por título, tag, archivo (.json, .yaml, .css) o autor..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#161824] border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#5865F2]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {[
            'Todos',
            'Bot & Automatización',
            'OBS & Streaming',
            'Stream Deck',
            'Audio & Filtros',
            'Macros & Keybinds',
            'Canales & Permisos',
            'Mod & Texturas',
          ].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-[#5865F2] text-white'
                  : 'bg-[#181a26] text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Config Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredConfigs.map(cfg => {
          const isPending = cfg.status === 'pending';
          const isRejected = cfg.status === 'rejected';

          return (
            <div
              key={cfg.id}
              className={`bg-[#161824] border rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition shadow-lg relative ${
                isPending
                  ? 'border-amber-500/50 bg-amber-500/5'
                  : isRejected
                  ? 'border-rose-500/50 bg-rose-500/5'
                  : 'border-slate-800/90'
              }`}
            >
              {/* Header Badges */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#1f2233] border border-slate-700 text-indigo-300 font-mono">
                    .{cfg.fileExtension.toUpperCase()} • {cfg.fileSize}
                  </span>

                  {isPending ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      En Revisión Staff
                    </span>
                  ) : isRejected ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Rechazado
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-800/70 px-2 py-0.5 rounded">
                      {cfg.category}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 hover:text-[#5865F2] transition">
                  {cfg.title}
                </h3>

                <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {cfg.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {cfg.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] text-slate-400 bg-[#10121a] px-2 py-0.5 rounded border border-slate-800 font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-5 pt-3 border-t border-slate-800/80">
                {/* Author row */}
                <div className="flex items-center justify-between mb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <img
                      src={cfg.author.avatar}
                      alt={cfg.author.username}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="text-slate-300 font-medium truncate max-w-[100px]">
                      {cfg.author.username}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                    <button
                      onClick={() => handleVote(cfg.id, 'like')}
                      className={`flex items-center gap-1 hover:text-emerald-400 transition ${
                        cfg.userVote === 'like' ? 'text-emerald-400 font-bold' : ''
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" /> {cfg.likes}
                    </button>
                    <span className="text-slate-600">|</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Download className="w-3 h-3" /> {cfg.downloads}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPreviewConfig(cfg)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#1f2233] hover:bg-[#282d44] text-slate-200 text-xs font-semibold border border-slate-700/60 transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    Inspeccionar
                  </button>

                  <button
                    onClick={() => handleDownload(cfg)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold shadow-sm shadow-[#5865F2]/20 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Descargar
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredConfigs.length === 0 && (
          <div className="col-span-full bg-[#161824] border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            <FileCode className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p className="text-base font-semibold text-white">No se encontraron archivos de configuración</p>
            <p className="text-xs text-slate-400 mt-1">
              Prueba modificando la búsqueda o sé el primero en subir un preset para la comunidad.
            </p>
          </div>
        )}
      </div>

      {/* Code Preview Modal */}
      {previewConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#141622] border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-[#1b1f2e] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileCode className="w-5 h-5 text-[#5865F2]" />
                <div>
                  <h3 className="text-sm font-bold text-white">{previewConfig.fileName}</h3>
                  <p className="text-[11px] text-slate-400">{previewConfig.title}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyFileContent(previewConfig.fileContent)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white transition"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> ¡Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copiar Código
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDownload(previewConfig)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5865F2] hover:bg-[#4752c4] text-xs font-bold text-white transition"
                >
                  <Download className="w-3.5 h-3.5" /> Descargar
                </button>
                <button
                  onClick={() => setPreviewConfig(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Code Body */}
            <div className="p-4 overflow-auto flex-1 bg-[#0c0d14] font-mono text-xs text-slate-300 leading-relaxed">
              <pre className="whitespace-pre-wrap select-text">{previewConfig.fileContent}</pre>
            </div>

            <div className="px-6 py-3 bg-[#141622] border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Autor: {previewConfig.author.username} ({previewConfig.author.role})</span>
              <span>Versión: {previewConfig.version}</span>
            </div>
          </div>
        </div>
      )}

      {/* Upload Config Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#161824] border border-slate-700 rounded-2xl w-full max-w-xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#5865F2]" />
                <h3 className="text-base font-bold text-white">Subir Configuración Comunitaria</h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 mt-4">
              {/* Drag and Drop Box */}
              <div
                onDragOver={e => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition ${
                  isDragging
                    ? 'border-[#5865F2] bg-[#5865F2]/10'
                    : 'border-slate-700/80 bg-[#10121a] hover:border-slate-600'
                }`}
              >
                {uploadedFile ? (
                  <div className="flex items-center justify-between bg-[#191c2b] p-3 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-3 text-left min-w-0">
                      <FileCode className="w-8 h-8 text-[#5865F2] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{uploadedFile.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {uploadedFile.size} • .{uploadedFile.extension.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadedFile(null)}
                      className="text-slate-400 hover:text-rose-400 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <FileText className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-white">
                      Arrastra tu archivo aquí o haz clic para explorar
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Soporta .json, .yaml, .yml, .cfg, .ini, .css, .sdProfile, .txt
                    </p>
                    <label className="mt-3 inline-block cursor-pointer px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition">
                      Seleccionar Archivo
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileInput}
                        accept=".json,.yaml,.yml,.cfg,.ini,.css,.txt,.sdProfile,.xml"
                      />
                    </label>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Título de la Configuración *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: OBS Studio - Cadena de Filtros de Micrófono"
                  value={uploadTitle}
                  onChange={e => setUploadTitle(e.target.value)}
                  className="w-full bg-[#10121a] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Categoría</label>
                  <select
                    value={uploadCategory}
                    onChange={e => setUploadCategory(e.target.value as ConfigCategory)}
                    className="w-full bg-[#10121a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                  >
                    <option value="Bot & Automatización">Bot & Automatización</option>
                    <option value="OBS & Streaming">OBS & Streaming</option>
                    <option value="Stream Deck">Stream Deck</option>
                    <option value="Audio & Filtros">Audio & Filtros</option>
                    <option value="Macros & Keybinds">Macros & Keybinds</option>
                    <option value="Canales & Permisos">Canales & Permisos</option>
                    <option value="Mod & Texturas">Mod & Texturas</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Versión</label>
                  <input
                    type="text"
                    placeholder="1.0.0"
                    value={uploadVersion}
                    onChange={e => setUploadVersion(e.target.value)}
                    className="w-full bg-[#10121a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Descripción e Instrucciones de Uso
                </label>
                <textarea
                  rows={2}
                  placeholder="Explica para qué sirve el archivo y cómo importarlo en el programa correspondiente..."
                  value={uploadDescription}
                  onChange={e => setUploadDescription(e.target.value)}
                  className="w-full bg-[#10121a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Etiquetas (separadas por comas)
                </label>
                <input
                  type="text"
                  placeholder="OBS, Audio, Microfono, Streaming"
                  value={uploadTags}
                  onChange={e => setUploadTags(e.target.value)}
                  className="w-full bg-[#10121a] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#5865F2]"
                />
              </div>

              <div className="bg-[#11131c] border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  {currentUser.roles.includes('Admin') || currentUser.roles.includes('Moderador') ? (
                    <span>Al tener rol de Staff, tu archivo se publicará de manera <strong>inmediata</strong>.</span>
                  ) : (
                    <span>Tu archivo se enviará al <strong>Panel de Moderación</strong> del Staff antes de ser visible para todos los miembros para garantizar la seguridad del código.</span>
                  )}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!uploadedFile}
                  className="px-5 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-[#5865F2]/20"
                >
                  Subir Archivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
