import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Play, Pause, BookA } from 'lucide-react';
import { fetchDictionaryDefinition } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { playClickSound } from '../constants';

interface DictionaryProps {
  onBack: () => void;
}

const Dictionary: React.FC<DictionaryProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [definition, setDefinition] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    playClickSound();

    // Stop any existing speech
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    setLoading(true);
    setDefinition(null);
    
    try {
      const result = await fetchDictionaryDefinition(searchTerm);
      setDefinition(result);
    } catch (error) {
      setDefinition("Erro ao buscar definição. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSpeech = () => {
    playClickSound();
    if (!definition) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      
      // Remove basic markdown symbols for cleaner speech
      const cleanText = definition.replace(/[*#_`]/g, '');
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'pt-BR';
      
      const voices = window.speechSynthesis.getVoices();
      const ptVoice = voices.find(v => v.lang === 'pt-BR');
      if (ptVoice) utterance.voice = ptVoice;

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1a100e] text-[#e0c9a6] relative overflow-hidden">
        {/* Background Texture & Effects */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-40 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#3e2723]/30 via-transparent to-black pointer-events-none"></div>

       {/* Header - Left Spacer for Global X */}
       <div className="bg-[#1a100e]/95 backdrop-blur border-b border-[#3e2723] p-4 flex items-center justify-between shadow-lg sticky top-0 z-20">
        <div className="flex items-center">
          <div className="w-10"></div> {/* Placeholder for Global X */}
          <h1 className="text-lg font-title font-bold text-[#fcf6ba] uppercase tracking-wider ml-2">Dicionário Bíblico</h1>
        </div>
        <BookA size={24} className="text-[#bf953f]" />
      </div>

      <div className="p-6 max-w-2xl mx-auto w-full flex-1 flex flex-col relative z-10">
        <div className="text-center mb-8">
            <Sparkles className="mx-auto text-[#bf953f] mb-2" size={32} />
            <p className="font-serif text-[#8d6e63]">Digite um termo, nome ou lugar bíblico para descobrir seu significado profundo.</p>
        </div>

        <form onSubmit={handleSearch} className="relative mb-8">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ex: Graça, Arca da Aliança, Melquisedeque..."
            className="w-full p-4 pl-5 pr-12 rounded-full border border-[#3e2723] focus:border-[#bf953f] focus:ring-1 focus:ring-[#bf953f] shadow-inner font-serif text-lg outline-none transition-colors bg-[#2d1b18] text-[#fcf6ba] placeholder-[#5d4037]"
          />
          <button 
            type="submit"
            className="absolute right-2 top-2 p-2 bg-[#3e2723] text-[#bf953f] rounded-full hover:bg-[#bf953f] hover:text-[#1a100e] transition-colors active:scale-95 shadow-lg"
          >
            <Search size={24} />
          </button>
        </form>

        {loading && (
             <div className="flex flex-col items-center justify-center py-12">
                <div className="w-10 h-10 border-4 border-[#bf953f] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[#8d6e63] font-serif animate-pulse italic">Consultando os pergaminhos...</p>
             </div>
        )}

        {definition && !loading && (
          <div className="p-6 rounded-xl shadow-2xl border border-[#3e2723] bg-[#2d1b18]/90 backdrop-blur transition-all duration-300 animate-in slide-in-from-bottom-4">
             <div className="flex justify-between items-start border-b border-[#3e2723] pb-2 mb-4">
               <h3 className="text-2xl font-bold font-title capitalize text-[#fcf6ba]">{searchTerm}</h3>
               <button 
                  onClick={toggleSpeech}
                  className="p-2 rounded-full transition-colors active:scale-95 hover:bg-[#3e2723] text-[#bf953f]"
                  title={isSpeaking ? "Parar leitura" : "Ouvir definição"}
               >
                 {isSpeaking ? <Pause size={24} /> : <Play size={24} />}
               </button>
             </div>
             <div className="prose prose-invert prose-p:text-[#e0c9a6] prose-strong:text-[#bf953f] font-serif leading-relaxed max-w-none">
               <ReactMarkdown>{definition}</ReactMarkdown>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dictionary;