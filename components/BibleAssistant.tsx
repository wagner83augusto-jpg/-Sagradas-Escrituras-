import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, StopCircle, Sparkles, Mic, Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { askBibleAssistant } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { playClickSound } from '../constants';

interface BibleAssistantProps {
  onBack: () => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const BibleAssistant: React.FC<BibleAssistantProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'A paz! Sou seu assistente bíblico. Posso falar com você sobre as Escrituras. Qual a sua dúvida?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Audio State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Inicializa voz ao carregar
  useEffect(() => {
    // Carregar vozes do sistema
    const loadVoices = () => {
        window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
        window.speechSynthesis.cancel();
        if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSpeaking, isLoading]);

  // --- TTS (Texto para Fala) ---
  const speakText = (text: string) => {
      window.speechSynthesis.cancel();
      
      // Limpa markdown básico para leitura
      const cleanText = text.replace(/[*#_`]/g, '');
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.0; // Velocidade natural
      utterance.pitch = 1.0;

      // Tenta pegar uma voz brasileira natural
      const voices = window.speechSynthesis.getVoices();
      const ptVoice = voices.find(v => v.lang === 'pt-BR' && v.name.includes('Google')) || voices.find(v => v.lang === 'pt-BR');
      if (ptVoice) utterance.voice = ptVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
  };

  // --- STT (Fala para Texto / Ditado) ---
  const toggleListening = () => {
      playClickSound();
      if (isListening) {
          if (recognitionRef.current) recognitionRef.current.stop();
          setIsListening(false);
          return;
      }

      // Parar a IA se ela estiver falando para ouvir o usuário
      if (isSpeaking) stopSpeaking();

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
          alert("Navegador não suporta reconhecimento de voz.");
          return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
              setInputText(transcript);
              // Opcional: Enviar automaticamente após ditar
              setTimeout(() => handleSend(null, transcript), 500); 
          }
      };

      recognitionRef.current = recognition;
      recognition.start();
  };

  const handleSend = async (e: React.FormEvent | null, textOverride?: string) => {
    if (e) e.preventDefault();
    
    const textToSend = textOverride || inputText;
    if (!textToSend.trim() || isLoading) return;

    playClickSound();
    stopSpeaking(); // Garante silêncio antes de processar
    
    setInputText('');
    
    // Add user message
    const newMessages: Message[] = [...messages, { role: 'user', text: textToSend }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await askBibleAssistant(textToSend, history);
      
      const updatedMessages: Message[] = [...newMessages, { role: 'model', text: response }];
      setMessages(updatedMessages);
      
      // RESPOSTA AUTOMÁTICA EM ÁUDIO
      speakText(response);

    } catch (error) {
      setMessages([...newMessages, { role: 'model', text: 'Desculpe, tive um problema de conexão. Tente novamente.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    playClickSound();
    stopSpeaking();
    if (confirm('Deseja limpar toda a conversa?')) {
        setMessages([{ role: 'model', text: 'Conversa reiniciada. Em que posso ajudar?' }]);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a100e] flex flex-col relative overflow-hidden text-[#e0c9a6]">
      {/* Background Texture & Effects */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-40 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#3e2723]/20 via-transparent to-black pointer-events-none"></div>

      {/* Header - Left Spacer for Global X */}
      <div className="bg-[#1a100e]/95 backdrop-blur border-b border-[#3e2723] p-4 flex items-center justify-between shadow-lg sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10"></div> {/* Placeholder for Global X */}
          <div>
            <h1 className="text-lg font-title font-bold leading-tight text-[#fcf6ba]">Assistente Bíblico</h1>
            <div className="flex items-center gap-2">
                <p className="text-[10px] text-[#bf953f] uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={10} /> IA de Voz
                </p>
                {isSpeaking && (
                    <div className="flex gap-0.5 items-end h-3 ml-2">
                        <span className="w-0.5 bg-[#bf953f] animate-[bounce_0.8s_infinite] h-2"></span>
                        <span className="w-0.5 bg-[#bf953f] animate-[bounce_1.2s_infinite] h-3"></span>
                        <span className="w-0.5 bg-[#bf953f] animate-[bounce_0.5s_infinite] h-1.5"></span>
                    </div>
                )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
            {isSpeaking ? (
                <button onClick={stopSpeaking} className="p-2 bg-[#3e2723] rounded-full text-[#bf953f] animate-pulse" title="Parar fala">
                    <VolumeX size={20} />
                </button>
            ) : (
                <button onClick={clearChat} className="p-2 hover:bg-[#3e2723] rounded-full text-[#5d4037] hover:text-red-400 transition-colors" title="Limpar conversa">
                    <Trash2 size={20} />
                </button>
            )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 relative z-10">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
          >
            <div 
              className={`max-w-[85%] rounded-2xl p-4 shadow-lg relative border group ${
                msg.role === 'user' 
                  ? 'bg-[#3e2723] text-[#fcf6ba] border-[#bf953f] rounded-tr-none' 
                  : 'bg-[#2d1b18] text-[#e0c9a6] border-[#3e2723] rounded-tl-none'
              }`}
            >
              {msg.role === 'model' && (
                <div className="absolute -top-6 -left-2 flex items-center gap-2">
                    <Bot size={16} className="text-[#1a100e] bg-[#bf953f] rounded-full p-0.5 shadow" />
                    <button 
                        onClick={() => speakText(msg.text)}
                        className="p-1 rounded-full bg-[#1a100e]/50 text-[#bf953f] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#bf953f] hover:text-[#1a100e]"
                        title="Ouvir novamente"
                    >
                        <Volume2 size={12} />
                    </button>
                </div>
              )}
              <div className={`prose ${msg.role === 'user' ? 'prose-invert' : 'prose-invert'} prose-p:my-0 text-sm leading-relaxed max-w-none font-serif`}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-[#2d1b18] border border-[#3e2723] rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
               <div className="w-2 h-2 bg-[#bf953f] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
               <div className="w-2 h-2 bg-[#bf953f] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
               <div className="w-2 h-2 bg-[#bf953f] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-[#1a100e] p-3 border-t border-[#3e2723] sticky bottom-0 z-20">
        <form onSubmit={(e) => handleSend(e)} className="relative max-w-4xl mx-auto flex items-end gap-2">
            
            <button 
                type="button"
                onClick={toggleListening}
                className={`p-3 rounded-full shadow-lg transition-all active:scale-95 ${
                    isListening 
                    ? 'bg-red-900/80 text-red-200 border border-red-500 animate-pulse' 
                    : 'bg-[#2d1b18] text-[#bf953f] border border-[#3e2723] hover:bg-[#3e2723]'
                }`}
                title={isListening ? "Parar de ouvir" : "Falar com o assistente"}
            >
                {isListening ? <StopCircle size={20} /> : <Mic size={20} />}
            </button>

            <div className="flex-1 bg-[#2d1b18] border border-[#3e2723] rounded-2xl focus-within:ring-2 focus-within:ring-[#bf953f] focus-within:border-transparent transition-all shadow-inner">
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={isListening ? "Ouvindo você..." : "Digite ou fale sua pergunta..."}
                    className="w-full p-3 bg-transparent outline-none text-[#e0c9a6] placeholder-[#5d4037] font-serif resize-none max-h-32 min-h-[50px]"
                    rows={1}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend(e);
                        }
                    }}
                />
            </div>
            
            {inputText.trim() && (
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="p-3 bg-[#bf953f] text-[#1a100e] rounded-full hover:bg-[#fcf6ba] disabled:opacity-50 disabled:bg-[#3e2723] disabled:text-[#5d4037] shadow-lg transition-transform active:scale-95 animate-in zoom-in"
                >
                    <Send size={20} />
                </button>
            )}
        </form>
      </div>
    </div>
  );
};

export default BibleAssistant;