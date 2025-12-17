import React, { useState, useMemo, useEffect, useRef } from 'react';
import { BookOpen, Award, ChevronRight, ChevronDown, PlayCircle, FileText, AlertCircle, Info, GraduationCap, Globe, Feather, Library, Volume2, Pause, StopCircle, Headphones, Star, TrendingUp, Crown, Sprout, Lock, Key, Tv, EyeOff, Image as ImageIcon } from 'lucide-react';
import { playClickSound } from '../constants';
import { fetchCourseContent, fetchCourseQuiz, CourseContent, QuizQuestion } from '../services/geminiService';
import { RESTRICTED_COURSES } from '../constants';
import { verifyAccessCode, isCourseUnlocked } from '../services/chatService';
import ReactMarkdown from 'react-markdown';

interface Props {
  onBack: () => void;
}

type DifficultyLevel = 'Fácil' | 'Médio' | 'Avançado' | 'Mestrado (Restrito)' | 'Novo Tempo';

interface CurriculumItem {
    id?: string; // ID opcional para cursos restritos
    level: DifficultyLevel;
    title: string;
    description: string;
    isLocked?: boolean;
    category?: string; // Para filtros da Novo Tempo
}

// GRADE CURRICULAR EXPANDIDA (ADVENTISTA)
const ADVENTIST_CURRICULUM: CurriculumItem[] = [
    // --- NÍVEL FÁCIL (BÁSICO) ---
    { level: 'Fácil', title: "Introdução à Teologia", description: "Conceitos básicos, história e como estudar a Bíblia." },
    { level: 'Fácil', title: "História da Igreja Adventista I", description: "O Grande Desapontamento e os pioneiros." },
    { level: 'Fácil', title: "Bíblia: O Pentateuco", description: "A Criação, o Êxodo e as leis de Moisés." },
    { level: 'Fácil', title: "Vida de Jesus (Evangelhos)", description: "Nascimento, ministério, morte e ressurreição de Cristo." },
    
    // --- NÍVEL MÉDIO (INTERMEDIÁRIO) ---
    { level: 'Médio', title: "Teologia Sistemática: Deus e Homem", description: "Antropologia bíblica, estado dos mortos e natureza divina." },
    { level: 'Médio', title: "História da Igreja Adventista II", description: "Expansão global e organização da IASD." },
    { level: 'Médio', title: "Livros Históricos e Poéticos", description: "Salmos, Provérbios e a história de Israel." },
    { level: 'Médio', title: "O Santuário Terrestre", description: "Simbologia do tabernáculo e o plano da redenção." },

    // --- NÍVEL AVANÇADO ---
    { level: 'Avançado', title: "Profecias de Daniel", description: "As 2300 tardes e manhãs, as bestas e o juízo." },
    { level: 'Avançado', title: "Profecias do Apocalipse", description: "As 7 igrejas, selos, trombetas e o fim dos tempos." },
    { level: 'Avançado', title: "O Santuário Celestial", description: "O Juízo Investigativo e o Dia da Expiação (Yom Kippur)." },
    { level: 'Avançado', title: "Teologia Sistemática: Escatologia", description: "Eventos finais, chuva serôdia e o fechamento da porta da graça." },
    
    // --- NÍVEL MESTRADO (RESTRITO / COM SENHA) ---
    ...RESTRICTED_COURSES.map(c => ({
        level: 'Mestrado (Restrito)' as DifficultyLevel,
        title: c.title,
        description: c.description,
        id: c.id,
        isLocked: true
    }))
];

// CURSOS NOVO TEMPO (CATEGORIZADOS & COMPLETOS)
const NOVO_TEMPO_CURRICULUM: CurriculumItem[] = [
    // --- BÍBLICOS ---
    { level: 'Novo Tempo', category: 'Bíblia', title: 'Bíblia Fácil', description: 'Estudo simples e direto das Escrituras.' },
    { level: 'Novo Tempo', category: 'Bíblia', title: 'Estudo Bíblico Interativo', description: 'Uma jornada dinâmica pela Palavra.' },
    { level: 'Novo Tempo', category: 'Bíblia', title: 'Verdades para o Tempo do Fim', description: 'Profecias essenciais para hoje.' },
    { level: 'Novo Tempo', category: 'Bíblia', title: 'Ensinos de Jesus', description: 'As parábolas e sermões do Mestre.' },
    { level: 'Novo Tempo', category: 'Bíblia', title: 'Meu Tempo com Deus', description: 'Devocional diário.' },
    { level: 'Novo Tempo', category: 'Bíblia', title: 'Código da Fé', description: 'Decifrando os mistérios da crença.' },
    { level: 'Novo Tempo', category: 'Bíblia', title: 'Meu Lugar no Mundo', description: 'Encontrando propósito na Bíblia.' },
    { level: 'Novo Tempo', category: 'Bíblia', title: '5 Coisas que te Aproximam de Deus', description: 'Passos práticos para a fé.' },
    { level: 'Novo Tempo', category: 'Bíblia', title: 'Lições para uma Vida mais Feliz 2.0', description: 'Sabedoria bíblica aplicada.' },
    { level: 'Novo Tempo', category: 'Bíblia', title: 'Bíblia Descomplicada', description: 'Entendendo textos difíceis.' },
    { level: 'Novo Tempo', category: 'Bíblia', title: 'Descobertas Bíblicas', description: 'Arqueologia e história.' },
    { level: 'Novo Tempo', category: 'Bíblia', title: 'O que Você Precisa Saber sobre o Sábado', description: 'O dia do Senhor.' },

    // --- FAMÍLIA & CASAIS ---
    { level: 'Novo Tempo', category: 'Família', title: 'Entre Família', description: 'Fortalecendo os laços do lar.' },
    { level: 'Novo Tempo', category: 'Família', title: 'Construir em Amor', description: 'Fundamentos para um lar cristão.' },
    { level: 'Novo Tempo', category: 'Família', title: 'Felizes para Sempre - Homens', description: 'Guia para maridos e pais.' },
    { level: 'Novo Tempo', category: 'Família', title: 'Felizes para Sempre - Mulheres', description: 'Guia para esposas e mães.' },
    { level: 'Novo Tempo', category: 'Família', title: 'Felizes na Intimidade', description: 'Sexualidade saudável no casamento.' },
    { level: 'Novo Tempo', category: 'Família', title: 'Pais Preparados, Filhos de Caráter', description: 'Educação de filhos.' },
    { level: 'Novo Tempo', category: 'Família', title: 'Juntos no Caminho', description: 'Discipulado em família.' },

    // --- SAÚDE & BEM-ESTAR ---
    { level: 'Novo Tempo', category: 'Saúde', title: 'Fique Leve', description: 'Emagrecimento e saúde física.' },
    { level: 'Novo Tempo', category: 'Saúde', title: 'Os 8 Remédios Naturais', description: 'Princípios de saúde adventista.' },
    { level: 'Novo Tempo', category: 'Saúde', title: 'Sentimentos: A Ciência do Existir', description: 'Saúde mental e emocional.' },
    { level: 'Novo Tempo', category: 'Saúde', title: 'O Segredo das Emoções', description: 'Inteligência emocional bíblica.' },
    { level: 'Novo Tempo', category: 'Saúde', title: 'Superando o Luto', description: 'Consolo e esperança na perda.' },
    { level: 'Novo Tempo', category: 'Saúde', title: 'Paz no Sofrimento', description: 'Encontrando conforto em Deus.' },

    // --- FINANÇAS ---
    { level: 'Novo Tempo', category: 'Finanças', title: 'Educação Financeira à Luz da Bíblia', description: 'Gestão de recursos.' },
    { level: 'Novo Tempo', category: 'Finanças', title: 'Saldo Mais', description: 'Saindo das dívidas e prosperando.' },

    // --- CRIANÇAS & JOVENS ---
    { level: 'Novo Tempo', category: 'Kids/Teens', title: 'Super Lupa', description: 'Ciência e criação para crianças.' },
    { level: 'Novo Tempo', category: 'Kids/Teens', title: 'Aventuras Bíblicas pelo Líbano', description: 'História bíblica para jovens.' },
    { level: 'Novo Tempo', category: 'Kids/Teens', title: 'Incríveis Milagres', description: 'Histórias de poder de Deus.' },
    { level: 'Novo Tempo', category: 'Kids/Teens', title: 'Aprendendo para Educar (Série)', description: 'Essencial para pais (Todas as idades).' },
    { level: 'Novo Tempo', category: 'Kids/Teens', title: 'Como se Tornar um Herói', description: 'Liderança e caráter para adolescentes.' },
    { level: 'Novo Tempo', category: 'Kids/Teens', title: 'A Minha Versão com Jesus', description: 'Discipulado jovem.' },

    // --- ESPECIAIS / PROFECIA / TEOLOGIA ---
    { level: 'Novo Tempo', category: 'Teologia', title: 'O Deus que Fala (Áudio)', description: 'Como ouvir a voz de Deus.' },
    { level: 'Novo Tempo', category: 'Teologia', title: 'Apocalipse: Mistérios Revelados', description: 'Desvendando o último livro.' },
    { level: 'Novo Tempo', category: 'Teologia', title: '1844 - A Jornada', description: 'A história do movimento adventista.' },
    { level: 'Novo Tempo', category: 'Teologia', title: 'Profecias de Daniel', description: 'História e profecia.' },
    { level: 'Novo Tempo', category: 'Teologia', title: 'O Espiritismo à Luz da Bíblia', description: 'Estudo apologético.' },
    { level: 'Novo Tempo', category: 'Teologia', title: 'Espírito Santo, o Deus dos Bastidores', description: 'Pneumatologia.' },
    { level: 'Novo Tempo', category: 'Teologia', title: 'Arqueologia e Bíblia', description: 'Evidências históricas.' },
    { level: 'Novo Tempo', category: 'Teologia', title: 'A Origem de Tudo', description: 'Criacionismo vs Evolucionismo.' },
    { level: 'Novo Tempo', category: 'Teologia', title: 'O Poder da Oração', description: 'Vida de oração profunda.' },
    { level: 'Novo Tempo', category: 'Teologia', title: 'Evidências', description: 'Ciência e Fé.' },
    { level: 'Novo Tempo', category: 'Teologia', title: 'Acordes', description: 'Música e adoração.' },
    { level: 'Novo Tempo', category: 'Teologia', title: 'Marcadas Pela Fé', description: 'Mulheres da Bíblia.' },
    { level: 'Novo Tempo', category: 'Teologia', title: 'Ouvindo a Voz de Deus', description: 'Discernimento espiritual.' },
    { level: 'Novo Tempo', category: 'Teologia', title: 'Histórias de Esperança', description: 'Testemunhos transformadores.' },
    { level: 'Novo Tempo', category: 'Teologia', title: 'Como Melhorar Sua Vida Espiritual', description: 'Crescimento diário.' },
    { level: 'Novo Tempo', category: 'Teologia', title: 'Por que Esperar?', description: 'Relacionamento cristão.' },
    { level: 'Novo Tempo', category: 'Teologia', title: 'Caminhada Cristã', description: 'A jornada do peregrino.' },
    { level: 'Novo Tempo', category: 'Teologia', title: '5 Hábitos para Mudar o Mundo', description: 'Vida missionária.' },
];

const TheologicalCourses: React.FC<Props> = ({ onBack }) => {
    // States
    const [view, setView] = useState('selection');
    const [activeTab, setActiveTab] = useState<'adventist' | 'novo_tempo'>('adventist');
    const [expandedLevel, setExpandedLevel] = useState<DifficultyLevel | string | null>(null);
    
    const [currentModule, setCurrentModule] = useState<CurriculumItem | null>(null);
    const [moduleContent, setModuleContent] = useState<CourseContent | null>(null);
    
    // Security State
    const [isBlurred, setIsBlurred] = useState(false);

    // Auth Modal State
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [courseToUnlock, setCourseToUnlock] = useState<CurriculumItem | null>(null);
    const [accessCodeInput, setAccessCodeInput] = useState('');
    const [authError, setAuthError] = useState('');

    const [loading, setLoading] = useState(false);

    // Audio / TTS States
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    // --- SECURITY LOGIC ---
    useEffect(() => {
        const handleContextMenu = (e: Event) => e.preventDefault();
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && (e.key === 'p' || e.key === 's')) e.preventDefault();
        };
        const handleBlur = () => setIsBlurred(true);
        const handleFocus = () => setIsBlurred(false);

        if (view === 'learning') {
            document.addEventListener('contextmenu', handleContextMenu);
            document.addEventListener('keydown', handleKeyDown);
            window.addEventListener('blur', handleBlur);
            window.addEventListener('focus', handleFocus);
        }

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
        };
    }, [view]);

    // Cleanup speech on unmount or view change
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, [view]);

    // Grouping Logic
    const groupedCurriculum = useMemo(() => {
        if (activeTab === 'adventist') {
            const groups: Record<string, CurriculumItem[]> = {
                'Fácil': [],
                'Médio': [],
                'Avançado': [],
                'Mestrado (Restrito)': []
            };
            ADVENTIST_CURRICULUM.forEach(item => {
                if (groups[item.level]) groups[item.level].push(item);
            });
            return groups;
        } else {
            // Group Novo Tempo by Category
            const groups: Record<string, CurriculumItem[]> = {};
            NOVO_TEMPO_CURRICULUM.forEach(item => {
                const cat = item.category || 'Geral';
                if (!groups[cat]) groups[cat] = [];
                groups[cat].push(item);
            });
            return groups;
        }
    }, [activeTab]);

    const toggleLevel = (lvl: string) => {
        playClickSound();
        setExpandedLevel(expandedLevel === lvl ? null : lvl);
    };

    const handleCourseClick = (item: CurriculumItem) => {
        playClickSound();
        if (item.isLocked && item.id) {
            if (isCourseUnlocked(item.id)) {
                startModule(item);
            } else {
                setCourseToUnlock(item);
                setAccessCodeInput('');
                setAuthError('');
                setShowAuthModal(true);
            }
        } else {
            startModule(item);
        }
    };

    const handleUnlockCourse = () => {
        if (!courseToUnlock || !courseToUnlock.id) return;
        
        const success = verifyAccessCode(courseToUnlock.id, accessCodeInput);
        if (success) {
            playClickSound();
            setShowAuthModal(false);
            startModule(courseToUnlock);
        } else {
            setAuthError('Senha inválida.');
        }
    };

    const startModule = async (item: CurriculumItem) => {
        setCurrentModule(item);
        setLoading(true);
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        
        try {
            const context = activeTab === 'adventist' 
                ? "Teologia Adventista do Sétimo Dia (IASD)" 
                : "Curso Bíblico Novo Tempo (Linguagem acessível e prática)";
            
            const content = await fetchCourseContent(context, item.title);
            setModuleContent(content);
            setView('learning');
        } catch (e) {
            console.error(e);
            alert("Erro ao carregar curso.");
        } finally {
            setLoading(false);
        }
    };

    // --- AUDIO FUNCTIONS ---
    const cleanMarkdownForSpeech = (text: string): string => {
        return text
            .replace(/!\[.*?\]\(.*?\)/g, ' Visualização de imagem. ') // Remove imagens para leitura
            .replace(/[#*`_]/g, '')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            .replace(/^\s*[-+*]\s+/gm, ', ');
    };

    const handleSpeak = () => {
        playClickSound();
        if (!moduleContent) return;

        if (isPaused) {
            window.speechSynthesis.resume();
            setIsPaused(false);
            setIsSpeaking(true);
            return;
        }

        if (isSpeaking) {
            window.speechSynthesis.pause();
            setIsPaused(true);
            setIsSpeaking(false);
            return;
        }

        const cleanText = cleanMarkdownForSpeech(moduleContent.content);
        const titleText = `Curso: ${moduleContent.title}. ${cleanText}`;
        
        const utterance = new SpeechSynthesisUtterance(titleText);
        utterance.lang = 'pt-BR';
        utterance.rate = 1.0;
        
        const voices = window.speechSynthesis.getVoices();
        const ptVoice = voices.find(v => v.lang === 'pt-BR' && v.name.includes('Google')) || voices.find(v => v.lang === 'pt-BR');
        if (ptVoice) utterance.voice = ptVoice;

        utterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
        };
        
        speechUtteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
    };

    const handleStopSpeech = () => {
        playClickSound();
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
    };

    const SecurityShield = () => (
      <div className={`absolute inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center text-center p-8 transition-opacity duration-300 ${isBlurred ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <EyeOff size={64} className="text-red-500 mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-red-500 uppercase tracking-widest mb-2">Conteúdo Protegido</h2>
          <p className="text-gray-400 font-serif">Visualização oculta por segurança.</p>
      </div>
    );

    // --- MARKDOWN RENDERERS PARA IMAGENS SEGURAS ---
    const markdownComponents = {
        img: ({node, ...props}: any) => {
            // Usa o Pollinations AI para gerar a imagem baseada no prompt (alt text)
            const prompt = props.alt ? encodeURIComponent(props.alt) : 'bible';
            const safeImageUrl = `https://image.pollinations.ai/prompt/${prompt}?width=800&height=450&nologo=true&seed=${Math.random()}`;
            
            return (
                <div className="my-8 relative rounded-xl overflow-hidden shadow-2xl border border-[#2dd4bf]/30 group select-none pointer-events-none user-select-none">
                    {/* Security Overlay (Transparent but blocks interaction) */}
                    <div 
                        className="absolute inset-0 z-20 bg-transparent" 
                        onContextMenu={(e) => e.preventDefault()}
                    />
                    
                    <div className="relative aspect-video bg-[#042f2e]">
                        <img 
                            src={safeImageUrl} 
                            alt="Ilustração do Curso" 
                            className="w-full h-full object-cover transition-transform duration-[20s] ease-linear transform scale-100 group-hover:scale-110 opacity-90"
                            loading="lazy"
                            onContextMenu={(e) => e.preventDefault()}
                            draggable={false}
                        />
                        {/* Marca d'água de proteção */}
                        <div className="absolute bottom-2 right-2 text-[10px] text-white/30 font-bold uppercase tracking-widest z-10 pointer-events-none">
                            Material Protegido • Não Copiar
                        </div>
                    </div>
                    
                    <div className="bg-[#0f172a] p-3 border-t border-[#2dd4bf]/20 flex items-center justify-center gap-2">
                        <ImageIcon size={14} className="text-[#2dd4bf]" />
                        <span className="text-xs text-[#99f6e4] font-serif italic text-center">
                            Ilustração: {props.alt || 'Conteúdo Visual'}
                        </span>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen bg-[#042f2e] text-[#ccfbf1] flex flex-col relative overflow-hidden font-sans">
             {/* Background Texture & Effects (Petrol Theme) */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-20 pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#0f172a] via-[#115e59]/20 to-[#042f2e] pointer-events-none"></div>

            {/* Header */}
            <header className="bg-[#042f2e]/90 backdrop-blur-md p-4 flex items-center gap-4 sticky top-0 z-20 border-b border-[#2dd4bf]/20 shadow-lg">
                <button 
                    onClick={() => { playClickSound(); handleStopSpeech(); onBack(); }}
                    className="p-2 text-[#2dd4bf] hover:text-[#ccfbf1] hover:bg-[#134e4a] rounded-full focus:outline-none focus:ring-2 focus:ring-[#2dd4bf]"
                    aria-label="Voltar para o menu principal"
                >
                    <ChevronRight size={24} className="rotate-180" />
                </button>
                <h1 className="text-lg font-title font-bold text-[#ccfbf1] uppercase tracking-widest flex-1 text-center drop-shadow-md">
                    Faculdade Teológica
                </h1>
                <div className="w-10"></div>
            </header>

            <main className="flex-1 p-4 max-w-md mx-auto w-full relative z-10 pb-20" role="main">
                {/* Security Shield */}
                {view === 'learning' && <SecurityShield />}

                {loading && (
                    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                        <div className="w-16 h-16 border-4 border-[#2dd4bf] border-t-transparent rounded-full animate-spin mb-6"></div>
                        <p className="text-[#ccfbf1] font-title text-xl animate-pulse">Carregando Curso...</p>
                    </div>
                )}

                {!loading && view === 'selection' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        
                        {/* Tab Switcher */}
                        <div className="flex p-1 bg-[#0f172a]/60 rounded-xl border border-[#2dd4bf]/20 mb-6 backdrop-blur-md" role="tablist">
                            <button
                                role="tab"
                                aria-selected={activeTab === 'adventist'}
                                onClick={() => { playClickSound(); setActiveTab('adventist'); }}
                                className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#2dd4bf] ${
                                    activeTab === 'adventist' 
                                    ? 'bg-[#2dd4bf] text-[#042f2e] shadow-[0_0_15px_rgba(45,212,191,0.3)]' 
                                    : 'text-[#5eead4] hover:text-[#ccfbf1] hover:bg-[#134e4a]/40'
                                }`}
                            >
                                <Feather size={16} aria-hidden="true" /> Teologia
                            </button>
                            <button
                                role="tab"
                                aria-selected={activeTab === 'novo_tempo'}
                                onClick={() => { playClickSound(); setActiveTab('novo_tempo'); }}
                                className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#2dd4bf] ${
                                    activeTab === 'novo_tempo' 
                                    ? 'bg-[#2dd4bf] text-[#042f2e] shadow-[0_0_15px_rgba(45,212,191,0.3)]' 
                                    : 'text-[#5eead4] hover:text-[#ccfbf1] hover:bg-[#134e4a]/40'
                                }`}
                            >
                                <Tv size={16} aria-hidden="true" /> Novo Tempo
                            </button>
                        </div>

                        {/* Curriculum List */}
                        <div className="space-y-4">
                            {(Object.keys(groupedCurriculum) as string[]).map((levelName, idx) => {
                                const isExpanded = expandedLevel === levelName;
                                const moduleItems = groupedCurriculum[levelName];
                                
                                return (
                                    <div 
                                        key={levelName} 
                                        style={{ animationDelay: `${idx * 150}ms` }}
                                        className="animate-in slide-in-from-bottom-4 fade-in fill-mode-backwards"
                                    >
                                        <button 
                                            onClick={() => toggleLevel(levelName)}
                                            className={`group relative w-full flex items-center gap-4 p-5 backdrop-blur-md border rounded-2xl shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#2dd4bf]
                                                ${isExpanded 
                                                    ? 'bg-[#115e59]/80 border-[#2dd4bf] shadow-[0_0_15px_rgba(45,212,191,0.2)]' 
                                                    : 'bg-[#134e4a]/40 border-[#2dd4bf]/30 hover:bg-[#115e59]/60 hover:border-[#5eead4] hover:scale-[1.02]'
                                                }
                                            `}
                                        >
                                            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg transition-transform duration-300 z-10
                                                ${isExpanded ? 'bg-[#2dd4bf] text-[#042f2e]' : 'bg-gradient-to-br from-[#2dd4bf] to-[#0f766e] text-[#042f2e] group-hover:rotate-12'}`}>
                                                {activeTab === 'adventist' ? <GraduationCap size={24} /> : <Tv size={24} />}
                                            </div>

                                            <div className="flex-1 text-left flex flex-col z-10">
                                                <span className={`font-title font-bold tracking-wide uppercase leading-none text-[#5eead4]`}>
                                                    {levelName}
                                                </span>
                                                <span className={`text-[11px] font-serif italic mt-1.5 leading-tight transition-colors ${isExpanded ? 'text-[#99f6e4]' : 'text-[#5eead4] group-hover:text-[#2dd4bf]'}`}>
                                                    {moduleItems.length} Cursos Disponíveis
                                                </span>
                                            </div>

                                            <div className={`transition-transform duration-300 z-10 ${isExpanded ? 'rotate-180 text-[#2dd4bf]' : 'text-[#2dd4bf]/70 group-hover:text-[#2dd4bf]'}`}>
                                                <ChevronDown size={24} />
                                            </div>
                                        </button>
                                        
                                        {/* Modules List */}
                                        {isExpanded && (
                                            <div className="mt-2 space-y-2 pl-4 border-l-2 border-[#2dd4bf]/20 ml-6">
                                                {moduleItems.map((item, mIdx) => (
                                                    <button
                                                        key={mIdx}
                                                        style={{ animationDelay: `${mIdx * 50}ms` }}
                                                        onClick={() => handleCourseClick(item)}
                                                        className="w-full text-left p-4 bg-[#0f172a]/60 border border-[#2dd4bf]/10 rounded-xl hover:bg-[#115e59]/40 hover:border-[#2dd4bf]/40 transition-all flex items-center gap-4 group focus:outline-none focus:bg-[#115e59]/40 animate-in slide-in-from-left fade-in fill-mode-backwards"
                                                    >
                                                        <div className={`p-2 rounded-full transition-colors shadow-inner ${item.isLocked ? 'bg-red-900/40 text-red-400' : 'bg-[#042f2e] text-[#2dd4bf] group-hover:bg-[#2dd4bf] group-hover:text-[#042f2e]'}`}>
                                                            {item.isLocked ? <Lock size={16} /> : <BookOpen size={16} />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-[#ccfbf1] group-hover:text-white transition-colors text-sm">{item.title}</h4>
                                                            <p className="text-[10px] text-[#99f6e4] mt-0.5 font-serif italic opacity-70 group-hover:opacity-100">{item.description}</p>
                                                        </div>
                                                        <PlayCircle size={16} className="text-[#2dd4bf] opacity-0 group-hover:opacity-100 transition-all transform group-hover:scale-110" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Password Modal */}
                {showAuthModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in" role="dialog">
                        <div className="bg-[#1a100e] border border-[#bf953f] w-full max-w-sm rounded-xl p-6 shadow-2xl">
                             <div className="text-center mb-6">
                                 <Lock size={40} className="mx-auto text-[#bf953f] mb-2" />
                                 <h3 className="font-bold text-[#fcf6ba] text-lg">Módulo Restrito</h3>
                                 <p className="text-xs text-[#8d6e63]">Este conteúdo requer liberação do administrador.</p>
                             </div>
                             <input 
                                type="text"
                                value={accessCodeInput}
                                onChange={e => setAccessCodeInput(e.target.value.toUpperCase())}
                                placeholder="Insira a Senha"
                                className="w-full p-3 bg-[#042f2e] border border-[#2dd4bf]/30 rounded text-center font-mono text-lg tracking-widest text-[#ccfbf1] mb-4 uppercase focus:outline-none focus:border-[#2dd4bf]"
                                autoFocus
                             />
                             {authError && <p className="text-xs text-red-400 text-center mb-4">{authError}</p>}
                             <div className="flex gap-2">
                                 <button onClick={() => setShowAuthModal(false)} className="flex-1 py-3 bg-[#2d1b18] text-[#8d6e63] font-bold rounded uppercase text-xs hover:bg-[#3e2723]">Cancelar</button>
                                 <button onClick={handleUnlockCourse} className="flex-1 py-3 bg-[#2dd4bf] text-[#042f2e] font-bold rounded uppercase text-xs hover:bg-[#ccfbf1]">Liberar</button>
                             </div>
                        </div>
                    </div>
                )}

                {!loading && view === 'learning' && moduleContent && (
                    <div className="space-y-6 animate-in slide-in-from-right duration-500 secure-content">
                        {/* Audio Player */}
                        <div 
                            className="bg-[#115e59]/40 backdrop-blur-md border border-[#2dd4bf] rounded-xl p-4 shadow-lg flex items-center justify-between sticky top-20 z-30"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-[#042f2e] text-[#2dd4bf] ${isSpeaking && !isPaused ? 'animate-pulse' : ''}`}>
                                    <Headphones size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-[#ccfbf1]">Áudio Aula</h3>
                                    <p className="text-[10px] text-[#99f6e4] uppercase tracking-wider">{isSpeaking ? (isPaused ? "Pausado" : "Reproduzindo...") : "Toque para ouvir"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={handleSpeak}
                                    className="p-3 bg-[#2dd4bf] text-[#042f2e] rounded-full hover:bg-[#ccfbf1] shadow-md transition-transform active:scale-95 focus:outline-none"
                                >
                                    {isSpeaking && !isPaused ? <Pause size={20} fill="currentColor" /> : <Volume2 size={20} />}
                                </button>
                                {(isSpeaking || isPaused) && (
                                    <button 
                                        onClick={handleStopSpeech}
                                        className="p-3 bg-[#042f2e] text-red-400 border border-red-900 rounded-full hover:bg-red-900/20 shadow-md transition-transform active:scale-95"
                                    >
                                        <StopCircle size={20} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Content with Secure Images */}
                        <article className="prose prose-invert prose-p:text-[#ccfbf1] prose-headings:text-[#2dd4bf] prose-strong:text-[#5eead4] max-w-none font-serif leading-loose text-lg bg-[#0f172a]/50 p-4 rounded-lg border border-[#2dd4bf]/10 selection:bg-red-900/50">
                            <div className="p-6 bg-[#134e4a]/30 rounded-xl border border-[#2dd4bf]/20 shadow-lg mb-8 backdrop-blur-sm">
                                <h1 className="text-3xl font-title font-bold text-[#ccfbf1] text-center mb-2">{moduleContent.title}</h1>
                                <div className="h-1 w-20 bg-[#2dd4bf] mx-auto rounded-full"></div>
                            </div>
                            <ReactMarkdown components={markdownComponents}>{moduleContent.content}</ReactMarkdown>
                        </article>

                        {/* Footer */}
                        <div className="pt-8 border-t border-[#2dd4bf]/20 sticky bottom-4 z-30">
                            <button 
                                onClick={() => { handleStopSpeech(); setView('selection'); }}
                                className="w-full mt-3 py-3 bg-[#134e4a]/40 text-[#99f6e4] font-bold uppercase tracking-widest rounded-xl hover:text-white transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#5eead4] border border-[#2dd4bf]/20 hover:border-[#2dd4bf]/50"
                            >
                                Voltar à Grade
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default TheologicalCourses;