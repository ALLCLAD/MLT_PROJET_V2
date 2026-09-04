import React, { useState, useEffect } from 'react';
import { 
    Sparkles, 
    Flame, 
    Star, 
    Target, 
    Trophy, 
    ChevronRight, 
    Check, 
    BrainCircuit, 
    BookOpen, 
    MessageSquare, 
    UserCircle, 
    RefreshCw, 
    Award,
    Gift
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../apiDjango/api.jsx';

const ApercuEnfant = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const minDelay = new Promise(resolve => setTimeout(resolve, 800));
            const [response] = await Promise.all([
                api.get('/quiz/enfant-dashboard/'),
                minDelay
            ]);
            setStats(response.data);
        } catch (err) {
            console.error("Erreur chargement dashboard enfant:", err);
            setStats({ 
                prenom: "Aventurier", 
                niveau: 1, 
                xp: 45, 
                streak: 3, 
                totalEtoiles: 24, 
                dernierScore: 14,
                active_dates_week: [true, true, true, true, false, false, false],
                total_exercices: 12
            });
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [refreshKey]);

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    const daysLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    const todayDayIndex = (new Date().getDay() + 6) % 7; // 0=Lundi, 6=Dimanche

    // Obtenir le message motivant en fonction de la série
    const getStreakMessage = (streak) => {
        if (streak >= 7) return "Waouh, quelle série incroyable ! Tu es imbattable !";
        if (streak >= 3) return "Waouh, quelle série ! Continue sur ta lancée !";
        if (streak >= 1) return "Super début de série ! Reviens demain pour la continuer !";
        return "Fais un exercice aujourd'hui pour démarrer ta série d'apprentissage !";
    };

    return (
        <div className="space-y-5 font-sans antialiased">

            {/* ── TOP HEADER COMPACT UNIFORMISÉ ── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-100 dark:bg-base-100 p-5 rounded-2xl border border-base-300/60 shadow-sm">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-extrabold uppercase tracking-wider mb-1">
                        <Sparkles size={12} className="animate-pulse" /> Espace Enfant
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-base-content uppercase">
                        Tableau de bord
                    </h1>
                    <p className="text-base-content/50 text-xs font-medium italic mt-0.5">
                        Salut, <span className="text-primary font-bold">{stats?.prenom || 'Aventurier'}</span> ! Prêt pour de nouveaux défis mathématiques ?
                    </p>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                    {/* Badge Niveau */}
                    <div className="bg-gradient-to-r from-primary to-purple-600 text-white px-3.5 py-1.5 rounded-xl shadow-xs">
                        <p className="text-[9px] font-black opacity-80 uppercase tracking-widest leading-none mb-0.5">Rang actuel</p>
                        <p className="font-extrabold text-xs">
                            Niveau {stats?.niveau || 1}
                        </p>
                    </div>
                    {/* Refresh */}
                    <button
                        onClick={handleRefresh}
                        className="btn btn-sm btn-circle btn-ghost text-primary hover:bg-primary/10 transition-transform active:scale-95"
                        title="Actualiser les données"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* ── CONTENU DU DASHBOARD / SKELETON ── */}
            {loading ? (
                <div className="space-y-5 animate-pulse">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        <div className="lg:col-span-4 bg-base-200/50 p-5 rounded-2xl h-64 space-y-3">
                            <div className="w-32 h-4 bg-base-300 rounded-lg"></div>
                            <div className="w-full h-14 bg-base-300 rounded-xl"></div>
                            <div className="w-full h-14 bg-base-300 rounded-xl"></div>
                        </div>
                        <div className="lg:col-span-4 bg-base-200/50 p-5 rounded-2xl h-64 flex flex-col items-center justify-center space-y-3">
                            <div className="w-32 h-32 rounded-full bg-base-300"></div>
                        </div>
                        <div className="lg:col-span-4 bg-base-200/50 p-5 rounded-2xl h-64 space-y-3">
                            <div className="w-32 h-4 bg-base-300 rounded-lg"></div>
                            <div className="w-full h-12 bg-base-300 rounded-xl"></div>
                            <div className="w-full h-12 bg-base-300 rounded-xl"></div>
                        </div>
                    </div>
                    <div className="bg-base-200/50 p-6 rounded-2xl h-44 w-full"></div>
                </div>
            ) : (
                <div className="space-y-5 animate-in fade-in duration-500">

                    {/* ══ LIGNE SUPÉRIEURE : 3 COLONNES ══ */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                        {/* COLONNE 1 (lg:col-span-4): Stats Rapides */}
                        <div className="lg:col-span-4 bg-base-100 dark:bg-base-100 p-5 rounded-2xl border border-base-300/60 shadow-sm flex flex-col justify-between space-y-3">
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-base-content/40 mb-1">
                                Mes Récompenses
                            </h3>

                            {/* Stat Card 1 — Série de Jours (Flamme) */}
                            <div className="bg-base-200/50 dark:bg-base-200/40 p-4 rounded-xl border border-base-200 dark:border-base-300/40 shadow-xs flex items-center justify-between group hover:scale-[1.01] transition-transform">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-sm">
                                        <Flame size={18} className="animate-pulse" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase text-base-content/40 tracking-wider">Série actuelle</p>
                                        <p className="text-xl font-black text-base-content italic mt-0.5">
                                            {stats?.streak || 0} <span className="text-xs font-bold not-italic opacity-60">jour{(stats?.streak || 0) > 1 ? 's' : ''}</span>
                                        </p>
                                    </div>
                                </div>
                                <span className="text-[9px] font-extrabold bg-orange-500/10 text-orange-600 px-2.5 py-0.5 rounded-full uppercase">Série</span>
                            </div>

                            {/* Stat Card 2 — Étoiles */}
                            <div className="bg-base-200/50 dark:bg-base-200/40 p-4 rounded-xl border border-base-200 dark:border-base-300/40 shadow-xs flex items-center justify-between group hover:scale-[1.01] transition-transform">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-white shadow-sm">
                                        <Star size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase text-base-content/40 tracking-wider">Étoiles collectées</p>
                                        <p className="text-xl font-black text-base-content italic mt-0.5">
                                            {stats?.totalEtoiles || 0}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-[9px] font-extrabold bg-amber-500/10 text-amber-600 px-2.5 py-0.5 rounded-full uppercase">Total</span>
                            </div>

                            {/* Stat Card 3 — Dernier Score */}
                            <div className="bg-base-200/50 dark:bg-base-200/40 p-4 rounded-xl border border-base-200 dark:border-base-300/40 shadow-xs flex items-center justify-between group hover:scale-[1.01] transition-transform">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-600 text-white shadow-sm">
                                        <Target size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase text-base-content/40 tracking-wider">Dernier score</p>
                                        <p className="text-xl font-black text-base-content italic mt-0.5">
                                            {stats?.dernierScore > 0 ? `${stats.dernierScore}/20` : '–'}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-[9px] font-extrabold bg-emerald-500/10 text-emerald-600 px-2.5 py-0.5 rounded-full uppercase">Note</span>
                            </div>
                        </div>

                        {/* COLONNE 2 (lg:col-span-4): Blob Énergie & Niveau XP */}
                        <div className="lg:col-span-4 bg-base-100 dark:bg-base-100 p-5 rounded-2xl border border-base-300/60 shadow-sm flex flex-col justify-between items-center text-center relative overflow-hidden group">
                            
                            <div className="w-full flex justify-center items-center mb-1">
                                <span className="text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border border-primary/20 bg-primary/10 text-primary">
                                    Énergie d'apprentissage
                                </span>
                            </div>

                            {/* Forme Blob Organique (Identique Parent) */}
                            <div className="relative w-36 h-36 my-2 flex items-center justify-center">
                                <div className="absolute inset-0 rounded-[42%_58%_70%_30%/45%_55%_45%_55%] blur-xl opacity-30 animate-pulse bg-gradient-to-tr from-primary to-purple-600 transition-all duration-1000"></div>

                                <div className="absolute inset-1.5 rounded-[42%_58%_70%_30%/45%_55%_45%_55%] p-0.5 transition-all duration-1000 shadow-sm bg-gradient-to-tr from-primary via-indigo-500 to-purple-500">
                                    <div className="w-full h-full rounded-[40%_60%_68%_32%/48%_52%_48%_52%] bg-gradient-to-br from-white/30 to-transparent"></div>
                                </div>

                                <div className="relative z-10 w-24 h-24 rounded-full bg-white dark:bg-base-100 shadow-inner flex flex-col items-center justify-center p-1 border border-base-200/50 dark:border-base-300">
                                    <span className="text-2xl font-black italic tracking-tighter leading-none text-primary">
                                        {Math.round(stats?.xp || 0)}
                                        <span className="text-[10px] font-bold not-italic opacity-40">%</span>
                                    </span>
                                    <span className="text-[8px] font-extrabold uppercase tracking-wider text-primary/70 mt-0.5">
                                        Niveau {stats?.niveau || 1}
                                    </span>
                                </div>
                            </div>

                            <div className="w-full bg-base-200/50 dark:bg-base-200/40 p-3 rounded-xl border border-base-200/60 dark:border-base-300/30 space-y-1.5">
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="opacity-50 uppercase">Progression XP</span>
                                    <span className="text-primary font-black">{Math.round(stats?.xp || 0)} / 100 XP</span>
                                </div>
                                <div className="h-2 w-full bg-base-300/60 rounded-full overflow-hidden p-0.5">
                                    <div 
                                        className="h-full bg-primary rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min(stats?.xp || 0, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* COLONNE 3 (lg:col-span-4): Actions Rapides Enfant */}
                        <div className="lg:col-span-4 bg-base-100 dark:bg-base-100 p-5 rounded-2xl border border-base-300/60 shadow-sm flex flex-col justify-between space-y-3">
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-base-content/40 mb-1">
                                Actions rapides
                            </h3>

                            <div className="space-y-2.5">
                                <button
                                    onClick={() => navigate('/enfant/exercices')}
                                    className="btn btn-primary btn-sm w-full rounded-xl font-bold text-xs shadow-md border-none hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-between px-4 py-2.5 h-auto"
                                >
                                    <span className="flex items-center gap-2.5">
                                        <BrainCircuit size={16} /> S'exercer
                                    </span>
                                    <ChevronRight size={16} />
                                </button>

                                <button
                                    onClick={() => navigate('/enfant/lecons')}
                                    className="btn bg-base-200/60 dark:bg-base-200 hover:bg-base-200 border-base-300/50 w-full rounded-xl font-bold text-xs text-base-content hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-between px-4 py-2.5 h-auto shadow-xs"
                                >
                                    <span className="flex items-center gap-2.5">
                                        <BookOpen size={16} className="text-blue-500" /> Mes Leçons
                                    </span>
                                    <ChevronRight size={16} />
                                </button>

                                <button
                                    onClick={() => navigate('/enfant/messagerie')}
                                    className="btn bg-base-200/60 dark:bg-base-200 hover:bg-base-200 border-base-300/50 w-full rounded-xl font-bold text-xs text-base-content hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-between px-4 py-2.5 h-auto shadow-xs"
                                >
                                    <span className="flex items-center gap-2.5">
                                        <MessageSquare size={16} className="text-indigo-500" /> Messagerie
                                    </span>
                                    <ChevronRight size={16} />
                                </button>

                                <button
                                    onClick={() => navigate('/enfant/profil')}
                                    className="btn bg-base-200/60 dark:bg-base-200 hover:bg-base-200 border-base-300/50 w-full rounded-xl font-bold text-xs text-base-content hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-between px-4 py-2.5 h-auto shadow-xs"
                                >
                                    <span className="flex items-center gap-2.5">
                                        <UserCircle size={16} className="text-purple-500" /> Mon Profil
                                    </span>
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>

                    </div>


                    {/* ══ LIGNE INFÉRIEURE : SÉRIE DUOLINGO COMPOSANT (Inspiré img_5) ══ */}
                    <div className="bg-base-100 dark:bg-base-100 p-6 md:p-8 rounded-2xl border border-base-300/60 shadow-sm relative overflow-hidden">
                        
                        {/* Arrière plan décoratif */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-500/5 via-amber-500/5 to-transparent rounded-full blur-2xl pointer-events-none"></div>

                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                            
                            {/* En-tête de la série avec Icône Flamme */}
                            <div className="flex items-center gap-4 text-center md:text-left">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
                                    <Flame size={30} className="animate-bounce" />
                                </div>
                                <div>
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-600 text-[10px] font-black uppercase tracking-wider mb-1">
                                        Calendrier d'assiduité
                                    </div>
                                    <h3 className="text-lg font-black text-base-content tracking-tight uppercase">
                                        Ta série cette semaine
                                    </h3>
                                    <p className="text-xs text-base-content/60 font-semibold italic">
                                        {getStreakMessage(stats?.streak || 0)}
                                    </p>
                                </div>
                            </div>

                            {/* ── RENDU DE LA BANDE DE SÉRIE STYLE IMG_5 (DUOLINGO STREAK) ── */}
                            <div className="w-full md:w-auto flex flex-col items-center">
                                <div className="flex items-center gap-2 sm:gap-3 bg-base-200/60 dark:bg-base-200/40 p-3 sm:p-4 rounded-3xl border border-base-300/50 shadow-inner overflow-x-auto max-w-full">
                                    {daysLabels.map((dayLabel, idx) => {
                                        const isActiveDay = stats?.active_dates_week?.[idx] || false;
                                        const isToday = idx === todayDayIndex;
                                        const isSundayChest = idx === 6;

                                        return (
                                            <div key={idx} className="flex flex-col items-center gap-2">
                                                {/* Label du jour (L, M, M, J, V, S, D) */}
                                                <span className={`text-[11px] font-black uppercase ${
                                                    isToday ? 'text-orange-500 scale-110' : 'text-base-content/40'
                                                }`}>
                                                    {dayLabel}
                                                </span>

                                                {/* Bouton/Cercle d'état */}
                                                {isSundayChest ? (
                                                    // Coffre au trésor le Dimanche (Design img_5)
                                                    <div 
                                                        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all ${
                                                            isActiveDay 
                                                                ? 'bg-gradient-to-tr from-amber-400 to-yellow-500 text-white shadow-md ring-4 ring-amber-400/30' 
                                                                : 'bg-base-300/50 text-base-content/30 border border-base-300'
                                                        }`}
                                                        title="Recompense du dimanche !"
                                                    >
                                                        <Gift size={22} className={isActiveDay ? "animate-bounce" : ""} />
                                                    </div>
                                                ) : (
                                                    // Jours normaux de la semaine
                                                    <div 
                                                        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-300 ${
                                                            isActiveDay 
                                                                ? 'bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30 ring-4 ring-orange-500/20 scale-105' 
                                                                : isToday 
                                                                    ? 'bg-base-100 border-2 border-dashed border-orange-400 text-orange-500 animate-pulse' 
                                                                    : 'bg-base-300/40 text-base-content/30'
                                                        }`}
                                                    >
                                                        {isActiveDay ? (
                                                            <Check size={22} strokeWidth={3.5} className="animate-in zoom-in-50" />
                                                        ) : (
                                                            <span className="w-2.5 h-2.5 rounded-full bg-base-300"></span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                        </div>

                        {/* Message d'encouragement inférieur */}
                        <div className="mt-5 pt-4 border-t border-base-200/60 dark:border-base-300/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                            <div className="flex items-center gap-2 text-xs font-bold text-base-content/70">
                                <Award size={16} className="text-amber-500 shrink-0" />
                                <span>Chaque jour d'exercice te rapproche du niveau supérieur !</span>
                            </div>
                            <button
                                onClick={() => navigate('/enfant/exercices')}
                                className="btn btn-xs btn-primary font-black uppercase tracking-wider rounded-lg"
                            >
                                Commencer un exercice
                            </button>
                        </div>

                    </div>

                </div>
            )}
        </div>
    );
};

export default ApercuEnfant;