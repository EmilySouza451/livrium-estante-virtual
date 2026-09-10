import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Bookmark,
  Calendar,
  Sparkles,
  Trophy,
  BarChart2,
  Trash2,
  Edit3,
  Share2,
  Download,
  Upload,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Star,
  Quote,
  Flame,
  ChevronRight,
  Filter,
  X,
  Sun,
  Moon,
  Compass,
  Award,
  BookMarked,
  FileSpreadsheet,
  FileText,
  Copy,
  Check
} from 'lucide-react';

// ==========================================
// 1. DADOS INICIAIS (CATÁLOGO CLÁSSICO)
// ==========================================
const INITIAL_BOOKS = [
  {
    id: 'book-1',
    title: 'Dom Casmurro',
    authors: ['Machado de Assis'],
    pageCount: 256,
    currentPage: 184,
    status: 'reading',
    format: 'physical',
    categories: ['Clássicos', 'Literatura Brasileira'],
    publisher: 'Garnier',
    publishedYear: 1899,
    isbn: '9788535914849',
    rating: 5,
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80',
    notes: '“Capitu, apesar daqueles olhos que o diabo lhe deu... você já reparou nos olhos dela? São assim de cigana oblíqua e dissimulada.” — Pág. 32',
    startedAt: '2026-08-15',
    audioCurrentMinutes: 0,
    audioTotalMinutes: 0,
  },
  {
    id: 'book-2',
    title: 'Memórias Póstumas de Brás Cubas',
    authors: ['Machado de Assis'],
    pageCount: 208,
    currentPage: 208,
    status: 'completed',
    format: 'ebook',
    categories: ['Clássicos', 'Realismo'],
    publisher: 'Tipografia Nacional',
    publishedYear: 1881,
    isbn: '9788572328142',
    rating: 5,
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    notes: '“Ao verme que primeiro roeu as frias carnes do meu cadáver dedico como saudosa lembrança estas memórias póstumas.”',
    startedAt: '2026-07-01',
    completedAt: '2026-07-22',
    audioCurrentMinutes: 0,
    audioTotalMinutes: 0,
  },
  {
    id: 'book-3',
    title: 'O Pequeno Príncipe',
    authors: ['Antoine de Saint-Exupéry'],
    pageCount: 96,
    currentPage: 0,
    status: 'want_to_read',
    format: 'audiobook',
    categories: ['Fábula', 'Filosofia'],
    publisher: 'Reynal & Hitchcock',
    publishedYear: 1943,
    isbn: '9788522031443',
    rating: 4,
    coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e37b73?auto=format&fit=crop&w=600&q=80',
    notes: '“O essencial é invisível aos olhos.”',
    audioCurrentMinutes: 0,
    audioTotalMinutes: 180,
  },
  {
    id: 'book-4',
    title: '1984',
    authors: ['George Orwell'],
    pageCount: 336,
    currentPage: 120,
    status: 'reading',
    format: 'physical',
    categories: ['Ficção Científica', 'Distopia'],
    publisher: 'Secker & Warburg',
    publishedYear: 1949,
    isbn: '9788535914848',
    rating: 5,
    coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    notes: '“Guerra é Paz. Liberdade é Escravidão. Ignorância é Força.”',
    startedAt: '2026-08-20',
    audioCurrentMinutes: 0,
    audioTotalMinutes: 0,
  }
];

const PRESET_CHALLENGES = [
  {
    id: 'ch-1',
    title: 'Maratona dos Clássicos',
    description: 'Leia 5 clássicos da literatura universal este ano.',
    targetCount: 5,
    category: 'Clássicos',
    badgeIcon: 'laurel',
    badgeColor: '#C89D54'
  },
  {
    id: 'ch-2',
    title: 'Odisseia de Páginas',
    description: 'Ultrapasse a marca de 1.000 páginas lidas no seu grimório.',
    targetCount: 1000,
    type: 'pages',
    badgeIcon: 'quill',
    badgeColor: '#4A1521'
  },
  {
    id: 'ch-3',
    title: 'Ouvinte da Biblioteca',
    description: 'Conclua ou ouça ao menos 1 audiolivro completo.',
    targetCount: 1,
    type: 'audiobook',
    badgeIcon: 'headphones',
    badgeColor: '#2B4C7E'
  }
];

// ==========================================
// 2. MOTOR DE ÁUDIO AMBIENTE (WEB AUDIO API)
// ==========================================
class AmbientSoundEngine {
  constructor() {
    this.ctx = null;
    this.nodes = [];
    this.gainNode = null;
    this.isPlaying = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  start(soundType, volume = 0.5) {
    this.init();
    if (!this.ctx) return;
    this.stop();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);

    if (soundType === 'rain') {
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.15;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, this.ctx.currentTime);
      noise.connect(filter);
      filter.connect(this.gainNode);
      noise.start();
      this.nodes.push(noise);
    } else if (soundType === 'fire') {
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * (Math.random() > 0.985 ? 0.8 : 0.03);
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(700, this.ctx.currentTime);
      noise.connect(filter);
      filter.connect(this.gainNode);
      noise.start();
      this.nodes.push(noise);
    } else {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(108, this.ctx.currentTime);
      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      osc.connect(subGain);
      subGain.connect(this.gainNode);
      osc.start();
      this.nodes.push(osc);
    }

    this.isPlaying = true;
  }

  setVolume(volume) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  stop() {
    this.nodes.forEach((n) => {
      try { n.stop(); } catch (e) {}
      try { n.disconnect(); } catch (e) {}
    });
    this.nodes = [];
    this.isPlaying = false;
  }
}

const ambientAudio = new AmbientSoundEngine();

// ==========================================
// 3. SELO DE CERA RETRÔ (SVG COMPONENT)
// ==========================================
function WaxSeal({ color = '#4A1521', icon = 'star', size = 48, label }) {
  const sealColors = {
    crimson: '#5E1D2A',
    gold: '#C89D54',
    emerald: '#1C3F2B',
    navy: '#1A2942',
    onyx: '#2A2022'
  };
  const activeColor = sealColors[color] || color;

  return (
    <div className="flex flex-col items-center gap-1 group">
      <div
        className="relative flex items-center justify-center rounded-full shadow-lg transition-transform duration-200 group-hover:scale-105"
        style={{
          width: size,
          height: size,
          backgroundColor: activeColor,
          border: '3px solid #E6CA85',
          boxShadow: '0 4px 10px rgba(0,0,0,0.35), inset 0 2px 5px rgba(255,255,255,0.25)',
        }}
      >
        <div className="absolute inset-1 rounded-full border border-[#E6CA85]/40" />
        <span className="text-[#E6CA85] select-none text-xs font-serif font-bold">
          {icon === 'star' && '★'}
          {icon === 'laurel' && '❧'}
          {icon === 'quill' && '✒'}
          {icon === 'book' && '📖'}
          {icon === 'headphones' && '🎧'}
        </span>
      </div>
      {label && (
        <span className="text-[11px] font-serif font-semibold text-[#5E1D2A] dark:text-[#E6CA85] text-center tracking-wide">
          {label}
        </span>
      )}
    </div>
  );
}

// ==========================================
// 4. COMPONENTE PRINCIPAL (APP)
// ==========================================
export default function App() {
  const [books, setBooks] = useState(() => {
    try {
      const saved = localStorage.getItem('livrium_books_v2');
      return saved ? JSON.parse(saved) : INITIAL_BOOKS;
    } catch {
      return INITIAL_BOOKS;
    }
  });

  const [challenges, setChallenges] = useState(() => {
    try {
      const saved = localStorage.getItem('livrium_challenges_v2');
      return saved ? JSON.parse(saved) : PRESET_CHALLENGES;
    } catch {
      return PRESET_CHALLENGES;
    }
  });

  const [readingSessions, setReadingSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('livrium_sessions_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('livrium_user_v2');
      return saved ? JSON.parse(saved) : { name: 'Bibliófilo Voraz', readingGoalPerYear: 12 };
    } catch {
      return { name: 'Bibliófilo Voraz', readingGoalPerYear: 12 };
    }
  });

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('livrium_theme_v2') || 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    localStorage.setItem('livrium_books_v2', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('livrium_sessions_v2', JSON.stringify(readingSessions));
  }, [readingSessions]);

  useEffect(() => {
    localStorage.setItem('livrium_user_v2', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('livrium_theme_v2', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const [activeTab, setActiveTab] = useState('shelf');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [timerBook, setTimerBook] = useState(null);
  const [shareBook, setShareBook] = useState(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isWaxModalOpen, setIsWaxModalOpen] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const stats = useMemo(() => {
    const totalPagesRead = books.reduce((acc, b) => acc + (b.currentPage || 0), 0);
    const completedCount = books.filter((b) => b.status === 'completed').length;
    const readingCount = books.filter((b) => b.status === 'reading').length;
    const wantCount = books.filter((b) => b.status === 'want_to_read').length;
    const audioMinutesTotal = books.reduce((acc, b) => acc + (b.audioCurrentMinutes || 0), 0);
    return { totalPagesRead, completedCount, readingCount, wantCount, audioMinutesTotal };
  }, [books]);

  const filteredBooks = useMemo(() => {
    return books
      .filter((b) => {
        const matchesQuery =
          b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.authors.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
        const matchesFormat = formatFilter === 'all' || b.format === formatFilter;
        return matchesQuery && matchesStatus && matchesFormat;
      })
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'pages') return b.pageCount - a.pageCount;
        if (sortBy === 'progress') {
          const pctA = a.pageCount ? a.currentPage / a.pageCount : 0;
          const pctB = b.pageCount ? b.currentPage / b.pageCount : 0;
          return pctB - pctA;
        }
        return 0;
      });
  }, [books, searchQuery, statusFilter, formatFilter, sortBy]);

  const handleUpdateProgress = (bookId, newPageOrMinutes, isAudio = false) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id !== bookId) return b;
        if (isAudio) {
          const total = b.audioTotalMinutes || 180;
          const updatedMin = Math.min(total, Math.max(0, newPageOrMinutes));
          const isDone = updatedMin >= total;
          return {
            ...b,
            audioCurrentMinutes: updatedMin,
            status: isDone ? 'completed' : 'reading',
            completedAt: isDone ? new Date().toISOString().slice(0, 10) : b.completedAt,
          };
        } else {
          const updatedPage = Math.min(b.pageCount, Math.max(0, newPageOrMinutes));
          const isDone = updatedPage >= b.pageCount;
          return {
            ...b,
            currentPage: updatedPage,
            status: isDone ? 'completed' : 'reading',
            completedAt: isDone ? new Date().toISOString().slice(0, 10) : b.completedAt,
          };
        }
      })
    );
  };

  const handleSaveBook = (bookData) => {
    if (bookData.id) {
      setBooks((prev) => prev.map((b) => (b.id === bookData.id ? { ...b, ...bookData } : b)));
      showToast('Obra atualizada com sucesso no acervo! 📜');
    } else {
      const newBook = {
        ...bookData,
        id: `book-${Date.now()}`,
        currentPage: bookData.currentPage || 0,
        status: bookData.status || 'want_to_read',
        format: bookData.format || 'physical',
        rating: bookData.rating || 0,
        notes: bookData.notes || '',
        authors: Array.isArray(bookData.authors) ? bookData.authors : [bookData.authors || 'Autor Desconhecido'],
      };
      setBooks((prev) => [newBook, ...prev]);
      showToast('Nova obra catalogada no Livrium! ✨');
    }
  };

  const handleDeleteBook = (id) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
    if (selectedBook?.id === id) setSelectedBook(null);
    showToast('Obra removida do acervo.');
  };

  const handleLogSession = (bookId, pages, minutes) => {
    const today = new Date().toISOString().slice(0, 10);
    const session = { id: `session-${Date.now()}`, bookId, pages, minutes, date: today };
    setReadingSessions((prev) => [session, ...prev]);

    const targetBook = books.find((b) => b.id === bookId);
    if (targetBook) {
      if (targetBook.format === 'audiobook') {
        handleUpdateProgress(bookId, (targetBook.audioCurrentMinutes || 0) + minutes, true);
      } else {
        handleUpdateProgress(bookId, (targetBook.currentPage || 0) + pages, false);
      }
    }
    showToast(`Sessão de ${minutes} min registrada! ⏱️`);
  };

  return (
    <div className="min-h-screen bg-[#F7F2E7] dark:bg-[#1E1718] text-[#231B15] dark:text-[#F7F2E7] font-serif transition-colors duration-200">
      {toast && (
        <div className="fixed bottom-20 right-6 z-50 bg-[#4A1521] text-[#E6CA85] px-4 py-3 rounded-xl border-2 border-[#C89D54] shadow-2xl flex items-center gap-3 text-sm font-semibold">
          <Sparkles className="w-4 h-4 text-[#C89D54]" />
          <span>{toast}</span>
          <span className="text-[#C89D54]">❧</span>
        </div>
      )}

      {/* HEADER SUPERIOR */}
      <header className="sticky top-0 z-40 bg-[#3B1019] text-[#F7F2E7] border-b-2 border-[#C89D54]/50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('shelf')}>
            <div className="w-10 h-10 rounded-xl bg-[#2A0B12] border border-[#C89D54] flex items-center justify-center shadow-inner">
              <BookOpen className="w-5 h-5 text-[#E6CA85]" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wider text-[#E6CA85] leading-none">LIVRIUM</h1>
              <p className="text-[10px] text-[#D9CDB8] uppercase tracking-widest">Estante Virtual</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center flex-1 max-w-xs relative mx-4">
            <Search className="w-4 h-4 absolute left-3 text-[#C4B5A5]" />
            <input
              type="text"
              placeholder="Buscar título ou autor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-[#2A0B12]/80 border border-[#C89D54]/40 text-[#F7F2E7] placeholder-[#C4B5A5] focus:outline-none focus:border-[#E6CA85]"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 text-[#C4B5A5] hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-[#C89D54] hover:bg-[#E6CA85] text-[#1E1718] shadow transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Incluir Obra</span>
            </button>

            <button
              onClick={() => setIsExportOpen(true)}
              title="Exportar Acervo"
              className="p-2 rounded-lg bg-[#2A0B12] hover:bg-[#4A1521] border border-[#C89D54]/40 text-[#E6CA85]"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
              title="Alternar Tema"
              className="p-2 rounded-lg bg-[#2A0B12] hover:bg-[#4A1521] border border-[#C89D54]/40 text-[#E6CA85]"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Sub-header de Abas para Desktop */}
        <div className="hidden md:flex items-center justify-center gap-6 py-2 bg-[#2A0B12] border-t border-[#C89D54]/20 text-xs uppercase tracking-wider font-semibold">
          {[
            { id: 'shelf', label: '📚 Estante Principal' },
            { id: 'calendar', label: '📅 Calendário Literário' },
            { id: 'stats', label: '📊 Estatísticas' },
            { id: 'journal', label: '🖋️ Diário & Citações' },
            { id: 'challenges', label: '🏆 Desafios & Conquistas' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-1 transition-colors ${
                activeTab === tab.id
                  ? 'text-[#E6CA85] border-b-2 border-[#C89D54] font-bold'
                  : 'text-[#C4B5A5] hover:text-[#E6CA85]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-12 space-y-6">
        {/* WIDGET META ANUAL */}
        <div className="bg-[#EDE5D3] dark:bg-[#2A0B12] p-4 sm:p-5 rounded-2xl border border-[#C89D54]/40 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-12 h-12 rounded-xl bg-[#4A1521] border border-[#C89D54] flex items-center justify-center text-[#E6CA85] shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-[#4A1521] dark:text-[#E6CA85]">Meta Anual de {user.name}</h3>
                <span className="text-xs bg-[#C89D54]/20 text-[#4A1521] dark:text-[#E6CA85] px-2 py-0.5 rounded-full font-sans font-bold">
                  {stats.completedCount} de {user.readingGoalPerYear} livros
                </span>
              </div>
              <p className="text-xs text-[#6E5D53] dark:text-[#C4B5A5]">
                {stats.completedCount >= user.readingGoalPerYear
                  ? '🎉 Meta do ano conquistada com maestria!'
                  : `Faltam apenas ${user.readingGoalPerYear - stats.completedCount} obras para concluir o objetivo.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-64">
            <div className="w-full bg-[#D9CDB8] dark:bg-[#1E1718] h-3 rounded-full overflow-hidden border border-[#C89D54]/40">
              <div
                className="bg-gradient-to-r from-[#C89D54] to-[#E6CA85] h-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((stats.completedCount / (user.readingGoalPerYear || 1)) * 100))}%` }}
              />
            </div>
            <button
              onClick={() => setIsWaxModalOpen(true)}
              className="text-xs font-bold text-[#4A1521] dark:text-[#E6CA85] hover:underline whitespace-nowrap"
            >
              Ver Selos
            </button>
          </div>
        </div>

        {/* --- ABA 1: ESTANTE PRINCIPAL --- */}
        {activeTab === 'shelf' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#EDE5D3] dark:bg-[#2A0B12] p-3 rounded-xl border border-[#C89D54]/30">
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                {[
                  { id: 'all', label: `Todos (${books.length})` },
                  { id: 'reading', label: `Lendo (${stats.readingCount})` },
                  { id: 'want_to_read', label: `Vou Ler (${stats.wantCount})` },
                  { id: 'completed', label: `Lidos (${stats.completedCount})` },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setStatusFilter(st.id)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                      statusFilter === st.id
                        ? 'bg-[#4A1521] text-[#E6CA85] shadow-xs'
                        : 'bg-transparent text-[#6E5D53] dark:text-[#C4B5A5] hover:bg-[#D9CDB8] dark:hover:bg-[#1E1718]'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <select
                  value={formatFilter}
                  onChange={(e) => setFormatFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#F7F2E7] dark:bg-[#1E1718] border border-[#C89D54]/40 text-[#231B15] dark:text-[#F7F2E7] font-semibold"
                >
                  <option value="all">Todos Formatos</option>
                  <option value="physical">📖 Livro Físico</option>
                  <option value="ebook">📱 E-book</option>
                  <option value="audiobook">🎧 Audiolivro</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#F7F2E7] dark:bg-[#1E1718] border border-[#C89D54]/40 text-[#231B15] dark:text-[#F7F2E7] font-semibold"
                >
                  <option value="recent">Mais Recentes</option>
                  <option value="title">Título (A-Z)</option>
                  <option value="progress">Maior Progresso</option>
                  <option value="pages">Nº de Páginas</option>
                </select>
              </div>
            </div>

            {filteredBooks.length === 0 ? (
              <div className="text-center py-16 bg-[#EDE5D3] dark:bg-[#2A0B12] rounded-2xl border border-dashed border-[#C89D54]/40 p-8 space-y-3">
                <BookOpen className="w-12 h-12 text-[#C89D54] mx-auto opacity-70" />
                <h3 className="font-bold text-base text-[#4A1521] dark:text-[#E6CA85]">Nenhuma obra encontrada</h3>
                <p className="text-xs text-[#6E5D53] dark:text-[#C4B5A5] max-w-sm mx-auto">
                  Adicione novos volumes ao seu acervo ou ajuste os filtros.
                </p>
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="mt-2 px-4 py-2 text-xs font-bold rounded-lg bg-[#C89D54] text-[#1E1718] hover:bg-[#E6CA85]"
                >
                  Cadastrar Primeira Obra
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredBooks.map((book) => {
                  const isAudio = book.format === 'audiobook';
                  const pct = isAudio
                    ? book.audioTotalMinutes
                      ? Math.round(((book.audioCurrentMinutes || 0) / book.audioTotalMinutes) * 100)
                      : 0
                    : book.pageCount
                    ? Math.round(((book.currentPage || 0) / book.pageCount) * 100)
                    : 0;

                  return (
                    <div
                      key={book.id}
                      onClick={() => setSelectedBook(book)}
                      className="group relative bg-[#EDE5D3] dark:bg-[#2A0B12] rounded-xl border border-[#C89D54]/40 p-2.5 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-[#D9CDB8] dark:bg-[#1E1718] border border-[#C89D54]/30 shadow-inner">
                        {book.coverUrl ? (
                          <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-[#4A1521] text-[#E6CA85]">
                            <BookOpen className="w-8 h-8 mb-2 opacity-60" />
                            <span className="text-[11px] font-bold line-clamp-3 leading-tight">{book.title}</span>
                          </div>
                        )}

                        <span className="absolute top-1.5 left-1.5 bg-[#1E1718]/80 text-[#E6CA85] text-[10px] px-1.5 py-0.5 rounded backdrop-blur-xs font-sans font-bold">
                          {isAudio ? '🎧 Audio' : book.format === 'ebook' ? '📱 E-book' : '📖 Físico'}
                        </span>

                        {pct > 0 && (
                          <span className="absolute bottom-1.5 right-1.5 bg-[#4A1521]/90 text-[#E6CA85] text-[10px] px-1.5 py-0.5 rounded font-bold">
                            {pct}%
                          </span>
                        )}
                      </div>

                      <div className="pt-2 space-y-1">
                        <h4 className="font-bold text-xs text-[#231B15] dark:text-[#F7F2E7] line-clamp-1 group-hover:text-[#C89D54]">
                          {book.title}
                        </h4>
                        <p className="text-[11px] text-[#6E5D53] dark:text-[#C4B5A5] line-clamp-1 italic">
                          {book.authors.join(', ')}
                        </p>

                        <div className="w-full bg-[#D9CDB8] dark:bg-[#1E1718] h-1.5 rounded-full overflow-hidden mt-1">
                          <div className="bg-[#C89D54] h-full" style={{ width: `${Math.min(100, pct)}%` }} />
                        </div>

                        <div className="flex items-center justify-between pt-1.5 text-[10px] text-[#6E5D53] dark:text-[#C4B5A5]" onClick={(e) => e.stopPropagation()}>
                          <span>{isAudio ? `${book.audioCurrentMinutes || 0}m` : `pág. ${book.currentPage}/${book.pageCount}`}</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleUpdateProgress(book.id, (isAudio ? book.audioCurrentMinutes || 0 : book.currentPage || 0) + (isAudio ? 15 : 5), isAudio)}
                              title={isAudio ? '+15 min' : '+5 páginas'}
                              className="px-1.5 py-0.5 rounded bg-[#C89D54]/20 hover:bg-[#C89D54] hover:text-[#1E1718] font-bold"
                            >
                              +{isAudio ? '15m' : '5p'}
                            </button>
                            <button
                              onClick={() => setTimerBook(book)}
                              title="Modo Foco / Pomodoro"
                              className="p-1 rounded hover:bg-[#C89D54]/20 text-[#C89D54]"
                            >
                              <Clock className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setShareBook(book)}
                              title="Compartilhar Conquista"
                              className="p-1 rounded hover:bg-[#C89D54]/20 text-[#C89D54]"
                            >
                              <Share2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --- ABA 2: CALENDÁRIO LITERÁRIO --- */}
        {activeTab === 'calendar' && (
          <div className="bg-[#EDE5D3] dark:bg-[#2A0B12] p-5 rounded-2xl border border-[#C89D54]/40 space-y-4">
            <div className="flex items-center justify-between border-b border-[#C89D54]/20 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#4A1521] dark:text-[#E6CA85] flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#C89D54]" /> Diário e Calendário de Leituras
                </h3>
                <p className="text-xs text-[#6E5D53] dark:text-[#C4B5A5]">
                  Histórico diário dos seus momentos de dedicação aos livros.
                </p>
              </div>
              <span className="text-xs font-bold text-[#4A1521] dark:text-[#E6CA85] bg-[#C89D54]/20 px-3 py-1 rounded-full">
                {readingSessions.length} sessões registradas
              </span>
            </div>

            {readingSessions.length === 0 ? (
              <p className="text-xs text-[#6E5D53] dark:text-[#C4B5A5] italic text-center py-8">
                Nenhuma sessão registrada ainda. Use o Modo Foco (⏱️) nos cards para marcar seu tempo de leitura!
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {readingSessions.map((s) => {
                  const target = books.find((b) => b.id === s.bookId);
                  return (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#F7F2E7] dark:bg-[#1E1718] border border-[#C89D54]/30 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <WaxSeal color="gold" size={32} icon="book" />
                        <div>
                          <h5 className="font-bold text-[#231B15] dark:text-[#F7F2E7]">{target?.title || 'Obra Removida'}</h5>
                          <span className="text-[11px] text-[#6E5D53] dark:text-[#C4B5A5]">Data: {s.date}</span>
                        </div>
                      </div>
                      <div className="text-right font-bold text-[#4A1521] dark:text-[#E6CA85]">
                        <div>+{s.pages} pág.</div>
                        <div className="text-[10px] text-[#6E5D53] dark:text-[#C4B5A5]">{s.minutes} min de foco</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --- ABA 3: ESTATÍSTICAS --- */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-[#EDE5D3] dark:bg-[#2A0B12] p-5 rounded-2xl border border-[#C89D54]/40 space-y-2 text-center">
              <BookOpen className="w-8 h-8 text-[#C89D54] mx-auto" />
              <h4 className="text-2xl font-bold text-[#4A1521] dark:text-[#E6CA85]">{stats.totalPagesRead}</h4>
              <p className="text-xs text-[#6E5D53] dark:text-[#C4B5A5] uppercase tracking-wider font-semibold">Total de Páginas Lidas</p>
            </div>

            <div className="bg-[#EDE5D3] dark:bg-[#2A0B12] p-5 rounded-2xl border border-[#C89D54]/40 space-y-2 text-center">
              <Award className="w-8 h-8 text-[#C89D54] mx-auto" />
              <h4 className="text-2xl font-bold text-[#4A1521] dark:text-[#E6CA85]">{stats.completedCount}</h4>
              <p className="text-xs text-[#6E5D53] dark:text-[#C4B5A5] uppercase tracking-wider font-semibold">Obras Concluídas</p>
            </div>

            <div className="bg-[#EDE5D3] dark:bg-[#2A0B12] p-5 rounded-2xl border border-[#C89D54]/40 space-y-2 text-center">
              <Clock className="w-8 h-8 text-[#C89D54] mx-auto" />
              <h4 className="text-2xl font-bold text-[#4A1521] dark:text-[#E6CA85]">{Math.round(stats.audioMinutesTotal / 60)}h {stats.audioMinutesTotal % 60}m</h4>
              <p className="text-xs text-[#6E5D53] dark:text-[#C4B5A5] uppercase tracking-wider font-semibold">Audiolivros Ouvidos</p>
            </div>
          </div>
        )}

        {/* --- ABA 4: DIÁRIO & CITAÇÕES --- */}
        {activeTab === 'journal' && (
          <div className="bg-[#EDE5D3] dark:bg-[#2A0B12] p-5 rounded-2xl border border-[#C89D54]/40 space-y-4">
            <h3 className="text-base font-bold text-[#4A1521] dark:text-[#E6CA85] flex items-center gap-2">
              <Quote className="w-5 h-5 text-[#C89D54]" /> Grimório de Citações & Reflexões
            </h3>
            <div className="space-y-3">
              {books
                .filter((b) => b.notes && b.notes.trim() !== '')
                .map((b) => (
                  <div key={b.id} className="p-4 rounded-xl bg-[#F7F2E7] dark:bg-[#1E1718] border border-[#C89D54]/30 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#4A1521] dark:text-[#E6CA85]">
                      <span>{b.title}</span>
                      <span className="italic font-normal">{b.authors.join(', ')}</span>
                    </div>
                    <blockquote className="text-xs italic text-[#231B15] dark:text-[#F7F2E7] pl-3 border-l-2 border-[#C89D54] whitespace-pre-line">
                      {b.notes}
                    </blockquote>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* --- ABA 5: DESAFIOS & SELOS EX LIBRIS --- */}
        {activeTab === 'challenges' && (
          <div className="space-y-6">
            <div className="bg-[#EDE5D3] dark:bg-[#2A0B12] p-5 rounded-2xl border border-[#C89D54]/40 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#4A1521] dark:text-[#E6CA85] flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[#C89D54]" /> Desafios Literários Oficiais
                  </h3>
                  <p className="text-xs text-[#6E5D53] dark:text-[#C4B5A5]">Conquiste selos de cera conforme avança em sua jornada.</p>
                </div>
                <button
                  onClick={() => setIsWaxModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#C89D54] text-[#1E1718] hover:bg-[#E6CA85]"
                >
                  Mural Ex Libris
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {challenges.map((ch) => (
                  <div key={ch.id} className="p-4 rounded-xl bg-[#F7F2E7] dark:bg-[#1E1718] border border-[#C89D54]/30 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <WaxSeal color={ch.badgeColor} size={36} icon={ch.badgeIcon} />
                        <h4 className="font-bold text-xs text-[#231B15] dark:text-[#F7F2E7]">{ch.title}</h4>
                      </div>
                      <p className="text-[11px] text-[#6E5D53] dark:text-[#C4B5A5]">{ch.description}</p>
                    </div>
                    <div className="text-right text-xs font-bold text-[#C89D54]">
                      Objetivo: {ch.targetCount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* BOTTOM NAVIGATION BAR (MOBILE) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#2A0B12] border-t border-[#C89D54]/30 pb-safe shadow-2xl">
        <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-1">
          {[
            { id: 'shelf', label: 'Estante', icon: BookOpen },
            { id: 'calendar', label: 'Diário', icon: Calendar },
            { id: 'stats', label: 'Stats', icon: BarChart2 },
            { id: 'journal', label: 'Citações', icon: Quote },
            { id: 'challenges', label: 'Desafios', icon: Trophy },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 transition-colors ${
                  active ? 'text-[#E6CA85] font-bold' : 'text-[#C4B5A5] hover:text-[#E6CA85]'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-[#E6CA85]' : 'text-[#C4B5A5]'}`} />
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* MODAL: CADASTRAR NOVA OBRA */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-[#F7F2E7] dark:bg-[#1E1718] border-2 border-[#C89D54] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-[#231B15] dark:text-[#F7F2E7]">
            <div className="flex items-center justify-between border-b border-[#C89D54]/30 pb-3">
              <h3 className="font-bold text-base text-[#4A1521] dark:text-[#E6CA85]">Incluir Obra no Acervo</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-[#C4B5A5] hover:text-[#4A1521] dark:hover:text-[#E6CA85]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target;
                handleSaveBook({
                  title: form.title.value,
                  authors: [form.author.value],
                  pageCount: parseInt(form.pageCount.value, 10) || 100,
                  format: form.format.value,
                  coverUrl: form.coverUrl.value,
                  audioTotalMinutes: form.format.value === 'audiobook' ? parseInt(form.pageCount.value, 10) : 0,
                });
                setIsAddOpen(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold mb-1">Título da Obra *</label>
                <input required name="title" className="w-full p-2 rounded-lg bg-[#EDE5D3] dark:bg-[#2A0B12] border border-[#C89D54]/40" />
              </div>

              <div>
                <label className="block font-bold mb-1">Autor(es) *</label>
                <input required name="author" className="w-full p-2 rounded-lg bg-[#EDE5D3] dark:bg-[#2A0B12] border border-[#C89D54]/40" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Formato</label>
                  <select name="format" className="w-full p-2 rounded-lg bg-[#EDE5D3] dark:bg-[#2A0B12] border border-[#C89D54]/40">
                    <option value="physical">📖 Livro Físico</option>
                    <option value="ebook">📱 E-book</option>
                    <option value="audiobook">🎧 Audiolivro</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Total Páginas / Minutos</label>
                  <input required type="number" name="pageCount" defaultValue={200} className="w-full p-2 rounded-lg bg-[#EDE5D3] dark:bg-[#2A0B12] border border-[#C89D54]/40" />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">URL da Imagem de Capa (opcional)</label>
                <input name="coverUrl" placeholder="https://..." className="w-full p-2 rounded-lg bg-[#EDE5D3] dark:bg-[#2A0B12] border border-[#C89D54]/40" />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#C89D54]/30">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 rounded-lg font-bold hover:bg-[#D9CDB8] dark:hover:bg-[#2A0B12]">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg font-bold bg-[#C89D54] text-[#1E1718] hover:bg-[#E6CA85]">
                  Salvar no Acervo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DETALHES DO LIVRO */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-[#F7F2E7] dark:bg-[#1E1718] border-2 border-[#C89D54] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-[#231B15] dark:text-[#F7F2E7]">
            <div className="flex items-start justify-between gap-3 border-b border-[#C89D54]/30 pb-3">
              <div>
                <h3 className="font-bold text-lg text-[#4A1521] dark:text-[#E6CA85]">{selectedBook.title}</h3>
                <p className="text-xs text-[#6E5D53] dark:text-[#C4B5A5] italic">{selectedBook.authors.join(', ')}</p>
              </div>
              <button onClick={() => setSelectedBook(null)} className="text-[#C4B5A5] hover:text-[#4A1521] dark:hover:text-[#E6CA85]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 bg-[#EDE5D3] dark:bg-[#2A0B12] p-4 rounded-xl border border-[#C89D54]/30 text-xs">
              <div className="flex justify-between font-bold">
                <span>Progresso de Leitura</span>
                <span>
                  {selectedBook.format === 'audiobook'
                    ? `${selectedBook.audioCurrentMinutes || 0} / ${selectedBook.audioTotalMinutes || 0} min`
                    : `${selectedBook.currentPage} / ${selectedBook.pageCount} pág.`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={selectedBook.format === 'audiobook' ? selectedBook.audioTotalMinutes || 180 : selectedBook.pageCount}
                value={selectedBook.format === 'audiobook' ? selectedBook.audioCurrentMinutes || 0 : selectedBook.currentPage}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  handleUpdateProgress(selectedBook.id, val, selectedBook.format === 'audiobook');
                  setSelectedBook((b) => ({
                    ...b,
                    [selectedBook.format === 'audiobook' ? 'audioCurrentMinutes' : 'currentPage']: val,
                  }));
                }}
                className="w-full accent-[#C89D54]"
              />
            </div>

            <div className="space-y-1 text-xs">
              <label className="block font-bold text-[#4A1521] dark:text-[#E6CA85]">Citações & Notas do Leitor</label>
              <textarea
                defaultValue={selectedBook.notes || ''}
                rows={4}
                placeholder="Registre passagens marcantes desta obra..."
                onBlur={(e) => {
                  handleSaveBook({ ...selectedBook, notes: e.target.value });
                }}
                className="w-full p-2.5 rounded-lg bg-[#EDE5D3] dark:bg-[#2A0B12] border border-[#C89D54]/40"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#C89D54]/30 text-xs font-bold">
              <button
                onClick={() => handleDeleteBook(selectedBook.id)}
                className="flex items-center gap-1.5 text-red-600 hover:underline"
              >
                <Trash2 className="w-4 h-4" /> Excluir
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShareBook(selectedBook);
                    setSelectedBook(null);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-[#C89D54] hover:bg-[#C89D54] hover:text-[#1E1718]"
                >
                  Compartilhar
                </button>
                <button
                  onClick={() => setSelectedBook(null)}
                  className="px-4 py-1.5 rounded-lg bg-[#C89D54] text-[#1E1718] hover:bg-[#E6CA85]"
                >
                  Concluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CRONÔMETRO DE LEITURA (POMODORO) */}
      {timerBook && (
        <ReadingTimerModal
          book={timerBook}
          onClose={() => setTimerBook(null)}
          onLogSession={(pages, min) => handleLogSession(timerBook.id, pages, min)}
        />
      )}

      {/* MODAL: CARTÃO SOCIAL STORY (9:16) */}
      {shareBook && (
        <SocialStoryModal
          book={shareBook}
          user={user}
          onClose={() => setShareBook(null)}
        />
      )}

      {/* MODAL: MURAL EX LIBRIS */}
      {isWaxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-[#F7F2E7] dark:bg-[#1E1718] border-2 border-[#C89D54] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-[#231B15] dark:text-[#F7F2E7]">
            <div className="flex items-center justify-between border-b border-[#C89D54]/30 pb-3">
              <h3 className="font-bold text-base text-[#4A1521] dark:text-[#E6CA85] flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#C89D54]" /> Galeria Ex Libris de Selos
              </h3>
              <button onClick={() => setIsWaxModalOpen(false)} className="text-[#C4B5A5] hover:text-[#4A1521] dark:hover:text-[#E6CA85]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 text-center py-4">
              <WaxSeal color="crimson" label="Primeiro Volume" icon="book" />
              <WaxSeal color="gold" label="Maratona de Foco" icon="star" />
              <WaxSeal color="emerald" label="Ouvinte Fiel" icon="headphones" />
              <WaxSeal color="navy" label="Leitor de Clássicos" icon="laurel" />
              <WaxSeal color="onyx" label="Mestre da Estante" icon="quill" />
            </div>

            <div className="text-right">
              <button
                onClick={() => setIsWaxModalOpen(false)}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-[#C89D54] text-[#1E1718] hover:bg-[#E6CA85]"
              >
                Fechar Mural
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EXPORTAR ACERVO */}
      {isExportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-[#F7F2E7] dark:bg-[#1E1718] border-2 border-[#C89D54] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-[#231B15] dark:text-[#F7F2E7]">
            <div className="flex items-center justify-between border-b border-[#C89D54]/30 pb-3">
              <h3 className="font-bold text-base text-[#4A1521] dark:text-[#E6CA85]">Exportar Acervo Livrium</h3>
              <button onClick={() => setIsExportOpen(false)} className="text-[#C4B5A5] hover:text-[#4A1521] dark:hover:text-[#E6CA85]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#6E5D53] dark:text-[#C4B5A5]">
              Seus dados pertencem a você. Exporte seu catálogo e histórico para o formato desejado:
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify({ books, user, readingSessions }, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `livrium-acervo-${new Date().toISOString().slice(0, 10)}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                  showToast('Backup JSON exportado com sucesso!');
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#EDE5D3] dark:bg-[#2A0B12] hover:bg-[#D9CDB8] dark:hover:bg-[#3B1019] border border-[#C89D54]/40 text-xs font-bold"
              >
                <Download className="w-4 h-4 text-[#C89D54]" />
                <div className="text-left">
                  <div>Backup Completo (JSON)</div>
                  <div className="text-[10px] text-[#6E5D53] dark:text-[#C4B5A5] font-normal">Para restauração em qualquer dispositivo</div>
                </div>
              </button>

              <button
                onClick={() => {
                  const headers = 'Título,Autores,Status,Formato,Páginas,Página Atual,Avaliação\n';
                  const rows = books.map((b) => `"${b.title}","${b.authors.join('; ')}","${b.status}","${b.format}","${b.pageCount}","${b.currentPage}","${b.rating || 0}"`).join('\n');
                  const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `livrium-planilha-${new Date().toISOString().slice(0, 10)}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                  showToast('Planilha CSV gerada!');
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#EDE5D3] dark:bg-[#2A0B12] hover:bg-[#D9CDB8] dark:hover:bg-[#3B1019] border border-[#C89D54]/40 text-xs font-bold"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#C89D54]" />
                <div className="text-left">
                  <div>Planilha de Leitura (CSV)</div>
                  <div className="text-[10px] text-[#6E5D53] dark:text-[#C4B5A5] font-normal">Compatível com Excel e Google Planilhas</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 5. SUBCOMPONENTE: CRONÔMETRO DE LEITURA (POMODORO)
// ==========================================
function ReadingTimerModal({ book, onClose, onLogSession }) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [sound, setSound] = useState('rain');
  const [isMuted, setIsMuted] = useState(false);
  const [pagesRead, setPagesRead] = useState(10);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    if (isActive && !isMuted) {
      ambientAudio.start(sound, 0.4);
    } else {
      ambientAudio.stop();
    }
    return () => ambientAudio.stop();
  }, [isActive, sound, isMuted]);

  const formatTime = (totalSec) => {
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-[#F7F2E7] dark:bg-[#1E1718] border-2 border-[#C89D54] rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl text-center text-[#231B15] dark:text-[#F7F2E7]">
        <h3 className="font-bold text-base text-[#4A1521] dark:text-[#E6CA85]">Sessão de Foco</h3>
        <p className="text-xs text-[#6E5D53] dark:text-[#C4B5A5] italic">{book.title}</p>

        <div className="text-5xl font-mono font-bold tracking-widest text-[#4A1521] dark:text-[#E6CA85] py-4 bg-[#EDE5D3] dark:bg-[#2A0B12] rounded-2xl border border-[#C89D54]/40">
          {formatTime(seconds)}
        </div>

        <div className="flex items-center justify-center gap-2 text-xs">
          {['rain', 'fire', 'library'].map((s) => (
            <button
              key={s}
              onClick={() => setSound(s)}
              className={`px-3 py-1 rounded-lg border font-semibold ${
                sound === s ? 'bg-[#C89D54] text-[#1E1718] border-[#C89D54]' : 'border-[#C89D54]/40'
              }`}
            >
              {s === 'rain' ? '🌧️ Chuva' : s === 'fire' ? '🔥 Lareira' : '🏛️ Biblioteca'}
            </button>
          ))}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-lg border border-[#C89D54]/40 text-[#C89D54]"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setIsActive(!isActive)}
            className="w-12 h-12 rounded-full bg-[#C89D54] text-[#1E1718] flex items-center justify-center shadow-lg hover:bg-[#E6CA85]"
          >
            {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </button>
          <button
            onClick={() => {
              setIsActive(false);
              setSeconds(0);
            }}
            className="p-3 rounded-full bg-[#EDE5D3] dark:bg-[#2A0B12] border border-[#C89D54]/40"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="pt-3 border-t border-[#C89D54]/30 space-y-2 text-xs">
          <div className="flex items-center justify-center gap-2">
            <span>Páginas lidas nesta sessão:</span>
            <input
              type="number"
              value={pagesRead}
              onChange={(e) => setPagesRead(parseInt(e.target.value, 10) || 0)}
              className="w-16 p-1 text-center font-bold rounded bg-[#EDE5D3] dark:bg-[#2A0B12] border border-[#C89D54]/40"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-3 py-1.5 rounded-lg font-bold">Cancelar</button>
            <button
              onClick={() => {
                onLogSession(pagesRead, Math.max(1, Math.round(seconds / 60)));
                onClose();
              }}
              className="px-4 py-1.5 rounded-lg font-bold bg-[#4A1521] text-[#E6CA85] hover:bg-[#5E1D2A]"
            >
              Gravar Sessão
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 6. SUBCOMPONENTE: CARTÃO SOCIAL STORY (9:16)
// ==========================================
function SocialStoryModal({ book, user, onClose }) {
  const isAudio = book.format === 'audiobook';
  const pct = isAudio
    ? book.audioTotalMinutes ? Math.round(((book.audioCurrentMinutes || 0) / book.audioTotalMinutes) * 100) : 0
    : book.pageCount ? Math.round(((book.currentPage || 0) / book.pageCount) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
      <div className="bg-[#EDE5D3] dark:bg-[#2A0B12] border-2 border-[#C89D54] rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl text-center text-[#231B15] dark:text-[#F7F2E7]">
        <div className="flex justify-between items-center pb-2 border-b border-[#C89D54]/30">
          <h4 className="font-bold text-xs text-[#4A1521] dark:text-[#E6CA85]">Cartão de Conquista (Story 9:16)</h4>
          <button onClick={onClose}><X className="w-4 h-4 text-[#C4B5A5]" /></button>
        </div>

        <div className="relative aspect-[9/16] w-full max-w-[260px] mx-auto bg-[#F7F2E7] text-[#231B15] p-5 rounded-2xl border-4 border-[#C89D54] shadow-2xl flex flex-col justify-between items-center text-center">
          <div className="space-y-1">
            <span className="text-[10px] font-sans uppercase tracking-widest text-[#5E1D2A] font-bold">LIVRIUM</span>
            <h5 className="font-bold text-sm text-[#4A1521] leading-tight line-clamp-2">{book.title}</h5>
            <p className="text-[10px] text-[#6E5D53] italic">{book.authors.join(', ')}</p>
          </div>

          <div className="w-24 aspect-[2/3] rounded shadow-md overflow-hidden bg-[#3B1019] border border-[#C89D54]/50 my-2">
            {book.coverUrl ? (
              <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#E6CA85] text-xs font-bold p-1">
                {book.title}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <WaxSeal color="gold" size={44} icon="star" />
            <div className="text-xl font-bold text-[#4A1521] pt-1">{pct}% CONCLUÍDO</div>
            <p className="text-[9px] text-[#6E5D53] uppercase tracking-wider">Leitor: {user.name}</p>
          </div>
        </div>

        <div className="flex justify-center gap-2 pt-2">
          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(`Conquista Literária: ${pct}% de "${book.title}" lidos no Livrium! 📖✨`);
                alert('Texto de compartilhamento copiado!');
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-[#C89D54] text-[#1E1718] hover:bg-[#E6CA85]"
          >
            <Copy className="w-3.5 h-3.5" /> Copiar Texto
          </button>
        </div>
      </div>
    </div>
  );
}