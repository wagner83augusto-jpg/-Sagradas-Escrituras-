import React, { useState, useEffect } from 'react';
import { Fingerprint, Mail, User, ArrowLeft, CheckCircle, Lock, ChevronRight } from 'lucide-react';
import { playClickSound } from '../constants';

interface LandingPageProps {
  onLoginSuccess: () => void;
}

type AuthMode = 'cover' | 'login' | 'register' | 'forgot';

const LandingPage: React.FC<LandingPageProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('cover');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  
  useEffect(() => {
      const bio = localStorage.getItem('bible_biometrics_enabled');
      if (bio === 'true') {
          setBiometricsAvailable(true);
      }
  }, []);

  const handleEnterClick = () => {
      setMode('login'); 
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleEnterClick();
      }
  };

  const handleBiometricAuth = () => {
      playClickSound();
      setLoading(true);
      setTimeout(() => {
          setLoading(false);
          onLoginSuccess();
      }, 1500);
  };

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      playClickSound();
      setLoading(true);
      setTimeout(() => {
          setLoading(false);
          // Habilita biometria para o próximo login após sucesso com senha
          localStorage.setItem('bible_biometrics_enabled', 'true');
          onLoginSuccess();
      }, 1500);
  };

  const handleGoogleLogin = () => {
      playClickSound();
      setLoading(true);
      setTimeout(() => {
          setLoading(false);
          localStorage.setItem('bible_biometrics_enabled', 'true');
          onLoginSuccess();
      }, 1500);
  };

  const handleRegister = (e: React.FormEvent) => {
      e.preventDefault();
      playClickSound();
      setLoading(true);
      setTimeout(() => {
          setLoading(false);
          setMode('login');
          setFeedbackMessage('Cadastro realizado com sucesso! Faça login.');
      }, 1500);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
      e.preventDefault();
      playClickSound();
      setLoading(true);
      setTimeout(() => {
          setLoading(false);
          setMode('login');
          setFeedbackMessage(`Link de recuperação enviado para ${email}`);
      }, 2000);
  };

  // --- RENDERERS ---

  const renderCover = () => (
      <div 
        className="relative w-full h-screen flex flex-col items-center overflow-hidden z-20 bg-[#1a100e]"
        onClick={handleEnterClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Toque em qualquer lugar para abrir o aplicativo."
      >
        
        {/* IMAGEM DO LEÃO DE FUNDO (OCUPANDO QUASE TUDO) */}
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a100e] via-transparent to-[#1a100e] z-10"></div>
            <img 
                src="https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?q=80&w=1920&auto=format&fit=crop" 
                alt="Leão Majestoso" 
                className="w-full h-full object-cover object-center opacity-90 transform transition-transform duration-[20s] hover:scale-105"
            />
        </div>

        {/* Title at the top - Overlaying the image */}
        <div className="mt-20 z-20 text-center drop-shadow-2xl">
            <h1 className="text-4xl md:text-6xl font-title text-transparent bg-clip-text bg-gradient-to-b from-[#fcf6ba] via-[#bf953f] to-[#aa771c] font-bold tracking-[0.2em] uppercase drop-shadow-[0_4px_15px_rgba(0,0,0,1)] leading-tight">
            Sagradas<br/>Escrituras
            </h1>
        </div>

        {/* Spacer to push content down */}
        <div className="flex-1"></div>

        {/* Footer Hint */}
        <div className="mb-12 z-20 pointer-events-none select-none text-center">
            <p className="text-[#bf953f] text-xs uppercase tracking-[0.4em] animate-pulse drop-shadow-lg font-bold bg-black/30 py-2 px-6 rounded-full border border-[#bf953f]/30 backdrop-blur-sm">
                Toque para Entrar
            </p>
        </div>

        {/* Watermark Augustus -> Augustos */}
        <div className="absolute bottom-4 right-6 z-20 pointer-events-none select-none">
            <p className="font-title text-[#bf953f] opacity-40 text-[10px] tracking-[0.3em] uppercase italic drop-shadow-md">Augustos</p>
        </div>
      </div>
  );

  const renderLoginCross = () => (
      <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
          
          {/* IMAGEM DA CRUZ DOURADA (FUNDO) */}
          <div className="absolute inset-0 z-0">
               {/* Overlay escuro para garantir que o texto do formulário seja legível */}
               <div className="absolute inset-0 bg-black/50 z-10"></div>
               <img 
                   src="https://i.pinimg.com/736x/2b/96/6e/2b966e632734199c0861118671607519.jpg" 
                   alt="Cruz Dourada Iluminada" 
                   className="w-full h-full object-cover object-center transform transition-transform duration-[30s] hover:scale-110"
               />
          </div>

          <button 
                onClick={() => { playClickSound(); setMode('cover'); setFeedbackMessage(null); }} 
                className="absolute top-6 left-6 text-[#fcf6ba] hover:text-[#bf953f] focus:outline-none transition-colors z-30"
                aria-label="Voltar para a capa"
          >
              <ArrowLeft size={24} />
          </button>

          {/* Container do Formulário com Efeito de Vidro (Glassmorphism) para destacar sobre a Cruz */}
          <div className="z-20 w-full max-w-sm p-8 bg-[#1a100e]/70 backdrop-blur-md rounded-2xl border border-[#bf953f]/30 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-700">
              
              {/* Header */}
              <div className="text-center mb-6">
                  <h2 className="text-2xl font-title font-bold text-[#fcf6ba] tracking-wider drop-shadow-lg">
                      Bem-vindo
                  </h2>
                  <p className="text-xs text-[#e0c9a6] font-serif italic mt-1">
                      Acesse as Escrituras Sagradas
                  </p>
              </div>

              {/* Formulário */}
              <div>
                  {feedbackMessage && (
                      <div className="mb-4 text-center text-xs text-green-400 flex items-center justify-center gap-1 animate-pulse bg-black/30 p-2 rounded">
                          <CheckCircle size={12} /> {feedbackMessage}
                      </div>
                  )}

                  {mode === 'login' ? (
                      <form onSubmit={handleLogin} className="space-y-6">
                          <div className="space-y-4">
                              <div className="relative group">
                                  <Mail className="absolute left-0 bottom-2 text-[#e0c9a6] group-focus-within:text-[#bf953f] transition-colors" size={18} />
                                  <input 
                                      type="email" 
                                      required 
                                      value={email}
                                      onChange={e => setEmail(e.target.value)}
                                      className="w-full bg-transparent border-b border-[#8d6e63] py-2 pl-8 text-[#fcf6ba] focus:border-[#bf953f] outline-none placeholder-[#8d6e63] text-sm transition-colors"
                                      placeholder="Seu Email"
                                  />
                              </div>
                              <div className="relative group">
                                  <Lock className="absolute left-0 bottom-2 text-[#e0c9a6] group-focus-within:text-[#bf953f] transition-colors" size={18} />
                                  <input 
                                      type="password" 
                                      required 
                                      value={password}
                                      onChange={e => setPassword(e.target.value)}
                                      className="w-full bg-transparent border-b border-[#8d6e63] py-2 pl-8 text-[#fcf6ba] focus:border-[#bf953f] outline-none placeholder-[#8d6e63] text-sm transition-colors"
                                      placeholder="Sua Senha"
                                  />
                              </div>
                          </div>

                          <div className="flex items-center justify-between mt-6">
                              {/* Botão de Biometria */}
                              {biometricsAvailable ? (
                                  <button 
                                    type="button" 
                                    onClick={handleBiometricAuth} 
                                    className="text-[#fcf6ba] p-3 border border-[#bf953f]/50 hover:bg-[#bf953f]/20 rounded-full transition-all active:scale-95" 
                                    title="Entrar com Biometria"
                                  >
                                      <Fingerprint size={24} />
                                  </button>
                              ) : <div className="w-10"></div>}

                              <button 
                                  type="submit" 
                                  disabled={loading}
                                  className="px-6 py-2 bg-gradient-to-r from-[#bf953f] to-[#8a6e3e] text-[#1a100e] font-bold text-sm uppercase tracking-widest rounded shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                              >
                                  {loading ? '...' : 'Entrar'} <ChevronRight size={16} />
                              </button>
                          </div>

                          {/* Opções Sociais */}
                          <button 
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-full py-2.5 mt-4 bg-black/40 border border-[#5d4037] text-[#e0c9a6] hover:border-[#bf953f] hover:text-[#fcf6ba] rounded transition-all flex items-center justify-center gap-2 group text-xs font-bold uppercase tracking-wider"
                          >
                             Login com Google
                          </button>

                          <div className="text-center space-y-2 mt-6 border-t border-[#bf953f]/20 pt-4">
                            <button type="button" onClick={() => setMode('register')} className="text-[10px] text-[#e0c9a6] hover:text-[#bf953f] uppercase tracking-wide block w-full">
                                Criar Conta
                            </button>
                            <button type="button" onClick={() => setMode('forgot')} className="text-[10px] text-[#8d6e63] hover:text-[#e0c9a6] block w-full">
                                Esqueci a senha
                            </button>
                          </div>
                      </form>
                  ) : mode === 'register' ? (
                      <form onSubmit={handleRegister} className="space-y-6">
                           <div className="space-y-4">
                              <div className="relative group">
                                  <User className="absolute left-0 bottom-2 text-[#e0c9a6] group-focus-within:text-[#bf953f] transition-colors" size={18} />
                                  <input 
                                      type="text" 
                                      required 
                                      value={name}
                                      onChange={e => setName(e.target.value)}
                                      className="w-full bg-transparent border-b border-[#8d6e63] py-2 pl-8 text-[#fcf6ba] focus:border-[#bf953f] outline-none placeholder-[#8d6e63] text-sm transition-colors"
                                      placeholder="Nome Completo"
                                  />
                              </div>
                              <div className="relative group">
                                  <Mail className="absolute left-0 bottom-2 text-[#e0c9a6] group-focus-within:text-[#bf953f] transition-colors" size={18} />
                                  <input 
                                      type="email" 
                                      required 
                                      value={email}
                                      onChange={e => setEmail(e.target.value)}
                                      className="w-full bg-transparent border-b border-[#8d6e63] py-2 pl-8 text-[#fcf6ba] focus:border-[#bf953f] outline-none placeholder-[#8d6e63] text-sm transition-colors"
                                      placeholder="Seu Email"
                                  />
                              </div>
                               <div className="relative group">
                                  <Lock className="absolute left-0 bottom-2 text-[#e0c9a6] group-focus-within:text-[#bf953f] transition-colors" size={18} />
                                  <input 
                                      type="password" 
                                      required 
                                      value={password}
                                      onChange={e => setPassword(e.target.value)}
                                      className="w-full bg-transparent border-b border-[#8d6e63] py-2 pl-8 text-[#fcf6ba] focus:border-[#bf953f] outline-none placeholder-[#8d6e63] text-sm transition-colors"
                                      placeholder="Crie uma Senha"
                                  />
                              </div>
                           </div>
                           <button 
                                  type="submit" 
                                  disabled={loading}
                                  className="w-full py-2 bg-[#3e2723] border border-[#bf953f] text-[#bf953f] font-bold text-sm uppercase tracking-widest rounded hover:bg-[#bf953f] hover:text-[#1a100e] transition-colors"
                              >
                                  {loading ? '...' : 'Cadastrar'}
                           </button>
                           <button type="button" onClick={() => setMode('login')} className="text-xs text-[#8d6e63] w-full mt-2 hover:text-[#fcf6ba]">Voltar ao Login</button>
                      </form>
                  ) : (
                      <form onSubmit={handleForgotPassword} className="space-y-6">
                          <div className="relative group">
                              <Mail className="absolute left-0 bottom-2 text-[#e0c9a6] group-focus-within:text-[#bf953f] transition-colors" size={18} />
                              <input 
                                  type="email" 
                                  required 
                                  value={email}
                                  onChange={e => setEmail(e.target.value)}
                                  className="w-full bg-transparent border-b border-[#8d6e63] py-2 pl-8 text-[#fcf6ba] focus:border-[#bf953f] outline-none placeholder-[#8d6e63] text-sm transition-colors"
                                  placeholder="Email de Recuperação"
                              />
                          </div>
                           <button 
                                  type="submit" 
                                  disabled={loading}
                                  className="w-full py-2 bg-[#3e2723] border border-[#bf953f] text-[#bf953f] font-bold text-sm uppercase tracking-widest rounded hover:bg-[#bf953f] hover:text-[#1a100e] transition-colors"
                              >
                                  {loading ? '...' : 'Recuperar Senha'}
                           </button>
                           <button type="button" onClick={() => setMode('login')} className="text-xs text-[#8d6e63] w-full mt-2 hover:text-[#fcf6ba]">Voltar ao Login</button>
                      </form>
                  )}
              </div>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a100e] relative overflow-hidden">
      {/* Background Texture (mantido caso a imagem falhe, mas a imagem cobrirá) */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-30"></div>
      
      {mode === 'cover' ? renderCover() : renderLoginCross()}
    </div>
  );
};

export default LandingPage;