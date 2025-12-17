import React, { useState, useEffect } from 'react';
import { Fingerprint, Mail, Lock, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { playClickSound } from '../constants';
import { registerUserLogin, isAppInMaintenance, logUserAccess } from '../services/chatService';

interface LandingPageProps {
  onLoginSuccess: () => void;
}

type AuthMode = 'cover' | 'login' | 'maintenance' | 'forgot';

const LandingPage: React.FC<LandingPageProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('cover');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  
  useEffect(() => {
      const bio = localStorage.getItem('bible_biometrics_enabled');
      if (bio === 'true') {
          setBiometricsAvailable(true);
      }

      if (isAppInMaintenance()) {
          setMode('maintenance');
      }
  }, []);

  const handleEnterClick = () => {
      playClickSound();
      if (mode === 'maintenance') return;
      setMode('login'); 
  };

  const performLogin = (userEmail: string) => {
      // Registra usuário no sistema simulado e gera log de acesso
      registerUserLogin("Usuário", userEmail);
      
      // LOG DE ACESSO PARA O ADMIN (COM NOTIFICAÇÃO)
      logUserAccess(userEmail);
      
      // Habilita biometria para o próximo login
      localStorage.setItem('bible_biometrics_enabled', 'true');
      onLoginSuccess();
  };

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      playClickSound();
      setErrorMessage(null);
      setLoading(true);
      
      // Simulação de Validação
      // Se campos vazios ou senha muito curta (simulando erro)
      if (!email || password.length < 4) {
          setTimeout(() => {
              setLoading(false);
              setErrorMessage("E-mail ou senha incorretos.");
          }, 1000);
          return;
      }

      // Admin Backdoor
      if (mode === 'maintenance' && email === 'admin@iasd.com' && password === 'admin123') {
           setTimeout(() => {
              setLoading(false);
              onLoginSuccess();
           }, 1000);
           return;
      }

      setTimeout(() => {
          setLoading(false);
          performLogin(email);
      }, 1500);
  };

  const handleBiometricAuth = () => {
      playClickSound();
      setLoading(true);
      setTimeout(() => {
          setLoading(false);
          performLogin("bio@user.com");
      }, 1500);
  };

  const handleGoogleLogin = () => {
      playClickSound();
      setLoading(true);
      setTimeout(() => {
          setLoading(false);
          performLogin("google@gmail.com");
      }, 1500);
  };

  const handleForgotPassword = () => {
      playClickSound();
      setLoading(true);
      setTimeout(() => {
          setLoading(false);
          setErrorMessage(null);
          setFeedbackMessage(`Link de recuperação enviado para ${email || 'seu e-mail'}`);
      }, 1500);
  };

  // --- RENDERERS ---

  const renderCover = () => (
      <div 
        onClick={handleEnterClick}
        className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden z-20 bg-[#1a100e] cursor-pointer group"
      >
        {/* IMAGEM DO LEÃO DE FUNDO */}
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a100e] via-transparent to-[#1a100e] z-10"></div>
            <img 
                src="https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?q=80&w=1920&auto=format&fit=crop" 
                alt="Leão Majestoso" 
                className="w-full h-full object-cover object-center opacity-90 transition-transform duration-[10s] group-hover:scale-105"
            />
        </div>

        {/* Título */}
        <div className="z-20 text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-title text-transparent bg-clip-text bg-gradient-to-b from-[#fcf6ba] via-[#bf953f] to-[#aa771c] font-bold tracking-[0.2em] uppercase drop-shadow-[0_4px_15px_rgba(0,0,0,1)] leading-tight">
            Sagradas<br/>Escrituras
            </h1>
        </div>

        {/* BOTÃO ÚNICO DE ENTRADA */}
        <div className="z-20">
            <button 
                className="group relative px-10 py-4 bg-transparent overflow-hidden rounded-full transition-all active:scale-95"
            >
                <div className="absolute inset-0 border border-[#bf953f] rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute inset-0 bg-[#bf953f]/10 rounded-full blur-md group-hover:bg-[#bf953f]/20 transition-all"></div>
                <span className="relative font-title text-xl font-bold text-[#fcf6ba] tracking-[0.3em] uppercase drop-shadow-md">
                    ENTRAR
                </span>
            </button>
        </div>
      </div>
  );

  const renderLoginCross = () => (
      <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
          
          {/* IMAGEM DA CRUZ DOURADA (FUNDO) */}
          <div className="absolute inset-0 z-0">
               <div className="absolute inset-0 bg-black/70 z-10"></div>
               <img 
                   src="https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=1920&auto=format&fit=crop" 
                   alt="Cruz Cristã ao Pôr do Sol" 
                   className="w-full h-full object-cover object-center"
               />
          </div>

          <button 
                onClick={() => { playClickSound(); setMode('cover'); setErrorMessage(null); setFeedbackMessage(null); }} 
                className="absolute top-6 left-6 text-[#fcf6ba] hover:text-[#bf953f] focus:outline-none transition-colors z-30"
          >
              <ArrowLeft size={24} />
          </button>

          {/* Container do Formulário Transparente */}
          <div className="z-20 w-full max-w-sm p-8 bg-[#1a100e]/80 backdrop-blur-md rounded-2xl border border-[#bf953f]/30 shadow-2xl animate-in fade-in duration-700">
              
              <div className="text-center mb-6">
                  <h2 className="text-2xl font-title font-bold text-[#fcf6ba] tracking-wider uppercase drop-shadow-lg">
                      Bem-vindo
                  </h2>
              </div>

              {feedbackMessage && (
                  <div className="mb-4 text-center text-xs text-green-400 bg-black/30 p-2 rounded border border-green-900 flex items-center justify-center gap-2">
                      <CheckCircle size={14} /> {feedbackMessage}
                  </div>
              )}

              <div className="space-y-5">
                  
                  {/* 1. OPÇÃO DE BIOMETRIA (SE DISPONÍVEL) */}
                  {biometricsAvailable && (
                      <button 
                        type="button" 
                        onClick={handleBiometricAuth} 
                        className="w-full py-3 mb-2 bg-[#1a100e] border border-[#bf953f] text-[#bf953f] font-bold text-sm uppercase tracking-widest rounded hover:bg-[#bf953f]/10 transition-colors flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(191,149,63,0.2)]"
                      >
                          <Fingerprint size={20} /> Entrar com Biometria
                      </button>
                  )}

                  {/* 2. FORMULÁRIO DE EMAIL E SENHA */}
                  <form onSubmit={handleLogin} className="space-y-4">
                      <div className="relative group">
                          <Mail className="absolute left-0 bottom-2 text-[#e0c9a6]" size={18} />
                          <input 
                              type="email" 
                              required 
                              value={email}
                              onChange={e => setEmail(e.target.value)}
                              className="w-full bg-transparent border-b border-[#8d6e63] py-2 pl-8 text-[#fcf6ba] focus:border-[#bf953f] outline-none placeholder-[#8d6e63]/70 text-sm transition-colors"
                              placeholder="E-mail"
                          />
                      </div>
                      <div className="relative group">
                          <Lock className="absolute left-0 bottom-2 text-[#e0c9a6]" size={18} />
                          <input 
                              type="password" 
                              required 
                              value={password}
                              onChange={e => setPassword(e.target.value)}
                              className="w-full bg-transparent border-b border-[#8d6e63] py-2 pl-8 text-[#fcf6ba] focus:border-[#bf953f] outline-none placeholder-[#8d6e63]/70 text-sm transition-colors"
                              placeholder="Senha"
                          />
                      </div>

                      {/* Botão Entrar */}
                      <button 
                          type="submit" 
                          disabled={loading}
                          className="w-full py-3 bg-[#bf953f] text-[#1a100e] font-bold text-sm uppercase tracking-widest rounded shadow-lg hover:bg-[#d4a74c] active:scale-95 transition-all mt-4"
                      >
                          {loading ? 'Entrando...' : 'Entrar'}
                      </button>
                  </form>

                  {/* 3. MENSAGEM DE ERRO E RECUPERAÇÃO */}
                  {errorMessage && (
                      <div className="text-center animate-in slide-in-from-top-2">
                          <p className="text-red-400 text-xs flex items-center justify-center gap-1 mb-2">
                              <AlertCircle size={12} /> {errorMessage}
                          </p>
                          <p className="text-[#8d6e63] text-xs">
                              Esqueceu? <button onClick={handleForgotPassword} className="text-[#bf953f] hover:underline font-bold">Recuperar Senha</button>
                          </p>
                      </div>
                  )}

                  {/* Link Recuperar (Sempre visível, mas discreto se não houver erro) */}
                  {!errorMessage && (
                      <div className="text-center">
                          <button onClick={handleForgotPassword} className="text-xs text-[#8d6e63] hover:text-[#bf953f] transition-colors uppercase tracking-wider">
                              Recuperar Senha
                          </button>
                      </div>
                  )}

                  {/* Divisor */}
                  <div className="flex items-center gap-2 opacity-50">
                      <div className="h-[1px] bg-[#8d6e63] flex-1"></div>
                      <span className="text-[10px] text-[#8d6e63] uppercase">ou</span>
                      <div className="h-[1px] bg-[#8d6e63] flex-1"></div>
                  </div>

                  {/* 4. LOGIN COM GOOGLE */}
                  <button 
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full py-3 bg-white text-gray-800 font-bold text-xs uppercase tracking-widest rounded hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                     <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.15-7.27c1.61 0 3.08.59 4.22 1.57l2.14-2.05C16.83 2.67 14.61 1.92 12.15 1.92C6.6 1.92 2.1 6.42 2.1 12c0 5.58 4.5 10.08 10.05 10.08c5.8 0 9.68-4.08 9.68-9.84c0-.66-.07-1.14-.15-1.14z"/></svg>
                     Entrar com Google
                  </button>

              </div>
          </div>
      </div>
  );

  const renderMaintenance = () => (
      <div className="relative w-full h-screen flex flex-col items-center justify-center bg-black text-center p-8">
           <h2 className="text-2xl font-bold text-red-500 uppercase tracking-widest mb-2">Manutenção</h2>
           <p className="text-[#8d6e63]">O aplicativo está em atualização.</p>
           {/* Backdoor simples para sair da manutenção na tela de login */}
           <button onClick={() => setMode('login')} className="mt-8 text-xs text-[#333] hover:text-[#555]">Admin Access</button>
      </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a100e] relative overflow-hidden">
      {mode === 'maintenance' ? renderMaintenance() : (mode === 'cover' ? renderCover() : renderLoginCross())}
    </div>
  );
};

export default LandingPage;