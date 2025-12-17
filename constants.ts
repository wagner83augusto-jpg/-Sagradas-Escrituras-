import { Book } from './types';

export const BIBLE_BOOKS: Book[] = [
  { name: 'Gênesis', testament: 'Old', chapters: 50 },
  { name: 'Êxodo', testament: 'Old', chapters: 40 },
  { name: 'Levítico', testament: 'Old', chapters: 27 },
  { name: 'Números', testament: 'Old', chapters: 36 },
  { name: 'Deuteronômio', testament: 'Old', chapters: 34 },
  { name: 'Josué', testament: 'Old', chapters: 24 },
  { name: 'Juízes', testament: 'Old', chapters: 21 },
  { name: 'Rute', testament: 'Old', chapters: 4 },
  { name: '1 Samuel', testament: 'Old', chapters: 31 },
  { name: '2 Samuel', testament: 'Old', chapters: 24 },
  { name: '1 Reis', testament: 'Old', chapters: 22 },
  { name: '2 Reis', testament: 'Old', chapters: 25 },
  { name: '1 Crônicas', testament: 'Old', chapters: 29 },
  { name: '2 Crônicas', testament: 'Old', chapters: 36 },
  { name: 'Esdras', testament: 'Old', chapters: 10 },
  { name: 'Neemias', testament: 'Old', chapters: 13 },
  { name: 'Ester', testament: 'Old', chapters: 10 },
  { name: 'Jó', testament: 'Old', chapters: 42 },
  { name: 'Salmos', testament: 'Old', chapters: 150 },
  { name: 'Provérbios', testament: 'Old', chapters: 31 },
  { name: 'Eclesiastes', testament: 'Old', chapters: 12 },
  { name: 'Cânticos', testament: 'Old', chapters: 8 },
  { name: 'Isaías', testament: 'Old', chapters: 66 },
  { name: 'Jeremias', testament: 'Old', chapters: 52 },
  { name: 'Lamentações', testament: 'Old', chapters: 5 },
  { name: 'Ezequiel', testament: 'Old', chapters: 48 },
  { name: 'Daniel', testament: 'Old', chapters: 12 },
  { name: 'Oseias', testament: 'Old', chapters: 14 },
  { name: 'Joel', testament: 'Old', chapters: 3 },
  { name: 'Amós', testament: 'Old', chapters: 9 },
  { name: 'Obadias', testament: 'Old', chapters: 1 },
  { name: 'Jonas', testament: 'Old', chapters: 4 },
  { name: 'Miqueias', testament: 'Old', chapters: 7 },
  { name: 'Naum', testament: 'Old', chapters: 3 },
  { name: 'Habacuque', testament: 'Old', chapters: 3 },
  { name: 'Sofonias', testament: 'Old', chapters: 3 },
  { name: 'Ageu', testament: 'Old', chapters: 2 },
  { name: 'Zacarias', testament: 'Old', chapters: 14 },
  { name: 'Malaquias', testament: 'Old', chapters: 4 },
  { name: 'Mateus', testament: 'New', chapters: 28 },
  { name: 'Marcos', testament: 'New', chapters: 16 },
  { name: 'Lucas', testament: 'New', chapters: 24 },
  { name: 'João', testament: 'New', chapters: 21 },
  { name: 'Atos', testament: 'New', chapters: 28 },
  { name: 'Romanos', testament: 'New', chapters: 16 },
  { name: '1 Coríntios', testament: 'New', chapters: 16 },
  { name: '2 Coríntios', testament: 'New', chapters: 13 },
  { name: 'Gálatas', testament: 'New', chapters: 6 },
  { name: 'Efésios', testament: 'New', chapters: 6 },
  { name: 'Filipenses', testament: 'New', chapters: 4 },
  { name: 'Colossenses', testament: 'New', chapters: 4 },
  { name: '1 Tessalonicenses', testament: 'New', chapters: 5 },
  { name: '2 Tessalonicenses', testament: 'New', chapters: 3 },
  { name: '1 Timóteo', testament: 'New', chapters: 6 },
  { name: '2 Timóteo', testament: 'New', chapters: 4 },
  { name: 'Tito', testament: 'New', chapters: 3 },
  { name: 'Filemom', testament: 'New', chapters: 1 },
  { name: 'Hebreus', testament: 'New', chapters: 13 },
  { name: 'Tiago', testament: 'New', chapters: 5 },
  { name: '1 Pedro', testament: 'New', chapters: 5 },
  { name: '2 Pedro', testament: 'New', chapters: 3 },
  { name: '1 João', testament: 'New', chapters: 5 },
  { name: '2 João', testament: 'New', chapters: 1 },
  { name: '3 João', testament: 'New', chapters: 1 },
  { name: 'Judas', testament: 'New', chapters: 1 },
  { name: 'Apocalipse', testament: 'New', chapters: 22 }
];

export const APOCRYPHA_BOOKS: Book[] = [
    { name: '1 Enoque', testament: 'Old', chapters: 108 },
    { name: 'Tobias', testament: 'Old', chapters: 14 },
    { name: 'Judite', testament: 'Old', chapters: 16 },
    { name: 'Sabedoria de Salomão', testament: 'Old', chapters: 19 },
    { name: 'Eclesiástico (Sirácida)', testament: 'Old', chapters: 51 },
    { name: 'Baruque', testament: 'Old', chapters: 6 },
    { name: '1 Macabeus', testament: 'Old', chapters: 16 },
    { name: '2 Macabeus', testament: 'Old', chapters: 15 },
    { name: 'Oração de Manassés', testament: 'Old', chapters: 1 }
];

export const ELLEN_WHITE_BOOKS: Book[] = [
    // Série Conflito
    { name: 'Patriarcas e Profetas', testament: 'Old', chapters: 73 },
    { name: 'Profetas e Reis', testament: 'Old', chapters: 60 },
    { name: 'O Desejado de Todas as Nações', testament: 'New', chapters: 87 },
    { name: 'Atos dos Apóstolos', testament: 'New', chapters: 58 },
    { name: 'O Grande Conflito', testament: 'New', chapters: 42 },
    
    // Vida Cristã e Devocional
    { name: 'Caminho a Cristo', testament: 'New', chapters: 13 },
    { name: 'Parábolas de Jesus', testament: 'New', chapters: 29 },
    { name: 'O Maior Discurso de Cristo', testament: 'New', chapters: 6 },
    { name: 'Eventos Finais', testament: 'New', chapters: 20 },
    
    // Conselhos e Igreja
    { name: 'Primeiros Escritos', testament: 'New', chapters: 10 },
    { name: 'Conselhos sobre Regime Alimentar', testament: 'New', chapters: 25 },
    { name: 'Mensagens aos Jovens', testament: 'New', chapters: 15 },
    { name: 'O Lar Adventista', testament: 'New', chapters: 20 },
    { name: 'Vida e Ensinos', testament: 'New', chapters: 10 },
    { name: 'Conselhos para a Igreja', testament: 'New', chapters: 66 },
    { name: 'Educação', testament: 'New', chapters: 35 },
    { name: 'Mente, Caráter e Personalidade', testament: 'New', chapters: 89 }
];

export const RODRIGO_SILVA_BOOKS: Book[] = [
    { name: 'A Bíblia de Álef a Ômega', testament: 'New', chapters: 10 },
    { name: 'O Ceticismo da Fé', testament: 'New', chapters: 12 },
    { name: 'A Bíblia e o Antigo Egito', testament: 'Old', chapters: 10 },
    { name: 'Maria Madalena', testament: 'New', chapters: 8 },
    { name: 'Enciclopédia Histórica da Vida de Jesus', testament: 'New', chapters: 20 },
    { name: 'O Caminho da Cruz', testament: 'New', chapters: 7 },
    { name: 'Deus e o Vazio Humano', testament: 'New', chapters: 6 },
    { name: 'Descobertas da Fé', testament: 'New', chapters: 8 },
    { name: 'Escavando a Verdade', testament: 'Old', chapters: 15 },
    { name: 'A Sujeira Debaixo do Tapete', testament: 'New', chapters: 5 },
    { name: 'O Peregrino', testament: 'New', chapters: 10 },
    { name: 'A Educação Física e o Bullying', testament: 'New', chapters: 6 },
    { name: 'Nada nos Faltará', testament: 'Old', chapters: 6 },
    { name: 'Sobre Taipas e Textos', testament: 'New', chapters: 8 },
    { name: 'Guia Politicamente Incorreto da Política Brasileira', testament: 'New', chapters: 12 },
    { name: '40 Dias com Jesus Mestre', testament: 'New', chapters: 40 },
    { name: 'Ministério Público e o Meio Ambiente', testament: 'New', chapters: 10 },
    { name: 'Gosto, Interpretação e Crítica', testament: 'New', chapters: 8 },
    { name: 'Garnisé: Criação, Raças, Doenças, Vacinação', testament: 'New', chapters: 5 },
    { name: 'Peelings Químicos Estéticos', testament: 'New', chapters: 6 },
    { name: 'O Plano de Negócios de Deus', testament: 'New', chapters: 10 },
    { name: 'A Bola e o Verbo', testament: 'New', chapters: 7 },
    { name: 'Paulo Freire e a Psicanálise Humanista', testament: 'New', chapters: 9 },
    { name: 'A Bíblia Comentada com Rodrigo Silva', testament: 'New', chapters: 66 }
];

export const MICHELSON_BORGES_BOOKS: Book[] = [
    { name: 'A História da Vida', testament: 'Old', chapters: 15 },
    { name: 'O Poder da Esperança', testament: 'New', chapters: 10 },
    { name: 'Nos Bastidores da Mídia', testament: 'Old', chapters: 12 },
    { name: 'Desvendando as Origens', testament: 'Old', chapters: 8 },
    { name: 'Terra de Gigantes', testament: 'Old', chapters: 10 },
    { name: 'A Descoberta', testament: 'New', chapters: 15 }
];

// --- NOVOS AUTORES CLÁSSICOS ---

export const JOHN_BUNYAN_BOOKS: Book[] = [
    { name: 'O Peregrino', testament: 'New', chapters: 20 },
    { name: 'A Guerra Santa', testament: 'New', chapters: 18 },
    { name: 'Graça Abundante', testament: 'New', chapters: 10 },
    { name: 'Um Tratado Sobre Oração', testament: 'New', chapters: 7 },
    { name: 'A Vida e Morte do Sr. Badman', testament: 'New', chapters: 12 }
];

export const SINCLAIR_FERGUSON_BOOKS: Book[] = [
    { name: 'Quem é o Espírito Santo', testament: 'New', chapters: 12 },
    { name: 'O Cristo Inteiro', testament: 'New', chapters: 10 },
    { name: 'A Vida Cristã', testament: 'New', chapters: 15 },
    { name: 'Devotados a Deus', testament: 'New', chapters: 10 },
    { name: 'Por Causa de Cristo', testament: 'New', chapters: 8 }
];

export const CHARLES_FINNEY_BOOKS: Book[] = [
    { name: 'Teologia Sistemática', testament: 'New', chapters: 40 },
    { name: 'Discursos sobre Avivamento', testament: 'New', chapters: 22 },
    { name: 'O Poder do Alto', testament: 'New', chapters: 10 },
    { name: 'Uma Vida Cheia do Espírito', testament: 'New', chapters: 15 }
];


// --- CURSOS RESTRITOS (PARA CONTROLE DO ADMIN) ---
export const RESTRICTED_COURSES = [
    { id: 'rest_1', title: 'Hermenêutica Avançada: Daniel 11', description: 'Exegese profunda dos reis do norte e do sul.' },
    { id: 'rest_2', title: 'O Selamento e os 144 Mil', description: 'Estudo exclusivo sobre os eventos finais e o remanescente.' },
    { id: 'rest_3', title: 'Grego Koiné: Tradução de Manuscritos', description: 'Módulo prático de tradução do Codex Sinaiticus.' },
    { id: 'rest_4', title: 'Psicologia Pastoral em Crises', description: 'Treinamento para lidar com traumas e luto na igreja.' },
    { id: 'rest_5', title: 'Administração Eclesiástica Superior', description: 'Gestão financeira e liderança de campo.' },
];

// --- SISTEMA DE ÁUDIO ---

// Singleton AudioContext para evitar limite de hardware do navegador
let globalAudioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (!globalAudioCtx) {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      globalAudioCtx = new AudioContext();
    }
  }
  // Se estiver suspenso (comum em navegadores que bloqueiam autoplay), retoma
  if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume();
  }
  return globalAudioCtx;
};

// 1. Som de Clique Suave (Feedback de Interface)
export const playClickSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Tom suave, levemente "glassy"
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    // Ignora erros de áudio silenciosamente
  }
};

// 2. Som de Notificação
export const playNotificationSound = () => {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        // "Ding" suave harmônico
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); 
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.1); 
        
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
    } catch (e) {}
};

// 3. EFEITO ESPECIAL: RUGIDO DE LEÃO (REAL)
export const playLionRoar = () => {
  try {
    const savedSound = localStorage.getItem('bible_lion_sound_enabled');
    if (savedSound === 'false') return;

    const roar = new Audio("https://cdn.pixabay.com/audio/2022/10/23/audio_17df663552.mp3");
    roar.volume = 1.0;
    roar.play().catch(e => console.error("Autoplay bloqueado:", e));
  } catch (e) {
    console.error("Erro no sistema de áudio:", e);
  }
};