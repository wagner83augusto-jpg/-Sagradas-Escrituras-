import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Search, Bell, X, Sparkles, GraduationCap, Radio, MessageCircle, Mic, Play, Pause, Scroll, Heart, Shield, Sun, Coffee, Zap, Anchor, Lock, Key, ToggleLeft, ToggleRight, Volume2, VolumeX, AlertCircle, Gamepad2, UserX, UserCheck, Siren, ChevronRight, Music, ArrowLeft, Disc, Feather, Power, AlertTriangle, Download } from 'lucide-react';
import { fetchDailyReflection, DailyReflection } from '../services/geminiService';
import { getAdminConfig, setAdminConfig, getAdminPassword, setAdminPassword, resetAdminPassword, MOCK_USERS, getBlockedUsers, toggleBlockUser } from '../services/chatService';
import { playClickSound } from '../constants';

interface MainMenuProps {
  onNavigate: (view: 'bible' | 'dictionary' | 'assistant' | 'radios' | 'chat' | 'courses' | 'quiz' | 'apocrypha') => void;
}

// --- DADOS DOS HINOS ---
interface Hymn {
    id: string;
    title: string;
    artist: string;
    url: string; // MP3 URL
    lyrics: string;
}

// --- DADOS DE ELLEN WHITE ---
interface EGWBook {
    title: string;
    category: string;
    year: string;
    description: string;
}

const EGW_BOOKS: EGWBook[] = [
    {
        title: "Primeiros Escritos",
        category: "Origens",
        year: "1882",
        description: "Narra as primeiras visões e o início do movimento adventista após o desapontamento de 1844."
    },
    {
        title: "O Grande Conflito",
        category: "Série Conflito",
        year: "1888",
        description: "A história do conflito cósmico entre Cristo e Satanás, desde a queda de Jerusalém até a Nova Terra."
    },
    {
        title: "Patriarcas e Profetas",
        category: "Série Conflito",
        year: "1890",
        description: "O grande conflito durante o período do Antigo Testamento, da criação até o rei Davi."
    },
    {
        title: "Profetas e Reis",
        category: "Série Conflito",
        year: "1917",
        description: "A história do cativeiro e restauração de Israel, de Salomão até a vinda do Messias."
    },
    {
        title: "O Desejado de Todas as Nações",
        category: "Série Conflito",
        year: "1898",
        description: "A biografia mais completa e inspiradora da vida e ministério de Jesus Cristo."
    },
    {
        title: "Atos dos Apóstolos",
        category: "Série Conflito",
        year: "1911",
        description: "A história da igreja cristã primitiva e o ministério dos apóstolos após a ascensão de Cristo."
    },
    {
        title: "Caminho a Cristo",
        category: "Devocional",
        year: "1892",
        description: "Um guia prático e profundo sobre como aceitar a Cristo e viver uma vida cristã genuína."
    },
    {
        title: "Parábolas de Jesus",
        category: "Ensino",
        year: "1900",
        description: "Lições espirituais extraídas das parábolas contadas por Cristo."
    },
    {
        title: "O Maior Discurso de Cristo",
        category: "Ensino",
        year: "1896",
        description: "Um estudo profundo sobre o Sermão da Montanha e as bem-aventuranças."
    },
    {
        title: "Educação",
        category: "Vida Cristã",
        year: "1903",
        description: "Princípios fundamentais sobre a verdadeira educação e o desenvolvimento do caráter."
    },
    {
        title: "A Ciência do Bom Viver",
        category: "Saúde",
        year: "1905",
        description: "Princípios de saúde física, mental e espiritual baseados na Bíblia."
    },
    {
        title: "Conselhos sobre o Regime Alimentar",
        category: "Saúde",
        year: "1938",
        description: "Orientações detalhadas sobre alimentação saudável e reforma de saúde."
    },
    {
        title: "Eventos Finais",
        category: "Escatologia",
        year: "1992 (Compilação)",
        description: "Uma compilação de citações sobre as profecias e acontecimentos dos últimos dias."
    },
    {
        title: "Testemunhos para a Igreja (Vol 1-9)",
        category: "Testemunhos",
        year: "1855-1909",
        description: "Conselhos abrangentes para a igreja cobrindo quase todos os aspectos da vida cristã."
    }
];

const ADVENTIST_HYMNS: Hymn[] = [
    {
        id: 'adv_1',
        title: 'Castelo Forte',
        artist: 'Hinário Adventista',
        url: 'https://archive.org/download/hino-43-castelo-forte-hinario-adventista/Hino%2043%20-%20Castelo%20Forte%20-%20Hin%C3%A1rio%20Adventista.mp3',
        lyrics: `Castelo forte é nosso Deus,\nEspada e bom escudo;\nCom seu poder defende os seus\nEm todo transe agudo.\nCom fúria pertinaz\nPersegue Satanás\nCom ânimo cruel;\nAstuto e mui rebel;\nIgual não há na terra.\n\nA força do homem nada faz,\nSozinho está perdido;\nMas nosso Deus socorro traz\nEm seu Filho escolhido.\nSabeis quem é? Jesus,\nO que venceu na cruz,\nSenhor dos altos céus,\nE, sendo o próprio Deus,\nTriunfa na batalha.`
    },
    {
        id: 'adv_2',
        title: 'Santo! Santo! Santo!',
        artist: 'Hinário Adventista',
        url: 'https://archive.org/download/Hino16SantoSantoSanto/Hino%2016%20-%20Santo%21%20Santo%21%20Santo%21.mp3',
        lyrics: `Santo! Santo! Santo! Deus Onipotente!\nCedo de manhã cantaremos teu louvor.\nSanto! Santo! Santo! Jeová Triúno!\nSendo Deus és um só, imenso em teu amor.\n\nSanto! Santo! Santo! Todos os remidos,\nJuntos com os anjos, proclamam teu louvor.\nAntes de formar-se o firmamento e a terra,\nEras, e sempre és, e hás de ser, Senhor.`
    },
    {
        id: 'adv_3',
        title: 'Grandioso És Tu',
        artist: 'Hinário Adventista',
        url: 'https://archive.org/download/Hino34GrandiosoEsTu/Hino%2034%20-%20Grandioso%20%C3%A9s%20Tu.mp3',
        lyrics: `Senhor, meu Deus, quando eu, maravilhado,\nFico a pensar nas obras de Tuas mãos,\nNo céu azul de estrelas pontilhado,\nO Teu poder mostrando a criação.\n\nEntão minh'alma canta a Ti, Senhor:\nGrandioso és Tu! Grandioso és Tu!\nEntão minh'alma canta a Ti, Senhor:\nGrandioso és Tu! Grandioso és Tu!`
    }
];

const GLOBAL_HYMNS: Hymn[] = [
    {
        id: 'glb_1',
        title: 'Amazing Grace (Instrumental)',
        artist: 'Clássicos Cristãos',
        url: 'https://cdn.pixabay.com/audio/2022/06/17/audio_651a5477d6.mp3',
        lyrics: `Amazing grace! How sweet the sound\nThat saved a wretch like me!\nI once was lost, but now am found;\nWas blind, but now I see.\n\n'Twas grace that taught my heart to fear,\nAnd grace my fears relieved;\nHow precious did that grace appear\nThe hour I first believed.`
    },
    {
        id: 'glb_2',
        title: 'Porque Ele Vive',
        artist: 'Harpa Cristã',
        url: 'https://archive.org/download/harpa-crista-hino-545-porque-ele-vive/Harpa%20Crist%C3%A3%20-%20Hino%20545%20-%20Porque%20Ele%20Vive.mp3',
        lyrics: `Deus enviou seu Filho amado\nPara morrer em meu lugar\nNa cruz pagou por meus pecados\nMas o sepulcro vazio está porque Ele vive\n\nPorque Ele vive, posso crer no amanhã\nPorque Ele vive, temor não há\nMas eu bem sei, eu sei, que a minha vida\nEstá nas mãos de meu Jesus, que vivo está`
    },
    {
        id: 'glb_3',
        title: 'Rude Cruz',
        artist: 'Clássicos',
        url: 'https://archive.org/download/HarpaCristaHino291ARudeCruz/Harpa%20Crist%C3%A3%20-%20Hino%20291%20-%20A%20Rude%20Cruz.mp3',
        lyrics: `Rude cruz se erigiu,\nDela o dia fugiu,\nComo emblema de vergonha e dor;\nMas contemplo essa cruz,\nPorque nela Jesus\nDeu a vida por mim, pecador.\n\nSim, eu amo a mensagem da cruz\nTé morrer eu a vou proclamar;\nLevarei eu também minha cruz\nTé por uma coroa trocar.`
    }
];

const REFLECTION_THEMES = [
    { id: 'random', label: 'Surpreenda-me', icon: Sparkles, color: 'text-yellow-400' },
    { id: 'ansiedade', label: 'Ansiedade', icon: Shield, color: 'text-blue-400' },
    { id: 'gratidao', label: 'Gratidão', icon: Heart, color: 'text-pink-400' },
    { id: 'coragem', label: 'Coragem', icon: Zap, color: 'text-orange-400' },
    { id: 'esperanca', label: 'Esperança', icon: Sun, color: 'text-yellow-200' },
    { id: 'familia', label: 'Família', icon: Heart, color: 'text-red-400' },
    { id: 'perdao', label: 'Perdão', icon: Anchor, color: 'text-indigo-400' },
    { id: 'sabedoria', label: 'Sabedoria', icon: BookOpen, color: 'text-emerald-400' },
    { id: 'fe', label: 'Fé Inabalável', icon: Shield, color: 'text-cyan-400' },
    { id: 'consolo', label: 'Consolo', icon: Coffee, color: 'text-amber-400' }
];

const MainMenu: React.FC<MainMenuProps> = ({ onNavigate }) => {
  // Daily Reflection State
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [dailyData, setDailyData] = useState<DailyReflection | null>(null);
  const [loadingDaily, setLoadingDaily] = useState(false);
  
  // Hymn State
  const [showHymnModal, setShowHymnModal] = useState(false);
  const [hymnTab, setHymnTab] = useState<'adventist' | 'global'>('adventist');
  const [currentHymn, setCurrentHymn] = useState<Hymn | null>(null);
  const [isHymnPlaying, setIsHymnPlaying] = useState(false);
  const hymnAudioRef = useRef<HTMLAudioElement | null>(null);

  // EGW State
  const [showEGWModal, setShowEGWModal] = useState(false);

  // TTS State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Private Section State
  const [showPrivateModal, setShowPrivateModal] = useState(false);
  const [privateView, setPrivateView] = useState<'login' | 'dashboard' | 'change_pass' | 'recover'>('login');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Admin Dashboard State
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminSoundEnabled, setAdminSoundEnabled] = useState(true);
  const [isAppLocked, setIsAppLocked] = useState(false);
  const [blockedList, setBlockedList] = useState<string[]>([]);

  // PWA Install Prompt State
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Password Change State
  const [newPass, setNewPass] = useState('');

  useEffect(() => {
    // Load voices
    const loadVoices = () => {
        const avail = window.speechSynthesis.getVoices();
        setVoices(avail.filter(v => v.lang.includes('pt')));
    };
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();

    // Load Admin Config for Locking State
    const config = getAdminConfig();
    setIsAppLocked(config.isAppLocked);

    // Auto-Show Daily Reflection (Uses "Motivação" implicitly or Random)
    const lastShownDate = localStorage.getItem('bible_last_daily_shown');
    const today = new Date().toDateString();
    const savedNotifyRef = localStorage.getItem('bible_notify_reflection') !== 'false';

    if (savedNotifyRef && lastShownDate !== today) {
        setTimeout(() => {
            handleAutoOpenDaily();
            localStorage.setItem('bible_last_daily_shown', today);
        }, 800);
    }

    // PWA Install Event Listener
    const handleInstallPrompt = (e: any) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later.
        setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
  }, []);

  // Sync Admin Config on Modal Open
  useEffect(() => {
      if (showPrivateModal && privateView === 'dashboard') {
          const config = getAdminConfig();
          setIsAdminMode(config.isAdminMode);
          setAdminSoundEnabled(config.adminSoundEnabled);
          setIsAppLocked(config.isAppLocked);
          setBlockedList(getBlockedUsers());
      }
  }, [showPrivateModal, privateView]);

  // Audio Player Logic for Hymns (Background Play Support)
  useEffect(() => {
      if (!hymnAudioRef.current) {
          hymnAudioRef.current = new Audio();
          hymnAudioRef.current.crossOrigin = "anonymous";
          
          hymnAudioRef.current.onended = () => setIsHymnPlaying(false);
          hymnAudioRef.current.onpause = () => setIsHymnPlaying(false);
          hymnAudioRef.current.onplay = () => setIsHymnPlaying(true);
      }

      // Cleanup
      return () => {
          if (hymnAudioRef.current) {
              hymnAudioRef.current.pause();
          }
      };
  }, []);

  // Update Media Session when hymn changes or plays
  useEffect(() => {
      if (currentHymn && 'mediaSession' in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
              title: currentHymn.title,
              artist: currentHymn.artist,
              album: hymnTab === 'adventist' ? 'Hinos Adventistas' : 'Hinos Globais',
              artwork: [
                  { src: 'https://cdn-icons-png.flaticon.com/512/3004/3004458.png', sizes: '512x512', type: 'image/png' }
              ]
          });

          navigator.mediaSession.setActionHandler('play', () => {
              hymnAudioRef.current?.play();
          });
          navigator.mediaSession.setActionHandler('pause', () => {
              hymnAudioRef.current?.pause();
          });
      }
  }, [currentHymn, hymnTab]);

  const handleNavigate = (view: any) => {
    if (isAppLocked) return;
    playClickSound();
    onNavigate(view);
  };

  const handleInstallApp = async () => {
      if (!installPrompt) return;
      playClickSound();
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
          setInstallPrompt(null);
      }
  };

  const handleAutoOpenDaily = async () => {
      if (isAppLocked) return;
      setShowDailyModal(true);
      setLoadingDaily(true);
      try {
          const data = await fetchDailyReflection("Motivação e Fé");
          setDailyData(data);
      } catch (error) {
          console.error("Failed to fetch daily", error);
      } finally {
          setLoadingDaily(false);
      }
  };

  const handleOpenDailyMenu = () => {
    if (isAppLocked) return;
    playClickSound();
    setDailyData(null); 
    setShowDailyModal(true);
  };

  const handleThemeSelect = async (themeId: string, label: string) => {
      playClickSound();
      setLoadingDaily(true);
      setDailyData(null); 
      
      try {
          const themeParam = themeId === 'random' ? undefined : label;
          const data = await fetchDailyReflection(themeParam);
          setDailyData(data);
      } catch (error) {
          console.error("Failed to fetch", error);
      } finally {
          setLoadingDaily(false);
      }
  };

  const handleDualVoiceRead = () => {
      if (isSpeaking) {
          window.speechSynthesis.cancel();
          setIsSpeaking(false);
          return;
      }

      if (!dailyData) return;

      setIsSpeaking(true);
      window.speechSynthesis.cancel();

      const voice1 = voices[0]; 
      const voice2 = voices.length > 1 ? voices[1] : voices[0];

      const utteranceRef = new SpeechSynthesisUtterance(dailyData.reference);
      utteranceRef.voice = voice1;
      utteranceRef.lang = 'pt-BR';
      utteranceRef.rate = 0.9;
      if (voice1 === voice2) utteranceRef.pitch = 1.1;

      const utteranceText = new SpeechSynthesisUtterance(`${dailyData.text}. Reflexão: ${dailyData.reflection}`);
      utteranceText.voice = voice2;
      utteranceText.lang = 'pt-BR';
      utteranceText.rate = 1.0;
      if (voice1 === voice2) utteranceText.pitch = 0.9;

      utteranceRef.onend = () => {
          window.speechSynthesis.speak(utteranceText);
      };

      utteranceText.onend = () => {
          setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utteranceRef);
  };

  // --- HYMN LOGIC ---
  const handleOpenHymns = () => {
      if (isAppLocked) return;
      playClickSound();
      setShowHymnModal(true);
  };

  const handlePlayHymn = (hymn: Hymn) => {
      playClickSound();
      if (currentHymn?.id === hymn.id) {
          // Toggle Play/Pause
          if (isHymnPlaying) {
              hymnAudioRef.current?.pause();
          } else {
              hymnAudioRef.current?.play();
          }
      } else {
          // New Hymn
          if (hymnAudioRef.current) {
              hymnAudioRef.current.src = hymn.url;
              hymnAudioRef.current.play().catch(e => console.error("Play error", e));
          }
          setCurrentHymn(hymn);
      }
  };

  const handleCloseHymnModal = () => {
      playClickSound();
      setShowHymnModal(false);
  };

  const handleReturnToHymnList = () => {
      playClickSound();
      setCurrentHymn(null);
      if (hymnAudioRef.current) hymnAudioRef.current.pause();
      setIsHymnPlaying(false);
  };

  // --- ELLEN WHITE LOGIC ---
  const handleOpenEGW = () => {
      if (isAppLocked) return;
      playClickSound();
      setShowEGWModal(true);
  };

  // --- ADMIN / PRIVATE LOGIC ---

  const handleOpenPrivate = () => {
      playClickSound();
      setPrivateView('login');
      setPasswordInput('');
      setErrorMsg('');
      setShowPrivateModal(true);
  };

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      const currentPass = getAdminPassword();
      if (passwordInput.trim() === currentPass) {
          playClickSound();
          setPrivateView('dashboard');
      } else {
          setErrorMsg('Senha incorreta.');
      }
  };

  const handleRecover = (e: React.FormEvent) => {
      e.preventDefault();
      if (passwordInput.trim().toLowerCase() === 'maranata') {
          playClickSound();
          resetAdminPassword();
          setPrivateView('login');
          setPasswordInput('');
          setErrorMsg('Senha resetada com sucesso para: admin123');
      } else {
          setErrorMsg('Palavra-chave incorreta.');
      }
  };

  const toggleAdminMode = () => {
      playClickSound();
      const newVal = !isAdminMode;
      setIsAdminMode(newVal);
      setAdminConfig({ isAdminMode: newVal, adminSoundEnabled, isAppLocked });
  };

  const toggleSoundMode = () => {
      playClickSound();
      const newVal = !adminSoundEnabled;
      setAdminSoundEnabled(newVal);
      setAdminConfig({ isAdminMode, adminSoundEnabled: newVal, isAppLocked });
  };

  const toggleAppLock = () => {
      playClickSound();
      const newVal = !isAppLocked;
      setIsAppLocked(newVal);
      setAdminConfig({ isAdminMode, adminSoundEnabled, isAppLocked: newVal });
  };

  const handleToggleBlock = (userId: string) => {
      playClickSound();
      const newList = toggleBlockUser(userId);
      setBlockedList(newList);
  };

  const handleChangePassword = (e: React.FormEvent) => {
      e.preventDefault();
      if (newPass.trim().length < 4) {
          setErrorMsg('A senha deve ter no mínimo 4 caracteres.');
          return;
      }
      playClickSound();
      setAdminPassword(newPass.trim());
      setNewPass('');
      setErrorMsg('Senha alterada com sucesso!');
      setTimeout(() => setErrorMsg(''), 3000);
  };

  // Menu items with improved accessibility descriptions (screenReaderText)
  const menuItems = [
    { 
        icon: BookOpen, 
        label: "Bíblia Sagrada", 
        desc: "Velho e Novo Testamento", 
        action: () => handleNavigate('bible'),
        screenReaderText: "Botão Bíblia Sagrada. Abra para ler todos os livros do velho e novo testamento." 
    },
    { 
        icon: Bell, 
        label: "Reflexão Diária", 
        desc: "Versículo e inspiração do dia", 
        action: handleOpenDailyMenu,
        screenReaderText: "Botão Reflexão Diária. Receba um versículo e uma mensagem inspiradora baseada em temas como ansiedade, gratidão e fé."
    },
    { 
        icon: Music, 
        label: "Hino Diário", 
        desc: "Louvor e Letra", 
        action: handleOpenHymns,
        screenReaderText: "Botão Hino Diário. Ouça hinos adventistas e globais com letras para acompanhamento."
    },
    { 
        icon: Feather, 
        label: "Ellen G. White", 
        desc: "Espírito de Profecia", 
        action: handleOpenEGW,
        screenReaderText: "Botão Ellen White. Acesse a biblioteca de livros do Espírito de Profecia, incluindo O Grande Conflito e Caminho a Cristo."
    },
    { 
        icon: GraduationCap, 
        label: "Cursos Teológicos", 
        desc: "Estudo das Profecias e Doutrinas", 
        action: () => handleNavigate('courses'),
        screenReaderText: "Botão Cursos Teológicos. Estude módulos sobre as 28 crenças fundamentais, profecias de Daniel e Apocalipse."
    },
    { 
        icon: Gamepad2, 
        label: "Quiz Bíblico", 
        desc: "Teste seus conhecimentos", 
        action: () => handleNavigate('quiz'),
        screenReaderText: "Botão Quiz Bíblico. Jogue um jogo de perguntas e respostas para testar seu conhecimento das escrituras."
    },
    { 
        icon: Scroll, 
        label: "Livros Apócrifos", 
        desc: "Literatura Histórica Extra-bíblica", 
        action: () => handleNavigate('apocrypha'),
        screenReaderText: "Botão Livros Apócrifos. Leia livros históricos como Macabeus e Enoque para fins de pesquisa."
    },
    { 
        icon: Search, 
        label: "Dicionário", 
        desc: "Termos, Significados e Lugares", 
        action: () => handleNavigate('dictionary'),
        screenReaderText: "Botão Dicionário Bíblico. Pesquise significados de palavras, nomes e lugares mencionados na Bíblia."
    },
    { 
        icon: Sparkles, 
        label: "Assistente IA", 
        desc: "Tire dúvidas teológicas", 
        action: () => handleNavigate('assistant'),
        screenReaderText: "Botão Assistente Inteligente. Converse com uma inteligência artificial para tirar dúvidas bíblicas e teológicas."
    },
    { 
        icon: Radio, 
        label: "Rádios Online", 
        desc: "Louvor e Adoração 24h", 
        action: () => handleNavigate('radios'),
        screenReaderText: "Botão Rádios Online. Ouça estações de rádio cristãs ao vivo, como Novo Tempo e outras."
    },
    { 
        icon: MessageCircle, 
        label: "Comunidade", 
        desc: "Chat e Interação Cristã", 
        action: () => handleNavigate('chat'),
        screenReaderText: "Botão Comunidade. Entre no chat para conversar e interagir com outros irmãos."
    },
    { 
        icon: Lock, 
        label: "Privado", 
        desc: null, 
        action: handleOpenPrivate,
        screenReaderText: "Botão Área Privada. Acesso restrito para administradores controlarem configurações do aplicativo."
    },
  ];

  const AnimatedButton = ({ icon: Icon, label, desc, onClick, index, screenReaderText, highlight }: any) => {
    const isRestricted = isAppLocked && label !== "Privado";
    
    return (
        <button
          onClick={onClick}
          disabled={isRestricted}
          style={{ animationDelay: `${index * 80}ms` }}
          className={`group relative w-full flex items-center gap-4 p-5 backdrop-blur-md border rounded-2xl shadow-lg transition-all duration-300 animate-in slide-in-from-bottom-4 fade-in fill-mode-backwards focus:outline-none focus:ring-2 focus:ring-[#bf953f]
            ${isRestricted 
                ? 'bg-black/50 border-gray-800 opacity-50 cursor-not-allowed' 
                : highlight 
                    ? 'bg-gradient-to-r from-[#bf953f]/20 to-[#3e2723]/80 border-[#bf953f] shadow-[0_0_15px_rgba(191,149,63,0.3)] hover:scale-[1.03]'
                    : 'bg-[#1a100e]/80 border-[#3e2723] hover:bg-[#2d1b18] hover:border-[#bf953f] hover:scale-[1.02]'
            }
          `}
          aria-label={label} 
        >
            {/* Hidden Text for Screen Readers (Accessibility Requirement) */}
            <span className="sr-only">{screenReaderText}</span>

            {/* Glow Effect */}
            {!isRestricted && <div className="absolute inset-0 bg-[#bf953f]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>}
    
            {/* Icon Container */}
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 z-10 
                ${isRestricted ? 'bg-gray-800 text-gray-500' : 'bg-gradient-to-br from-[#bf953f] to-[#5d4037] text-[#1a100e] group-hover:rotate-12'}`}>
                <Icon size={24} strokeWidth={2} aria-hidden="true" />
            </div>
            
            {/* Text Area */}
            <div className="flex-1 text-left flex flex-col z-10">
                <h3 className={`text-lg font-title font-bold tracking-wide uppercase leading-none ${isRestricted ? 'text-gray-500' : 'text-[#e0c9a6] group-hover:text-[#fcf6ba]'}`}>
                    {label}
                </h3>
                {/* Render Preview Description if exists */}
                {desc && (
                    <span className={`text-[11px] font-serif italic mt-1.5 leading-tight transition-colors ${isRestricted ? 'text-gray-600' : 'text-[#8d6e63] group-hover:text-[#bf953f]'}`}>
                        {desc}
                    </span>
                )}
            </div>
    
            {/* Action Indicator */}
            <div className={`transition-colors z-10 ${isRestricted ? 'text-gray-700' : 'text-[#5d4037] group-hover:text-[#bf953f] opacity-70'}`}>
                {isRestricted ? <Lock size={20} /> : (desc ? <ChevronRight size={20} /> : <Lock size={16} />)}
            </div>
        </button>
      );
  };

  return (
    <main className="min-h-screen bg-[#1a100e] flex flex-col items-center p-6 relative overflow-hidden" role="main" aria-label="Menu Principal">
      {/* Background Texture & Effects */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-40 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#3e2723]/30 via-transparent to-black pointer-events-none"></div>

      {isAppLocked && (
          <div className="fixed top-0 left-0 w-full bg-red-900/90 text-white text-center py-2 z-50 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 animate-in slide-in-from-top">
              <AlertTriangle size={14} /> Aplicativo em Manutenção / Bloqueado
          </div>
      )}

      {/* Main Menu List - Clean Layout (No Huge Header) */}
      <div className="w-full max-w-md relative z-10 flex flex-col justify-center gap-4 pt-16 pb-20">
        <nav className="flex flex-col gap-3 w-full" aria-label="Navegação Principal">
            {/* Install Button if available */}
            {installPrompt && (
                <AnimatedButton 
                    index={-1}
                    icon={Download}
                    label="Instalar Aplicativo"
                    desc="Baixe para usar offline no celular"
                    onClick={handleInstallApp}
                    screenReaderText="Botão Instalar Aplicativo. Adiciona o app à tela inicial do seu celular."
                    highlight={true}
                />
            )}

            {menuItems.map((item, idx) => (
                <AnimatedButton 
                    key={idx}
                    index={idx}
                    icon={item.icon}
                    label={item.label}
                    desc={item.desc}
                    onClick={item.action}
                    screenReaderText={item.screenReaderText}
                />
            ))}
        </nav>
      </div>

      {/* Daily Reflection Modal */}
      {showDailyModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="daily-title"
        >
          <div 
            className="relative w-full max-w-md bg-[#1a100e] border border-[#bf953f] shadow-[0_0_50px_rgba(191,149,63,0.3)] rounded-xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="bg-[#2d1b18] p-4 flex justify-between items-center border-b border-[#bf953f]/30 flex-shrink-0">
              <div className="flex items-center space-x-2 text-[#bf953f]">
                <Sparkles size={18} aria-hidden="true" />
                <h3 id="daily-title" className="font-title font-bold text-lg tracking-widest text-[#e0c9a6]">Inspiração do Dia</h3>
              </div>
              <button 
                onClick={() => { 
                    playClickSound(); 
                    setShowDailyModal(false); 
                    window.speechSynthesis.cancel();
                    setIsSpeaking(false);
                    setDailyData(null);
                }}
                className="text-[#bf953f] hover:text-[#fcf6ba] hover:bg-white/10 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-[#bf953f]"
                aria-label="Fechar"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')]">
                {loadingDaily ? (
                    <div className="h-[400px] flex flex-col items-center justify-center p-8 space-y-4">
                        <div className="w-12 h-12 border-2 border-[#bf953f] border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="font-serif text-[#8d6e63] animate-pulse text-sm uppercase tracking-widest text-center">
                            Buscando sabedoria nos céus...
                        </p>
                    </div>
                ) : dailyData ? (
                    <div className="p-8 text-center flex flex-col justify-center min-h-[400px] animate-in fade-in zoom-in duration-500">
                        <div className="space-y-8">
                            <div>
                                <h4 className="font-title text-2xl font-bold text-[#bf953f] mb-4 drop-shadow-md">{dailyData.reference}</h4>
                                <p className="font-serif text-xl italic text-[#e0c9a6] leading-relaxed">
                                "{dailyData.text}"
                                </p>
                            </div>
                            
                            <div className="relative py-4 border-t border-[#bf953f]/20 border-b border-[#bf953f]/20">
                                <p className="font-sans text-sm text-[#a1887f] leading-relaxed px-2">
                                    {dailyData.reflection}
                                </p>
                            </div>

                            <div className="flex justify-center gap-4">
                                <button 
                                    onClick={handleDualVoiceRead}
                                    className={`p-4 rounded-full border transition-all duration-300 shadow-lg ${isSpeaking ? 'border-[#bf953f] text-[#bf953f] bg-[#bf953f]/10 animate-pulse' : 'border-[#5d4037] text-[#8d6e63] bg-[#2d1b18] hover:border-[#bf953f] hover:text-[#bf953f] hover:scale-105'}`}
                                    title={isSpeaking ? "Parar" : "Ouvir"}
                                    aria-label={isSpeaking ? "Parar leitura" : "Ouvir reflexão"}
                                >
                                    {isSpeaking ? <Pause size={24} /> : <Mic size={24} />}
                                </button>
                            </div>

                            <button 
                                onClick={() => { playClickSound(); setDailyData(null); }}
                                className="text-xs text-[#bf953f] underline hover:text-[#fcf6ba] mt-4"
                            >
                                Escolher outro tema
                            </button>
                        </div>
                    </div>
                ) : (
                    // Menu Selection View
                    <div className="p-6">
                        <div className="text-center mb-6">
                            <h4 className="text-[#fcf6ba] font-serif mb-2">Como você está se sentindo?</h4>
                            <p className="text-xs text-[#8d6e63]">Escolha um tema para receber uma mensagem de Deus.</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            {REFLECTION_THEMES.map((theme) => (
                                <button
                                    key={theme.id}
                                    onClick={() => handleThemeSelect(theme.id, theme.label)}
                                    className="p-4 bg-[#2d1b18] border border-[#3e2723] rounded-lg hover:border-[#bf953f] hover:bg-[#3e2723] transition-all group flex flex-col items-center gap-2 active:scale-95"
                                >
                                    <theme.icon className={`w-6 h-6 ${theme.color} group-hover:scale-110 transition-transform`} />
                                    <span className="text-sm font-bold text-[#e0c9a6] group-hover:text-[#fcf6ba]">{theme.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Daily Hymn Modal */}
      {showHymnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in" role="dialog" aria-labelledby="hymn-title">
            <div className="w-full max-w-lg bg-[#1a100e] border border-[#3e2723] rounded-2xl overflow-hidden flex flex-col h-[85vh] shadow-[0_0_50px_rgba(62,39,35,0.8)]">
                {/* Header */}
                <div className="bg-[#2d1b18] p-4 flex justify-between items-center border-b border-[#3e2723]">
                    <h3 id="hymn-title" className="font-title font-bold text-[#fcf6ba] flex items-center gap-2">
                        <Music size={20} className="text-[#bf953f]" />
                        {currentHymn ? currentHymn.title : "Hino Diário"}
                    </h3>
                    <button onClick={handleCloseHymnModal} className="text-[#8d6e63] hover:text-[#fcf6ba] rounded-full p-1">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 flex flex-col overflow-hidden relative">
                    {/* View 1: List Selection */}
                    {!currentHymn && (
                        <div className="flex flex-col h-full animate-in slide-in-from-left duration-300">
                             {/* Tabs */}
                             <div className="flex p-2 bg-[#1a100e] border-b border-[#3e2723]">
                                <button 
                                    onClick={() => { playClickSound(); setHymnTab('adventist'); }}
                                    className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider rounded-lg transition-colors ${hymnTab === 'adventist' ? 'bg-[#3e2723] text-[#fcf6ba]' : 'text-[#5d4037] hover:text-[#8d6e63]'}`}
                                >
                                    Adventista
                                </button>
                                <button 
                                    onClick={() => { playClickSound(); setHymnTab('global'); }}
                                    className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider rounded-lg transition-colors ${hymnTab === 'global' ? 'bg-[#3e2723] text-[#fcf6ba]' : 'text-[#5d4037] hover:text-[#8d6e63]'}`}
                                >
                                    Global
                                </button>
                             </div>

                             <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {(hymnTab === 'adventist' ? ADVENTIST_HYMNS : GLOBAL_HYMNS).map((hymn) => (
                                    <button 
                                        key={hymn.id}
                                        onClick={() => handlePlayHymn(hymn)}
                                        className="w-full p-4 bg-[#2d1b18] border border-[#3e2723] rounded-xl flex items-center gap-4 hover:border-[#bf953f] hover:bg-[#3e2723] transition-all group"
                                    >
                                        <div className="w-12 h-12 bg-[#1a100e] rounded-full flex items-center justify-center border border-[#5d4037] group-hover:border-[#bf953f] shadow-inner">
                                            <Play size={20} className="text-[#8d6e63] group-hover:text-[#bf953f] ml-1" />
                                        </div>
                                        <div className="text-left flex-1">
                                            <h4 className="font-bold text-[#e0c9a6] group-hover:text-[#fcf6ba]">{hymn.title}</h4>
                                            <p className="text-xs text-[#8d6e63] italic">{hymn.artist}</p>
                                        </div>
                                    </button>
                                ))}
                             </div>
                        </div>
                    )}

                    {/* View 2: Player & Lyrics */}
                    {currentHymn && (
                        <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
                             <div className="bg-gradient-to-b from-[#3e2723] to-[#1a100e] p-6 text-center shadow-lg relative shrink-0">
                                <button 
                                    onClick={handleReturnToHymnList} 
                                    className="absolute top-4 left-4 p-2 text-[#bf953f] hover:text-[#fcf6ba] rounded-full bg-black/20"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                
                                <div className="w-32 h-32 mx-auto bg-[#1a100e] rounded-full border-4 border-[#3e2723] shadow-2xl flex items-center justify-center mb-4 relative">
                                    <Disc size={64} className={`text-[#bf953f] ${isHymnPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`} />
                                    {/* Center Hole */}
                                    <div className="absolute w-8 h-8 bg-[#3e2723] rounded-full border border-[#bf953f]/30"></div>
                                </div>
                                
                                <h2 className="text-xl font-title font-bold text-[#fcf6ba] mb-1">{currentHymn.title}</h2>
                                <p className="text-sm text-[#bf953f] italic mb-6">{currentHymn.artist}</p>

                                <div className="flex justify-center gap-6 items-center">
                                    <button 
                                        onClick={() => handlePlayHymn(currentHymn)}
                                        className="w-16 h-16 bg-[#bf953f] rounded-full text-[#1a100e] flex items-center justify-center shadow-[0_0_20px_rgba(191,149,63,0.3)] hover:scale-105 transition-transform"
                                    >
                                        {isHymnPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                                    </button>
                                </div>
                             </div>

                             <div className="flex-1 overflow-y-auto p-6 bg-[#1a100e]">
                                <div className="text-center">
                                    <h4 className="text-xs font-bold text-[#5d4037] uppercase tracking-widest mb-4">Letra</h4>
                                    <p className="font-serif text-lg leading-loose text-[#e0c9a6] whitespace-pre-line">
                                        {currentHymn.lyrics}
                                    </p>
                                </div>
                                <div className="h-20"></div> {/* Spacer */}
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* ELLEN G WHITE MODAL */}
      {showEGWModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in" role="dialog">
            <div className="w-full max-w-lg bg-[#1a100e] border border-[#bf953f] rounded-2xl overflow-hidden flex flex-col h-[85vh] shadow-[0_0_50px_rgba(191,149,63,0.2)]">
                <div className="bg-[#2d1b18] p-4 flex justify-between items-center border-b border-[#3e2723]">
                    <div className="flex items-center gap-2">
                        <Feather size={20} className="text-[#bf953f]" />
                        <div>
                            <h3 className="font-title font-bold text-[#fcf6ba] leading-none">Ellen G. White</h3>
                            <p className="text-[10px] text-[#8d6e63] uppercase tracking-widest">Espírito de Profecia</p>
                        </div>
                    </div>
                    <button onClick={() => { playClickSound(); setShowEGWModal(false); }} className="text-[#8d6e63] hover:text-[#fcf6ba] rounded-full p-1">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')]">
                    {EGW_BOOKS.map((book, idx) => (
                        <div 
                            key={idx}
                            className="bg-[#2d1b18] border border-[#3e2723] p-4 rounded-xl hover:border-[#bf953f] transition-all group flex flex-col gap-1"
                        >
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-[#e0c9a6] group-hover:text-[#fcf6ba] text-lg">{book.title}</h4>
                                <span className="text-xs bg-[#1a100e] text-[#bf953f] px-2 py-0.5 rounded border border-[#3e2723]">{book.year}</span>
                            </div>
                            <span className="text-xs text-[#bf953f] uppercase font-bold tracking-wider">{book.category}</span>
                            <p className="text-sm text-[#8d6e63] font-serif mt-2 leading-relaxed">{book.description}</p>
                        </div>
                    ))}
                    <div className="h-10"></div>
                </div>
            </div>
        </div>
      )}

      {/* ADMIN / PRIVATE MODAL */}
      {showPrivateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in" role="dialog" aria-labelledby="private-title">
             <div className="bg-[#f3e5ab] w-full max-w-sm rounded-xl shadow-2xl border-4 border-[#3e2723] overflow-hidden flex flex-col max-h-[85vh]">
                <div className="bg-[#3e2723] p-4 flex justify-between items-center border-b-4 border-[#bf953f]">
                    <h3 id="private-title" className="font-title font-bold text-[#fcf6ba] tracking-wide flex items-center gap-2">
                        <Lock size={18} /> Área Administrativa
                    </h3>
                    <button onClick={() => { playClickSound(); setShowPrivateModal(false); }} className="text-[#fcf6ba] hover:bg-white/10 rounded-full p-1">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto bg-white/50 p-6">
                    {/* Login View */}
                    {privateView === 'login' && (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="text-center mb-6">
                                <Key className="mx-auto text-[#bf953f] mb-2" size={40} />
                                <p className="text-sm text-[#5d4037]">Acesso restrito ao Administrador</p>
                            </div>
                            <input 
                                type="password" 
                                value={passwordInput}
                                onChange={e => setPasswordInput(e.target.value)}
                                placeholder="Senha de Acesso"
                                className="w-full p-3 border border-[#d7ccc8] rounded bg-white focus:outline-none focus:border-[#bf953f]"
                                autoFocus
                            />
                            {errorMsg && <p className={`text-xs text-center ${errorMsg.includes('sucesso') ? 'text-green-600' : 'text-red-500'}`}>{errorMsg}</p>}
                            <button type="submit" className="w-full py-3 bg-[#3e2723] text-[#fcf6ba] font-bold rounded uppercase tracking-wider hover:bg-[#5d4037]">
                                Entrar
                            </button>
                            <button 
                                type="button"
                                onClick={() => { setPrivateView('recover'); setPasswordInput(''); setErrorMsg(''); }}
                                className="w-full text-xs text-[#8d6e63] hover:text-[#bf953f] mt-2 underline"
                            >
                                Esqueci a senha
                            </button>
                        </form>
                    )}

                    {/* Recover View */}
                    {privateView === 'recover' && (
                        <form onSubmit={handleRecover} className="space-y-4">
                            <div className="text-center mb-6">
                                <AlertCircle className="mx-auto text-red-500 mb-2" size={40} />
                                <h4 className="font-bold text-[#3e2723]">Recuperação</h4>
                                <p className="text-sm text-[#5d4037]">Digite a palavra-chave mestra para resetar.</p>
                            </div>
                            <input 
                                type="password" 
                                value={passwordInput}
                                onChange={e => setPasswordInput(e.target.value)}
                                placeholder="Palavra-chave Mestra"
                                className="w-full p-3 border border-[#d7ccc8] rounded bg-white focus:outline-none focus:border-[#bf953f]"
                                autoFocus
                            />
                            {errorMsg && <p className={`text-xs text-center ${errorMsg.includes('sucesso') ? 'text-green-600' : 'text-red-500'}`}>{errorMsg}</p>}
                            <button type="submit" className="w-full py-3 bg-red-800 text-white font-bold rounded uppercase tracking-wider hover:bg-red-900">
                                Resetar Senha
                            </button>
                            <button 
                                type="button"
                                onClick={() => setPrivateView('login')}
                                className="w-full text-xs text-[#5d4037] hover:underline mt-2"
                            >
                                Voltar
                            </button>
                        </form>
                    )}

                    {/* Dashboard View Reformulada */}
                    {privateView === 'dashboard' && (
                        <div className="space-y-6">
                            
                            {/* Controle de Bloqueio de App */}
                            <div className="bg-red-50 p-4 rounded-lg border border-red-200 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="pr-4">
                                        <p className="text-sm font-bold text-red-800 flex items-center gap-2">
                                            <Power size={16} /> Bloquear Aplicativo
                                        </p>
                                        <p className="text-[10px] text-red-600">
                                            Impede o acesso de usuários a todas as funções, exceto esta área privada.
                                        </p>
                                    </div>
                                    <button 
                                        onClick={toggleAppLock}
                                        className={`p-1 rounded-full transition-colors ${isAppLocked ? 'text-red-600 bg-red-200' : 'text-gray-400 bg-gray-100'}`}
                                        aria-label={isAppLocked ? "Desbloquear Aplicativo" : "Bloquear Aplicativo"}
                                    >
                                        {isAppLocked ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                    </button>
                                </div>
                            </div>

                            {/* Seção 1: Monitoramento de Entrada */}
                            <div className="bg-white p-4 rounded-lg border border-[#d7ccc8] shadow-sm space-y-4">
                                <h4 className="font-bold text-[#3e2723] uppercase text-xs tracking-wider border-b border-[#eee] pb-2 flex items-center gap-2">
                                    <Siren size={16} /> Monitoramento de Acesso
                                </h4>
                                
                                <div className="flex items-center justify-between">
                                    <div className="pr-4">
                                        <p className="text-sm font-bold text-[#5d4037]">Notificações de Entrada</p>
                                        <p className="text-[10px] text-[#8d6e63]">Avisa quando usuários acessam o chat.</p>
                                    </div>
                                    <button 
                                        onClick={toggleAdminMode}
                                        className={`p-1 rounded-full transition-colors ${isAdminMode ? 'text-green-600 bg-green-100' : 'text-gray-400 bg-gray-100'}`}
                                    >
                                        {isAdminMode ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="pr-4">
                                        <p className="text-sm font-bold text-[#5d4037]">Alerta Sonoro</p>
                                        <p className="text-[10px] text-[#8d6e63]">Efeito sonoro ao detectar login.</p>
                                    </div>
                                    <button 
                                        onClick={toggleSoundMode}
                                        className={`p-1 rounded-full transition-colors ${adminSoundEnabled ? 'text-[#bf953f] bg-[#3e2723]' : 'text-gray-400 bg-gray-100'}`}
                                    >
                                        {adminSoundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                                    </button>
                                </div>
                            </div>

                            {/* Seção 2: Controle de Usuários (Ban List) */}
                            <div className="bg-white p-4 rounded-lg border border-[#d7ccc8] shadow-sm">
                                <h4 className="font-bold text-[#3e2723] uppercase text-xs tracking-wider border-b border-[#eee] pb-2 mb-3 flex items-center gap-2">
                                    <UserX size={16} /> Gerenciar Usuários
                                </h4>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {MOCK_USERS.map((user) => {
                                        const isBlocked = blockedList.includes(user.id);
                                        return (
                                            <div key={user.id} className={`flex items-center justify-between p-2 rounded border ${isBlocked ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white ${isBlocked ? 'bg-gray-400' : user.avatarColor}`}>
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className={`text-xs font-bold ${isBlocked ? 'text-red-700 line-through' : 'text-[#3e2723]'}`}>{user.name}</p>
                                                        <p className="text-[9px] text-gray-500">{user.isOnline ? 'Online' : 'Offline'}</p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleToggleBlock(user.id)}
                                                    className={`p-1.5 rounded transition-colors ${isBlocked ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                                                    title={isBlocked ? "Desbloquear Usuário" : "Banir Usuário"}
                                                >
                                                    {isBlocked ? <UserCheck size={16} /> : <UserX size={16} />}
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                                <p className="text-[10px] text-center text-gray-400 mt-2 italic">
                                    Usuários banidos não podem enviar mensagens.
                                </p>
                            </div>

                            {/* Seção 3: Configurações de Conta */}
                            <div className="space-y-2 pt-2 border-t border-[#d7ccc8]">
                                <button 
                                    onClick={() => { setPrivateView('change_pass'); setErrorMsg(''); }}
                                    className="w-full py-3 bg-[#e0c9a6] text-[#5d4037] font-bold rounded uppercase tracking-wider text-xs hover:bg-[#d7ccc8]"
                                >
                                    Alterar Senha de Acesso
                                </button>
                                <button 
                                    onClick={() => { setPrivateView('login'); setPasswordInput(''); }}
                                    className="w-full py-2 text-[#8d6e63] text-xs underline"
                                >
                                    Sair / Logout
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Change Password View */}
                    {privateView === 'change_pass' && (
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div className="text-center mb-4">
                                <h4 className="font-bold text-[#3e2723]">Alterar Senha</h4>
                            </div>
                            <input 
                                type="password" 
                                value={newPass}
                                onChange={e => setNewPass(e.target.value)}
                                placeholder="Nova Senha"
                                className="w-full p-3 border border-[#d7ccc8] rounded bg-white focus:outline-none focus:border-[#bf953f]"
                                autoFocus
                            />
                            {errorMsg && <p className={`text-xs text-center ${errorMsg.includes('sucesso') ? 'text-green-600' : 'text-red-500'}`}>{errorMsg}</p>}
                            <button type="submit" className="w-full py-3 bg-[#3e2723] text-[#fcf6ba] font-bold rounded uppercase tracking-wider hover:bg-[#5d4037]">
                                Salvar Nova Senha
                            </button>
                            <button 
                                type="button"
                                onClick={() => { setPrivateView('dashboard'); setErrorMsg(''); setNewPass(''); }}
                                className="w-full text-xs text-[#5d4037] hover:underline mt-2"
                            >
                                Cancelar
                            </button>
                        </form>
                    )}
                </div>
             </div>
          </div>
      )}
    </main>
  );
};

export default MainMenu;