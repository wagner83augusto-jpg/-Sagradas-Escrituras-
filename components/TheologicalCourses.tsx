import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, Award, ChevronRight, PlayCircle, FileText, AlertCircle, Info, GraduationCap, Star, Book } from 'lucide-react';
import { playClickSound } from '../constants';
import { fetchCourseSyllabus, fetchCourseContent, fetchCourseQuiz, CourseModule, CourseContent, QuizQuestion } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface Props {
  onBack: () => void;
}

const TOPICS = [
    "As 28 Crenças Fundamentais",
    "Profecias de Daniel",
    "Profecias de Apocalipse",
    "O Santuário Celestial",
    "História da Igreja Adventista",
    "Soteriologia: A Doutrina da Salvação"
];

const TheologicalCourses: React.FC<Props> = ({ onBack }) => {
    // States: 'selection' | 'syllabus' | 'learning' | 'quiz' | 'result'
    const [view, setView] = useState('selection');
    const [selectedTopic, setSelectedTopic] = useState('');
    const [syllabus, setSyllabus] = useState<CourseModule[]>([]);
    const [currentModule, setCurrentModule] = useState<CourseModule | null>(null);
    const [moduleContent, setModuleContent] = useState<CourseContent | null>(null);
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
    const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(false);

    const loadSyllabus = async (topic: string) => {
        playClickSound();
        setSelectedTopic(topic);
        setLoading(true);
        try {
            const data = await fetchCourseSyllabus(topic);
            setSyllabus(data);
            setView('syllabus');
        } catch (e) {
            alert('Erro ao criar curso.');
        } finally {
            setLoading(false);
        }
    };

    const startModule = async (module: CourseModule) => {
        playClickSound();
        setCurrentModule(module);
        setLoading(true);
        try {
            const content = await fetchCourseContent(selectedTopic, module.title);
            setModuleContent(content);
            setView('learning');
        } finally {
            setLoading(false);
        }
    };

    const startQuiz = async () => {
        playClickSound();
        if (!moduleContent) return;
        setLoading(true);
        try {
            const questions = await fetchCourseQuiz(moduleContent.content);
            setQuizQuestions(questions);
            setQuizAnswers(new Array(questions.length).fill(-1));
            setView('quiz');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (qIndex: number, optionIndex: number) => {
        const newAnswers = [...quizAnswers];
        newAnswers[qIndex] = optionIndex;
        setQuizAnswers(newAnswers);
    };

    const finishQuiz = () => {
        playClickSound();
        let correct = 0;
        quizQuestions.forEach((q, idx) => {
            if (q.correctOptionIndex === quizAnswers[idx]) correct++;
        });
        const percentage = Math.round((correct / quizQuestions.length) * 100);
        setScore(percentage);
        setView('result');
        
        // Save progress (mock)
        const history = JSON.parse(localStorage.getItem('bible_courses_progress') || '{}');
        history[`${selectedTopic}-${currentModule?.id}`] = percentage;
        localStorage.setItem('bible_courses_progress', JSON.stringify(history));
    };

    // Componente de Botão Estilizado (Igual ao Menu)
    const CourseButton = ({ label, desc, onClick, index, icon: Icon = BookOpen }: any) => (
        <button
          onClick={onClick}
          style={{ animationDelay: `${index * 80}ms` }}
          className="group relative w-full flex items-center gap-4 p-5 bg-[#1a100e]/80 backdrop-blur-md border border-[#3e2723] rounded-2xl shadow-lg hover:bg-[#2d1b18] hover:border-[#bf953f] hover:scale-[1.02] transition-all duration-300 animate-in slide-in-from-bottom-4 fade-in fill-mode-backwards focus:outline-none focus:ring-2 focus:ring-[#bf953f]"
        >
            <div className="absolute inset-0 bg-[#bf953f]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#bf953f] to-[#5d4037] rounded-full flex items-center justify-center text-[#1a100e] shadow-lg group-hover:rotate-12 transition-transform duration-300 z-10">
                <Icon size={24} strokeWidth={2} />
            </div>
            
            <div className="flex-1 text-left flex flex-col z-10">
                <h3 className="text-lg font-title font-bold text-[#e0c9a6] group-hover:text-[#fcf6ba] tracking-wide uppercase leading-tight">
                    {label}
                </h3>
                {desc && (
                    <span className="text-[11px] text-[#8d6e63] font-serif italic mt-1 group-hover:text-[#bf953f] transition-colors">
                        {desc}
                    </span>
                )}
            </div>
    
            <div className="text-[#5d4037] group-hover:text-[#bf953f] transition-colors opacity-70 z-10">
                <ChevronRight size={20} />
            </div>
        </button>
    );

    return (
        <div className="min-h-screen bg-[#1a100e] text-[#e0c9a6] flex flex-col relative overflow-hidden">
             {/* Background Texture & Effects */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-40 pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#3e2723]/30 via-transparent to-black pointer-events-none"></div>

            {/* Header - Left Spacer for Global X */}
            <div className="bg-[#1a100e]/95 backdrop-blur-md p-4 flex items-center gap-4 sticky top-0 z-20 border-b border-[#3e2723] shadow-lg">
                <div className="w-10"></div> {/* Placeholder for Global X */}
                <h1 className="text-lg font-title font-bold text-[#fcf6ba] uppercase tracking-widest">Seminário Teológico</h1>
            </div>

            <div className="flex-1 p-6 max-w-2xl mx-auto w-full relative z-10">
                {loading && (
                    <div className="flex flex-col items-center justify-center h-full py-20">
                        <div className="w-12 h-12 border-2 border-[#bf953f] border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-[#8d6e63] animate-pulse font-serif italic">Consultando biblioteca teológica...</p>
                    </div>
                )}

                {!loading && view === 'selection' && (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                             <GraduationCap size={48} className="mx-auto text-[#bf953f] mb-4" />
                             <h2 className="text-2xl font-serif text-[#fcf6ba] mb-2">Catálogo de Cursos</h2>
                             <p className="text-xs text-[#8d6e63]">Selecione um tema para aprofundar seus conhecimentos.</p>
                        </div>
                        
                        <div className="flex flex-col gap-4">
                            {TOPICS.map((topic, idx) => (
                                <CourseButton 
                                    key={idx}
                                    index={idx}
                                    label={topic}
                                    desc="Curso Completo com Certificação"
                                    onClick={() => loadSyllabus(topic)}
                                    icon={Book}
                                />
                            ))}
                        </div>
                        
                        {/* Notificação Discreta sobre Certificados */}
                        <div className="mt-8 flex items-start gap-3 px-5 py-4 bg-[#2d1b18]/60 border border-[#3e2723] rounded-xl text-[11px] text-[#8d6e63] italic">
                             <Info size={16} className="flex-shrink-0 mt-0.5 text-[#bf953f]" />
                             <p>Nota: Os certificados emitidos neste aplicativo são simbólicos para incentivo pessoal de estudos e não possuem reconhecimento acadêmico ou legal.</p>
                        </div>
                    </div>
                )}

                {!loading && view === 'syllabus' && (
                    <div className="space-y-6">
                         <div className="text-center mb-8 pb-4 border-b border-[#3e2723]">
                             <h2 className="text-xl font-title font-bold text-[#bf953f] mb-1">{selectedTopic}</h2>
                             <p className="text-xs text-[#8d6e63] uppercase tracking-wider">Plano de Ensino</p>
                         </div>
                         
                         <div className="flex flex-col gap-4">
                             {syllabus.map((mod, idx) => (
                                 <CourseButton
                                     key={mod.id}
                                     index={idx}
                                     label={`Módulo ${mod.id}: ${mod.title}`}
                                     desc={mod.description}
                                     onClick={() => startModule(mod)}
                                     icon={PlayCircle}
                                 />
                             ))}
                         </div>
                    </div>
                )}

                {!loading && view === 'learning' && moduleContent && (
                    <div className="space-y-6 pb-20">
                        <div className="flex justify-between items-center border-b border-[#3e2723] pb-4">
                             <h2 className="text-xl font-serif text-[#fcf6ba]">{moduleContent.title}</h2>
                        </div>
                        <article className="prose prose-invert prose-p:text-[#e0c9a6] prose-headings:text-[#bf953f] prose-strong:text-[#fcf6ba] max-w-none font-serif leading-relaxed text-lg">
                            <ReactMarkdown>{moduleContent.content}</ReactMarkdown>
                        </article>
                        <div className="pt-8 border-t border-[#3e2723]">
                            <button 
                                onClick={startQuiz}
                                className="w-full py-4 bg-gradient-to-r from-[#bf953f] to-[#8a6e3e] text-[#1a100e] font-bold uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-lg flex items-center justify-center gap-2 transform active:scale-95"
                            >
                                <FileText size={20} /> Fazer Prova do Módulo
                            </button>
                        </div>
                    </div>
                )}

                {!loading && view === 'quiz' && (
                    <div className="space-y-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-serif text-[#bf953f]">Avaliação de Conhecimento</h2>
                            <span className="text-xs bg-[#3e2723] px-2 py-1 rounded text-[#8d6e63]">{quizQuestions.length} Questões</span>
                        </div>
                        {quizQuestions.map((q, qIdx) => (
                            <div key={qIdx} className="bg-[#1a100e]/50 backdrop-blur p-6 rounded-2xl border border-[#3e2723] shadow-md">
                                <h3 className="font-bold text-lg mb-4 text-[#fcf6ba]">{qIdx + 1}. {q.question}</h3>
                                <div className="space-y-3">
                                    {q.options.map((opt, oIdx) => (
                                        <button
                                            key={oIdx}
                                            onClick={() => handleAnswer(qIdx, oIdx)}
                                            className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                                                quizAnswers[qIdx] === oIdx 
                                                ? 'bg-[#3e2723] border-[#bf953f] text-[#bf953f] shadow-[0_0_10px_rgba(191,149,63,0.2)]' 
                                                : 'bg-[#2d1b18] border-transparent hover:border-[#5d4037] text-[#a1887f]'
                                            }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <button 
                            onClick={finishQuiz}
                            disabled={quizAnswers.includes(-1)}
                            className="w-full py-4 bg-[#bf953f] text-[#1a100e] font-bold uppercase tracking-widest rounded-xl hover:bg-[#fcf6ba] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            Finalizar Prova
                        </button>
                    </div>
                )}

                {!loading && view === 'result' && (
                    <div className="text-center py-12 space-y-8">
                        {score >= 70 ? (
                            <div className="relative inline-block">
                                <div className="absolute inset-0 bg-[#bf953f]/20 blur-xl rounded-full"></div>
                                <Award size={100} className="relative z-10 text-[#bf953f] animate-bounce" />
                            </div>
                        ) : (
                            <AlertCircle size={80} className="mx-auto text-red-500" />
                        )}
                        
                        <div>
                            <h2 className="text-5xl font-title font-bold text-[#fcf6ba] drop-shadow-lg">{score}%</h2>
                            <p className="text-[#a1887f] uppercase tracking-widest mt-2 text-sm">Aproveitamento Final</p>
                        </div>

                        <div className="bg-[#2d1b18]/80 p-6 rounded-xl border border-[#3e2723] text-left max-w-md mx-auto shadow-lg">
                            <h3 className="font-bold text-[#bf953f] mb-4 uppercase text-xs tracking-wider border-b border-[#3e2723] pb-2">Gabarito Comentado</h3>
                            <div className="space-y-6 text-sm">
                                {quizQuestions.map((q, idx) => (
                                    <div key={idx} className="border-b border-[#3e2723] pb-4 last:border-0 last:pb-0">
                                        <p className="text-[#fcf6ba] mb-2 font-bold">{idx+1}. {q.question}</p>
                                        <p className={`font-bold mb-1 ${quizAnswers[idx] === q.correctOptionIndex ? 'text-green-500' : 'text-red-400'}`}>
                                            Sua resposta: {q.options[quizAnswers[idx]]}
                                        </p>
                                        <p className="text-[#8d6e63] italic leading-relaxed">Explicação: {q.explanation}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4 max-w-sm mx-auto">
                             <button onClick={() => setView('syllabus')} className="flex-1 py-3 border border-[#bf953f] text-[#bf953f] rounded-xl hover:bg-[#bf953f]/10 transition-colors uppercase text-xs font-bold tracking-wider">
                                 Voltar ao Curso
                             </button>
                             {score < 70 && (
                                 <button onClick={startQuiz} className="flex-1 py-3 bg-[#bf953f] text-[#1a100e] rounded-xl hover:bg-[#fcf6ba] transition-colors uppercase text-xs font-bold tracking-wider">
                                     Tentar Novamente
                                 </button>
                             )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TheologicalCourses;