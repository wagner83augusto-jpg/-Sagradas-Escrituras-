import React, { useState } from 'react';
import { 
  BookOpen, BrainCircuit, MessageSquare, 
  Sparkles, Search, X, Volume2, StopCircle, Settings, ShieldAlert,
  GraduationCap, Radio, Library, ChevronRight, Music, Bot
} from 'lucide-react';
import { fetchDailyReflection, DailyReflection } from '../services/geminiService';
import { playClickSound } from '../constants';
import GlobalControls from './GlobalControls';

interface MainMenuProps {
  onNavigate: (view: string) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onNavigate }) => {
  const [dailyData, setDailyData] = useState<DailyReflection | null>(null);
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleOpenDaily = async () => {
    playClickSound();
    setShowDailyModal(true);
    if (!dailyData) {
        setLoadingDaily(true);
        try {
            const data = await fetchDailyReflection();
            setDailyData(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingDaily(false);
        }
    }
  };

  const handleDualVoiceRead = () => {
    if (!dailyData) return;

    if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
    }

    const text = `Versículo de hoje. ${dailyData.reference}. ${dailyData.text}. Reflexão. ${dailyData.reflection}`;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'pt-BR';
    u.onend = () => setIsSpeaking(false);
    
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang === 'pt-BR');
    if (ptVoice) u.voice = ptVoice;

    window.speechSynthesis.speak(u);
    setIsSpeaking(true);
  };

  const handleNav = (view: string) => {
    playClickSound();
    onNavigate(view);
  };

  // Botão customizado com efeito Vidro Fumê e Cascata
  const GlassButton = ({ icon, label, desc, onClick, index, variant }: any) => (
    <button
      onClick={onClick}
      style={{ animationDelay: `${index * 100}ms` }}
      className={`group relative w-full flex items-center gap-5 p-6 rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-500 ease-out animate-in slide-in-from-bottom-10 fade-in fill-mode-backwards hover:scale-[1.03]
        ${variant === 'admin' 
          ? 'bg-red-950/40 border-red-900/50 hover:bg-red-900/60' 
          : 'bg-[#1a100e]/60 border-[#3e2723]/50 hover:bg-[#2d1b18]/80 hover:border-[#bf953f]'}
      `}
    >
      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-[#bf953f]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

      {/* Icon Container */}
      <div className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:rotate-6
        ${variant === 'admin' ? 'bg-gradient-to-br from-red-900 to-red-950 text-red-200' : 'bg-gradient-to-br from-[#3e2723] to-[#1a100e] text-[#bf953f] group-hover:text-[#fcf6ba]'}
      `}>
         {icon}
      </div>

      {/* Text Content */}
      <div className="flex-1 text-left relative z-10">
         <h3 className={`text-lg font-title font-bold uppercase tracking-wider leading-tight mb-1
            ${variant === 'admin' ? 'text-red-200 group-hover:text-red-100' : 'text-[#e0c9a6] group-hover:text-[#fcf6ba]'}
         `}>
            {label}
         </h3>
         {desc && (
             <p className="text-xs font-serif italic text-[#8d6e63] group-hover:text-[#bf953f] transition-colors">
                {desc}
             </p>
         )}
      </div>

      {/* Chevron */}
      <div className={`relative z-10 opacity-50 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 ${variant === 'admin' ? 'text-red-500' : 'text-[#bf953f]'}`}>
          <ChevronRight size={24} />
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0c0504] text-[#e0c9a6] relative overflow-y-auto overflow-x-hidden flex flex-col items-center pb-10">
      
      {/* Background Texture - Couro/Textura */}
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-60 pointer-events-none"></div>
      <div className="fixed inset-0 bg-gradient-to-b from-[#3e2723]/20 via-transparent to-[#000000] pointer-events-none"></div>

      <GlobalControls />

      <header className="w-full pt-12 pb-6 text-center z-10 relative">
          <div className="w-20 h-1 bg-[#bf953f] mx-auto rounded-full mb-6 shadow-[0_0_10px_#bf953f]"></div>
          <h1 className="text-4xl md:text-5xl font-title font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#fcf6ba] to-[#bf953f] drop-shadow-lg tracking-[0.15em] uppercase">
              Sagradas<br/>Escrituras
          </h1>
          <p className="text-[#8d6e63] font-serif italic mt-3 text-sm tracking-widest">Explore a sabedoria divina</p>
      </header>

      {/* LISTA DE MENU CASCATA */}
      <div className="w-full max-w-lg px-6 flex flex-col gap-4 z-10">
          
          {/* 1. BÍBLIA SAGRADA */}
          <GlassButton 
             index={0}
             icon={<BookOpen size={28} />}
             label="📖 Bíblia Sagrada"
             desc="Antigo e Novo Testamento"
             onClick={() => handleNav('bible')}
          />

          {/* 2. BIBLIOTECA */}
          <GlassButton 
             index={1}
             icon={<Library size={28} />}
             label="📚 Biblioteca"
             desc="Acervo de Autores"
             onClick={() => handleNav('library')}
          />

          {/* 3. INSPIRAÇÃO DO DIA */}
          <GlassButton 
             index={2}
             icon={<Sparkles size={28} />}
             label="✨ Inspiração do Dia"
             desc="Versículo e Reflexão"
             onClick={handleOpenDaily}
          />

          {/* 4. HINÁRIO */}
          <GlassButton 
             index={3}
             icon={<Music size={28} />}
             label="🎵 Hinário & Louvor"
             desc="Hinos e Cânticos"
             onClick={() => handleNav('radios')} 
          />

          {/* 5. CURSOS */}
          <GlassButton 
             index={4}
             icon={<GraduationCap size={28} />}
             label="🎓 Cursos Teológicos"
             desc="Estudos Profundos"
             onClick={() => handleNav('courses')}
          />

          {/* 6. QUIZ */}
          <GlassButton 
             index={5}
             icon={<BrainCircuit size={28} />}
             label="🧩 Quiz Bíblico"
             desc="Desafie seu conhecimento"
             onClick={() => handleNav('quiz')}
          />

          {/* 7. DICIONÁRIO */}
          <GlassButton 
             index={6}
             icon={<Search size={28} />}
             label="🔍 Dicionário"
             desc="Termos Bíblicos"
             onClick={() => handleNav('dictionary')}
          />

          {/* 8. ASSISTENTE (NOVO/RENOMEADO) */}
          <GlassButton 
             index={7}
             icon={<Bot size={28} />}
             label="🤖 Assistente da Bíblia"
             desc="IA de Voz"
             onClick={() => handleNav('assistant')}
          />

          {/* 9. COMUNIDADE */}
          <GlassButton 
             index={8}
             icon={<MessageSquare size={28} />}
             label="💬 Comunidade"
             desc="Bate-papo Cristão"
             onClick={() => handleNav('chat')}
          />

           {/* 10. RÁDIOS ONLINE */}
           <GlassButton 
             index={9}
             icon={<Radio size={28} />}
             label="📻 Rádios Online"
             desc="Estações Ao Vivo"
             onClick={() => handleNav('radios')}
          />

           {/* 11. CONFIGURAÇÕES */}
           <GlassButton 
             index={10}
             icon={<Settings size={28} />}
             label="⚙️ Configurações"
             desc="Ajustes de Áudio"
             onClick={() => handleNav('settings')}
          />

           <div className="my-2 border-t border-[#3e2723]/30"></div>

           {/* 12. ADMIN */}
           <GlassButton 
             index={11}
             icon={<ShieldAlert size={28} />}
             label="🛡️ Admin Restrito"
             desc="" // Prévia removida conforme solicitado
             onClick={() => handleNav('admin')}
             variant="admin"
          />
      </div>
      
      {/* Rodapé removido */}
      <div className="mb-8"></div>

      {showDailyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
             <div className="relative w-full max-w-md border border-[#bf953f] shadow-[0_0_50px_rgba(191,149,63,0.3)] rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* IMAGEM DE FUNDO (CRUZ) */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-black/80 z-10"></div>
                    <img 
                        src="https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=1920&auto=format&fit=crop" 
                        alt="Fundo Cruz" 
                        className="w-full h-full object-cover object-center"
                    />
                </div>

                {/* CONTEÚDO SOBREPOSTO */}
                <div className="relative z-20 flex flex-col h-full">
                    <div className="p-6 flex justify-between items-center border-b border-[#bf953f]/30 flex-shrink-0 bg-gradient-to-b from-black/80 to-transparent">
                        <h3 className="font-title font-bold text-xl tracking-widest text-[#fcf6ba] drop-shadow-md flex items-center gap-2">
                            <Sparkles size={18} className="text-[#bf953f]" /> Palavra do Dia
                        </h3>
                        <button onClick={() => { window.speechSynthesis.cancel(); setIsSpeaking(false); setShowDailyModal(false); }} className="text-[#bf953f] hover:text-white bg-black/30 rounded-full p-2 transition-colors hover:bg-black/50 border border-[#bf953f]/30"><X size={20} /></button>
                    </div>
                    
                    <div className="p-6 text-center overflow-y-auto custom-scrollbar">
                        {loadingDaily ? (
                            <div className="flex justify-center py-12"><div className="w-10 h-10 border-2 border-[#bf953f] border-t-transparent rounded-full animate-spin"></div></div>
                        ) : dailyData ? (
                            <div className="space-y-8 animate-in slide-in-from-bottom-4">
                                <div className="bg-black/40 backdrop-blur-sm p-8 rounded-xl border border-[#bf953f]/20 shadow-lg relative">
                                    <span className="absolute -top-3 -left-2 text-6xl text-[#bf953f]/20 font-serif">"</span>
                                    <p className="font-serif text-2xl text-[#fcf6ba] italic leading-relaxed drop-shadow-md relative z-10">{dailyData.text}</p>
                                    <p className="text-sm text-[#bf953f] mt-6 font-bold uppercase tracking-wider border-t border-[#bf953f]/30 pt-4 inline-block px-8">— {dailyData.reference}</p>
                                </div>

                                <div className="bg-[#bf953f]/10 backdrop-blur-sm p-6 rounded-xl border border-[#bf953f]/20">
                                    <h4 className="text-xs uppercase tracking-[0.2em] text-[#bf953f] mb-3 font-bold flex items-center justify-center gap-2"><Sparkles size={12}/> Reflexão Pastoral</h4>
                                    <p className="text-[#e0c9a6] font-serif leading-loose text-lg drop-shadow text-justify">{dailyData.reflection}</p>
                                </div>

                                <button 
                                    onClick={handleDualVoiceRead}
                                    className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-bold uppercase tracking-wider transition-all shadow-xl backdrop-blur-md border ${
                                        isSpeaking 
                                        ? 'bg-[#3e2723]/80 text-red-400 border-red-900 animate-pulse' 
                                        : 'bg-[#bf953f] text-[#1a100e] border-[#fcf6ba] hover:bg-[#fcf6ba] hover:scale-[1.02]'
                                    }`}
                                >
                                    {isSpeaking ? (
                                        <><StopCircle size={20} /> Parar Leitura</>
                                    ) : (
                                        <><Volume2 size={20} /> Ouvir Reflexão</>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <p className="text-[#e0c9a6] font-serif italic">Buscando inspiração divina...</p>
                        )}
                    </div>
                </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default MainMenu;