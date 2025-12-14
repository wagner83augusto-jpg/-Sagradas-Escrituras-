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

// --- SISTEMA DE ÁUDIO ---

// 1. Som de Clique Suave (Feedback de Interface)
export const playClickSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Tom curto e agradável
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    // Ignora erros de áudio
  }
};

// 2. Som de Notificação
export const playNotificationSound = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        // "Ding" suave
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
// Usa um arquivo de áudio real em vez de sintetizador para garantir impacto
export const playLionRoar = () => {
  try {
    // Verificar preferência do usuário
    const savedSound = localStorage.getItem('bible_lion_sound_enabled');
    if (savedSound === 'false') return;

    // URL de áudio público de um rugido de leão de alta qualidade
    const roar = new Audio("https://cdn.pixabay.com/audio/2022/10/23/audio_17df663552.mp3");
    roar.volume = 1.0;
    roar.play().catch(e => console.error("Erro ao reproduzir áudio do leão (verifique permissões de autoplay):", e));
  } catch (e) {
    console.error("Erro no sistema de áudio:", e);
  }
};