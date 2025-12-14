import React, { useState, useEffect, useRef } from 'react';
import { Radio, Play, Pause, Volume2, Wifi, ExternalLink, Download, WifiOff, CloudOff, StopCircle } from 'lucide-react';
import { playClickSound } from '../constants';
import { RadioStation } from '../types';

interface ChristianRadiosProps {
  onBack: () => void;
  globalStation: RadioStation | null;
  globalIsPlaying: boolean;
  onPlayStation: (station: RadioStation) => void;
}

// Station List definition remains here or imported
const STATIONS: RadioStation[] = [
  { 
    id: 'nt_1', 
    name: 'Rádio Novo Tempo', 
    genre: 'Adventista / Notícias', 
    url: 'https://stream.sgr.net.br/novotempo', 
    color: 'bg-blue-800' 
  },
  { 
    id: 'melodia_rj', 
    name: 'Rádio Melodia 97.5', 
    genre: 'Gospel / Adoração', 
    url: 'https://ice.fabricahost.com.br/melodiafm', 
    color: 'bg-indigo-900' 
  },
  { 
    id: '93_fm', 
    name: 'Rádio 93 FM', 
    genre: 'Louvor / Jovem', 
    url: 'https://ice.fabricahost.com.br/93fm', 
    color: 'bg-red-900' 
  },
  { 
    id: 'harpa_web', 
    name: 'Web Rádio Harpa', 
    genre: 'Hinos Tradicionais', 
    url: 'https://s09.maxcast.com.br:8294/live', 
    color: 'bg-amber-900' 
  },
  { 
    id: 'feliz_sp', 
    name: 'Rádio Feliz FM', 
    genre: 'São Paulo / Variado', 
    url: 'https://ice.fabricahost.com.br/felizfm', 
    color: 'bg-pink-900' 
  },
  { 
    id: 'maranata_pe', 
    name: 'Rádio Maranata FM', 
    genre: 'Recife / Pentecostal', 
    url: 'https://euroticast5.euroti.com.br/stream/8036/stream', 
    color: 'bg-orange-800' 
  },
  { 
    id: 'novas_paz', 
    name: 'Rádio Novas de Paz', 
    genre: 'Pregação / Hinos', 
    url: 'https://ice.fabricahost.com.br/novasdepaz88', 
    color: 'bg-green-900' 
  },
  { 
    id: 'cpad_web', 
    name: 'Rádio CPAD', 
    genre: 'Teologia / Clássicos', 
    url: 'https://s3.audio.streamer.com.br/cpad', 
    color: 'bg-slate-800' 
  },
  { 
    id: 'biblia_sbn', 
    name: 'Rádio Bíblia SBN', 
    genre: 'Estudo / Leitura', 
    url: 'https://ice.fabricahost.com.br/radiobibliasbn', 
    color: 'bg-yellow-900' 
  },
  { 
    id: 'sara_pr', 
    name: 'Rádio Sara Brasil', 
    genre: 'Curitiba / Worship', 
    url: 'https://ice.fabricahost.com.br/sarabrasilfmctba', 
    color: 'bg-purple-900' 
  },
  { 
    id: 'gospel_fm', 
    name: 'Rádio Gospel FM', 
    genre: 'Contemporâneo', 
    url: 'https://ice.fabricahost.com.br/radiogospel', 
    color: 'bg-teal-900' 
  }
];

const ChristianRadios: React.FC<ChristianRadiosProps> = ({ onBack, globalStation, globalIsPlaying, onPlayStation }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Recording State (Local to this component, as recording usually happens while watching)
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    window.speechSynthesis.cancel();
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (isRecording) {
          stopRecording(); // Ensure recording stops if navigating away
      }
    };
  }, [isRecording]);

  const handleStationClick = (station: RadioStation) => {
      playClickSound();
      if (!isOnline) {
          alert("Sem conexão com a internet.");
          return;
      }
      onPlayStation(station);
  };

  // --- Logic for Downloading/Recording Stream ---
  // Note: This relies on browser capabilities and CORS.
  const startRecording = async () => {
    // This requires capturing the tab audio or using a stream. 
    // Since we can't easily capture the global audio element from here without context,
    // we will simulate the recording UI or warn about CORS limitations.
    alert("Para gravar áudio de rádios online, seu navegador pode exigir permissões específicas. Iniciando tentativa...");
    setIsRecording(true);
    // Real implementation would involve Web Audio API connecting to the global audio element source node
  };

  const stopRecording = () => {
    setIsRecording(false);
    alert("Gravação finalizada (Simulação).");
  };

  const handleToggleRecord = () => {
      playClickSound();
      if (isRecording) {
          stopRecording();
      } else {
          startRecording();
      }
  };

  return (
    <div className="min-h-screen bg-[#1a100e] text-[#fcf6ba] flex flex-col relative overflow-hidden">
       {/* Background Texture & Effects */}
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-40 pointer-events-none"></div>
       <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#3e2723]/30 via-transparent to-black pointer-events-none"></div>

       {/* Header - Left Spacer for Global X */}
       <div className="bg-[#1a100e]/95 backdrop-blur-md p-4 flex items-center justify-between shadow-lg sticky top-0 z-10 border-b border-[#3e2723]">
        <div className="flex items-center gap-3">
            <div className="w-10"></div> {/* Placeholder for Global X */}
            <div>
            <h1 className="text-lg font-title font-bold text-[#fcf6ba]">Rádios Cristãs</h1>
            <div className="flex items-center gap-2" role="status" aria-live="polite">
                {isOnline ? (
                    <>
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" aria-hidden="true"></span>
                        <p className="text-[10px] text-[#bf953f] uppercase tracking-wider">Ao Vivo</p>
                    </>
                ) : (
                    <>
                         <span className="w-2 h-2 bg-gray-500 rounded-full" aria-hidden="true"></span>
                         <p className="text-[10px] text-gray-400 uppercase tracking-wider">Offline</p>
                    </>
                )}
            </div>
            </div>
        </div>
        <div className="mr-2">
             {isOnline ? (
                 <Wifi size={20} className="text-[#bf953f]" aria-label="Conexão com internet ativa" />
             ) : (
                 <WifiOff size={20} className="text-red-400" aria-label="Sem conexão com internet" />
             )}
        </div>
      </div>

      <div className="flex-1 p-6 max-w-2xl mx-auto w-full relative z-10">
        
        {/* Player Active Area */}
        <div className="mb-8 bg-[#2d1b18]/90 backdrop-blur border border-[#3e2723] rounded-xl p-6 shadow-2xl relative overflow-hidden transition-all duration-300">
            <div className="absolute -right-10 -top-10 opacity-10">
                <Radio size={150} aria-hidden="true" />
            </div>

            {!isOnline ? (
                 <div className="relative z-10 text-center py-8">
                     <CloudOff size={64} className="mx-auto text-[#5d4037] mb-4" aria-hidden="true" />
                     <h2 className="text-xl font-bold font-title text-[#bf953f] mb-2">Conexão Necessária</h2>
                     <p className="text-sm text-[#a1887f]">Conecte-se à internet para ouvir as rádios ao vivo.</p>
                 </div>
            ) : globalStation ? (
                <div className="relative z-10 text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#bf953f] to-[#5d4037] rounded-full flex items-center justify-center shadow-lg mb-4">
                        <Volume2 size={40} className={`text-[#1a100e] ${globalIsPlaying ? 'animate-pulse' : ''}`} aria-hidden="true" />
                    </div>
                    <h2 className="text-2xl font-bold font-title text-[#bf953f] mb-1">{globalStation.name}</h2>
                    <p className="text-sm text-[#a1887f] mb-6">{globalStation.genre}</p>
                    
                    <div className="flex justify-center gap-6 items-center">
                        <button 
                             onClick={handleToggleRecord}
                             className={`p-3 rounded-full transition-all duration-300 border focus:outline-none focus:ring-2 focus:ring-[#bf953f] ${
                                 isRecording 
                                 ? 'bg-red-900/50 text-red-400 border-red-500 animate-pulse' 
                                 : 'bg-[#1a100e] text-[#5d4037] border-transparent hover:bg-[#3e2723] hover:text-[#fcf6ba]'
                             }`}
                             title={isRecording ? "Parar Gravação" : "Gravar (Simulado)"}
                             aria-label={isRecording ? "Parar Gravação" : "Gravar"}
                             disabled={!globalIsPlaying}
                        >
                            {isRecording ? <StopCircle size={20} /> : <Download size={20} />}
                        </button>

                        <button 
                            onClick={() => handleStationClick(globalStation)}
                            className="w-16 h-16 bg-[#bf953f] hover:bg-[#d4a74c] text-[#3e2723] rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#fcf6ba]"
                            aria-label={globalIsPlaying ? "Pausar rádio" : "Tocar rádio"}
                        >
                            {globalIsPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                        </button>

                        <button 
                             onClick={() => window.open(globalStation.url, '_blank')}
                             className="p-3 text-[#5d4037] bg-[#1a100e] rounded-full hover:bg-[#3e2723] hover:text-[#fcf6ba] transition-colors focus:outline-none focus:ring-2 focus:ring-[#bf953f]"
                             title="Abrir Link Externo"
                             aria-label="Abrir stream em outra aba"
                        >
                            <ExternalLink size={20} />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 opacity-50">
                    <Wifi size={48} className="mx-auto mb-4" aria-hidden="true" />
                    <p>Selecione uma estação para começar a louvar</p>
                </div>
            )}
        </div>

        {/* Station List */}
        <h3 className="text-[#8d6e63] uppercase text-xs font-bold tracking-widest mb-4 ml-2">Estações Disponíveis</h3>
        <div className="space-y-3 pb-8" role="list">
            {STATIONS.map((station) => (
                <button
                    key={station.id}
                    onClick={() => handleStationClick(station)}
                    disabled={!isOnline}
                    role="listitem"
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between group focus:outline-none focus:ring-2 focus:ring-[#bf953f] backdrop-blur-md
                        ${globalStation?.id === station.id 
                            ? 'bg-[#3e2723]/90 border-[#bf953f] shadow-[0_0_15px_rgba(191,149,63,0.2)]' 
                            : 'bg-[#1a100e]/70 border-[#3e2723]'}
                        ${!isOnline ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#5d4037] hover:bg-[#2d1b18]'}
                    `}
                    aria-current={globalStation?.id === station.id ? 'true' : 'false'}
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${station.color} text-white shadow-inner`} aria-hidden="true">
                            {station.name.substring(0, 2)}
                        </div>
                        <div>
                            <h4 className={`font-bold ${globalStation?.id === station.id ? 'text-[#bf953f]' : 'text-[#e0c9a6]'}`}>
                                {station.name}
                            </h4>
                            <p className="text-xs text-[#8d6e63]">{station.genre}</p>
                        </div>
                    </div>
                    {globalStation?.id === station.id && globalIsPlaying && (
                         <div className="flex gap-1 items-end h-4" aria-label="Reproduzindo agora">
                            <span className="w-1 bg-[#bf953f] animate-[bounce_1s_infinite] h-2"></span>
                            <span className="w-1 bg-[#bf953f] animate-[bounce_1.2s_infinite] h-4"></span>
                            <span className="w-1 bg-[#bf953f] animate-[bounce_0.8s_infinite] h-3"></span>
                         </div>
                    )}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ChristianRadios;