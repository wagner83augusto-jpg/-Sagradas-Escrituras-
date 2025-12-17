import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BIBLE_BOOKS, APOCRYPHA_BOOKS, ELLEN_WHITE_BOOKS, RODRIGO_SILVA_BOOKS, MICHELSON_BORGES_BOOKS, JOHN_BUNYAN_BOOKS, SINCLAIR_FERGUSON_BOOKS, CHARLES_FINNEY_BOOKS } from '../constants';
import { Book as BookType, ChapterData, BibleViewState, Verse, BibleVersion, UserNotesMap, SearchResult } from '../types';
import { fetchChapterContent } from '../services/geminiService';
import { Share2, Play, Pause, BookOpen, Bookmark, Check, ChevronDown, ChevronRight, MessageSquare, Save, Trash2, X, Pencil, Search, Globe, Loader2, AlertTriangle, Type, Image as ImageIcon, Copy, Download, Library, Feather, FileText, Pickaxe, BookKey, GraduationCap, Flame, Shield, Lock, ArrowLeft } from 'lucide-react';
import { playClickSound } from '../constants';

interface BibleReaderProps {
  onBackToMenu: () => void;
}

interface LastReadData {
  bookName: string;
  chapter: number;
  category: string;
}

type BookCategory = 'bible' | 'apocrypha' | 'ellen' | 'rodrigo' | 'michelson' | 'bunyan' | 'ferguson' | 'finney';

// -- HELPER: Glass Book Card (Estilo do Menu Principal) --
// Moved outside component to avoid recreation and fix TS issue with 'key' prop
const GlassBookCard: React.FC<{ book: BookType, index: number }> = ({ book, index }) => (
    <button 
        onClick={() => {playClickSound(); window.location.hash = `bible/${book.name}`}}
        style={{ animationDelay: `${index * 50}ms` }}
        className="group relative flex flex-col items-center justify-center p-4 bg-[#1a100e]/60 backdrop-blur-md border border-[#3e2723]/50 rounded-xl shadow-lg hover:bg-[#2d1b18]/80 hover:border-[#bf953f] hover:scale-105 transition-all duration-300 animate-in fade-in fill-mode-backwards focus:outline-none focus:ring-2 focus:ring-[#bf953f]"
        role="button"
        aria-label={`Ler livro ${book.name}, contém ${book.chapters} capítulos`}
    >
        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent via-[#bf953f]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        
        <div className="mb-2 p-3 bg-gradient-to-br from-[#3e2723] to-[#1a100e] rounded-full shadow-inner text-[#bf953f] group-hover:text-[#fcf6ba] transition-colors">
            <BookOpen size={24} />
        </div>
        
        <h3 className="text-sm font-title font-bold text-[#e0c9a6] group-hover:text-[#fcf6ba] text-center uppercase tracking-wide leading-tight line-clamp-2 min-h-[2.5em] flex items-center">
            {book.name}
        </h3>
        <span className="text-[10px] text-[#8d6e63] font-serif italic mt-1 group-hover:text-[#bf953f] transition-colors">
            {book.chapters} Caps
        </span>
    </button>
);

const BibleReader: React.FC<BibleReaderProps> = ({ onBackToMenu }) => {
  // -- ROUTER LOGIC --
  const hash = window.location.hash;
  const parts = hash.replace('#', '').split('/').map(part => decodeURIComponent(part));
  
  // Detect if we are in 'bible' mode (exclusive) or 'library' mode (all authors)
  const mode = parts[0] === 'library' ? 'library' : 'bible';
  
  const bookNameParam = parts[1];
  const chapterParam = parts[2];

  // Helper para encontrar livro em todas as categorias
  const findBook = (name: string) => {
      return BIBLE_BOOKS.find(b => b.name === name) ||
             APOCRYPHA_BOOKS.find(b => b.name === name) ||
             ELLEN_WHITE_BOOKS.find(b => b.name === name) ||
             RODRIGO_SILVA_BOOKS.find(b => b.name === name) ||
             MICHELSON_BORGES_BOOKS.find(b => b.name === name) ||
             JOHN_BUNYAN_BOOKS.find(b => b.name === name) ||
             SINCLAIR_FERGUSON_BOOKS.find(b => b.name === name) ||
             CHARLES_FINNEY_BOOKS.find(b => b.name === name) || null;
  };

  const selectedBook = bookNameParam ? findBook(bookNameParam) : null;
  const selectedChapter = chapterParam ? parseInt(chapterParam, 10) : null;

  let viewState: BibleViewState = 'books';
  if (selectedBook) {
    viewState = selectedChapter ? 'verses' : 'chapters';
  }

  // Determine active category based on book or default to bible
  const [activeCategory, setActiveCategory] = useState<BookCategory>('bible');
  // State to handle the "Single Bible Cover" view
  const [bibleExpanded, setBibleExpanded] = useState(false);

  useEffect(() => {
    if (selectedBook) {
        if (BIBLE_BOOKS.some(b => b.name === selectedBook.name)) setActiveCategory('bible');
        else if (APOCRYPHA_BOOKS.some(b => b.name === selectedBook.name)) setActiveCategory('apocrypha');
        else if (ELLEN_WHITE_BOOKS.some(b => b.name === selectedBook.name)) setActiveCategory('ellen');
        else if (RODRIGO_SILVA_BOOKS.some(b => b.name === selectedBook.name)) setActiveCategory('rodrigo');
        else if (MICHELSON_BORGES_BOOKS.some(b => b.name === selectedBook.name)) setActiveCategory('michelson');
        else if (JOHN_BUNYAN_BOOKS.some(b => b.name === selectedBook.name)) setActiveCategory('bunyan');
        else if (SINCLAIR_FERGUSON_BOOKS.some(b => b.name === selectedBook.name)) setActiveCategory('ferguson');
        else if (CHARLES_FINNEY_BOOKS.some(b => b.name === selectedBook.name)) setActiveCategory('finney');
    }
  }, [selectedBook]);

  // Reset bible expansion when switching tabs explicitly
  const handleCategoryChange = (cat: BookCategory) => {
      setActiveCategory(cat);
      if (cat === 'bible') {
          setBibleExpanded(false);
      }
  };

  // -- STATE --
  const [chapterData, setChapterData] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(false);
  const [speakingVerse, setSpeakingVerse] = useState<number | null>(null);
  const [activeVerse, setActiveVerse] = useState<Verse | null>(null);
  
  // Image Generation State
  const [showImageModal, setShowImageModal] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageBgIndex, setImageBgIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [currentVersion, setCurrentVersion] = useState<BibleVersion>('ACF');
  const [userNotes, setUserNotes] = useState<UserNotesMap>({});
  const [editingVerse, setEditingVerse] = useState<Verse | null>(null);
  const [noteText, setNoteText] = useState('');

  // Load Notes
  useEffect(() => {
    const savedNotes = localStorage.getItem('bible_user_notes');
    if (savedNotes) setUserNotes(JSON.parse(savedNotes));
  }, []);

  useEffect(() => {
    if (Object.keys(userNotes).length > 0) localStorage.setItem('bible_user_notes', JSON.stringify(userNotes));
  }, [userNotes]);

  // Fetch Logic & Auto Save Last Read
  useEffect(() => {
    if (viewState === 'verses' && selectedBook && selectedChapter) {
      setLoading(true);
      setChapterData(null);
      
      // Determine context for fetch based on ACTIVE CATEGORY
      let contextType = activeCategory; 

      // -- GRAVAR ÚLTIMA PÁGINA LIDA (AUTOMÁTICO) --
      const lastRead: LastReadData = {
          bookName: selectedBook.name,
          chapter: selectedChapter,
          category: activeCategory
      };
      localStorage.setItem('bible_last_read', JSON.stringify(lastRead));

      fetchChapterContent(selectedBook.name, selectedChapter, currentVersion, contextType)
        .then(data => setChapterData(data))
        .catch(e => console.error(e))
        .finally(() => setLoading(false));
    }
  }, [selectedBook?.name, selectedChapter, viewState, currentVersion, activeCategory]);

  // -- HANDLERS --
  const handleVerseClick = (verse: Verse) => {
      if (activeVerse?.verse === verse.verse) {
          setActiveVerse(null);
      } else {
          playClickSound();
          setActiveVerse(verse);
      }
  };

  const handleBookmark = () => {
      if (!selectedBook || !selectedChapter) return;
      playClickSound();
      
      // Salva explicitamente como última leitura
      const lastRead: LastReadData = {
          bookName: selectedBook.name,
          chapter: selectedChapter,
          category: activeCategory
      };
      localStorage.setItem('bible_last_read', JSON.stringify(lastRead));
      
      alert(`Marcador salvo com sucesso em: ${selectedBook.name} ${selectedChapter}`);
      if (activeVerse) setActiveVerse(null);
  };

  const handleCopy = () => {
      if (!activeVerse) return;
      // BLOQUEIO DE CÓPIA PARA LIVROS PROTEGIDOS
      if (activeCategory !== 'bible' && activeCategory !== 'apocrypha') {
          alert('Este conteúdo está protegido por direitos autorais do autor.');
          return;
      }

      const text = `${selectedBook?.name} ${selectedChapter}:${activeVerse.verse} - "${activeVerse.text}"`;
      navigator.clipboard.writeText(text);
      alert('Texto copiado!');
      setActiveVerse(null);
  };

  const handleNote = () => {
      if (!activeVerse) return;
      const key = `${selectedBook?.name}-${selectedChapter}-${activeVerse.verse}`;
      setNoteText(userNotes[key] || '');
      setEditingVerse(activeVerse);
      setActiveVerse(null);
  };

  const handleSaveNote = () => {
      if (!editingVerse) return;
      const key = `${selectedBook?.name}-${selectedChapter}-${editingVerse.verse}`;
      const newNotes = { ...userNotes, [key]: noteText };
      if (!noteText.trim()) delete newNotes[key];
      setUserNotes(newNotes);
      setEditingVerse(null);
  };

  const toggleSpeech = () => {
      if (!activeVerse) return;
      if (speakingVerse === activeVerse.verse) {
          window.speechSynthesis.cancel();
          setSpeakingVerse(null);
      } else {
          window.speechSynthesis.cancel();
          setSpeakingVerse(activeVerse.verse);
          const u = new SpeechSynthesisUtterance(activeVerse.text);
          u.lang = 'pt-BR';
          u.onend = () => setSpeakingVerse(null);
          window.speechSynthesis.speak(u);
      }
  };

  // -- IMAGE GENERATION (Simplified) --
  const imageBackgrounds = [
      'linear-gradient(135deg, #3e2723 0%, #1a100e 100%)', 
      'linear-gradient(135deg, #bf953f 0%, #fcf6ba 50%, #aa771c 100%)', 
      'linear-gradient(to bottom, #0f2027, #203a43, #2c5364)', 
      'url("https://www.transparenttextures.com/patterns/black-linen.png")'
  ];

  const generateImage = useCallback(() => {
      if (!activeVerse || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 1080;
      canvas.height = 1080;

      // Background
      if (imageBackgrounds[imageBgIndex].includes('url')) {
          ctx.fillStyle = '#1a100e';
          ctx.fillRect(0, 0, 1080, 1080);
      } else {
          const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
          if (imageBgIndex === 1) { // Gold
             gradient.addColorStop(0, '#bf953f');
             gradient.addColorStop(1, '#aa771c');
             ctx.fillStyle = gradient;
          } else if (imageBgIndex === 2) { // Night
             gradient.addColorStop(0, '#0f2027');
             gradient.addColorStop(1, '#2c5364');
             ctx.fillStyle = gradient;
          } else {
             ctx.fillStyle = '#3e2723';
          }
          ctx.fillRect(0, 0, 1080, 1080);
      }

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const textColor = imageBgIndex === 1 ? '#3e2723' : '#fcf6ba';
      
      // Text logic simplified for brevity
      ctx.font = 'italic 48px serif';
      ctx.fillStyle = textColor;
      ctx.fillText(activeVerse.text.substring(0, 30) + "...", 540, 540); 
      
      ctx.font = 'bold 40px sans-serif';
      ctx.fillText(`${selectedBook?.name} ${selectedChapter}:${activeVerse.verse}`, 540, 900);
      
      setGeneratedImage(canvas.toDataURL('image/png'));
  }, [activeVerse, imageBgIndex, selectedBook, selectedChapter]);

  useEffect(() => {
      if (showImageModal) setTimeout(generateImage, 100);
  }, [showImageModal, imageBgIndex, generateImage]);

  const handleShareImage = async () => {
      // BLOQUEIO DE PRINT/SHARE PARA LIVROS PROTEGIDOS
      if (activeCategory !== 'bible' && activeCategory !== 'apocrypha') {
          alert('Protegido: Não é permitido compartilhar imagens deste conteúdo.');
          return;
      }

      if (!generatedImage) return;
      try {
          const blob = await (await fetch(generatedImage)).blob();
          const file = new File([blob], 'card.png', { type: 'image/png' });
          if (navigator.share) await navigator.share({ files: [file], title: 'Versículo' });
          else {
              const a = document.createElement('a');
              a.href = generatedImage;
              a.download = 'card.png';
              a.click();
          }
          setShowImageModal(false);
      } catch (e) {}
  };

  // -- RENDER HELPERS --
  const renderBookGrid = (books: BookType[]) => (
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {books.map((b, idx) => (
              <GlassBookCard key={b.name} book={b} index={idx} />
          ))}
      </div>
  );

  return (
    <div className="min-h-screen bg-[#1a100e] flex flex-col relative overflow-hidden">
        {/* Estilo CSS da animação de Virar Folha */}
        <style>{`
          @keyframes pageFlipIn {
            0% {
              opacity: 0;
              transform: perspective(2000px) rotateY(-90deg) translateX(20px);
              transform-origin: left center;
            }
            100% {
              opacity: 1;
              transform: perspective(2000px) rotateY(0deg) translateX(0);
              transform-origin: left center;
            }
          }
          .animate-page-flip {
            animation: pageFlipIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
            transform-style: preserve-3d;
            will-change: transform, opacity;
          }
        `}</style>

        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-40 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#3e2723]/30 via-transparent to-black pointer-events-none"></div>

        {/* Top Bar */}
        <div className="sticky top-0 bg-[#1a100e]/95 backdrop-blur z-20 border-b border-[#3e2723] flex flex-col shadow-lg">
            <div className="flex items-center justify-between p-4">
                <div className="w-10"></div> 
                <div className="text-[#fcf6ba] font-bold font-title truncate px-2 text-lg tracking-widest uppercase">
                    {selectedBook ? selectedBook.name : (mode === 'library' ? 'Biblioteca' : 'Bíblia Sagrada')}
                </div>
                <div className="w-10"></div>
            </div>

            {/* Categoria Tabs - Barra de Navegação Horizontal - APENAS SE ESTIVER NO MODO BIBLIOTECA E NENHUM LIVRO SELECIONADO */}
            {(!selectedBook && mode === 'library') && (
                <div className="flex overflow-x-auto p-2 gap-2 scrollbar-hide border-t border-[#3e2723]/30 pb-3">
                    <button 
                        onClick={() => handleCategoryChange('bible')} 
                        className={`px-4 py-2 rounded-full whitespace-nowrap text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all duration-300 ${activeCategory === 'bible' ? 'bg-[#bf953f] text-[#1a100e] shadow-[0_0_10px_#bf953f]' : 'bg-[#2d1b18] text-[#8d6e63] border border-[#3e2723] hover:text-[#e0c9a6]'}`}
                    >
                        <BookOpen size={14} /> Bíblia
                    </button>
                    <button 
                        onClick={() => handleCategoryChange('apocrypha')} 
                        className={`px-4 py-2 rounded-full whitespace-nowrap text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all duration-300 ${activeCategory === 'apocrypha' ? 'bg-[#bf953f] text-[#1a100e] shadow-[0_0_10px_#bf953f]' : 'bg-[#2d1b18] text-[#8d6e63] border border-[#3e2723] hover:text-[#e0c9a6]'}`}
                    >
                        <Library size={14} /> Apócrifos
                    </button>
                    <button 
                        onClick={() => handleCategoryChange('ellen')} 
                        className={`px-4 py-2 rounded-full whitespace-nowrap text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all duration-300 ${activeCategory === 'ellen' ? 'bg-[#bf953f] text-[#1a100e] shadow-[0_0_10px_#bf953f]' : 'bg-[#2d1b18] text-[#8d6e63] border border-[#3e2723] hover:text-[#e0c9a6]'}`}
                    >
                        <Feather size={14} /> Ellen G. White
                    </button>
                    <button 
                        onClick={() => handleCategoryChange('bunyan')} 
                        className={`px-4 py-2 rounded-full whitespace-nowrap text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all duration-300 ${activeCategory === 'bunyan' ? 'bg-[#bf953f] text-[#1a100e] shadow-[0_0_10px_#bf953f]' : 'bg-[#2d1b18] text-[#8d6e63] border border-[#3e2723] hover:text-[#e0c9a6]'}`}
                    >
                        <BookKey size={14} /> John Bunyan
                    </button>
                    <button 
                        onClick={() => handleCategoryChange('rodrigo')} 
                        className={`px-4 py-2 rounded-full whitespace-nowrap text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all duration-300 ${activeCategory === 'rodrigo' ? 'bg-[#bf953f] text-[#1a100e] shadow-[0_0_10px_#bf953f]' : 'bg-[#2d1b18] text-[#8d6e63] border border-[#3e2723] hover:text-[#e0c9a6]'}`}
                    >
                        <Pickaxe size={14} /> Rodrigo Silva
                    </button>
                    <button 
                        onClick={() => handleCategoryChange('ferguson')} 
                        className={`px-4 py-2 rounded-full whitespace-nowrap text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all duration-300 ${activeCategory === 'ferguson' ? 'bg-[#bf953f] text-[#1a100e] shadow-[0_0_10px_#bf953f]' : 'bg-[#2d1b18] text-[#8d6e63] border border-[#3e2723] hover:text-[#e0c9a6]'}`}
                    >
                        <Flame size={14} /> Sinclair Ferguson
                    </button>
                     <button 
                        onClick={() => handleCategoryChange('finney')} 
                        className={`px-4 py-2 rounded-full whitespace-nowrap text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all duration-300 ${activeCategory === 'finney' ? 'bg-[#bf953f] text-[#1a100e] shadow-[0_0_10px_#bf953f]' : 'bg-[#2d1b18] text-[#8d6e63] border border-[#3e2723] hover:text-[#e0c9a6]'}`}
                    >
                        <GraduationCap size={14} /> Charles Finney
                    </button>
                    <button 
                        onClick={() => handleCategoryChange('michelson')} 
                        className={`px-4 py-2 rounded-full whitespace-nowrap text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all duration-300 ${activeCategory === 'michelson' ? 'bg-[#bf953f] text-[#1a100e] shadow-[0_0_10px_#bf953f]' : 'bg-[#2d1b18] text-[#8d6e63] border border-[#3e2723] hover:text-[#e0c9a6]'}`}
                    >
                        <Globe size={14} /> Michelson Borges
                    </button>
                </div>
            )}
        </div>
        
        {/* Content */}
        <div className="flex-1 relative z-10 overflow-y-auto">
            {loading && (
                <div className="text-center py-20 flex flex-col items-center">
                    <Loader2 className="animate-spin text-[#bf953f] mb-4" size={40} />
                    <p className="text-[#8d6e63] animate-pulse font-serif">Carregando sabedoria...</p>
                </div>
            )}
            
            {!loading && viewState === 'books' && (
                <div className="animate-in fade-in duration-500">
                    {/* Visualização Especial para Bíblia Sagrada (Capa Única) */}
                    {activeCategory === 'bible' && (
                        !bibleExpanded ? (
                            <div className="p-4 flex flex-col items-center justify-center min-h-[50vh] animate-in zoom-in duration-500">
                                <button 
                                    onClick={() => { playClickSound(); setBibleExpanded(true); }}
                                    className="group relative w-full max-w-xs aspect-[2/3] bg-[#1a100e] border-2 border-[#3e2723] rounded-xl shadow-[0_0_30px_rgba(62,39,35,0.5)] flex flex-col items-center justify-between p-8 hover:scale-105 hover:border-[#bf953f] transition-all duration-500"
                                >
                                    {/* Detalhes da Capa */}
                                    <div className="absolute inset-3 border border-[#3e2723]/50 rounded-lg pointer-events-none"></div>
                                    <div className="absolute top-0 bottom-0 left-4 w-[2px] bg-[#2d1b18] opacity-50"></div>
                                    
                                    <div className="mt-8 text-[#bf953f] group-hover:text-[#fcf6ba] transition-colors transform group-hover:scale-110 duration-500">
                                        <BookOpen size={64} strokeWidth={1} />
                                    </div>
                                    
                                    <div className="text-center">
                                        <h2 className="text-3xl font-title font-bold text-[#e0c9a6] uppercase tracking-[0.2em] leading-tight group-hover:text-[#fcf6ba] transition-colors drop-shadow-md">
                                            Bíblia<br/>Sagrada
                                        </h2>
                                        <div className="mt-4 h-[1px] w-16 bg-[#bf953f] mx-auto opacity-50"></div>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <p className="text-[#8d6e63] font-serif italic text-xs mb-4 text-center group-hover:text-[#bf953f] transition-colors">
                                            Antigo e Novo Testamento
                                        </p>
                                        <div className="px-6 py-2 bg-[#bf953f]/10 border border-[#bf953f]/30 rounded-full text-[#bf953f] text-[10px] font-bold uppercase tracking-widest text-center group-hover:bg-[#bf953f] group-hover:text-[#1a100e] transition-all">
                                            Abrir
                                        </div>
                                    </div>
                                </button>
                            </div>
                        ) : (
                            <div>
                                <div className="px-4 pb-2 pt-2 sticky top-0 bg-[#1a100e]/95 backdrop-blur z-30 flex items-center">
                                    <button 
                                        onClick={() => { playClickSound(); setBibleExpanded(false); }} 
                                        className="text-xs text-[#bf953f] hover:text-[#fcf6ba] flex items-center gap-1 uppercase tracking-wider font-bold py-2 px-3 rounded-lg hover:bg-[#3e2723] transition-colors"
                                    >
                                        <ArrowLeft size={14}/> Fechar Bíblia
                                    </button>
                                </div>
                                {renderBookGrid(BIBLE_BOOKS)}
                            </div>
                        )
                    )}

                    {activeCategory === 'apocrypha' && renderBookGrid(APOCRYPHA_BOOKS)}
                    {activeCategory === 'ellen' && renderBookGrid(ELLEN_WHITE_BOOKS)}
                    {activeCategory === 'rodrigo' && renderBookGrid(RODRIGO_SILVA_BOOKS)}
                    {activeCategory === 'michelson' && renderBookGrid(MICHELSON_BORGES_BOOKS)}
                    {activeCategory === 'bunyan' && renderBookGrid(JOHN_BUNYAN_BOOKS)}
                    {activeCategory === 'ferguson' && renderBookGrid(SINCLAIR_FERGUSON_BOOKS)}
                    {activeCategory === 'finney' && renderBookGrid(CHARLES_FINNEY_BOOKS)}
                </div>
            )}

            {!loading && viewState === 'chapters' && selectedBook && (
                <div className="p-4 grid grid-cols-5 gap-3 animate-in zoom-in duration-300">
                    {Array.from({length: selectedBook.chapters}, (_, i) => i+1).map(c => (
                        <button key={c} onClick={() => {playClickSound(); window.location.hash = `bible/${selectedBook.name}/${c}`}} className="aspect-square bg-[#2d1b18]/80 border border-[#3e2723] text-[#e0c9a6] rounded-xl flex items-center justify-center font-bold font-title text-lg hover:bg-[#bf953f] hover:text-[#1a100e] hover:scale-110 transition-all shadow-md">
                            {c}
                        </button>
                    ))}
                </div>
            )}

            {!loading && viewState === 'verses' && chapterData && (
                 <div 
                    className={`pb-32 px-4 pt-4 max-w-2xl mx-auto animate-page-flip ${
                        (activeCategory !== 'bible' && activeCategory !== 'apocrypha') 
                        ? 'secure-content select-none' 
                        : ''
                    }`}
                    onContextMenu={(e) => {
                        if (activeCategory !== 'bible' && activeCategory !== 'apocrypha') e.preventDefault();
                    }}
                 >
                    {activeCategory !== 'bible' && activeCategory !== 'apocrypha' && (
                        <div className="mb-6 flex flex-col items-center justify-center gap-2 text-xs text-red-400 opacity-70 p-4 border border-red-900/30 rounded-lg bg-red-900/10">
                            <div className="flex items-center gap-2">
                                <Lock size={14} /> 
                                <span className="uppercase tracking-widest font-bold">Conteúdo Protegido</span>
                            </div>
                            <p className="text-center font-serif italic">Para preservar a propriedade intelectual do autor, cópias e capturas de tela estão desabilitadas.</p>
                        </div>
                    )}

                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-title font-bold text-[#fcf6ba] drop-shadow-md">{chapterData.book}</h2>
                        <div className="inline-block mt-2 px-4 py-1 rounded-full border border-[#3e2723] bg-[#1a100e]">
                            <span className="text-sm font-serif text-[#bf953f] italic">Capítulo {chapterData.chapter}</span>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        {chapterData.verses.map((v) => {
                            const isSelected = activeVerse?.verse === v.verse;
                            const hasNote = userNotes[`${chapterData.book}-${chapterData.chapter}-${v.verse}`];
                            return (
                                <div 
                                    key={v.verse}
                                    onClick={() => handleVerseClick(v)}
                                    className={`relative p-4 rounded-xl transition-all duration-300 cursor-pointer border ${isSelected ? 'bg-[#3e2723]/90 text-[#fcf6ba] border-[#bf953f] shadow-[0_0_15px_rgba(191,149,63,0.2)] scale-[1.01]' : 'hover:bg-[#2d1b18]/60 text-[#e0c9a6] border-transparent hover:border-[#3e2723]'}`}
                                >
                                    <span className={`absolute top-4 left-2 text-[10px] font-bold ${isSelected ? 'text-[#bf953f]' : 'text-[#5d4037]'}`}>{v.verse}</span>
                                    <p className="font-serif text-lg leading-loose pl-6 text-justify">{v.text}</p>
                                    {hasNote && (
                                        <div className="mt-3 text-sm italic text-[#bf953f] border-t border-[#bf953f]/30 pt-2 flex gap-2">
                                            <MessageSquare size={14} /> {hasNote}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                 </div>
            )}
        </div>

        {/* Minimalist Floating Action Bar */}
        {activeVerse && (
            <div className="fixed bottom-16 left-1/2 -translate-x-1/2 bg-[#3e2723] text-[#fcf6ba] rounded-full px-6 py-3 shadow-[0_0_20px_rgba(0,0,0,0.8)] border border-[#bf953f] flex items-center gap-6 animate-in slide-in-from-bottom-10 z-30 mb-4 backdrop-blur-xl">
                <button onClick={toggleSpeech} className="flex flex-col items-center gap-1 active:scale-90 transition-transform hover:text-white" aria-label="Ouvir verso">
                    {speakingVerse ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <div className="w-[1px] h-8 bg-[#bf953f]/30"></div>
                
                {/* Botão de Marcador/Salvar Leitura (Disponível para todos) */}
                <button onClick={handleBookmark} className="flex flex-col items-center gap-1 active:scale-90 transition-transform hover:text-white" aria-label="Marcar página">
                    <Bookmark size={20} />
                </button>
                <div className="w-[1px] h-8 bg-[#bf953f]/30"></div>

                {/* Botões protegidos para conteúdos extra-bíblicos */}
                {(activeCategory === 'bible' || activeCategory === 'apocrypha') ? (
                    <>
                        <button onClick={handleCopy} className="flex flex-col items-center gap-1 active:scale-90 transition-transform hover:text-white" aria-label="Copiar texto"><Copy size={20} /></button>
                        <div className="w-[1px] h-8 bg-[#bf953f]/30"></div>
                        <button onClick={() => { playClickSound(); setShowImageModal(true); }} className="flex flex-col items-center gap-1 active:scale-90 transition-transform hover:text-white" aria-label="Criar imagem"><ImageIcon size={20} /></button>
                        <div className="w-[1px] h-8 bg-[#bf953f]/30"></div>
                    </>
                ) : (
                    <>
                         <button disabled className="opacity-30 cursor-not-allowed flex flex-col items-center gap-1" aria-hidden="true"><Copy size={20} /></button>
                         <div className="w-[1px] h-8 bg-[#bf953f]/30"></div>
                         <button disabled className="opacity-30 cursor-not-allowed flex flex-col items-center gap-1" aria-hidden="true"><ImageIcon size={20} /></button>
                         <div className="w-[1px] h-8 bg-[#bf953f]/30"></div>
                    </>
                )}
                {/* Botão de Notas (Disponível para todos) */}
                <button onClick={handleNote} className="flex flex-col items-center gap-1 active:scale-90 transition-transform hover:text-white" aria-label="Criar nota"><MessageSquare size={20} /></button>
            </div>
        )}

        {/* Modals for Note and Image (Simplified reuse) */}
        {editingVerse && (
            <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                <div className="bg-[#1a100e] w-full max-w-md rounded-2xl p-6 border border-[#bf953f] shadow-2xl">
                    <h3 className="text-[#fcf6ba] font-bold mb-4 font-title uppercase tracking-widest">Anotação Pessoal</h3>
                    <textarea value={noteText} onChange={e => setNoteText(e.target.value)} className="w-full h-32 bg-[#2d1b18] border border-[#3e2723] rounded-xl p-4 text-[#e0c9a6] focus:border-[#bf953f] outline-none" placeholder="Escreva sua revelação aqui..." />
                    <div className="flex justify-end gap-3 mt-4">
                        <button onClick={() => setEditingVerse(null)} className="px-6 py-2 text-[#8d6e63] hover:text-[#e0c9a6]">Cancelar</button>
                        <button onClick={handleSaveNote} className="px-6 py-2 bg-[#bf953f] text-[#1a100e] font-bold rounded-lg hover:bg-[#fcf6ba] transition-colors">Salvar</button>
                    </div>
                </div>
            </div>
        )}
        
        {showImageModal && (
            <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 animate-in zoom-in">
                 <button onClick={() => setShowImageModal(false)} className="absolute top-4 right-4 text-white hover:text-red-400 transition-colors"><X size={32} /></button>
                 <canvas ref={canvasRef} className="hidden" />
                 {generatedImage ? <img src={generatedImage} className="w-full max-w-sm rounded-xl border-4 border-[#bf953f] shadow-[0_0_30px_rgba(191,149,63,0.3)]" alt="Versículo Gerado" /> : <Loader2 className="animate-spin text-[#bf953f]" size={48} />}
                 <div className="mt-8 flex gap-4">
                     {imageBackgrounds.map((bg, i) => <button key={i} onClick={() => setImageBgIndex(i)} className={`w-10 h-10 rounded-full border-2 ${imageBgIndex === i ? 'border-[#bf953f] scale-110' : 'border-gray-600'} transition-all`} style={{background: bg.includes('url') ? '#333' : bg}} aria-label={`Mudar fundo ${i + 1}`} />)}
                 </div>
                 <button onClick={handleShareImage} className="mt-8 py-4 px-10 bg-[#bf953f] text-[#1a100e] font-bold rounded-full uppercase tracking-widest hover:bg-[#fcf6ba] hover:scale-105 transition-all shadow-lg flex items-center gap-2">
                    <Share2 size={20} /> Compartilhar
                 </button>
            </div>
        )}
    </div>
  );
};

export default BibleReader;