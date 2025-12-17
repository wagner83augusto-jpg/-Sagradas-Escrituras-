
export interface ChatUser {
  id: string;
  name: string;
  avatarColor: string;
  isOnline: boolean;
  email?: string;
  lastLogin?: string;
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

// Interface para Logs de Acesso
export interface AccessLog {
    id: string;
    email: string;
    timestamp: string;
    deviceInfo: string;
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
const STORAGE_KEY_COURSE_PERMISSIONS = 'bible_course_permissions';
const STORAGE_KEY_REGISTERED_USERS = 'bible_app_registered_users';
const STORAGE_KEY_MAINTENANCE_MODE = 'bible_app_maintenance_mode';
const STORAGE_KEY_ACCESS_LOGS = 'bible_app_access_logs';

// --- LOGS DE ACESSO E NOTIFICAÇÕES ---

export const logUserAccess = (email: string) => {
    const logs = getAccessLogs();
    const newLog: AccessLog = {
        id: Date.now().toString(),
        email: email,
        timestamp: new Date().toISOString(),
        deviceInfo: navigator.userAgent
    };
    
    // Mantém apenas os últimos 50 logs para não encher o storage
    const updatedLogs = [newLog, ...logs].slice(0, 50);
    localStorage.setItem(STORAGE_KEY_ACCESS_LOGS, JSON.stringify(updatedLogs));
    
    // Tenta enviar notificação se for um login novo e não for o próprio admin testando
    if (!email.toLowerCase().includes('admin')) {
        sendSecurityNotification(`Novo acesso detectado: ${email}`);
    }
};

export const getAccessLogs = (): AccessLog[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY_ACCESS_LOGS);
        return stored ? JSON.parse(stored) : [];
    } catch (e) { return []; }
};

export const clearAccessLogs = () => {
    localStorage.removeItem(STORAGE_KEY_ACCESS_LOGS);
};

// Sistema de Notificação Push (Nativo do Navegador)
export const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
        alert("Este navegador não suporta notificações de sistema.");
        return false;
    }
    
    if (Notification.permission === "granted") return true;
    
    const permission = await Notification.requestPermission();
    return permission === "granted";
};

export const sendSecurityNotification = (message: string) => {
    // Só envia se permitido e suportado
    if ("Notification" in window && Notification.permission === "granted") {
        try {
            // Reproduz som de alerta
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3");
            audio.volume = 0.5;
            audio.play().catch(() => {});

            // Envia notificação visual
            // Tenta usar ServiceWorker se disponível (para mobile/PWA), senão usa API padrão
            if (navigator.serviceWorker && navigator.serviceWorker.ready) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification("Alerta de Segurança IASD", {
                        body: message,
                        icon: "https://cdn-icons-png.flaticon.com/512/3004/3004458.png",
                        vibrate: [200, 100, 200],
                        tag: 'security-alert'
                    } as any);
                });
            } else {
                new Notification("Alerta de Segurança IASD", {
                    body: message,
                    icon: "https://cdn-icons-png.flaticon.com/512/3004/3004458.png"
                });
            }
        } catch (e) {
            console.error("Erro ao enviar notificação", e);
        }
    }
};

// --- GESTÃO DE USUÁRIOS REGISTRADOS (DB SIMULADO) ---
export const getRegisteredUsers = (): ChatUser[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY_REGISTERED_USERS);
        return stored ? JSON.parse(stored) : [];
    } catch (e) { return []; }
};

export const registerUserLogin = (name: string, email: string) => {
    const users = getRegisteredUsers();
    const existingIndex = users.findIndex(u => u.email === email);
    
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
        users[existingIndex].lastLogin = now;
        users[existingIndex].isOnline = true;
    } else {
        const newUser: ChatUser = {
            id: `user_${Date.now()}`,
            name: name,
            email: email,
            avatarColor: 'bg-amber-700',
            isOnline: true,
            lastLogin: now
        };
        users.push(newUser);
    }
    localStorage.setItem(STORAGE_KEY_REGISTERED_USERS, JSON.stringify(users));
};

export const removeRegisteredUser = (email: string) => {
    let users = getRegisteredUsers();
    users = users.filter(u => u.email !== email);
    localStorage.setItem(STORAGE_KEY_REGISTERED_USERS, JSON.stringify(users));
    return users;
};

// --- MODO MANUTENÇÃO ---
export const isAppInMaintenance = (): boolean => {
    return localStorage.getItem(STORAGE_KEY_MAINTENANCE_MODE) === 'true';
};

export const setAppMaintenance = (enabled: boolean) => {
    localStorage.setItem(STORAGE_KEY_MAINTENANCE_MODE, String(enabled));
};


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
    isAppLocked: boolean;
}

export const getAdminConfig = (): AdminConfig => {
    const stored = localStorage.getItem(STORAGE_KEY_ADMIN_CONFIG);
    if (stored) return JSON.parse(stored);
    return { isAdminMode: false, adminSoundEnabled: true, isAppLocked: false };
};

export const setAdminConfig = (config: AdminConfig) => {
    localStorage.setItem(STORAGE_KEY_ADMIN_CONFIG, JSON.stringify(config));
};

// --- GESTÃO DE ACESSO A CURSOS ---

interface CoursePermission {
    userId: string;
    courseId: string;
    accessCode: string;
    isUnlocked: boolean;
}

export const getCoursePermissions = (): CoursePermission[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY_COURSE_PERMISSIONS);
        return stored ? JSON.parse(stored) : [];
    } catch (e) { return []; }
};

export const generateAccessCode = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const grantCourseAccess = (userId: string, courseId: string): string => {
    const permissions = getCoursePermissions();
    const existing = permissions.find(p => p.userId === userId && p.courseId === courseId);
    
    if (existing) return existing.accessCode;

    const newCode = generateAccessCode();
    const newPermission: CoursePermission = {
        userId,
        courseId,
        accessCode: newCode,
        isUnlocked: false
    };
    
    localStorage.setItem(STORAGE_KEY_COURSE_PERMISSIONS, JSON.stringify([...permissions, newPermission]));
    return newCode;
};

export const verifyAccessCode = (courseId: string, inputCode: string): boolean => {
    const permissions = getCoursePermissions();
    const validPermissionIndex = permissions.findIndex(p => p.courseId === courseId && p.accessCode === inputCode.toUpperCase().trim());
    
    if (validPermissionIndex !== -1) {
        permissions[validPermissionIndex].isUnlocked = true;
        localStorage.setItem(STORAGE_KEY_COURSE_PERMISSIONS, JSON.stringify(permissions));
        return true;
    }
    return false;
};

export const isCourseUnlocked = (courseId: string): boolean => {
    const permissions = getCoursePermissions();
    return permissions.some(p => p.courseId === courseId && p.isUnlocked);
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
  const cleanContent = isText ? filterProfanity(content) : content;
  
  const newMessage: ChatMessage = {
    id: Date.now().toString(),
    userId: user.id,
    userName: user.name,
    avatarColor: 'bg-[#3e2723]',
    text: isText ? cleanContent : undefined,
    audio: !isText ? cleanContent : undefined,
    type: type,
    timestamp: new Date().toISOString()
  };

  const messages = getMessages();
  const updatedMessages = [...messages, newMessage];
  
  if (updatedMessages.length > 20) updatedMessages.shift();
  
  try {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(updatedMessages));
  } catch (e) {
    console.error("Storage full or error", e);
    if (updatedMessages.length > 5) {
        const fallback = updatedMessages.slice(updatedMessages.length - 5);
        localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(fallback));
    }
  }
  return newMessage;
};

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
