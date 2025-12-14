import React, { useState, useEffect } from 'react';
import { APOCRYPHA_BOOKS } from '../constants';
import { ChapterData, BibleViewState } from '../types';
import { fetchApocryphaContent } from '../services/geminiService';
import { Scroll, AlertCircle, ChevronRight, Book } from 'lucide-react';
import { playClickSound } from '../constants';

interface Props {
  onBackToMenu: () => void;
}

const ApocryphaReader: React.FC<Props> = ({ onBackToMenu }) => {
  const hash = window.location.hash;
  const parts = hash.replace('#', '').split('/').map(part => decodeURIComponent(part));
  
  const bookNameParam = parts[1];
  const chapterParam = parts[2];

  const selectedBook = APOCRYPHA_BOOKS.find(b => b.name === bookNameParam) || null;
  const selectedChapter = chapterParam ? parseInt(chapterParam, 10) : null;

  let viewState: BibleViewState = 'books';
  if (selectedBook) {
    viewState = selectedChapter ? 'verses' : 'chapters';
  }

  const [chapterData, setChapterData] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (viewState === 'verses' && selectedBook && selectedChapter) {
      setLoading(true);
      setChapterData(null);
      
      fetchApocryphaContent(selectedBook.name, selectedChapter)
        .then(data => setChapterData(data))
        .catch(e => console.error(e))
        .finally(() => setLoading(false));
    }
  }, [selectedBook?.name, selectedChapter, viewState]);

  // Componente de Botão Estilizado (Igual ao Menu)
  const BookButton = ({ label, desc, onClick, index }: any) => (
    <button
      onClick={onClick}
      style={{ animationDelay: `${index * 80}ms` }}
      className="group relative w-full flex items-center gap-4 p-5 bg-[#1a100e]/80 backdrop-blur-md border border-[#3e2723] rounded-2xl shadow-lg hover:bg-[#2d1b18] hover:border-[#bf953f] hover:scale-[1.02] transition-all duration-300 animate-in slide-in-from-bottom-4 fade-in fill-mode-backwards focus:outline-none focus:ring-2 focus:ring-[#bf953f]"
    >
        <div className="absolute inset-0 bg-[#bf953f]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#bf953f] to-[#5d4037] rounded-full flex items-center justify-center text-[#1a100e] shadow-lg group-hover:rotate-12 transition-transform duration-300 z-10">
            <Scroll size={24} strokeWidth={2} />
        </div>
        
        <div className="flex-1 text-left flex flex-col z-10">
            <h3 className="text-lg font-title font-bold text-[#e0c9a6] group-hover:text-[#fcf6ba] tracking-wide uppercase leading-tight">
                {label}
            </h3>
            {desc && (
                <span className="text-[11px] text-[#8d6e63] font-serif italic mt-1 group-hover:text-[#bf953f] transition-colors">
                    {desc}
                </span>
            )}
        </div>

        <div className="text-[#5d4037] group-hover:text-[#bf953f] transition-colors opacity-70 z-10">
            <ChevronRight size={20} />
        </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#1a100e] flex flex-col relative text-[#e0c9a6] overflow-hidden">
        {/* Background Texture & Effects */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-40 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#3e2723]/30 via-transparent to-black pointer-events-none"></div>

        {/* Top Bar - Left Spacer for Global X */}
        <div className="sticky top-0 bg-[#1a100e]/95 backdrop-blur-md z-20 shadow-lg flex items-center justify-between p-4 border-b border-[#3e2723]">
            <div className="w-10"></div> {/* Placeholder for Global X */}
            <div className="font-bold font-title uppercase tracking-widest flex items-center gap-2 text-[#fcf6ba]">
                <Book size={18} />
                {selectedBook ? selectedBook.name : 'Livros Apócrifos'}
            </div>
            <div className="w-8"></div>
        </div>

        {/* Disclaimer Banner (Dark Mode) */}
        {viewState === 'books' && (
             <div className="relative z-10 bg-[#2d1b18] text-[#8d6e63] text-xs p-4 text-center border-b border-[#3e2723]">
                <p className="flex items-center justify-center gap-2 max-w-lg mx-auto leading-relaxed">
                    <AlertCircle size={14} className="flex-shrink-0 text-[#bf953f]" />
                    Estes livros não pertencem ao cânon bíblico protestante/adventista. Disponibilizados apenas para fins de pesquisa histórica e literária.
                </p>
             </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto relative z-10">
            {loading && (
                <div className="text-center py-20 text-[#5d4037] animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 border-2 border-[#bf953f] border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="font-serif italic text-[#8d6e63]">Desenrolando pergaminhos antigos...</p>
                </div>
            )}
            
            {!loading && viewState === 'books' && (
                <div className="p-6 flex flex-col gap-4 max-w-md mx-auto">
                    {APOCRYPHA_BOOKS.map((b, idx) => (
                        <BookButton 
                            key={b.name}
                            index={idx}
                            label={b.name}
                            desc={`${b.chapters} Capítulos disponíveis`}
                            onClick={() => {playClickSound(); window.location.hash = `apocrypha/${b.name}`}}
                        />
                    ))}
                </div>
            )}

            {!loading && viewState === 'chapters' && selectedBook && (
                <div className="p-6 max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-title font-bold text-[#fcf6ba] mb-2">{selectedBook.name}</h2>
                        <p className="text-xs text-[#8d6e63] uppercase tracking-widest">Selecione o Capítulo</p>
                    </div>
                    
                    <div className="grid grid-cols-5 md:grid-cols-8 gap-3">
                        {Array.from({length: selectedBook.chapters}, (_, i) => i+1).map((c, idx) => (
                            <button 
                                key={c} 
                                onClick={() => {playClickSound(); window.location.hash = `apocrypha/${selectedBook.name}/${c}`}} 
                                style={{ animationDelay: `${idx * 20}ms` }}
                                className="aspect-square bg-[#1a100e]/80 backdrop-blur border border-[#3e2723] rounded-lg flex items-center justify-center font-bold text-[#e0c9a6] hover:bg-[#bf953f] hover:text-[#1a100e] hover:border-[#fcf6ba] transition-all shadow-md animate-in zoom-in fill-mode-backwards"
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {!loading && viewState === 'verses' && chapterData && (
                 <div className="pb-32 px-6 pt-8 max-w-2xl mx-auto font-serif text-lg leading-relaxed text-justify animate-in fade-in">
                    <div className="text-center mb-10 pb-6 border-b border-[#3e2723]">
                        <h2 className="text-3xl font-title font-bold text-[#bf953f] mb-2">{chapterData.book}</h2>
                        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#2d1b18] border border-[#3e2723]">
                             <span className="text-sm font-serif text-[#a1887f] italic">Capítulo {chapterData.chapter}</span>
                        </div>
                    </div>
                    {chapterData.verses.map((v) => (
                        <span key={v.verse} className="hover:bg-[#bf953f]/10 transition-colors rounded px-1 inline-block">
                            <sup className="font-bold text-xs text-[#5d4037] mr-1 select-none">{v.verse}</sup>
                            <span className="text-[#e0c9a6]">{v.text}</span>
                            {" "}
                        </span>
                    ))}
                 </div>
            )}
        </div>
    </div>
  );
};

export default ApocryphaReader;