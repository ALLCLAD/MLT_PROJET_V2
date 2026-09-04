import React from 'react';
import { Link } from 'react-router-dom';
import HeroImage from '../../assets/logo.jpeg';
import { Sparkles, ArrowRight, Play, Compass, Plus, Percent } from 'lucide-react';

const Hero = () => {
    return (
        <section className="relative py-16 md:py-28 flex items-center overflow-hidden bg-base-100 text-base-content"
                 style={{ minHeight: '85vh' }}>
            
            {/* CSS ANIMATIONS & EFFECTS */}
            <style>{`
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(5deg); }
                }
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(15px) rotate(-8deg); }
                }
                @keyframes pulse-glow {
                    0%, 100% { transform: scale(1) translate(-50%, -50%); opacity: 0.6; filter: blur(60px); }
                    50% { transform: scale(1.15) translate(-45%, -45%); opacity: 0.8; filter: blur(80px); }
                }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-float-1 { animation: float-slow 6s ease-in-out infinite; }
                .animate-float-2 { animation: float-delayed 8s ease-in-out infinite; }
                .animate-float-3 { animation: float-slow 7s ease-in-out infinite 1s; }
                .animate-glow { animation: pulse-glow 10s ease-in-out infinite; }
                .animate-fade-up { animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-delay-1 { animation-delay: 0.1s; }
                .animate-delay-2 { animation-delay: 0.25s; }
                .animate-delay-3 { animation-delay: 0.4s; }
            `}</style>

            {/* BACKGROUND GRADIENT ORBS */}
            <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/20 pointer-events-none animate-glow" style={{ zIndex: 0 }} />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-secondary/15 pointer-events-none animate-glow" style={{ zIndex: 0, animationDelay: '-5s' }} />

            {/* FLOATING DECORATIONS */}
            <div className="absolute top-1/4 left-10 pointer-events-none animate-float-1 opacity-25 select-none hidden md:block">
                <span className="text-8xl font-black text-primary">+</span>
            </div>
            <div className="absolute bottom-1/4 left-1/3 pointer-events-none animate-float-2 opacity-20 select-none hidden md:block">
                <span className="text-7xl font-black text-secondary">÷</span>
            </div>
            <div className="absolute top-20 right-1/3 pointer-events-none animate-float-3 opacity-25 select-none hidden md:block">
                <span className="text-8xl font-black text-accent">%</span>
            </div>
            <div className="absolute bottom-1/5 right-10 pointer-events-none animate-float-1 opacity-20 select-none hidden md:block">
                <span className="text-9xl font-black text-primary">π</span>
            </div>

            <div className="container mx-auto px-6 md:px-12 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">

                    {/* TEXTE GAUCHE */}
                    <div className="w-full lg:w-6/12 text-center lg:text-left flex flex-col items-center lg:items-start">
                        {/* Tag Premium */}
                        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-black tracking-widest px-4 py-2 rounded-2xl mb-6 uppercase animate-fade-up">
                            <Sparkles size={14} className="text-primary animate-pulse" />
                            L'apprentissage réinventé
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.1] tracking-tight text-base-content animate-fade-up animate-delay-1">
                            Les maths deviennent <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-600 to-secondary drop-shadow-sm">
                                un jeu d'enfant.
                            </span>
                        </h1>
                        
                        <p className="text-lg md:text-xl mb-10 text-base-content/70 max-w-lg font-medium leading-relaxed animate-fade-up animate-delay-2">
                            Une plateforme interactive et ludique conçue pour aider les élèves à progresser en s'amusant, tout en offrant un suivi transparent aux parents et enseignants.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center lg:justify-start animate-fade-up animate-delay-3">
                            <Link 
                                to="/inscription" 
                                className="btn btn-primary btn-lg rounded-2xl px-8 shadow-xl shadow-primary/25 border-none text-white hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-2 font-black group"
                            >
                                Commencer l'aventure
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <a 
                                href="#enfants" 
                                className="btn btn-ghost btn-lg rounded-2xl px-8 border border-base-content/10 hover:bg-base-200/50 hover:border-transparent transition-all flex items-center gap-2 font-bold"
                            >
                                <Play size={16} fill="currentColor" />
                                Découvrir le concept
                            </a>
                        </div>
                    </div>

                    {/* IMAGE DROITE AVEC HALO DYNAMIQUE */}
                    <div className="w-full lg:w-6/12 flex justify-center relative">
                        <div className="relative inline-block animate-float-1">
                            
                            {/* LE HALO BLEU D'ORIGINE - Opacité 0.8 pour éviter le gris */}
                            <div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                                style={{
                                    width: '110%', height: '110%',
                                    background: 'hsl(var(--p))',
                                    filter: 'blur(50px)', opacity: '0.8', zIndex: 0
                                }}
                            ></div>
                            
                            {/* Floating decorative metric badges */}
                            <div className="absolute top-8 -left-8 bg-base-100/90 backdrop-blur-md border border-base-content/10 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 z-20 animate-float-2">
                                <div className="p-2 bg-success/15 text-success rounded-xl">
                                    <Sparkles size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-base-content/50 uppercase tracking-wider">Récompense</p>
                                    <p className="text-sm font-black text-base-content">+150 XP gagnés !</p>
                                </div>
                            </div>

                            <div className="absolute bottom-12 -right-6 bg-base-100/90 backdrop-blur-md border border-base-content/10 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 z-20 animate-float-3">
                                <div className="p-2 bg-secondary/15 text-secondary rounded-xl">
                                    <Compass size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-base-content/50 uppercase tracking-wider">Progression</p>
                                    <p className="text-sm font-black text-base-content">Niveau 12 atteint</p>
                                </div>
                            </div>

                            {/* Main Artwork Frame */}
                            <div className="relative z-10 p-4 bg-base-100/30 backdrop-blur-sm border border-white/10 rounded-[3.5rem] shadow-2xl overflow-hidden hover:scale-[1.01] transition-transform duration-500">
                                <img 
                                    src={HeroImage} 
                                    className="w-full max-w-[420px] rounded-[2.8rem] shadow-lg object-cover transform rotate-[-1deg]" 
                                    alt="MathTool Interactive Learning App" 
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Hero;