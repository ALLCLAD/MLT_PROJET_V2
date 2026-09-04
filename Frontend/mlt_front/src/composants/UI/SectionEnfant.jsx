import React from 'react';
import { Link } from 'react-router-dom';
import ImgEnfant from '../../assets/img.png';
import { Gamepad2, Award, Shield, User, GraduationCap, Flame } from 'lucide-react';

const SectionEnfant = () => {
    const pointsList = [
        {
            icon: <Gamepad2 className="text-success" size={20} />,
            title: "Calcul en s'amusant",
            desc: "Des quiz et aventures pour maîtriser le calcul sans pression."
        },
        {
            icon: <Award className="text-warning" size={20} />,
            title: "Succès & Trophées",
            desc: "Plus de 50 badges uniques à débloquer en complétant les leçons."
        },
        {
            icon: <User className="text-info" size={20} />,
            title: "Avatar évolutif",
            desc: "Personnalise ton personnage avec tes points d'expérience."
        },
        {
            icon: <Flame className="text-error" size={20} />,
            title: "Défis quotidiens",
            desc: "Une série d'exercices rapides chaque jour pour rester au top."
        }
    ];

    return (
        <section id="enfants" className="py-16 my-10 px-4 bg-base-100 text-base-content font-sans">
            <div className="container mx-auto">
                <div className="flex flex-col lg:flex-row items-center p-8 md:p-16 bg-base-100 border border-base-content/10 rounded-[3rem] shadow-xl hover:shadow-2xl hover:border-primary/20 transition-all duration-500 group gap-12">
                    {/* Left: Interactive Visual */}
                    <div className="w-full lg:w-5/12 text-center relative flex justify-center">
                        <div className="absolute w-72 h-72 bg-success/10 blur-3xl rounded-full scale-90 group-hover:scale-110 transition-transform duration-700 pointer-events-none"></div>
                        <img 
                            src={ImgEnfant} 
                            className="relative z-10 w-full max-w-sm rounded-[2.5rem] object-cover shadow-2xl group-hover:translate-y-[-5px] group-hover:rotate-[0.5deg] transition-all duration-500" 
                            alt="Enfants apprenant en s'amusant" 
                        />
                    </div>

                    {/* Right: Enriched Content */}
                    <div className="w-full lg:w-7/12">
                        <div className="inline-flex items-center gap-1.5 bg-success/10 text-success text-xs font-black tracking-widest px-4 py-2 rounded-xl mb-6 uppercase">
                            <Gamepad2 size={14} />
                            ESPACE ÉLÈVE
                        </div>
                        
                        <h2 className="text-4xl md:text-5xl font-black mb-6 leading-[1.15] tracking-tight">
                            Apprends les mathématiques <br />
                            <span className="text-success">sans même t'en rendre compte.</span>
                        </h2>
                        
                        <p className="text-base-content/75 font-medium text-lg mb-8 leading-relaxed">
                            À travers un parcours de jeu immersif, ton enfant surmonte les difficultés scolaires et prend plaisir à résoudre les problèmes les plus complexes.
                        </p>

                        {/* Feature Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                            {pointsList.map((item, idx) => (
                                <div key={idx} className="flex gap-3 hover:translate-x-1 transition-transform duration-300">
                                    <div className="p-3 bg-base-200 rounded-xl h-11 w-11 flex items-center justify-center flex-shrink-0 shadow-sm">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-base-content text-sm">{item.title}</h4>
                                        <p className="text-xs text-base-content/60 font-medium mt-1 leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Link 
                            to="/inscription" 
                            className="btn btn-neutral btn-lg rounded-2xl px-10 font-black normal-case shadow-lg shadow-neutral/10 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            Rejoindre la partie
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SectionEnfant;