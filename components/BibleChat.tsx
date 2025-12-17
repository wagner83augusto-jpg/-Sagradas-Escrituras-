import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, User, Star, Ban, X, Shield, Mic, Trash2, StopCircle, Plus, AlertCircle, Bell, BellRing, Search, Check, AudioLines } from 'lucide-react';
import { getMessages, sendMessage, getBlockedUsers, toggleBlockUser, getAddedUsers, toggleAddUser, ChatMessage, MOCK_USERS, getAdminConfig } from '../services/chatService';
import { playClickSound, playNotificationSound } from '../constants';

interface BibleChatProps {
  onBack: () => void;
}

const BibleChat: React.FC<BibleChatProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  
  const [showParticipants, setShowParticipants] = useState(false);
  const [participantSearch, setParticipantSearch] = useState('');

  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [addedUsers, setAddedUsers] = useState<string[]>([]);
  
  const [a11yAnnouncement, setA11yAnnouncement] = useState('');

  // Admin Configs (Read Only in this view)
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminSoundEnabled, setAdminSoundEnabled] = useState(true); 
  
  // Recording & Dictation State
  const [isRecording, setIsRecording] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  const currentUser = { id: 'me', name: 'Você' };
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingInterval = useRef<number | null>(null);
  const loginSimulationInterval = useRef<number | null>(null);

  // Carregar dados iniciais e configurações
  useEffect(() => {
    setBlockedUsers(getBlockedUsers());
    setAddedUsers(getAddedUsers());
    setMessages(getMessages());
    
    // Load Admin Configs from storage
    const config = getAdminConfig();
    setIsAdminMode(config.isAdminMode);
    setAdminSoundEnabled(config.adminSoundEnabled);

    pollingInterval.current = window.setInterval(() => {
      const msgs = getMessages();
      setMessages(prev => {
        const lastLocal = prev[prev.length - 1]?.id;
        const lastRemote = msgs[msgs.length - 1]?.id;
        if (lastLocal !== lastRemote || prev.length !== msgs.length) return msgs;
        return prev;
      });
      
      // Re-check config in case it changed in other tab/menu
      const currentConfig = getAdminConfig();
      setIsAdminMode(currentConfig.isAdminMode);
      setAdminSoundEnabled(currentConfig.adminSoundEnabled);

    }, 2000);

    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (loginSimulationInterval.current) clearInterval(loginSimulationInterval.current);
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  // Simulação de Login (Silencioso se configurado)
  useEffect(() => {
    if (isAdminMode) {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }

        loginSimulationInterval.current = window.setInterval(() => {
            if (Math.random() > 0.6) {
               // Apenas som, sem notificação visual no cabeçário para manter interface limpa
                if (adminSoundEnabled) {
                    playNotificationSound(); 
                }
            }
        }, 8000);
    } else {
        if (loginSimulationInterval.current) {
            clearInterval(loginSimulationInterval.current);
        }
    }

    return () => {
        if (loginSimulationInterval.current) clearInterval(loginSimulationInterval.current);
    };
  }, [isAdminMode, adminSoundEnabled]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isRecording, isDictating]);

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    playClickSound();
    sendMessage(inputText, currentUser, 'text');
    setInputText('');
    setMessages(getMessages());
  };

  const handleOpenParticipants = () => {
    playClickSound();
    setParticipantSearch('');
    setShowParticipants(true);
  };

  // --- Funções de Gravação de Áudio ---
  const handleStartRecording = async () => {
    playClickSound();
    if (isDictating && recognitionRef.current) {
        recognitionRef.current.stop();
        setIsDictating(false);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone", err);
      alert("Para enviar áudio, permita o acesso ao microfone.");
    }
  };

  const handleStopAndSendRecording = () => {
    playClickSound();
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          sendMessage(base64Audio, currentUser, 'audio');
          setMessages(getMessages());
          mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
        };
      };

      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
      }
    }
  };

  const handleCancelRecording = () => {
    playClickSound();
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      audioChunksRef.current = [];
      if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
      }
    }
  };

  // --- Funções de Ditado ---
  const handleDictationToggle = () => {
    playClickSound();
    if (isDictating) {
        if (recognitionRef.current) recognitionRef.current.stop();
        setIsDictating(false);
        return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Desculpe, seu navegador não suporta a funcionalidade de ditado por voz.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsDictating(true);
    recognition.onend = () => setIsDictating(false);
    recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
            setInputText(prev => {
                const trimmed = prev.trim();
                return trimmed ? `${trimmed} ${transcript}` : transcript;
            });
        }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleBlock = (user: {id: string, name: string}) => {
    playClickSound();
    const newBlocked = toggleBlockUser(user.id);
    setBlockedUsers(newBlocked);
    const isNowBlocked = newBlocked.includes(user.id);
    setA11yAnnouncement(`${user.name} foi ${isNowBlocked ? 'bloqueado' : 'desbloqueado'}.`);
  };

  const handleToggleAdd = (user: {id: string, name: string}) => {
    playClickSound();
    const newAdded = toggleAddUser(user.id);
    setAddedUsers(newAdded);
    const isNowAdded = newAdded.includes(user.id);
    setA11yAnnouncement(`${user.name} foi ${isNowAdded ? 'adicionado aos favoritos' : 'removido dos favoritos'}.`);
  };

  const visibleMessages = messages.filter(msg => !blockedUsers.includes(msg.userId));

  const filteredParticipants = MOCK_USERS.filter(user => 
      user.name.toLowerCase().includes(participantSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#1a100e] text-[#e0c9a6] flex flex-col relative overflow-hidden">
      {/* Background Texture & Effects */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-40 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#3e2723]/30 via-transparent to-black pointer-events-none"></div>

      <div role="status" aria-live="polite" className="sr-only">
        {a11yAnnouncement}
      </div>

      {/* Header - Left Spacer for Global X */}
      <div className="bg-[#1a100e]/95 backdrop-blur-md text-[#fcf6ba] p-4 flex items-center justify-between shadow-lg sticky top-0 z-10 border-b border-[#3e2723]">
        <div className="flex items-center gap-3">
          <div className="w-10"></div> {/* Placeholder for Global X */}
          <div>
            <h1 className="text-lg font-title font-bold leading-tight">Bate-papo Bíblico</h1>
            <p className="text-[10px] text-[#bf953f] uppercase tracking-wider flex items-center gap-1">
               <Shield size={10} aria-hidden="true" /> Comunidade Segura
            </p>
          </div>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={handleOpenParticipants}
                className="p-2 hover:bg-[#3e2723] rounded-full text-[#bf953f] relative transition-colors" 
                title="Participantes"
                aria-label="Ver Participantes"
            >
                <Users size={24} aria-hidden="true" />
            </button>
        </div>
      </div>

      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 relative z-10">
        <div className="text-center py-4 opacity-60">
           <p className="text-xs text-[#8d6e63] font-serif uppercase tracking-widest">Início da Conversa</p>
           <div className="h-[1px] w-32 bg-[#5d4037] mx-auto mt-2"></div>
        </div>

        {visibleMessages.map((msg) => {
          const isMe = msg.userId === currentUser.id;
          const isAdded = addedUsers.includes(msg.userId);

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {!isMe && (
                  <span className="text-[10px] font-bold text-[#8d6e63] mb-1 ml-1 flex items-center gap-1">
                    {msg.userName}
                    {isAdded && <Star size={10} className="text-[#bf953f] fill-current" aria-label="Favorito" />}
                  </span>
                )}
                <div 
                  className={`px-4 py-2 rounded-2xl shadow-lg border relative ${
                    isMe 
                      ? 'bg-[#3e2723] text-[#fcf6ba] border-[#bf953f] rounded-tr-none' 
                      : 'bg-[#2d1b18] text-[#e0c9a6] border-[#3e2723] rounded-tl-none'
                  }`}
                >
                  {msg.type === 'audio' && msg.audio ? (
                      <div className="flex items-center gap-2 min-w-[200px] py-1">
                          <audio controls src={msg.audio} className="h-8 w-full max-w-[240px]" />
                      </div>
                  ) : (
                      <p className="font-serif text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  )}
                </div>
                <span className="text-[9px] text-[#5d4037] mt-1 mx-1 opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Área de Input */}
      <div className="bg-[#1a100e] p-3 border-t border-[#3e2723] sticky bottom-0 z-10">
        {isRecording ? (
            <div className="max-w-4xl mx-auto flex items-center gap-4 bg-[#2d1b18] border border-[#bf953f] p-3 rounded-2xl animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 text-red-500 font-bold flex-1" role="alert">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="font-mono">{formatTime(recordingDuration)}</span>
                    <span className="text-xs font-normal text-[#8d6e63] ml-2">Gravando áudio...</span>
                </div>
                <button 
                    onClick={handleCancelRecording}
                    className="p-3 bg-[#1a100e] text-[#8d6e63] rounded-full hover:bg-[#3e2723] hover:text-red-500 shadow-sm border border-[#3e2723] transition-colors"
                    title="Cancelar"
                    aria-label="Cancelar gravação"
                >
                    <Trash2 size={20} aria-hidden="true" />
                </button>
                <button 
                    onClick={handleStopAndSendRecording}
                    className="p-3 bg-[#bf953f] text-[#1a100e] rounded-full hover:bg-[#fcf6ba] shadow-md transition-transform active:scale-95"
                    title="Enviar Áudio"
                    aria-label="Enviar Áudio"
                >
                    <Send size={20} aria-hidden="true" />
                </button>
            </div>
        ) : (
            <form onSubmit={handleSendText} className="relative max-w-4xl mx-auto flex items-end gap-2">
                <div className="flex-1 bg-[#2d1b18] border border-[#3e2723] rounded-2xl focus-within:ring-2 focus-within:ring-[#bf953f] focus-within:border-transparent transition-all shadow-inner flex items-end pr-2">
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={isDictating ? "Ouvindo sua voz..." : "Mensagem..."}
                        className="w-full p-3 bg-transparent outline-none text-[#e0c9a6] placeholder-[#5d4037] font-serif resize-none max-h-32 min-h-[50px]"
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendText(e);
                            }
                        }}
                        aria-label="Digite sua mensagem"
                    />
                    <button
                        type="button"
                        onClick={handleDictationToggle}
                        className={`p-2 mb-1.5 rounded-full transition-all ${isDictating ? 'text-red-500 animate-pulse bg-red-900/20' : 'text-[#8d6e63] hover:text-[#bf953f] hover:bg-[#3e2723]'}`}
                        title="Ditar texto"
                        aria-label="Ativar ditado por voz"
                    >
                         {isDictating ? <StopCircle size={20} /> : <Mic size={20} />}
                    </button>
                </div>
                
                {inputText.trim() ? (
                     <button 
                        type="submit" 
                        className="p-3 bg-[#bf953f] text-[#1a100e] rounded-full hover:bg-[#fcf6ba] shadow-md transition-transform active:scale-95 animate-in zoom-in duration-200"
                        aria-label="Enviar mensagem"
                    >
                        <Send size={20} aria-hidden="true" />
                    </button>
                ) : (
                    <button 
                        type="button"
                        onClick={handleStartRecording}
                        className="p-3 bg-[#3e2723] text-[#bf953f] rounded-full hover:bg-[#5d4037] shadow-md transition-transform active:scale-95 animate-in zoom-in duration-200"
                        title="Gravar Mensagem de Áudio"
                        aria-label="Gravar áudio"
                    >
                        <AudioLines size={20} aria-hidden="true" />
                    </button>
                )}
            </form>
        )}
      </div>

      {/* Modal de Participantes - Estilo Dark */}
      {showParticipants && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in" role="dialog" aria-labelledby="participants-title">
          <div className="bg-[#1a100e] w-full max-w-sm rounded-xl shadow-2xl border border-[#bf953f] overflow-hidden flex flex-col max-h-[80vh]">
            <div className="bg-[#2d1b18] p-4 flex justify-between items-center border-b border-[#3e2723]">
              <h3 id="participants-title" className="font-title font-bold text-[#fcf6ba] tracking-wide flex items-center gap-2">
                <Users size={18} aria-hidden="true" /> Usuários Logados
              </h3>
              <button onClick={() => { playClickSound(); setShowParticipants(false); }} className="text-[#bf953f] hover:text-[#fcf6ba] hover:bg-[#3e2723] rounded-full p-1" aria-label="Fechar participantes">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            
            <div className="p-3 bg-[#1a100e] border-b border-[#3e2723]">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5d4037]" size={16} aria-hidden="true" />
                    <input 
                        type="text" 
                        value={participantSearch}
                        onChange={(e) => setParticipantSearch(e.target.value)}
                        placeholder="Buscar usuário..."
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#3e2723] text-[#e0c9a6] text-sm focus:outline-none focus:border-[#bf953f] bg-[#2d1b18] placeholder-[#5d4037]"
                        aria-label="Buscar participante por nome"
                    />
                </div>
            </div>

            <div className="p-4 overflow-y-auto flex-1 bg-[#1a100e]">
                <div className="space-y-3">
                    {filteredParticipants.length === 0 ? (
                        <p className="text-center text-[#5d4037] text-sm py-4 italic">Nenhum usuário encontrado.</p>
                    ) : (
                        filteredParticipants.map(user => {
                            const isBlocked = blockedUsers.includes(user.id);
                            const isAdded = addedUsers.includes(user.id);
                            
                            return (
                                <div key={user.id} className={`p-3 rounded-lg border flex items-center justify-between shadow-sm transition-all ${isBlocked ? 'border-red-900 bg-red-900/10' : 'bg-[#2d1b18] border-[#3e2723]'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${isBlocked ? 'bg-gray-600' : user.avatarColor} relative`}>
                                            {user.name.charAt(0)}
                                            {!isBlocked && user.isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#2d1b18] rounded-full"></span>}
                                        </div>
                                        <div className={isBlocked ? 'opacity-50' : ''}>
                                            <p className={`font-bold text-sm leading-tight ${isBlocked ? 'text-red-400 line-through' : 'text-[#e0c9a6]'}`}>
                                                {user.name}
                                            </p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {isBlocked && (
                                                    <span className="text-[9px] bg-red-900 text-red-300 px-1.5 py-0.5 rounded border border-red-800 font-bold uppercase tracking-wide flex items-center gap-1">
                                                        <Ban size={8} /> Bloqueado
                                                    </span>
                                                )}
                                                {isAdded && (
                                                    <span className="text-[9px] bg-yellow-900/30 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-800 font-bold uppercase tracking-wide flex items-center gap-1">
                                                        <Star size={8} /> Favorito
                                                    </span>
                                                )}
                                                {!isBlocked && !isAdded && (
                                                    <span className="text-[10px] text-[#8d6e63]">
                                                        {user.isOnline ? 'Online agora' : 'Visto recentemente'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleToggleAdd(user)}
                                            className={`p-2 rounded-full border transition-all active:scale-95 ${isAdded ? 'bg-yellow-900/20 border-yellow-700 text-yellow-500' : 'border-transparent text-[#5d4037] hover:bg-[#3e2723] hover:text-[#fcf6ba]'}`}
                                            title={isAdded ? "Remover Favorito" : "Favoritar"}
                                        >
                                            <Star size={20} fill={isAdded ? "currentColor" : "none"} aria-hidden="true" />
                                        </button>
                                        <button 
                                            onClick={() => handleToggleBlock(user)}
                                            className={`p-2 rounded-full border transition-all active:scale-95 ${isBlocked ? 'bg-red-900/20 border-red-800 text-red-500' : 'border-transparent text-[#5d4037] hover:bg-red-900/20 hover:text-red-400'}`}
                                            title={isBlocked ? "Desbloquear" : "Bloquear"}
                                        >
                                            <Ban size={20} aria-hidden="true" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BibleChat;