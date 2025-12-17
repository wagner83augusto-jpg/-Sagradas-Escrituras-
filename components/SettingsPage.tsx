import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Trash2, Fingerprint, Moon, Sun, ChevronRight, Settings as SettingsIcon } from 'lucide-react';
import { playClickSound } from '../constants';

interface SettingsPageProps {
    onBack: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [lionSound, setLionSound] = useState(true);
    const [biometrics, setBiometrics] = useState(false);

    useEffect(() => {
        setLionSound(localStorage.getItem('bible_lion_sound_enabled') !== 'false');
        setBiometrics(localStorage.getItem('bible_biometrics_enabled') === 'true');
    }, []);

    const toggleLionSound = () => {
        playClickSound();
        const newState = !lionSound;
        setLionSound(newState);
        localStorage.setItem('bible_lion_sound_enabled', String(newState));
    };

    const toggleBiometrics = () => {
        playClickSound();
        const newState = !biometrics;
        setBiometrics(newState);
        localStorage.setItem('bible_biometrics_enabled', String(newState));
    };

    const clearLocalData = () => {
        playClickSound();
        if (confirm("Isso apagará suas notas, histórico do chat e preferências salvas neste dispositivo. Deseja continuar?")) {
            localStorage.clear();
            alert("Dados limpos com sucesso. O aplicativo será reiniciado.");
            window.location.reload();
        }
    };

    return (
        <div className="min-h-screen bg-[#1a100e] text-[#e0c9a6] flex flex-col relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-40 pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#3e2723]/30 via-transparent to-black pointer-events-none"></div>

            {/* Header */}
            <header className="bg-[#1a100e]/95 backdrop-blur-md p-4 flex items-center gap-4 sticky top-0 z-20 border-b border-[#3e2723] shadow-lg">
                <button 
                    onClick={() => { playClickSound(); onBack(); }}
                    className="p-2 text-[#bf953f] hover:text-[#fcf6ba] hover:bg-[#3e2723] rounded-full focus:outline-none"
                >
                    <ChevronRight size={24} className="rotate-180" />
                </button>
                <h1 className="text-lg font-title font-bold text-[#fcf6ba] uppercase tracking-widest flex items-center gap-2">
                    <SettingsIcon size={20} /> Configurações
                </h1>
            </header>

            <main className="p-6 max-w-lg mx-auto w-full z-10 space-y-8">
                
                {/* Seção Áudio */}
                <section>
                    <h2 className="text-[#8d6e63] text-xs font-bold uppercase tracking-widest mb-4 ml-2">Preferências de Áudio</h2>
                    <div className="bg-[#2d1b18] rounded-xl border border-[#3e2723] overflow-hidden">
                        <div className="p-4 flex items-center justify-between border-b border-[#3e2723]/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#1a100e] rounded-full text-[#bf953f]">
                                    {lionSound ? <Volume2 size={20} /> : <VolumeX size={20} />}
                                </div>
                                <div>
                                    <p className="font-bold text-[#e0c9a6]">Efeitos Sonoros</p>
                                    <p className="text-[10px] text-[#8d6e63]">Sons de clique e ambiente</p>
                                </div>
                            </div>
                            <button 
                                onClick={toggleLionSound}
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${lionSound ? 'bg-[#bf953f]' : 'bg-[#1a100e] border border-[#5d4037]'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${lionSound ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Seção Segurança */}
                <section>
                    <h2 className="text-[#8d6e63] text-xs font-bold uppercase tracking-widest mb-4 ml-2">Segurança</h2>
                    <div className="bg-[#2d1b18] rounded-xl border border-[#3e2723] overflow-hidden">
                         <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#1a100e] rounded-full text-[#bf953f]">
                                    <Fingerprint size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-[#e0c9a6]">Login Biométrico</p>
                                    <p className="text-[10px] text-[#8d6e63]">Usar digital para entrar</p>
                                </div>
                            </div>
                            <button 
                                onClick={toggleBiometrics}
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${biometrics ? 'bg-[#bf953f]' : 'bg-[#1a100e] border border-[#5d4037]'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${biometrics ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Seção Dados */}
                <section>
                    <h2 className="text-[#8d6e63] text-xs font-bold uppercase tracking-widest mb-4 ml-2">Armazenamento</h2>
                    <button 
                        onClick={clearLocalData}
                        className="w-full bg-[#2d1b18] hover:bg-red-900/20 rounded-xl border border-[#3e2723] p-4 flex items-center gap-3 group transition-colors"
                    >
                         <div className="p-2 bg-[#1a100e] rounded-full text-red-400 group-hover:bg-red-900/40">
                            <Trash2 size={20} />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-red-400">Limpar Dados Locais</p>
                            <p className="text-[10px] text-[#8d6e63]">Remove notas e histórico deste aparelho</p>
                        </div>
                    </button>
                </section>
                
                {/* Rodapé removido */}
            </main>
        </div>
    );
};

export default SettingsPage;