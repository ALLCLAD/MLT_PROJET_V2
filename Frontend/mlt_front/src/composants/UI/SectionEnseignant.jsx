import React from 'react';
import { Link } from 'react-router-dom';
import ImgEnseignant from '../../assets/img_5.png';
import { GraduationCap, LayoutDashboard, PlusCircle, CheckSquare, BarChart3, Users } from 'lucide-react';

const SectionEnseignant = () => {
    const teacherFeatures = [
        {
            icon: <Users className="text-warning" size={20} />,
            title: "Gestion des classes & élèves",
            desc: "Créez vos listes scolaires et invitez vos élèves en quelques clics."
        },
        {
            icon: <PlusCircle className="text-warning" size={20} />,
            title: "Distribution de devoirs",
            desc: "Assignez des leçons ou des exercices adaptés au rythme de chacun."
        },
        {
            icon: <CheckSquare className="text-warning" size={20} />,
            title: "Correction automatisée",
            desc: "Gagnez du temps avec le système de correction automatique des exercices."
        },
        {
            icon: <BarChart3 className="text-warning" size={20} />,
            title: "Suivi des compétences",
            desc: "Identifiez précisément les acquis et les lacunes à travers des rapports clairs."
        }
    ];

    return (
        <section id="enseignant" className="py-16 my-10 px-4 bg-base-100">
            <div className="container mx-auto">
                <div className="flex flex-col lg:flex-row items-center p-8 md:p-16 bg-neutral text-neutral-content rounded-[3rem] shadow-2xl overflow-hidden hover:shadow-neutral/20 transition-all duration-500 group gap-12">
                    
                    {/* Left: Image Area */}
                    <div className="w-full lg:w-5/12 text-center relative flex justify-center">
                        <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full scale-75"></div>
                        <img 
                            src={ImgEnseignant} 
                            className="relative z-10 w-full max-w-sm rounded-[2.5rem] object-cover opacity-90 group-hover:translate-y-[-5px] group-hover:rotate-[0.5deg] transition-all duration-500" 
                            alt="Enseignant planifiant des cours sur tablette" 
                        />
                    </div>
                    
                    {/* Right: Content Area */}
                    <div className="w-full lg:w-7/12">
                        <div className="inline-flex items-center gap-1.5 bg-white/10 text-warning text-xs font-black tracking-widest px-4 py-2 rounded-xl mb-6 uppercase">
                            <GraduationCap size={14} />
                            ESPACE ENSEIGNANT
                        </div>
                        
                        <h2 className="text-4xl md:text-5xl font-black mb-6 leading-[1.15] text-white tracking-tight">
                            La technologie au service <br />
                            <span className="text-warning">de votre pédagogie.</span>
                        </h2>
                        
                        <p className="text-lg opacity-70 mb-8 font-medium">
                            Une interface pensée pour simplifier votre quotidien en classe et maximiser la réussite de vos élèves grâce aux données d'apprentissage.
                        </p>
                        
                        {/* Teacher Features Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 text-white">
                            {teacherFeatures.map((item, idx) => (
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
                            className="btn btn-warning btn-lg rounded-2xl px-10 font-black text-gray-900 border-none shadow-lg shadow-warning/15 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            Découvrir les outils
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SectionEnseignant;