import React, { useState, useEffect } from 'react';
import { 
    ShieldAlert, Lock, Unlock, ChevronRight, UserX, Database, 
    RefreshCw, AlertTriangle, GraduationCap, Key, MessageSquare, 
    Trash2, Volume2, VolumeX, Bell, Hammer, Users, Eye, BellRing 
} from 'lucide-react';
import { playClickSound, playNotificationSound } from '../constants';
import { 
    getAdminPassword, setAdminPassword, 
    grantCourseAccess, getBlockedUsers, toggleBlockUser,
    getAdminConfig, setAdminConfig, AdminConfig,
    isAppInMaintenance, setAppMaintenance,
    getRegisteredUsers, removeRegisteredUser, ChatUser,
    getAccessLogs, AccessLog, clearAccessLogs,
    requestNotificationPermission, sendSecurityNotification
} from '../services/chatService';
import { RESTRICTED_COURSES } from '../constants';

interface AdminPageProps {
    onBack: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onBack }) => {
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    
    // Config State
    const [config, setConfig] = useState<AdminConfig>({
        isAdminMode: false,
        adminSoundEnabled: true,
        isAppLocked: false
    });
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    // Data State
    const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
    const [registeredUsers, setRegisteredUsers] = useState<ChatUser[]>([]);
    const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
    const [generatedCodes, setGeneratedCodes] = useState<Record<string, string>>({});
    
    // Tools State
    const [newPass, setNewPass] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            loadData();
        }
    }, [isAuthenticated]);

    const loadData = () => {
        setBlockedUsers(getBlockedUsers());
        setConfig(getAdminConfig());
        setMaintenanceMode(isAppInMaintenance());
        setRegisteredUsers(getRegisteredUsers());
        setAccessLogs(getAccessLogs());
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const currentPass = getAdminPassword();
        if (passwordInput === currentPass) {
            playClickSound();
            setIsAuthenticated(true);
            setErrorMsg('');
        } else {
            setErrorMsg('Senha incorreta.');
            setPasswordInput('');
        }
    };

    // --- MANUTENÇÃO / BLOQUEIO GLOBAL ---
    const toggleMaintenance = () => {
        playClickSound();
        const newState = !maintenanceMode;
        setMaintenanceMode(newState);
        setAppMaintenance(newState);
    };

    // --- GESTÃO DE USUÁRIOS REGISTRADOS ---
    const handleDeleteUser = (email: string) => {
        if (confirm(`Remover usuário ${email} do registro?`)) {
            playClickSound();
            const updated = removeRegisteredUser(email);
            setRegisteredUsers(updated);
        }
    };

    // --- CURSO / ESTUDOS ---
    const handleGenerateCode = (courseId: string) => {
        playClickSound();
        const code = grantCourseAccess('student_general', courseId);
        setGeneratedCodes(prev => ({ ...prev, [courseId]: code }));
    };

    // --- CHAT / USUÁRIOS BLOQUEADOS ---
    const handleUnblock = (userId: string) => {
        playClickSound();
        toggleBlockUser(userId);
        setBlockedUsers(getBlockedUsers()); 
    };

    const handleClearChat = () => {
        if (confirm("Tem certeza? Isso apagará todo o histórico de conversas.")) {
            playClickSound();
            localStorage.removeItem('bible_chat_messages');
            alert("Chat limpo com sucesso.");
        }
    };

    // --- CONFIGURAÇÕES GERAIS ---
    const toggleConfig = (key: keyof AdminConfig) => {
        playClickSound();
        const newConfig = { ...config, [key]: !config[key] };
        setConfig(newConfig);
        setAdminConfig(newConfig);
    };

    // --- NOTIFICAÇÕES E ACESSO ---
    const handleEnableNotifications = async () => {
        const granted = await requestNotificationPermission();
        if (granted) {
            alert("Notificações ativadas! Você receberá alertas de acesso.");
            sendSecurityNotification("Teste de notificação: Sistema Ativo.");
        } else {
            alert("Permissão negada. Verifique as configurações do navegador.");
        }
    };

    const handleClearLogs = () => {
        if (confirm("Limpar histórico de acessos?")) {
            playClickSound();
            clearAccessLogs();
            setAccessLogs([]);
        }
    };

    // --- SEGURANÇA ---
    const handleChangePassword = () => {
        if (!newPass.trim()) return;
        setAdminPassword(newPass);
        alert('Senha atualizada com sucesso.');
        setNewPass('');
    };

    const handleFactoryReset = () => {
        if (confirm("PERIGO: Isso resetará TODAS as configurações, notas e usuários. Continuar?")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#1a100e] flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-40 pointer-events-none"></div>
                <div className="relative z-10 w-full max-w-sm bg-[#2d1b18] border border-red-900/50 rounded-2xl p-8 shadow-2xl">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-900">
                            <Lock size={32} className="text-red-500" />
                        </div>
                        <h2 className="text-2xl font-title font-bold text-red-500 uppercase tracking-widest">Área Restrita</h2>
                        <p className="text-xs text-[#8d6e63] mt-2">Painel de Controle Pastoral</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <input 
                            type="password" 
                            value={passwordInput}
                            onChange={e => setPasswordInput(e.target.value)}
                            placeholder="Senha de Acesso"
                            className="w-full p-4 bg-[#1a100e] border border-[#3e2723] rounded-xl text-[#e0c9a6] focus:border-red-500 focus:outline-none text-center tracking-widest"
                            autoFocus
                        />
                        {errorMsg && <p className="text-red-400 text-xs text-center animate-pulse">{errorMsg}</p>}
                        
                        <div className="flex gap-3 pt-4">
                            <button 
                                type="button" 
                                onClick={onBack}
                                className="flex-1 py-3 bg-transparent border border-[#3e2723] text-[#8d6e63] rounded-lg hover:text-[#e0c9a6] transition-colors"
                            >
                                Voltar
                            </button>
                            <button 
                                type="submit" 
                                className="flex-1 py-3 bg-red-900 text-red-100 rounded-lg hover:bg-red-800 font-bold uppercase tracking-wider shadow-lg"
                            >
                                Entrar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1a100e] text-[#e0c9a6] flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-40 pointer-events-none"></div>
            
            <header className="bg-red-950/30 backdrop-blur-md p-4 flex items-center gap-4 sticky top-0 z-20 border-b border-red-900/30">
                <button 
                    onClick={() => { playClickSound(); onBack(); }}
                    className="p-2 text-red-400 hover:text-red-200 hover:bg-red-900/20 rounded-full focus:outline-none"
                >
                    <ChevronRight size={24} className="rotate-180" />
                </button>
                <h1 className="text-lg font-title font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
                    <ShieldAlert size={20} /> Painel Administrativo
                </h1>
            </header>

            <main className="p-6 max-w-2xl mx-auto w-full z-10 space-y-8 pb-20">
                
                {/* 1. MODO MANUTENÇÃO (BLOQUEIO DE APP) */}
                <section>
                    <button 
                        onClick={toggleMaintenance}
                        className={`w-full p-6 rounded-xl border flex items-center gap-4 transition-all duration-300 ${
                            maintenanceMode 
                            ? 'bg-red-900 border-red-500 text-white shadow-[0_0_20px_rgba(255,0,0,0.4)]' 
                            : 'bg-[#2d1b18] border-[#3e2723] hover:border-red-500/50'
                        }`}
                    >
                        <div className={`p-4 rounded-full ${maintenanceMode ? 'bg-red-800 text-white' : 'bg-[#1a100e] text-red-500'}`}>
                            <Hammer size={32} className={maintenanceMode ? 'animate-bounce' : ''} />
                        </div>
                        <div className="text-left">
                            <h3 className="text-lg font-bold uppercase tracking-widest">Modo Manutenção</h3>
                            <p className={`text-xs ${maintenanceMode ? 'text-red-200' : 'text-[#8d6e63]'}`}>
                                {maintenanceMode 
                                    ? 'ATIVO: Aplicativo bloqueado para usuários.' 
                                    : 'INATIVO: Aplicativo acessível normalmente.'}
                            </p>
                        </div>
                    </button>
                </section>

                {/* 2. MONITORAMENTO DE ACESSO (NOVO) */}
                <section className="space-y-4">
                    <h2 className="text-[#8d6e63] text-xs font-bold uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Eye size={14} /> Monitoramento de Acesso
                    </h2>
                    
                    <div className="flex gap-2 mb-2">
                         <button 
                            onClick={handleEnableNotifications}
                            className="flex-1 py-2 bg-[#2d1b18] border border-[#3e2723] text-[#e0c9a6] rounded hover:border-red-500 hover:text-red-400 text-xs font-bold uppercase flex items-center justify-center gap-2"
                         >
                            <BellRing size={14} /> Ativar Notificações
                         </button>
                         <button 
                            onClick={handleClearLogs}
                            className="flex-1 py-2 bg-[#2d1b18] border border-[#3e2723] text-[#8d6e63] rounded hover:text-red-400 text-xs font-bold uppercase"
                         >
                            Limpar Logs
                         </button>
                    </div>

                    <div className="bg-[#2d1b18] border border-[#3e2723] rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                        {accessLogs.length === 0 ? (
                            <p className="p-4 text-center text-xs text-[#8d6e63]">Nenhum acesso registrado recentemente.</p>
                        ) : (
                            <table className="w-full text-left text-xs">
                                <thead className="bg-[#1a100e] text-[#8d6e63] border-b border-[#3e2723]">
                                    <tr>
                                        <th className="p-3">Usuário</th>
                                        <th className="p-3 text-right">Horário</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {accessLogs.map((log) => (
                                        <tr key={log.id} className="border-b border-[#3e2723] last:border-0 hover:bg-[#3e2723]/30">
                                            <td className="p-3 font-bold text-[#e0c9a6]">{log.email}</td>
                                            <td className="p-3 text-right text-[#8d6e63] font-mono">
                                                {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                <br/>
                                                <span className="text-[9px] opacity-70">{new Date(log.timestamp).toLocaleDateString()}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>

                {/* 3. CONTROLE DE CHAT (BLOQUEIOS) */}
                <section className="space-y-4">
                    <h2 className="text-[#8d6e63] text-xs font-bold uppercase tracking-widest ml-1 flex items-center gap-2">
                        <MessageSquare size={14} /> Moderação de Chat
                    </h2>
                    
                    {blockedUsers.length > 0 && (
                        <div className="bg-[#2d1b18] border border-[#3e2723] rounded-xl p-4 mb-4">
                            <h3 className="text-xs text-red-400 font-bold mb-3">Usuários Bloqueados no Chat</h3>
                            <div className="space-y-2">
                                {blockedUsers.map(userId => (
                                    <div key={userId} className="flex justify-between items-center bg-[#1a100e] p-2 rounded border border-[#3e2723]">
                                        <span className="text-[#e0c9a6] text-sm font-mono">{userId}</span>
                                        <button 
                                            onClick={() => handleUnblock(userId)}
                                            className="text-xs bg-red-900/50 text-red-200 px-2 py-1 rounded hover:bg-red-800 flex items-center gap-1"
                                        >
                                            <Unlock size={10} /> Desbloquear
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <button 
                        onClick={handleClearChat}
                        className="w-full py-3 border border-[#3e2723] text-[#8d6e63] hover:text-red-400 hover:border-red-500 rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all"
                    >
                        <Trash2 size={16} /> Limpar Histórico do Chat
                    </button>
                </section>

                 {/* 4. GESTÃO DE ESTUDOS (LIBERAÇÃO) */}
                 <section className="space-y-4">
                    <h2 className="text-[#8d6e63] text-xs font-bold uppercase tracking-widest ml-1 flex items-center gap-2">
                        <GraduationCap size={14} /> Chaves de Acesso a Cursos
                    </h2>
                    <div className="bg-[#2d1b18] border border-[#3e2723] rounded-xl overflow-hidden">
                        {RESTRICTED_COURSES.map(course => (
                            <div key={course.id} className="p-4 border-b border-[#3e2723] last:border-0 flex items-center justify-between gap-4">
                                <div className="min-w-0">
                                    <h4 className="text-red-200 font-bold text-sm truncate">{course.title}</h4>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    {generatedCodes[course.id] ? (
                                        <div className="bg-[#1a100e] px-3 py-1 rounded border border-[#bf953f] text-[#bf953f] font-mono font-bold tracking-widest text-sm animate-in zoom-in">
                                            {generatedCodes[course.id]}
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => handleGenerateCode(course.id)}
                                            className="px-3 py-2 bg-red-900/30 text-red-400 border border-red-900/50 rounded hover:bg-red-900/50 text-xs font-bold uppercase flex items-center gap-1"
                                        >
                                            <Key size={12} /> Gerar
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 5. SEGURANÇA E SISTEMA */}
                <section className="space-y-4">
                    <h2 className="text-[#8d6e63] text-xs font-bold uppercase tracking-widest ml-1 flex items-center gap-2">
                        <ShieldAlert size={14} /> Sistema
                    </h2>
                    
                    <div className="bg-[#2d1b18] border border-[#3e2723] rounded-xl p-4">
                         <div className="flex justify-between items-center mb-4 pb-4 border-b border-[#3e2723]">
                            <span className="text-[#e0c9a6] text-sm font-bold">Modo Administrador</span>
                            <button onClick={() => toggleConfig('isAdminMode')} className={`w-10 h-5 rounded-full relative transition-colors ${config.isAdminMode ? 'bg-red-500' : 'bg-[#1a100e]'}`}>
                                <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${config.isAdminMode ? 'left-6' : 'left-1'}`}></div>
                            </button>
                        </div>
                        
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-[#3e2723]">
                            <span className="text-[#e0c9a6] text-sm font-bold">Sons de Alerta</span>
                            <button onClick={() => toggleConfig('adminSoundEnabled')} className={`w-10 h-5 rounded-full relative transition-colors ${config.adminSoundEnabled ? 'bg-red-500' : 'bg-[#1a100e]'}`}>
                                <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${config.adminSoundEnabled ? 'left-6' : 'left-1'}`}></div>
                            </button>
                        </div>

                        <div className="space-y-2 mt-4">
                            <input 
                                type="password" 
                                value={newPass}
                                onChange={e => setNewPass(e.target.value)}
                                placeholder="Nova Senha de Admin"
                                className="w-full p-2 bg-[#1a100e] border border-[#3e2723] rounded text-sm text-[#e0c9a6] focus:border-red-500 focus:outline-none"
                            />
                            <button 
                                onClick={handleChangePassword}
                                className="w-full py-2 bg-[#3e2723] text-[#8d6e63] hover:text-[#e0c9a6] rounded text-xs font-bold uppercase"
                            >
                                Atualizar Senha
                            </button>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleFactoryReset}
                        className="w-full py-3 bg-red-950/30 text-red-500 border border-red-900/30 hover:bg-red-900/50 rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2"
                    >
                        <AlertTriangle size={16} /> Resetar Fábrica
                    </button>
                </section>
                
                {/* Rodapé removido */}
            </main>
        </div>
    );
};

export default AdminPage;