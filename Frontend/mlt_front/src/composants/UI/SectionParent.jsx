import React from 'react';
import { Link } from 'react-router-dom';
import ImgParent from '../../assets/img_3.png';
import { Users, Shield, TrendingUp, MessageSquare, Bell, Target } from 'lucide-react';

const SectionParent = () => {
    const parentFeatures = [
        {
            icon: <TrendingUp className="text-warning" size={20} />,
            title: "Rapports d'activité détaillés",
            desc: "Visualisez en un clic les scores, le temps passé et les leçons maîtrisées."
        },
        {
            icon: <MessageSquare className="text-warning" size={20} />,
            title: "Messagerie directe",
            desc: "Communiquez instantanément avec les enseignants pour un meilleur suivi."
        },
        {
            icon: <Bell className="text-warning" size={20} />,
            title: "Notifications en direct",
            desc: "Soyez alerté dès que votre enfant termine un exercice ou gagne un trophée."
        },
        {
            icon: <Target className="text-warning" size={20} />,
            title: "Objectifs d'entraînement",
            desc: "Définissez des défis hebdomadaires pour encourager la régularité."
        }
    ];

    return (
        <section id="parent" className="py-16 my-10 px-4 bg-base-100 text-base-content">
            <div className="container mx-auto">
                <div className="relative flex flex-col lg:flex-row-reverse items-center p-8 md:p-16 bg-gradient-to-br from-primary to-purple-700 text-primary-content rounded-[3rem] shadow-2xl overflow-hidden hover:shadow-primary/20 transition-all duration-500 group gap-12">
                    
                    {/* Glowing Accent Orbs in card */}
                    <div className="absolute top-[-20%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-white/10 blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />
                    
                    {/* Content Area */}
                    <div className="w-full lg:w-7/12 z-10">
                        <div className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-black tracking-widest px-4 py-2 rounded-xl mb-6 uppercase">
                            <Users size={14} />
                            ESPACE PARENT
                        </div>
                        
                        <h2 className="text-4xl md:text-5xl font-black mb-6 leading-[1.15] text-white tracking-tight">
                            Accompagnez sa réussite, <br />
                            <span className="text-warning">gardez l'esprit tranquille.</span>
                        </h2>
                        
                        <p className="text-lg opacity-90 mb-8 font-medium text-white/80 leading-relaxed">
                            Suivez l'évolution académique de votre enfant au jour le jour grâce à nos outils d'analyse simplifiés conçus spécifiquement pour les parents.
                        </p>
                        
                        {/* Parent Features Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 text-white">
                            {parentFeatures.map((item, idx) => (
                                <div key={idx} className="flex gap-3 hover:translate-x-1 transition-transform duration-300">
                                    <div className="p-3 bg-white/10 rounded-xl h-11 w-11 flex items-center justify-center flex-shrink-0 shadow-sm border border-white/5">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">{item.title}</h4>
                                        <p className="text-xs text-white/70 font-medium mt-1 leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <Link 
                            to="/inscription" 
                            className="btn btn-warning btn-lg rounded-2xl px-10 font-black text-gray-900 border-none shadow-lg shadow-warning/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            Accès Parent
                        </Link>
                    </div>

                    {/* Image Area */}
                    <div className="w-full lg:w-5/12 text-center z-10 relative flex justify-center">
                        <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full scale-75"></div>
                        <img 
                            src={ImgParent} 
                            className="relative z-10 w-full max-w-sm rounded-[2.5rem] object-cover shadow-2xl border-4 border-white/10 group-hover:translate-y-[-5px] group-hover:rotate-[-0.5deg] transition-all duration-500" 
                            alt="Parent et enfant consultant les progrès scolaires" 
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SectionParent;