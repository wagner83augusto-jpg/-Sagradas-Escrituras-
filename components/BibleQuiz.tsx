import React, { useState, useEffect, useRef } from 'react';
import { BrainCircuit, Trophy, Timer, Check, X, Flame, BookOpen, Heart, Clock } from 'lucide-react';
import { playClickSound } from '../constants';
import { fetchBibleQuizQuestion, QuizQuestion } from '../services/geminiService';

interface Props {
  onBack: () => void;
}

// URLs de Áudio Estáveis (Mixkit/CDN Assets)
const SOUNDS = {
    correct: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3', // Win Chime
    wrong: 'https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3',   // Fail Tone
    tick: 'https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3',    // Click/Tick
    timeout: 'https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3'     // Alarm
};

const BibleQuiz: React.FC<Props> = ({ onBack }) => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0); 
  const [lives, setLives] = useState(7); // 7 vidas
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  
  // Timer State - Aumentado para 180 segundos (3 minutos)
  const [timeLeft, setTimeLeft] = useState(180);
  const timerRef = useRef<number | null>(null);

  // Audio Refs para performance
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
      // Pré-carregar áudios
      Object.keys(SOUNDS).forEach(key => {
          const audio = new Audio(SOUNDS[key as keyof typeof SOUNDS]);
          audio.preload = 'auto';
          audioRefs.current[key] = audio;
      });

      return () => stopTimer();
  }, []);

  // Timer Logic
  useEffect(() => {
      if (gameState === 'playing' && currentQuestion && !loading && feedback === null) {
          startTimer();
      } else {
          stopTimer();
      }
  }, [gameState, currentQuestion, loading, feedback]);

  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
      stopTimer();
      setTimeLeft(180); // 3 Minutos
      
      timerRef.current = window.setInterval(() => {
          setTimeLeft((prev) => {
              const newValue = prev - 1;
              
              // Efeito sonoro de contagem regressiva (últimos 5 segundos)
              if (newValue <= 5 && newValue > 0) {
                  playSound('tick', 0.8);
              }

              if (newValue <= 0) {
                  handleTimeout();
                  return 0;
              }
              return newValue;
          });
      }, 1000);
  };

  const stopTimer = () => {
      if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
      }
  };

  const handleTimeout = () => {
      stopTimer();
      playSound('timeout');
      handleMistake('timeout');
  };

  const loadQuestion = async () => {
      setLoading(true);
      setFeedback(null);
      setTimeLeft(180); // Reset timer visualmente antes de carregar
      try {
          const q = await fetchBibleQuizQuestion(difficulty);
          setCurrentQuestion(q);
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  const startGame = (diff: 'easy' | 'medium' | 'hard') => {
      playClickSound();
      setDifficulty(diff);
      setScore(0);
      setStreak(0);
      setLives(7); // Inicia com 7 vidas
      setGameState('playing');
      loadQuestion();
  };

  const playSound = (type: keyof typeof SOUNDS, volume = 1.0) => {
      try {
          // Tenta usar o ref pré-carregado ou cria um novo se falhar
          let audio = audioRefs.current[type];
          if (!audio) {
              audio = new Audio(SOUNDS[type]);
          }
          
          audio.volume = volume;
          audio.currentTime = 0; // Reinicia o áudio
          
          const playPromise = audio.play();
          if (playPromise !== undefined) {
              playPromise.catch(error => {
                  console.log("Reprodução de áudio bloqueada (interação necessária):", error);
              });
          }
      } catch (e) {
          console.error("Erro ao tocar som:", e);
      }
  };

  const handleMistake = (type: 'wrong' | 'timeout') => {
      setStreak(0);
      setLives(l => l - 1);
      setFeedback(type);
      
      if (lives - 1 <= 0) {
          setTimeout(() => setGameState('gameover'), 3000);
      } else {
          setTimeout(loadQuestion, 3500);
      }
  };

  const handleAnswer = (optionIndex: number) => {
      if (!currentQuestion || feedback !== null) return; 

      stopTimer();

      if (optionIndex === currentQuestion.correctOptionIndex) {
          playSound('correct');
          const basePoints = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30;
          const timeBonus = Math.floor(timeLeft / 10); // Bônus ajustado para o tempo maior
          const streakBonus = streak * 5;
          
          setScore(s => s + basePoints + streakBonus + timeBonus);
          setStreak(s => s + 1);
          setFeedback('correct');
          setTimeout(loadQuestion, 2500); 
      } else {
          playSound('wrong');
          handleMistake('wrong');
      }
  };

  return (
    <div className="min-h-screen bg-[#1a100e] text-[#e0c9a6] flex flex-col relative overflow-hidden">
        {/* BG Effect */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#3e2723] to-[#1a100e] opacity-40 -z-10"></div>

        <div className="p-4 flex justify-between items-center z-10 bg-[#1a100e]/80 backdrop-blur-sm border-b border-[#3e2723] sticky top-0">
            <button onClick={onBack} className="text-[#8d6e63] hover:text-[#fcf6ba] text-xs uppercase font-bold tracking-wider">
                Sair
            </button>
            <div className="flex items-center gap-4">
                {streak > 1 && (
                    <div className="flex items-center gap-1 text-orange-400 font-bold animate-pulse">
                        <Flame size={18} fill="currentColor" />
                        <span>x{streak}</span>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <Trophy className="text-[#bf953f]" size={18} />
                    <span className="font-bold font-title text-xl">{score}</span>
                </div>
            </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-lg mx-auto w-full">
            
            {gameState === 'menu' && (
                <div className="text-center space-y-8 animate-in fade-in zoom-in">
                    <BrainCircuit size={80} className="mx-auto text-[#bf953f] mb-4" />
                    <h1 className="text-4xl font-title font-bold text-[#fcf6ba]">Quiz Bíblico IA</h1>
                    <p className="text-[#8d6e63]">Teste seu conhecimento das Escrituras com inteligência artificial.</p>

                    <div className="grid gap-4 w-full max-w-xs mx-auto">
                        <button onClick={() => startGame('easy')} className="py-4 bg-[#2d1b18] border border-green-800 hover:bg-green-900/30 rounded text-green-400 font-bold uppercase tracking-widest transition-transform active:scale-95 shadow-lg">
                            Fácil
                        </button>
                        <button onClick={() => startGame('medium')} className="py-4 bg-[#2d1b18] border border-yellow-800 hover:bg-yellow-900/30 rounded text-yellow-400 font-bold uppercase tracking-widest transition-transform active:scale-95 shadow-lg">
                            Médio
                        </button>
                        <button onClick={() => startGame('hard')} className="py-4 bg-[#2d1b18] border border-red-800 hover:bg-red-900/30 rounded text-red-400 font-bold uppercase tracking-widest transition-transform active:scale-95 shadow-lg">
                            Difícil
                        </button>
                    </div>
                </div>
            )}

            {gameState === 'playing' && (
                <div className="w-full space-y-4">
                    {/* Top Stats Bar */}
                    <div className="flex items-center justify-between bg-[#2d1b18] p-3 rounded-xl border border-[#3e2723]">
                        {/* Lives (7 Bars) */}
                        <div className="flex gap-1">
                            {[...Array(7)].map((_, i) => (
                                <div 
                                    key={i} 
                                    className={`w-3 h-4 rounded-sm transition-all duration-300 ${
                                        i < lives 
                                            ? 'bg-gradient-to-t from-red-600 to-red-400 shadow-[0_0_5px_rgba(255,0,0,0.5)]' 
                                            : 'bg-[#1a100e] border border-[#3e2723]'
                                    }`}
                                ></div>
                            ))}
                        </div>
                        
                        {/* Timer */}
                        <div className={`flex items-center gap-2 font-mono font-bold text-lg ${timeLeft <= 5 ? 'text-red-500 animate-pulse scale-110' : 'text-[#fcf6ba]'}`}>
                             <Clock size={18} />
                             {formatTime(timeLeft)}
                        </div>
                    </div>

                    {loading ? (
                         <div className="text-center py-12 flex flex-col items-center min-h-[300px] justify-center">
                             <div className="w-12 h-12 border-2 border-[#bf953f] border-t-transparent rounded-full animate-spin mb-4"></div>
                             <p className="text-xs text-[#8d6e63] animate-pulse">Preparando desafio...</p>
                         </div>
                    ) : currentQuestion ? (
                        <div className="animate-in slide-in-from-right duration-300">
                             <div className="bg-[#2d1b18] p-6 rounded-lg border border-[#3e2723] shadow-lg mb-6 relative overflow-hidden min-h-[160px] flex items-center justify-center">
                                {feedback === 'correct' && (
                                    <div className="absolute inset-0 bg-green-900/95 flex flex-col items-center justify-center z-20 animate-in fade-in">
                                        <Check size={64} className="text-green-400 mb-2 animate-bounce" />
                                        <p className="text-green-200 font-bold text-xl">Correto!</p>
                                    </div>
                                )}
                                {feedback === 'wrong' && (
                                    <div className="absolute inset-0 bg-red-900/95 flex flex-col items-center justify-center z-20 animate-in fade-in">
                                        <X size={64} className="text-red-400 mb-2 animate-pulse" />
                                        <p className="text-red-200 font-bold text-xl">Incorreto</p>
                                    </div>
                                )}
                                {feedback === 'timeout' && (
                                    <div className="absolute inset-0 bg-orange-900/95 flex flex-col items-center justify-center z-20 animate-in fade-in">
                                        <Timer size={64} className="text-orange-400 mb-2 animate-pulse" />
                                        <p className="text-orange-200 font-bold text-xl">Tempo Esgotado!</p>
                                    </div>
                                )}
                                
                                <h2 className="text-xl md:text-2xl font-serif text-[#fcf6ba] text-center leading-relaxed">
                                    {currentQuestion.question}
                                </h2>
                             </div>

                             <div className="grid gap-3">
                                 {currentQuestion.options.map((opt, idx) => (
                                     <button
                                        key={idx}
                                        onClick={() => handleAnswer(idx)}
                                        disabled={feedback !== null}
                                        className={`p-4 rounded border text-left font-bold transition-all relative overflow-hidden text-sm md:text-base
                                            ${feedback && idx === currentQuestion.correctOptionIndex 
                                                ? 'bg-green-900/50 border-green-500 text-green-200 shadow-[0_0_15px_rgba(0,255,0,0.3)]' 
                                                : feedback && feedback !== 'correct' && idx !== currentQuestion.correctOptionIndex
                                                    ? 'opacity-30' 
                                                    : 'bg-[#1a100e] border-[#5d4037] hover:border-[#bf953f] hover:text-[#bf953f] active:scale-[0.98]'
                                            }
                                        `}
                                     >
                                         <span className="mr-3 opacity-50">{String.fromCharCode(65 + idx)}.</span>
                                         {opt}
                                     </button>
                                 ))}
                             </div>
                             
                             {/* Feedback Area with Explanation */}
                             {feedback && (
                                 <div className="mt-4 p-4 bg-[#3e2723] rounded border border-[#bf953f]/30 text-sm text-[#e0c9a6] animate-in slide-in-from-bottom duration-500">
                                     <div className="flex items-start gap-2">
                                         <BookOpen className="flex-shrink-0 text-[#bf953f] mt-0.5" size={16} />
                                         <div>
                                            <p className="mb-2"><span className="font-bold text-[#bf953f]">Explicação:</span> {currentQuestion.explanation}</p>
                                            {currentQuestion.reference && (
                                                <p className="text-xs text-[#8d6e63] font-serif italic">Referência: {currentQuestion.reference}</p>
                                            )}
                                         </div>
                                     </div>
                                 </div>
                             )}
                        </div>
                    ) : null}
                </div>
            )}

            {gameState === 'gameover' && (
                <div className="text-center space-y-6 animate-in zoom-in w-full">
                    <h2 className="text-4xl font-title font-bold text-red-500">Fim de Jogo</h2>
                    <div className="py-8 bg-[#2d1b18] rounded-xl border border-[#3e2723] w-full shadow-2xl">
                        <p className="text-[#8d6e63] uppercase tracking-widest text-sm">Pontuação Final</p>
                        <p className="text-6xl font-bold text-[#bf953f] mt-2 drop-shadow-lg">{score}</p>
                    </div>
                    <button 
                        onClick={() => setGameState('menu')}
                        className="w-full px-8 py-4 bg-[#bf953f] text-[#1a100e] font-bold rounded-full hover:bg-[#fcf6ba] transition-transform active:scale-95 shadow-lg uppercase tracking-widest"
                    >
                        Jogar Novamente
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};

export default BibleQuiz;