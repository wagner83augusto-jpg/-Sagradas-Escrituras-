export interface ChatUser {
  id: string;
  name: string;
  avatarColor: string;
  isOnline: boolean;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  avatarColor: string;
  text?: string;
  audio?: string; // Base64 Data URL
  type: 'text' | 'audio';
  timestamp: string;
}

// Lista básica de profanidades para filtro
const BAD_WORDS = [
  'idiota', 'burro', 'estupido', 'estúpido', 'imbecil', 'trouxa', 
  'palavrão', 'merda', 'bosta', 'pqp', 'caralho', 'porra', 'inferno', 'demonio'
];

export const MOCK_USERS: ChatUser[] = [
  { id: 'user_1', name: 'Irmão João', avatarColor: 'bg-blue-700', isOnline: true },
  { id: 'user_2', name: 'Maria Madalena', avatarColor: 'bg-pink-700', isOnline: true },
  { id: 'user_3', name: 'Paulo Apóstolo', avatarColor: 'bg-green-700', isOnline: false },
  { id: 'user_4', name: 'Débora Juíza', avatarColor: 'bg-purple-700', isOnline: true },
  { id: 'user_5', name: 'Pedro Pescador', avatarColor: 'bg-orange-700', isOnline: true },
];

const STORAGE_KEY_MESSAGES = 'bible_chat_messages';
const STORAGE_KEY_BLOCKED = 'bible_chat_blocked_users';
const STORAGE_KEY_ADDED = 'bible_chat_added_users';
const STORAGE_KEY_CUSTOM_FILTER = 'bible_chat_custom_filter';
const STORAGE_KEY_ADMIN_CONFIG = 'bible_chat_admin_config';
const STORAGE_KEY_ADMIN_PASS = 'bible_chat_admin_pass';

// --- Gerenciamento de Admin e Segurança ---

export const getAdminPassword = (): string => {
    return localStorage.getItem(STORAGE_KEY_ADMIN_PASS) || 'admin123';
};

export const setAdminPassword = (newPass: string) => {
    localStorage.setItem(STORAGE_KEY_ADMIN_PASS, newPass);
};

export const resetAdminPassword = () => {
    localStorage.setItem(STORAGE_KEY_ADMIN_PASS, 'admin123');
};

export interface AdminConfig {
    isAdminMode: boolean;
    adminSoundEnabled: boolean;
    isAppLocked: boolean; // Novo campo para bloqueio global
}

export const getAdminConfig = (): AdminConfig => {
    const stored = localStorage.getItem(STORAGE_KEY_ADMIN_CONFIG);
    if (stored) return JSON.parse(stored);
    return { isAdminMode: false, adminSoundEnabled: true, isAppLocked: false };
};

export const setAdminConfig = (config: AdminConfig) => {
    localStorage.setItem(STORAGE_KEY_ADMIN_CONFIG, JSON.stringify(config));
};

// --- Gerenciamento de Filtro Personalizado ---

export const getCustomFilterWords = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CUSTOM_FILTER);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

export const addCustomFilterWord = (word: string): string[] => {
  const current = getCustomFilterWords();
  const lowerWord = word.toLowerCase().trim();
  if (!lowerWord || current.includes(lowerWord) || BAD_WORDS.includes(lowerWord)) return current;
  
  const updated = [...current, lowerWord];
  localStorage.setItem(STORAGE_KEY_CUSTOM_FILTER, JSON.stringify(updated));
  return updated;
};

export const removeCustomFilterWord = (word: string): string[] => {
  const current = getCustomFilterWords();
  const updated = current.filter(w => w !== word);
  localStorage.setItem(STORAGE_KEY_CUSTOM_FILTER, JSON.stringify(updated));
  return updated;
};

export const filterProfanity = (text: string): string => {
  let filteredText = text;
  const customWords = getCustomFilterWords();
  const allBadWords = [...BAD_WORDS, ...customWords];

  allBadWords.forEach(word => {
    // Escapa caracteres especiais para evitar erros no Regex
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
    filteredText = filteredText.replace(regex, '*'.repeat(word.length));
  });
  return filteredText;
};

// --- Funções Principais do Chat ---

export const getMessages = (): ChatMessage[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_MESSAGES);
    if (!stored) {
        // Initial mock messages
        const initials: ChatMessage[] = [
            {
                id: 'msg_1',
                userId: 'user_1',
                userName: 'Irmão João',
                avatarColor: 'bg-blue-700',
                text: 'A paz do Senhor a todos! Alguém já leu Salmos hoje?',
                type: 'text',
                timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString()
            },
            {
                id: 'msg_2',
                userId: 'user_2',
                userName: 'Maria Madalena',
                avatarColor: 'bg-pink-700',
                text: 'Amém! Li o Salmo 91, muito edificante.',
                type: 'text',
                timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
            }
        ];
        localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(initials));
        return initials;
    }
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
};

export const sendMessage = (content: string, user: { name: string; id: string }, type: 'text' | 'audio' = 'text'): ChatMessage => {
  const isText = type === 'text';
  const cleanContent = isText ? filterProfanity(content) : content; // Audio content is the base64 string
  
  const newMessage: ChatMessage = {
    id: Date.now().toString(),
    userId: user.id,
    userName: user.name,
    avatarColor: 'bg-[#3e2723]', // Cor do usuário atual
    text: isText ? cleanContent : undefined,
    audio: !isText ? cleanContent : undefined,
    type: type,
    timestamp: new Date().toISOString()
  };

  const messages = getMessages();
  const updatedMessages = [...messages, newMessage];
  
  // Keep only last 20 messages (reduced because audio strings are heavy for localStorage)
  if (updatedMessages.length > 20) updatedMessages.shift();
  
  try {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(updatedMessages));
  } catch (e) {
    console.error("Storage full or error", e);
    // Fallback: try to save fewer messages
    if (updatedMessages.length > 5) {
        const fallback = updatedMessages.slice(updatedMessages.length - 5);
        localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(fallback));
    }
  }
  return newMessage;
};

// Gerenciamento de Bloqueio
export const getBlockedUsers = (): string[] => {
  const stored = localStorage.getItem(STORAGE_KEY_BLOCKED);
  return stored ? JSON.parse(stored) : [];
};

export const toggleBlockUser = (userId: string) => {
  const blocked = getBlockedUsers();
  let newBlocked;
  if (blocked.includes(userId)) {
    newBlocked = blocked.filter(id => id !== userId);
  } else {
    newBlocked = [...blocked, userId];
  }
  localStorage.setItem(STORAGE_KEY_BLOCKED, JSON.stringify(newBlocked));
  return newBlocked;
};

// Gerenciamento de "Adicionar" (Amigos/Contatos)
export const getAddedUsers = (): string[] => {
  const stored = localStorage.getItem(STORAGE_KEY_ADDED);
  return stored ? JSON.parse(stored) : [];
};

export const toggleAddUser = (userId: string) => {
  const added = getAddedUsers();
  let newAdded;
  if (added.includes(userId)) {
    newAdded = added.filter(id => id !== userId);
  } else {
    newAdded = [...added, userId];
  }
  localStorage.setItem(STORAGE_KEY_ADDED, JSON.stringify(newAdded));
  return newAdded;
};