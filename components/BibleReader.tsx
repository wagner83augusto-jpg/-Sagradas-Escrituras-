import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BIBLE_BOOKS } from '../constants';
import { Book as BookType, ChapterData, BibleViewState, Verse, BibleVersion, UserNotesMap, SearchResult } from '../types';
import { fetchChapterContent, searchBible } from '../services/geminiService';
import { Share2, Play, Pause, BookOpen, Bookmark, Check, ChevronDown, ChevronRight, MessageSquare, Save, Trash2, X, Pencil, Search, Globe, Loader2, AlertTriangle, Type, Image as ImageIcon, Copy, Download } from 'lucide-react';
import { playClickSound } from '../constants';

interface BibleReaderProps {
  onBackToMenu: () => void;
}

interface LastReadData {
  bookName: string;
  chapter: number;
}

type FontSize = 'small' | 'medium' | 'large';

const VERSIONS: { id: BibleVersion; name: string }[] = [
  { id: 'ACF', name: 'Almeida Corrigida Fiel' },
  { id: 'ARA', name: 'Almeida Revista e Atualizada' },
  { id: 'NVI', name: 'Nova Versão Internacional' },
  { id: 'NTLH', name: 'Nova Tradução na Ling. de Hoje' },
];

// Helper para desenhar texto no canvas (wrap text)
const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const words = text.split(' ');
    let line = '';
    let testLine = '';
    let lineArray = [];

    for(let n = 0; n < words.length; n++) {
        testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            lineArray.push({text: line, x: x, y: y});
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    lineArray.push({text: line, x: x, y: y});
    return { lines: lineArray, finalY: y };
};

const BibleReader: React.FC<BibleReaderProps> = ({ onBackToMenu }) => {
  // -- ROUTER LOGIC --
  const hash = window.location.hash;
  const parts = hash.replace('#', '').split('/').map(part => decodeURIComponent(part));
  
  const bookNameParam = parts[1];
  const chapterParam = parts[2];

  const selectedBook = BIBLE_BOOKS.find(b => b.name === bookNameParam) || null;
  const selectedChapter = chapterParam ? parseInt(chapterParam, 10) : null;

  let viewState: BibleViewState = 'books';
  if (selectedBook) {
    viewState = selectedChapter ? 'verses' : 'chapters';
  }

  // -- STATE --
  const [chapterData, setChapterData] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(false);
  const [speakingVerse, setSpeakingVerse] = useState<number | null>(null);
  
  // Selection State (Minimalist Mode)
  const [activeVerse, setActiveVerse] = useState<Verse | null>(null); // Clicked verse
  
  // Image Generation State
  const [showImageModal, setShowImageModal] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageBgIndex, setImageBgIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [lastRead, setLastRead] = useState<LastReadData | null>(() => {
    try {
      const saved = localStorage.getItem('bible_last_read');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });
  
  const [currentVersion, setCurrentVersion] = useState<BibleVersion>(() => {
    const saved = localStorage.getItem('bible_version_pref');
    return (saved && VERSIONS.some(v => v.id === saved)) ? saved as BibleVersion : 'ACF';
  });
  
  const [fontSize, setFontSize] = useState<FontSize>('medium');
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

  // Clean up selection on nav
  useEffect(() => {
      setActiveVerse(null);
      setSpeakingVerse(null);
      window.speechSynthesis.cancel();
  }, [hash, selectedBook, selectedChapter]);

  // Fetch Logic
  useEffect(() => {
    if (viewState === 'verses' && selectedBook && selectedChapter) {
      setLoading(true);
      setChapterData(null);
      
      const newLastRead = { bookName: selectedBook.name, chapter: selectedChapter };
      localStorage.setItem('bible_last_read', JSON.stringify(newLastRead));
      setLastRead(newLastRead);

      // Simple Fetch (ignoring complex offline logic for this snippet to focus on UI)
      fetchChapterContent(selectedBook.name, selectedChapter, currentVersion)
        .then(data => setChapterData(data))
        .catch(e => console.error(e))
        .finally(() => setLoading(false));
    }
  }, [selectedBook?.name, selectedChapter, viewState, currentVersion]);

  // -- HANDLERS --

  const handleVerseClick = (verse: Verse) => {
      // Toggle selection
      if (activeVerse?.verse === verse.verse) {
          setActiveVerse(null);
      } else {
          playClickSound();
          setActiveVerse(verse);
      }
  };

  const handleVerseKeyDown = (e: React.KeyboardEvent, verse: Verse) => {
      if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleVerseClick(verse);
      }
  };

  const handleCopy = () => {
      if (!activeVerse) return;
      const text = `${selectedBook?.name} ${selectedChapter}:${activeVerse.verse} - "${activeVerse.text}"`;
      navigator.clipboard.writeText(text);
      alert('Versículo copiado!');
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

  // -- SPEECH --
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

  // -- IMAGE GENERATION --
  const imageBackgrounds = [
      'linear-gradient(135deg, #3e2723 0%, #1a100e 100%)', // Dark Leather
      'linear-gradient(135deg, #bf953f 0%, #fcf6ba 50%, #aa771c 100%)', // Gold
      'linear-gradient(to bottom, #0f2027, #203a43, #2c5364)', // Night
      'linear-gradient(to right, #c6ffdd, #fbd786, #f7797d)', // Sunrise
      'url("https://www.transparenttextures.com/patterns/black-linen.png")' // Texture
  ];

  const generateImage = useCallback(() => {
      if (!activeVerse || !canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Settings
      const width = 1080;
      const height = 1080;
      canvas.width = width;
      canvas.height = height;

      // Background
      if (imageBackgrounds[imageBgIndex].includes('url')) {
          ctx.fillStyle = '#1a100e';
          ctx.fillRect(0, 0, width, height);
      } else {
          const gradient = ctx.createLinearGradient(0, 0, width, height);
          if (imageBgIndex === 1) { // Gold
             gradient.addColorStop(0, '#bf953f');
             gradient.addColorStop(0.5, '#fcf6ba');
             gradient.addColorStop(1, '#aa771c');
             ctx.fillStyle = gradient;
          } else if (imageBgIndex === 2) { // Night
             gradient.addColorStop(0, '#0f2027');
             gradient.addColorStop(1, '#2c5364');
             ctx.fillStyle = gradient;
          } else if (imageBgIndex === 3) {
             gradient.addColorStop(0, '#c6ffdd');
             gradient.addColorStop(1, '#f7797d');
             ctx.fillStyle = gradient;
          } else {
             ctx.fillStyle = '#3e2723';
          }
          ctx.fillRect(0, 0, width, height);
      }

      // Text Config
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const textColor = imageBgIndex === 1 || imageBgIndex === 3 ? '#3e2723' : '#fcf6ba';
      
      // Verse Text
      ctx.font = 'bold 60px "Cinzel"'; // Using Cinzel equivalent if available, or serif
      ctx.fillStyle = textColor;
      
      // Quotes
      ctx.font = '120px serif';
      ctx.globalAlpha = 0.3;
      ctx.fillText('“', width/2, 200);
      ctx.globalAlpha = 1.0;

      // Wrap Body Text
      ctx.font = 'italic 48px serif';
      const textLines = wrapText(ctx, activeVerse.text, width/2, height/2 - 100, 900, 70);
      
      textLines.lines.forEach(line => {
          ctx.fillText(line.text, line.x, line.y);
      });

      // Reference
      ctx.font = 'bold 40px sans-serif';
      ctx.fillText(`${selectedBook?.name} ${selectedChapter}:${activeVerse.verse}`, width/2, height - 150);
      
      // Footer
      ctx.font = '24px sans-serif';
      ctx.globalAlpha = 0.7;
      ctx.fillText('Bíblia IASD', width/2, height - 80);

      setGeneratedImage(canvas.toDataURL('image/png'));

  }, [activeVerse, imageBgIndex, selectedBook, selectedChapter]);

  useEffect(() => {
      if (showImageModal) {
          // Small delay to ensure font/canvas is ready
          setTimeout(generateImage, 100);
      }
  }, [showImageModal, imageBgIndex, generateImage]);

  const handleShareImage = async () => {
      if (!generatedImage) return;
      
      try {
          const blob = await (await fetch(generatedImage)).blob();
          const file = new File([blob], 'versiculo.png', { type: 'image/png' });
          
          if (navigator.share) {
              await navigator.share({
                  files: [file],
                  title: 'Versículo Bíblico'
              });
          } else {
              // Fallback download
              const a = document.createElement('a');
              a.href = generatedImage;
              a.download = 'versiculo.png';
              a.click();
          }
          setShowImageModal(false);
          setActiveVerse(null);
      } catch (e) {
          console.error(e);
          alert('Erro ao compartilhar imagem.');
      }
  };

  // -- RENDER --

  const renderVerses = () => (
      <div className="pb-32 px-4 pt-4 max-w-2xl mx-auto" role="list">
          {/* Header Minimalista */}
          <div className="text-center mb-8">
              <h2 className="text-3xl font-title font-bold text-[#fcf6ba]">{chapterData?.book}</h2>
              <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="h-[1px] w-8 bg-[#bf953f]"></span>
                  <span className="text-xl font-serif text-[#8d6e63]">{chapterData?.chapter}</span>
                  <span className="h-[1px] w-8 bg-[#bf953f]"></span>
              </div>
          </div>

          {chapterData?.verses.map((v) => {
              const isSelected = activeVerse?.verse === v.verse;
              const hasNote = userNotes[`${chapterData.book}-${chapterData.chapter}-${v.verse}`];

              return (
                  <div 
                    key={v.verse}
                    onClick={() => handleVerseClick(v)}
                    onKeyDown={(e) => handleVerseKeyDown(e, v)}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    aria-label={`Versículo ${v.verse}: ${v.text}. Toque para opções.`}
                    className={`relative mb-4 p-4 rounded-lg transition-all duration-500 ease-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#bf953f]
                        ${isSelected 
                            ? 'bg-[#3e2723] text-[#fcf6ba] shadow-[0_10px_40px_-10px_rgba(191,149,63,0.3)] scale-[1.03] border border-[#bf953f] translate-x-1 z-10' 
                            : 'hover:bg-[#2d1b18] text-[#e0c9a6] border border-transparent hover:translate-x-1'
                        }
                    `}
                  >
                      <sup className={`mr-2 font-bold text-xs ${isSelected ? 'text-[#bf953f]' : 'text-[#8d6e63]'}`}>{v.verse}</sup>
                      <span className={`font-serif text-lg leading-relaxed ${hasNote ? 'underline decoration-dotted decoration-[#bf953f]' : ''}`}>
                          {v.text}
                      </span>
                      {hasNote && isSelected && (
                          <div className="mt-2 text-sm italic text-[#bf953f] bg-black/20 p-2 rounded animate-in fade-in slide-in-from-top-2">
                              Nota: {hasNote}
                          </div>
                      )}
                  </div>
              )
          })}
      </div>
  );

  return (
    <div className="min-h-screen bg-[#1a100e] flex flex-col relative overflow-hidden">
        {/* Background Texture & Effects */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-40 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#3e2723]/30 via-transparent to-black pointer-events-none"></div>

        {/* Simple Top Bar - With placeholder left for Global X */}
        <div className="sticky top-0 bg-[#1a100e]/95 backdrop-blur z-10 border-b border-[#3e2723] flex items-center justify-between p-4 shadow-lg">
            <div className="w-10"></div> {/* Placeholder for Global X */}
            <div className="text-[#fcf6ba] font-bold font-title truncate px-2">
                {selectedBook ? selectedBook.name : 'Bíblia'}
            </div>
            <div className="w-10"></div>
        </div>
        
        {/* Content */}
        <div className="flex-1 relative z-10">
            {loading && (
                <div className="text-center py-20 flex flex-col items-center">
                    <div className="w-12 h-12 border-2 border-[#bf953f] border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-[#8d6e63] animate-pulse">Consultando as Escrituras...</p>
                </div>
            )}
            
            {!loading && viewState === 'books' && (
                <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {BIBLE_BOOKS.map(b => (
                        <button key={b.name} onClick={() => {playClickSound(); window.location.hash = `bible/${b.name}`}} className="p-4 bg-[#2d1b18]/80 border border-[#3e2723] text-[#e0c9a6] rounded shadow-sm hover:border-[#bf953f] hover:bg-[#3e2723] hover:text-[#fcf6ba] transition-all focus:outline-none focus:ring-2 focus:ring-[#bf953f]">
                            {b.name}
                        </button>
                    ))}
                </div>
            )}

            {!loading && viewState === 'chapters' && selectedBook && (
                <div className="p-4 grid grid-cols-5 gap-3">
                    {Array.from({length: selectedBook.chapters}, (_, i) => i+1).map(c => (
                        <button key={c} onClick={() => {playClickSound(); window.location.hash = `bible/${selectedBook.name}/${c}`}} className="aspect-square bg-[#2d1b18]/80 border border-[#3e2723] text-[#e0c9a6] rounded flex items-center justify-center font-bold hover:bg-[#bf953f] hover:text-[#1a100e] hover:border-[#fcf6ba] transition-all focus:outline-none focus:ring-2 focus:ring-[#bf953f]">
                            {c}
                        </button>
                    ))}
                </div>
            )}

            {!loading && viewState === 'verses' && renderVerses()}
        </div>

        {/* Minimalist Floating Action Bar (When Verse Selected) */}
        {activeVerse && (
            <div className="fixed bottom-16 left-1/2 -translate-x-1/2 bg-[#3e2723] text-[#fcf6ba] rounded-full px-6 py-3 shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-[#bf953f] flex items-center gap-6 animate-in slide-in-from-bottom-10 z-30 mb-4" role="toolbar" aria-label="Opções do Versículo">
                <button onClick={toggleSpeech} className="flex flex-col items-center gap-1 active:scale-90 transition-transform focus:outline-none focus:text-[#bf953f]" aria-label={speakingVerse ? "Pausar leitura" : "Ouvir versículo"}>
                    {speakingVerse ? <Pause size={20} /> : <Play size={20} />}
                    <span className="text-[9px] uppercase font-bold text-[#bf953f]" aria-hidden="true">Ouvir</span>
                </button>
                <div className="w-[1px] h-8 bg-[#bf953f]/30"></div>
                <button onClick={handleCopy} className="flex flex-col items-center gap-1 active:scale-90 transition-transform focus:outline-none focus:text-[#bf953f]" aria-label="Copiar texto">
                    <Copy size={20} />
                    <span className="text-[9px] uppercase font-bold text-[#bf953f]" aria-hidden="true">Copiar</span>
                </button>
                <div className="w-[1px] h-8 bg-[#bf953f]/30"></div>
                <button onClick={() => { playClickSound(); setShowImageModal(true); }} className="flex flex-col items-center gap-1 active:scale-90 transition-transform focus:outline-none focus:text-[#bf953f]" aria-label="Criar card de imagem">
                    <ImageIcon size={20} />
                    <span className="text-[9px] uppercase font-bold text-[#bf953f]" aria-hidden="true">Card</span>
                </button>
                <div className="w-[1px] h-8 bg-[#bf953f]/30"></div>
                <button onClick={handleNote} className="flex flex-col items-center gap-1 active:scale-90 transition-transform focus:outline-none focus:text-[#bf953f]" aria-label="Adicionar nota pessoal">
                    <MessageSquare size={20} />
                    <span className="text-[9px] uppercase font-bold text-[#bf953f]" aria-hidden="true">Nota</span>
                </button>
            </div>
        )}

        {/* Note Editor Modal */}
        {editingVerse && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="note-title">
                <div className="bg-[#1a100e] w-full max-w-md rounded-lg p-4 border border-[#bf953f] shadow-2xl animate-in zoom-in duration-300">
                    <h3 id="note-title" className="font-bold text-[#fcf6ba] mb-2">Sua Anotação</h3>
                    <textarea 
                        value={noteText}
                        onChange={e => setNoteText(e.target.value)}
                        className="w-full h-32 bg-[#2d1b18] border border-[#3e2723] rounded p-2 text-[#e0c9a6] focus:outline-none focus:border-[#bf953f]"
                        placeholder="Escreva algo..."
                        aria-label="Texto da nota"
                    />
                    <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => setEditingVerse(null)} className="px-4 py-2 text-[#8d6e63] hover:text-[#e0c9a6] rounded">Cancelar</button>
                        <button onClick={handleSaveNote} className="px-4 py-2 bg-[#bf953f] text-[#1a100e] font-bold rounded hover:bg-[#d4a74c]">Salvar</button>
                    </div>
                </div>
            </div>
        )}

        {/* Image Generator Modal */}
        {showImageModal && (
            <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Gerador de Imagem">
                <div className="relative w-full max-w-sm">
                    <button onClick={() => setShowImageModal(false)} className="absolute -top-12 right-0 text-white p-2" aria-label="Fechar">
                        <X size={24} />
                    </button>
                    
                    {/* Hidden Canvas for Generation */}
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {/* Live Preview */}
                    {generatedImage ? (
                        <img src={generatedImage} alt="Prévia da imagem com versículo gerada" className="w-full rounded shadow-2xl border-4 border-[#bf953f]" />
                    ) : (
                        <div className="w-full aspect-square bg-[#1a100e] flex items-center justify-center text-[#bf953f]">
                            <Loader2 className="animate-spin" />
                        </div>
                    )}

                    {/* Controls */}
                    <div className="mt-6 flex justify-center gap-3">
                        {imageBackgrounds.map((bg, idx) => (
                            <button 
                                key={idx}
                                onClick={() => setImageBgIndex(idx)}
                                className={`w-8 h-8 rounded-full border-2 ${imageBgIndex === idx ? 'border-white scale-110' : 'border-transparent'}`}
                                style={{ background: bg.includes('url') ? '#000' : bg }}
                                aria-label={`Selecionar fundo ${idx + 1}`}
                            />
                        ))}
                    </div>

                    <button 
                        onClick={handleShareImage}
                        className="w-full mt-6 py-4 bg-[#bf953f] text-[#1a100e] font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-[#d4a74c]"
                    >
                        <Share2 size={20} /> Compartilhar Imagem
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default BibleReader;