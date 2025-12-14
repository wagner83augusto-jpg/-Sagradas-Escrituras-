import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Sparkles } from 'lucide-react';
import { playClickSound } from '../constants';
import { BIBLE_BOOKS } from '../constants';

const COMMANDS_HELP_TEXT = "Você pode dizer: 'Menu' para ouvir as opções, 'Abrir Bíblia', 'Mateus 4 8' para ir a um versículo, 'Abrir Cursos', 'Abrir Rádios' ou 'Abrir Comunidade'.";

const MENU_READING_TEXT = "Menu Principal. Opção 1: Bíblia Sagrada. Opção 2: Reflexão Diária. Opção 3: Cursos Teológicos. Opção 4: Quiz Bíblico. Opção 5: Livros Apócrifos. Opção 6: Dicionário. Opção 7: Assistente IA. Opção 8: Rádios Online. Opção 9: Comunidade.";

const GlobalControls: React.FC = () => {
    const [isListening, setIsListening] = useState(false);
    const [feedback, setFeedback] = useState('');
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // Cancelar fala ao desmontar
        return () => {
            window.speechSynthesis.cancel();
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, []);

    const speak = (text: string) => {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'pt-BR';
        window.speechSynthesis.speak(u);
    };

    const processCommand = (transcript: string) => {
        const cmd = transcript.toLowerCase();
        setFeedback(cmd);
        
        // 1. Comando: AJUDA / COMANDOS
        if (cmd.includes('comandos') || cmd.includes('ajuda') || cmd.includes('o que posso dizer')) {
            speak(COMMANDS_HELP_TEXT);
            return;
        }

        // 2. Comando: MENU (Com leitura acessível)
        if (cmd === 'menu' || cmd.includes('abrir menu') || cmd.includes('voltar para o menu')) {
            window.location.hash = 'menu';
            setTimeout(() => speak(MENU_READING_TEXT), 500);
            return;
        }

        // 3. Navegação Direta por Telas
        if (cmd.includes('curso')) window.location.hash = 'courses';
        else if (cmd.includes('comunidade') || cmd.includes('chat')) window.location.hash = 'chat';
        else if (cmd.includes('rádio') || cmd.includes('musica')) window.location.hash = 'radios';
        else if (cmd.includes('quiz') || cmd.includes('jogo')) window.location.hash = 'quiz';
        else if (cmd.includes('dicionário')) window.location.hash = 'dictionary';
        else if (cmd.includes('apócrifo')) window.location.hash = 'apocrypha';
        else if (cmd.includes('assistente')) window.location.hash = 'assistant';
        
        // 4. Navegação Bíblica Inteligente (Ex: "Mateus 4 8" ou "Abrir Mateus capítulo 4")
        else {
            const foundBook = BIBLE_BOOKS.find(b => cmd.includes(b.name.toLowerCase()));
            if (foundBook) {
                // Regex para pegar sequencias de digitos
                const numbers = cmd.match(/\d+/g);
                
                let chapter = 1;
                let verse = null;

                if (numbers && numbers.length > 0) {
                    chapter = parseInt(numbers[0]);
                    if (numbers.length > 1) {
                        verse = parseInt(numbers[1]);
                    }
                }

                // Navegar
                window.location.hash = `bible/${foundBook.name}/${chapter}`;
                speak(`Abrindo ${foundBook.name} capítulo ${chapter}`);
            } else {
                // Feedback visual apenas, sem som de erro para não ser intrusivo se o reconhecimento pegar ruído
            }
        }
    };

    const toggleListening = () => {
        playClickSound();
        if (isListening) {
            if (recognitionRef.current) recognitionRef.current.stop();
            setIsListening(false);
            setFeedback('');
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Navegação por voz não suportada.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(true);
            setFeedback('Ouvindo...');
        };

        recognition.onend = () => {
            setIsListening(false);
            setTimeout(() => setFeedback(''), 2000);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            processCommand(transcript);
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    return (
        <div 
            className="fixed top-4 right-4 z-50 flex items-center gap-3"
            role="region" 
            aria-label="Controles Globais de Acessibilidade e Voz"
        >
            {feedback && (
                <div className="absolute top-12 right-0 bg-[#3e2723] text-[#fcf6ba] text-xs px-3 py-1 rounded shadow-lg border border-[#bf953f] whitespace-nowrap animate-in fade-in">
                    {feedback}
                </div>
            )}

            <button
                onClick={() => { playClickSound(); window.location.hash = 'assistant'; }}
                className="w-10 h-10 rounded-full bg-[#1a100e]/80 backdrop-blur-md border border-[#bf953f] flex items-center justify-center text-[#bf953f] shadow-lg hover:bg-[#3e2723] transition-all focus:outline-none focus:ring-2 focus:ring-[#fcf6ba]"
                aria-label="Abrir Assistente de Inteligência Artificial"
                title="Assistente IA"
            >
                <Sparkles size={20} />
            </button>

            <button
                onClick={toggleListening}
                className={`w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#fcf6ba] ${
                    isListening 
                    ? 'bg-red-900/90 border-red-500 text-white animate-pulse' 
                    : 'bg-[#1a100e]/80 border-[#bf953f] text-[#bf953f] hover:bg-[#3e2723]'
                }`}
                aria-label={isListening ? "Parar escuta de comandos" : "Ativar comandos de voz. Diga 'Comandos' para ajuda."}
                title="Comando de Voz Global"
            >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
        </div>
    );
};

export default GlobalControls;