import React, { useState } from 'react';
import {
    PlusCircle, Shapes, XCircle,
    ChevronRight, Pencil, Zap, BookOpen,
    Calculator, FlaskConical, Sparkles, Award, TrendingUp, Ruler
} from 'lucide-react';
import QuizEngine from './QuizEngine';
import CalculEcritEngine from './CalculEcritEngine';
import ProblemeEngine from './ProblemeEngine';

const domaines = [
    {
        id: 'CALCUL',
        name: 'CALCUL',
        icon: <PlusCircle size={22} strokeWidth={2.5} />,
        iconBg:    'bg-indigo-500/10 dark:bg-indigo-500/20',
        iconColor: 'text-indigo-600 dark:text-indigo-400',
        btnBg:     'bg-indigo-600 hover:bg-indigo-700',
        badgeBg:   'bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20',
        badgeColor:'text-indigo-600 dark:text-indigo-400',
        shadowColor:'shadow-indigo-500/25',
        badge: 'QCM CALCUL',
        desc: 'Additions, soustractions et opérations fondamentales.',
    },
    {
        id: 'GEOMETRIE',
        name: 'GÉOMÉTRIE',
        icon: <Shapes size={22} strokeWidth={2.5} />,
        iconBg:    'bg-emerald-500/10 dark:bg-emerald-500/20',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        btnBg:     'bg-emerald-600 hover:bg-emerald-700',
        badgeBg:   'bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20',
        badgeColor:'text-emerald-600 dark:text-emerald-400',
        shadowColor:'shadow-emerald-500/25',
        badge: 'FORMES',
        desc: 'Reconnaissance des formes, angles et figures.',
    },
    {
        id: 'DENOMBREMENT',
        name: 'DÉNOMBREMENT',
        icon: <XCircle size={22} strokeWidth={2.5} />,
        iconBg:    'bg-amber-500/10 dark:bg-amber-500/20',
        iconColor: 'text-amber-600 dark:text-amber-400',
        btnBg:     'bg-amber-500 hover:bg-amber-600',
        badgeBg:   'bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20',
        badgeColor:'text-amber-600 dark:text-amber-400',
        shadowColor:'shadow-amber-500/25',
        badge: 'NOMBRES',
        desc: 'Compter, ranger et comparer les nombres.',
    },
    {
        id: 'GRANDEURS',
        name: 'GRANDEURS',
        icon: <Ruler size={22} strokeWidth={2.5} />,
        iconBg:    'bg-purple-500/10 dark:bg-purple-500/20',
        iconColor: 'text-purple-600 dark:text-purple-400',
        btnBg:     'bg-purple-600 hover:bg-purple-700',
        badgeBg:   'bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/20',
        badgeColor:'text-purple-600 dark:text-purple-400',
        shadowColor:'shadow-purple-500/25',
        badge: 'MESURES',
        desc: 'Unités de mesure, poids, aires et longueurs.',
    },
];

const exerciceTypes = [
    {
        id: 'CALCUL_MENTAL',
        name: 'CALCUL MENTAL',
        icon: <Zap size={22} strokeWidth={2.5} />,
        iconBg:    'bg-violet-500/10 dark:bg-violet-500/20',
        iconColor: 'text-violet-600 dark:text-violet-400',
        btnBg:     'bg-violet-600 hover:bg-violet-700',
        badgeBg:   'bg-violet-500/10 dark:bg-violet-500/20 border border-violet-500/20',
        badgeColor:'text-violet-600 dark:text-violet-400',
        shadowColor:'shadow-violet-500/25',
        badge: 'CHRONO RAPIDE',
        desc: 'Réponds le plus vite possible avant la fin du temps imparti.',
    },
    {
        id: 'CALCUL_ECRIT',
        name: 'CALCUL ÉCRIT',
        icon: <Pencil size={22} strokeWidth={2.5} />,
        iconBg:    'bg-rose-500/10 dark:bg-rose-500/20',
        iconColor: 'text-rose-600 dark:text-rose-400',
        btnBg:     'bg-rose-600 hover:bg-rose-700',
        badgeBg:   'bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/20',
        badgeColor:'text-rose-600 dark:text-rose-400',
        shadowColor:'shadow-rose-500/25',
        badge: 'CALCUL POSÉ',
        desc: 'Entraîne-toi à poser tes calculs colonne par colonne.',
    },
    {
        id: 'PROBLEME',
        name: 'PROBLÈMES',
        icon: <FlaskConical size={22} strokeWidth={2.5} />,
        iconBg:    'bg-teal-500/10 dark:bg-teal-500/20',
        iconColor: 'text-teal-600 dark:text-teal-400',
        btnBg:     'bg-teal-600 hover:bg-teal-700',
        badgeBg:   'bg-teal-500/10 dark:bg-teal-500/20 border border-teal-500/20',
        badgeColor:'text-teal-600 dark:text-teal-400',
        shadowColor:'shadow-teal-500/25',
        badge: 'SITUATION',
        desc: 'Résous des énoncés concrets de la vie quotidienne.',
    },
];

const ExactStyleCard = ({ item, onClick }) => (
    <div
        onClick={onClick}
        className="group cursor-pointer bg-white dark:bg-base-200/60 p-5 sm:p-6 rounded-[24px] border border-gray-100 dark:border-base-300/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] dark:hover:shadow-none dark:hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between h-52 relative overflow-hidden"
    >
        <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                {item.icon}
            </div>
            <h3 className="text-sm sm:text-base font-black uppercase text-gray-900 dark:text-base-content group-hover:text-primary transition-colors tracking-tight">
                {item.name}
            </h3>
        </div>

        <p className="text-xs sm:text-sm text-gray-500 dark:text-base-content/60 font-medium mt-2.5 leading-relaxed line-clamp-2">
            {item.desc}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-base-300/40 mt-auto">
            <span className={`px-3.5 py-1.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider ${item.badgeBg} ${item.badgeColor}`}>
                {item.badge}
            </span>
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl ${item.btnBg} text-white flex items-center justify-center shadow-md ${item.shadowColor} group-hover:scale-110 transition-transform shrink-0`}>
                <ChevronRight size={20} strokeWidth={2.5} />
            </div>
        </div>
    </div>
);

const ExercicesEnf = () => {
    const [quizConfig, setQuizConfig] = useState(null);
    const [activeTab, setActiveTab] = useState('reviser');

    const lancerRevision = (domaineId) => {
        setQuizConfig({ theme: domaineId, typeFilter: 'QCM', moteur: 'quiz' });
    };

    const lancerExercice = (typeId) => {
        if (typeId === 'CALCUL_ECRIT') {
            setQuizConfig({ moteur: 'calcul_ecrit' });
        } else if (typeId === 'PROBLEME') {
            setQuizConfig({ moteur: 'probleme' });
        } else {
            setQuizConfig({ theme: 'CALCUL', typeFilter: 'CALCUL_MENTAL', moteur: 'quiz' });
        }
    };

    if (quizConfig) {
        if (quizConfig.moteur === 'calcul_ecrit') {
            return <CalculEcritEngine onBack={() => setQuizConfig(null)} />;
        }
        if (quizConfig.moteur === 'probleme') {
            return <ProblemeEngine onBack={() => setQuizConfig(null)} />;
        }
        return (
            <QuizEngine
                theme={quizConfig.theme}
                typeFilter={quizConfig.typeFilter}
                onBack={() => setQuizConfig(null)}
            />
        );
    }

    return (
        <div className="space-y-5 font-sans antialiased">
            {/* TOP HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-base-100 p-5 rounded-2xl border border-gray-100 dark:border-base-300/60 shadow-sm">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-extrabold uppercase tracking-wider mb-1">
                        <Sparkles size={12} className="animate-pulse" /> Espace Pratique
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-base-content uppercase">
                        S'exercer
                    </h1>
                    <p className="text-gray-500 dark:text-base-content/50 text-xs font-medium italic mt-0.5">
                        Choisis ton domaine ou ton type d'exercice pour relever de nouveaux défis !
                    </p>
                </div>

                <div className="join bg-white dark:bg-base-200/70 p-1 rounded-xl border border-gray-200 dark:border-base-300/40 w-full sm:w-auto shrink-0">
                    <button
                        onClick={() => setActiveTab('reviser')}
                        className={`btn btn-sm join-item border-none rounded-lg flex-1 sm:flex-none font-extrabold uppercase text-xs tracking-wider transition-all ${
                            activeTab === 'reviser' ? 'btn-primary text-white shadow-xs' : 'btn-ghost text-gray-700 dark:text-base-content/60 hover:text-gray-900 dark:hover:text-base-content'
                        }`}
                    >
                        <BookOpen size={14} className="mr-1.5" /> Réviser QCM
                    </button>
                    <button
                        onClick={() => setActiveTab('exercer')}
                        className={`btn btn-sm join-item border-none rounded-lg flex-1 sm:flex-none font-extrabold uppercase text-xs tracking-wider transition-all ${
                            activeTab === 'exercer' ? 'btn-primary text-white shadow-xs' : 'btn-ghost text-gray-700 dark:text-base-content/60 hover:text-gray-900 dark:hover:text-base-content'
                        }`}
                    >
                        <Calculator size={14} className="mr-1.5" /> Exercices
                    </button>
                </div>
            </div>

            {/* CONTENU DES CARTES */}
            <div className="bg-white dark:bg-base-100 p-5 sm:p-6 rounded-2xl border border-gray-100 dark:border-base-300/60 shadow-sm min-h-[360px]">
                {activeTab === 'reviser' && (
                    <div className="space-y-5 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-base-200/60">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-base-content/40">
                                Sélectionne un domaine de révision QCM
                            </p>
                            <span className="text-[9px] font-black bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-full uppercase">4 thèmes</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                            {domaines.map((domaine) => (
                                <ExactStyleCard
                                    key={domaine.id}
                                    item={domaine}
                                    onClick={() => lancerRevision(domaine.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'exercer' && (
                    <div className="space-y-5 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-base-200/60">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-base-content/40">
                                Modes de calcul et résolution de problèmes
                            </p>
                            <span className="text-[9px] font-black bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 border border-violet-500/20 px-2.5 py-1 rounded-full uppercase">3 modes</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                            {exerciceTypes.map((type) => (
                                <ExactStyleCard
                                    key={type.id}
                                    item={type}
                                    onClick={() => lancerExercice(type.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* ── BANDEAU INFÉRIEUR (TEXTE VIOLET FONCÉ LISIBLE) ── */}
                <div className="mt-8 bg-[#faf5ff] dark:bg-purple-950/40 border border-[#f3e8ff] dark:border-purple-900/50 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-4">
                        {/* Icône Médaille / Cocarde de gauche en violet foncé */}
                        <Award size={26} strokeWidth={2} className="text-purple-900 dark:text-purple-300 shrink-0" />
                        
                        {/* Texte violet très foncé pour une lisibilité maximale */}
                        <span className="text-xs sm:text-sm font-black leading-tight text-purple-950 dark:text-purple-200">
                            Entraîne-toi régulièrement pour progresser et relever de nouveaux défis !
                        </span>
                    </div>

                    {/* Icône Graphique de droite */}
                    <div className="w-10 h-10 rounded-2xl bg-[#faf5ff] dark:bg-purple-900/40 border border-[#f3e8ff] dark:border-purple-800/40 text-purple-800 dark:text-purple-300 flex items-center justify-center shrink-0 hidden sm:flex">
                        <TrendingUp size={20} strokeWidth={2} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExercicesEnf;