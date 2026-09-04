import React, { useState, useEffect } from 'react';
import Navbar from '../composants/UI/Navbar';
import Hero from '../composants/UI/Hero';
import SectionEnfant from '../composants/UI/SectionEnfant';
import SectionParent from '../composants/UI/SectionParent';
import SectionEnseignant from '../composants/UI/SectionEnseignant';
import Footer from '../composants/UI/Footer';
import Logo from '../assets/logo.jpeg';

const Accueil = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1200);

        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center select-none"
                 style={{ background: 'radial-gradient(circle, rgba(255,255,255,1) 70%, rgba(59,130,246,0.03) 100%)' }}>
                <style>{`
                    @keyframes spin-ultra {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    @keyframes fade-pulse {
                        0%, 100% { opacity: 0.5; }
                        50% { opacity: 1; }
                    }
                    @keyframes logo-reveal {
                        0% { transform: scale(0.92); opacity: 0; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    .animate-spin-ultra {
                        animation: spin-ultra 1.1s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite;
                    }
                    .animate-fade-pulse {
                        animation: fade-pulse 1.6s ease-in-out infinite;
                    }
                    .animate-logo-reveal {
                        animation: logo-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }
                `}</style>
                <div className="relative flex flex-col items-center">
                    {/* Ring Loader Container */}
                    <div className="relative w-28 h-28 flex items-center justify-center">
                        {/* Static light track */}
                        <div className="absolute inset-0 rounded-full border-[3px] border-slate-100"></div>
                        {/* Animated active segment */}
                        <div className="absolute inset-0 rounded-full border-[3px] border-primary border-t-transparent animate-spin-ultra"></div>
                        
                        {/* Logo inside */}
                        <img 
                            src={Logo} 
                            alt="Logo MathTool" 
                            className="w-20 h-20 rounded-2xl shadow-md object-cover animate-logo-reveal" 
                        />
                    </div>
                    
                    {/* Sleek Text */}
                    <div className="mt-6 flex flex-col items-center gap-0.5">
                        <span className="text-sm font-black tracking-widest text-slate-800 uppercase">
                            MATH LEARNING TOOL
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400 animate-fade-pulse">
                            Initialisation de l'application...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100 text-base-content transition-all animate-in fade-in duration-500">
            <Navbar />
            <main>
                <Hero />
                <SectionEnfant />
                <SectionParent />
                <SectionEnseignant />
            </main>
            <Footer />
        </div>
    );
};

export default Accueil;