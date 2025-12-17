import React, { useState, useEffect, useRef } from 'react';
import LandingPage from './components/LandingPage';
import MainMenu from './components/MainMenu';
import BibleReader from './components/BibleReader';
import Dictionary from './components/Dictionary';
import BibleAssistant from './components/BibleAssistant';
import ChristianRadios from './components/ChristianRadios';
import BibleChat from './components/BibleChat';
import TheologicalCourses from './components/TheologicalCourses';
import BibleQuiz from './components/BibleQuiz';
import ApocryphaReader from './components/ApocryphaReader';
import SettingsPage from './components/SettingsPage';
import AdminPage from './components/AdminPage';
import { RadioStation } from './types';
import { Pause, Play, X, Radio, Loader2 } from 'lucide-react';
import { playClickSound } from './constants';

const App: React.FC = () => {
  const [hash, setHash] = useState(window.location.hash);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // -- GLOBAL RADIO STATE --
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [isRadioPlaying, setIsRadioPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Inicializa o objeto de áudio globalmente
    if (!audioRef.current) {
        audioRef.current = new Audio();
        // REMOVIDO: crossOrigin = "anonymous" bloqueia rádios que não enviam cabeçalhos CORS
        // audioRef.current.crossOrigin = "anonymous"; 
        audioRef.current.preload = "none";
    }

    const audio = audioRef.current;

    // Event Listeners para sincronizar estado real do áudio
    const onPlay = () => { setIsRadioPlaying(true); setIsBuffering(false); };
    const onPause = () => setIsRadioPlaying(false);
    const onWaiting = () => setIsBuffering(true); // Buffering/Carregando
    const onPlaying = () => { setIsRadioPlaying(true); setIsBuffering(false); };
    const onError = (e: any) => {
        console.error("Erro no stream de áudio:", e);
        setIsRadioPlaying(false);
        setIsBuffering(false);
    };
    const onEnded = () => setIsRadioPlaying(false);

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('error', onError);
    audio.addEventListener('ended', onEnded);

    // Setup Media Session para controle na tela de bloqueio e barra de notificações
    if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', () => {
            audio.play().catch(() => {});
        });
        navigator.mediaSession.setActionHandler('pause', () => {
            audio.pause();
        });
        navigator.mediaSession.setActionHandler('stop', () => {
            handleStopRadio();
        });
    }

    return () => {
        audio.removeEventListener('play', onPlay);
        audio.removeEventListener('pause', onPause);
        audio.removeEventListener('waiting', onWaiting);
        audio.removeEventListener('playing', onPlaying);
        audio.removeEventListener('error', onError);
        audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const handlePlayStation = (station: RadioStation) => {
      const audio = audioRef.current;
      if (!audio) return;

      if (currentStation?.id === station.id) {
          // Toggle Play/Pause na mesma estação
          if (isRadioPlaying) {
              audio.pause();
          } else {
              audio.play().catch(e => {
                  console.error("Erro ao retomar rádio:", e);
                  setIsRadioPlaying(false);
              });
          }
      } else {
          // Nova Estação
          setIsBuffering(true);
          setIsRadioPlaying(false); // Reseta visualmente até começar
          
          audio.src = station.url;
          audio.load(); // Força o carregamento do novo stream
          
          audio.play().then(() => {
              // Sucesso no play
              if ('mediaSession' in navigator) {
                  navigator.mediaSession.metadata = new MediaMetadata({
                      title: station.name,
                      artist: station.genre,
                      album: 'Rádio Bíblia IASD',
                      artwork: [{ src: 'https://cdn-icons-png.flaticon.com/512/3004/3004458.png', sizes: '512x512', type: 'image/png' }]
                  });
              }
          }).catch(e => {
              console.error("Erro ao tocar rádio (Autoplay ou Erro de Rede):", e);
              setIsRadioPlaying(false);
              setIsBuffering(false);
              alert("Não foi possível conectar a esta rádio no momento. Tente outra estação.");
          });
          
          setCurrentStation(station);
      }
  };

  const handleStopRadio = () => {
      if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = ""; // Libera conexão
      }
      setIsRadioPlaying(false);
      setIsBuffering(false);
      setCurrentStation(null);
  };

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash);
      window.scrollTo(0, 0);
    };

    if (!window.location.hash) {
      window.location.hash = ''; // Landing
    }

    const bioEnabled = localStorage.getItem('bible_biometrics_enabled');
    if (bioEnabled === 'true') {
        // Biometrics check handled in LandingPage
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLoginSuccess = () => {
      setIsAuthenticated(true);
      window.location.hash = 'menu';
  };

  const handleGlobalBack = () => {
      playClickSound();
      const current = window.location.hash.replace('#', '');
      
      if (current === 'menu') {
          // Logout logic
          setIsAuthenticated(false);
          setHash('');
          window.location.hash = '';
      } else {
          // Smart Navigation: Pop last segment of hash to go up one level
          const parts = current.split('/');
          if (parts.length > 1) {
              parts.pop();
              window.location.hash = parts.join('/');
          } else {
              window.location.hash = 'menu';
          }
      }
  };

  const renderView = () => {
    const currentHash = hash.replace('#', '');

    if (!isAuthenticated) {
        return <LandingPage onLoginSuccess={handleLoginSuccess} />;
    }

    if (currentHash === '' || currentHash === 'landing') {
        window.location.hash = 'menu'; 
        return <MainMenu onNavigate={(view) => window.location.hash = view} />;
    }
    
    if (currentHash === 'menu') {
      return <MainMenu onNavigate={(view) => window.location.hash = view} />;
    }
    
    if (currentHash === 'bible' || currentHash.startsWith('bible/')) {
      return <BibleReader onBackToMenu={() => window.location.hash = 'menu'} />;
    }

    // NOVA ROTA PARA BIBLIOTECA
    if (currentHash === 'library' || currentHash.startsWith('library/')) {
        return <BibleReader onBackToMenu={() => window.location.hash = 'menu'} />;
    }

    if (currentHash === 'apocrypha' || currentHash.startsWith('apocrypha/')) {
      return <ApocryphaReader onBackToMenu={() => window.location.hash = 'menu'} />;
    }
    
    if (currentHash === 'dictionary') {
      return <Dictionary onBack={() => window.location.hash = 'menu'} />;
    }

    if (currentHash === 'assistant') {
      return <BibleAssistant onBack={() => window.location.hash = 'menu'} />;
    }

    if (currentHash === 'radios') {
      return <ChristianRadios 
                onBack={() => window.location.hash = 'menu'} 
                globalStation={currentStation}
                globalIsPlaying={isRadioPlaying}
                onPlayStation={handlePlayStation}
             />;
    }

    if (currentHash === 'chat') {
      return <BibleChat onBack={() => window.location.hash = 'menu'} />;
    }

    if (currentHash === 'courses') {
      return <TheologicalCourses onBack={() => window.location.hash = 'menu'} />;
    }

    if (currentHash === 'quiz') {
      return <BibleQuiz onBack={() => window.location.hash = 'menu'} />;
    }
    
    // --- NOVAS ROTAS ---
    if (currentHash === 'settings') {
      return <SettingsPage onBack={() => window.location.hash = 'menu'} />;
    }
    
    if (currentHash === 'admin') {
      return <AdminPage onBack={() => window.location.hash = 'menu'} />;
    }

    return <MainMenu onNavigate={(view) => window.location.hash = view} />;
  };

  const isRadioPage = hash.includes('radios');

  return (
    <div className="antialiased text-gray-800 pb-20 md:pb-0">
      
      {/* Global Discreet Close/Back Button */}
      {isAuthenticated && (
          <button 
            onClick={handleGlobalBack}
            className="fixed top-4 left-4 z-50 p-2 text-[#bf953f]/50 hover:text-[#bf953f] transition-colors rounded-full focus:outline-none focus:ring-1 focus:ring-[#bf953f]"
            aria-label="Fechar aba atual / Voltar"
          >
            <X size={20} />
          </button>
      )}

      {renderView()}

      {/* Mini Player Global */}
      {currentStation && !isRadioPage && (
          <section 
            className="fixed bottom-0 left-0 right-0 bg-[#2d1b18] border-t border-[#bf953f] p-3 shadow-2xl z-50 animate-in slide-in-from-bottom-5"
            aria-label="Reprodutor de Rádio Minimizado"
          >
              <div className="max-w-2xl mx-auto flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 bg-[#bf953f] rounded-full flex items-center justify-center text-[#2d1b18]">
                          {isBuffering ? (
                              <Loader2 size={20} className="animate-spin" />
                          ) : (
                              <Radio size={20} className={isRadioPlaying ? 'animate-pulse' : ''} aria-hidden="true" />
                          )}
                      </div>
                      <div className="flex-1 min-w-0">
                          <p className="text-[#fcf6ba] text-sm font-bold truncate">{currentStation.name}</p>
                          <p className="text-[#a1887f] text-xs truncate">{isBuffering ? 'Conectando...' : currentStation.genre}</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handlePlayStation(currentStation)}
                        className="p-2 bg-[#bf953f] rounded-full text-[#2d1b18] hover:bg-[#fcf6ba] focus:outline-none focus:ring-2 focus:ring-white"
                        aria-label={isRadioPlaying ? "Pausar Rádio" : "Tocar Rádio"}
                      >
                          {isRadioPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                      </button>
                      <button 
                        onClick={handleStopRadio}
                        className="p-2 text-[#a1887f] hover:text-red-400 focus:outline-none focus:text-red-400"
                        aria-label="Fechar Reprodutor"
                      >
                          <X size={20} />
                      </button>
                  </div>
              </div>
          </section>
      )}
    </div>
  );
};

export default App;