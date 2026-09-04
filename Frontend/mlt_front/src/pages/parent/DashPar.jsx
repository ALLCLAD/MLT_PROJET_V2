import React, { useState, useEffect } from 'react';
import {
    Calendar as CalendarIcon,
    TrendingUp,
    Clock,
    Users,
    Bell,
    ChevronRight,
    RefreshCw,
    Sparkles,
    ChevronLeft,
    Award,
    MessageSquare,
    UserCircle,
    Trophy,
    Activity,
    Star,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import api from '../../apiDjango/api.jsx';

const DashPar = () => {
    const navigate = useNavigate();
    const [statsGlobales, setStatsGlobales] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const [graphData, setGraphData] = useState([]);
    const [enfantsNoms, setEnfantsNoms] = useState([]);
    const [recentScores, setRecentScores] = useState([]);

    // État pour le mini calendrier interactif One UI
    const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

    const colors = ["#6366f1", "#f59e0b", "#10b981", "#ec4899", "#3b82f6"];

    const fetchStats = async () => {
        try {
            setLoadingStats(true);

            const minDelay = new Promise(resolve => setTimeout(resolve, 800));

            const [statsRes] = await Promise.all([
                api.get('/quiz/stats-global/'),
                minDelay
            ]);

            setStatsGlobales(statsRes.data);
            setGraphData(statsRes.data.graphData || []);
            setRecentScores(statsRes.data.recentActivity || []);

            if (statsRes.data.graphData && statsRes.data.graphData.length > 0) {
                const noms = Object.keys(statsRes.data.graphData[0]).filter(k => k !== 'name');
                setEnfantsNoms(noms);
            }
        } catch (err) {
            console.error("Erreur chargement dashboard parent:", err);
        } finally {
            setLoadingStats(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [refreshKey]);

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    const moyenne = statsGlobales?.moyenneGenerale || 0;

    // --- Génération de la grille du mini calendrier ---
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfWeek = (year, month) => {
        let day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1;
    };

    const currentYear = currentMonthDate.getFullYear();
    const currentMonth = currentMonthDate.getMonth();
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayIndex = getFirstDayOfWeek(currentYear, currentMonth);

    const prevMonthDays = () => {
        setCurrentMonthDate(new Date(currentYear, currentMonth - 1, 1));
    };
    const nextMonthDays = () => {
        setCurrentMonthDate(new Date(currentYear, currentMonth + 1, 1));
    };

    const todayDate = new Date();
    const isToday = (day) =>
        todayDate.getDate() === day &&
        todayDate.getMonth() === currentMonth &&
        todayDate.getFullYear() === currentYear;

    return (
        // ── DASHBOARD PARENT UNIFORMISÉ & COMPACT ──
        <div className="space-y-5 font-sans antialiased">
            
            {/* ── TOP HEADER COMPACT ── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-100 dark:bg-base-100 p-5 rounded-2xl border border-base-300/60 shadow-sm">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-extrabold uppercase tracking-wider mb-1">
                        <Sparkles size={12} className="animate-pulse" /> Espace Parent
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-base-content uppercase">
                        Tableau de bord
                    </h1>
                    <p className="text-base-content/50 text-xs font-medium italic mt-0.5">
                        Bienvenue ! Suivez l'activité et les progrès de vos enfants.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                    {/* Date badge */}
                    <div className="bg-base-200/70 dark:bg-base-200 px-3.5 py-1.5 rounded-xl border border-base-300/40">
                        <p className="text-[9px] font-black opacity-40 uppercase tracking-widest leading-none mb-0.5">Aujourd'hui</p>
                        <p className="font-extrabold text-xs text-base-content">
                            {new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                    {/* Refresh */}
                    <button
                        onClick={handleRefresh}
                        className="btn btn-sm btn-circle btn-ghost text-primary hover:bg-primary/10 transition-transform active:scale-95"
                        title="Actualiser les données"
                    >
                        <RefreshCw size={18} className={loadingStats ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

                {/* ── CONTENU DU GRAND CADRE / LOADERS SQUELETTES GLOBAUX ── */}
                {loadingStats ? (
                    <div className="p-6 md:p-10 space-y-8 animate-pulse">
                        {/* Skeleton Ligne 1 */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-4 bg-base-200/50 p-6 rounded-[2.5rem] h-64 space-y-4">
                                <div className="w-40 h-4 bg-base-300 rounded-lg"></div>
                                <div className="w-full h-14 bg-base-300 rounded-2xl"></div>
                                <div className="w-full h-14 bg-base-300 rounded-2xl"></div>
                            </div>
                            <div className="lg:col-span-4 bg-base-200/50 p-6 rounded-[2.5rem] h-64 flex flex-col items-center justify-center space-y-4">
                                <div className="w-36 h-36 rounded-full bg-base-300"></div>
                            </div>
                            <div className="lg:col-span-4 bg-base-200/50 p-6 rounded-[2.5rem] h-64 space-y-3">
                                <div className="w-36 h-4 bg-base-300 rounded-lg mb-4"></div>
                                <div className="w-full h-12 bg-base-300 rounded-2xl"></div>
                                <div className="w-full h-12 bg-base-300 rounded-2xl"></div>
                                <div className="w-full h-12 bg-base-300 rounded-2xl"></div>
                            </div>
                        </div>

                        {/* Skeleton Ligne 2 */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-8 bg-base-200/50 p-8 rounded-[2.5rem] h-80">
                                <div className="w-48 h-6 bg-base-300 rounded-xl mb-6"></div>
                                <div className="w-full h-52 bg-base-300 rounded-3xl"></div>
                            </div>
                            <div className="lg:col-span-4 bg-base-200/50 p-6 rounded-[2.5rem] h-80 space-y-4">
                                <div className="w-32 h-5 bg-base-300 rounded-xl"></div>
                                <div className="w-full h-52 bg-base-300 rounded-3xl"></div>
                            </div>
                        </div>

                        {/* Skeleton Ligne 3 */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-7 bg-base-200/50 p-8 rounded-[2.5rem] h-64 space-y-4">
                                <div className="w-40 h-5 bg-base-300 rounded-xl"></div>
                                <div className="w-full h-12 bg-base-300 rounded-2xl"></div>
                                <div className="w-full h-12 bg-base-300 rounded-2xl"></div>
                            </div>
                            <div className="lg:col-span-5 bg-base-200/50 p-8 rounded-[2.5rem] h-64 space-y-4">
                                <div className="w-36 h-5 bg-base-300 rounded-xl"></div>
                                <div className="w-full h-32 bg-base-300 rounded-3xl"></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* ── DISPOSITION EN GRILLE RÉEL STYLE ONE UI 8.5 ── */
                    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-700">

                        {/* ══ LIGNE SUPÉRIEURE 3 COLONNES ══ */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                            {/* COLONNE 1 (lg:col-span-4): Stats Rapides */}
                            <div className="lg:col-span-4 bg-base-100 dark:bg-base-100 p-5 rounded-2xl border border-base-300/60 shadow-sm flex flex-col justify-between space-y-3">
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-base-content/40 mb-1">
                                    Statistiques globales
                                </h3>

                                {/* Stat Card 1 — Enfants */}
                                <div className="bg-base-200/50 dark:bg-base-200/40 p-4 rounded-xl border border-base-200 dark:border-base-300/40 shadow-xs flex items-center justify-between group hover:scale-[1.01] transition-transform">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-sm">
                                            <Users size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-base-content/40 tracking-wider">Mes enfants</p>
                                            <p className="text-xl font-black text-base-content italic mt-0.5">
                                                {statsGlobales?.totalEnfants || 0}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-extrabold bg-blue-500/10 text-blue-600 px-2.5 py-0.5 rounded-full uppercase">Inscrits</span>
                                </div>

                                {/* Stat Card 2 — Exercices */}
                                <div className="bg-base-200/50 dark:bg-base-200/40 p-4 rounded-xl border border-base-200 dark:border-base-300/40 shadow-xs flex items-center justify-between group hover:scale-[1.01] transition-transform">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-600 text-white shadow-sm">
                                            <Trophy size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-base-content/40 tracking-wider">Exercices terminés</p>
                                            <p className="text-xl font-black text-base-content italic mt-0.5">
                                                {statsGlobales?.exercicesTermines || 0}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-extrabold bg-emerald-500/10 text-emerald-600 px-2.5 py-0.5 rounded-full uppercase">Total</span>
                                </div>

                                {/* Stat Card 3 — Moyenne */}
                                <div className="bg-base-200/50 dark:bg-base-200/40 p-4 rounded-xl border border-base-200 dark:border-base-300/40 shadow-xs flex items-center justify-between group hover:scale-[1.01] transition-transform">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white shadow-sm">
                                            <Star size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-base-content/40 tracking-wider">Moyenne générale</p>
                                            <p className="text-xl font-black text-base-content italic mt-0.5">
                                                {statsGlobales?.moyenneGenerale ? `${statsGlobales.moyenneGenerale}/20` : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-extrabold bg-amber-500/10 text-amber-600 px-2.5 py-0.5 rounded-full uppercase">Globale</span>
                                </div>
                            </div>

                            {/* COLONNE 2 (lg:col-span-4): Blob Progression Générale */}
                            <div className="lg:col-span-4 bg-base-100 dark:bg-base-100 p-5 rounded-2xl border border-base-300/60 shadow-sm flex flex-col justify-between items-center text-center relative overflow-hidden group">

                                <div className="w-full flex justify-center items-center mb-1">
                                    <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                                        moyenne >= 15 ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' :
                                        moyenne >= 10 ? 'text-amber-600 bg-amber-500/10 border-amber-500/20' :
                                        'text-rose-600 bg-rose-500/10 border-rose-500/20'
                                    }`}>
                                        Vue Globale
                                    </span>
                                </div>

                                {/* Forme 'Blob' Organique */}
                                <div className="relative w-36 h-36 my-2 flex items-center justify-center">
                                    <div className={`absolute inset-0 rounded-[42%_58%_70%_30%/45%_55%_45%_55%] blur-xl opacity-30 animate-pulse transition-all duration-1000 ${
                                        moyenne >= 15 ? 'bg-gradient-to-tr from-emerald-600 to-teal-400' :
                                        moyenne >= 10 ? 'bg-gradient-to-tr from-amber-500 to-orange-400' :
                                        'bg-gradient-to-tr from-rose-600 to-red-400'
                                    }`}></div>

                                    <div className={`absolute inset-1.5 rounded-[42%_58%_70%_30%/45%_55%_45%_55%] p-0.5 transition-all duration-1000 shadow-sm ${
                                        moyenne >= 15 ? 'bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500' :
                                        moyenne >= 10 ? 'bg-gradient-to-tr from-amber-500 via-orange-400 to-yellow-500' :
                                        'bg-gradient-to-tr from-rose-500 via-red-500 to-pink-500'
                                    }`}>
                                        <div className="w-full h-full rounded-[40%_60%_68%_32%/48%_52%_48%_52%] bg-gradient-to-br from-white/30 to-transparent"></div>
                                    </div>

                                    <div className="relative z-10 w-24 h-24 rounded-full bg-white dark:bg-base-100 shadow-inner flex flex-col items-center justify-center p-1 border border-base-200/50 dark:border-base-300">
                                        <span className={`text-2xl font-black italic tracking-tighter leading-none ${
                                            moyenne >= 15 ? 'text-teal-900 dark:text-emerald-400' :
                                            moyenne >= 10 ? 'text-amber-900 dark:text-amber-400' :
                                            'text-rose-900 dark:text-rose-400'
                                        }`}>
                                            {moyenne}
                                            <span className="text-[10px] font-bold not-italic opacity-40">/20</span>
                                        </span>
                                        <span className={`text-[8px] font-extrabold uppercase tracking-wider mt-0.5 ${
                                            moyenne >= 15 ? 'text-teal-700 dark:text-emerald-500' :
                                            moyenne >= 10 ? 'text-amber-700 dark:text-amber-500' :
                                            'text-rose-700 dark:text-rose-500'
                                        }`}>
                                            Moyenne
                                        </span>
                                    </div>
                                </div>

                                <div className="w-full bg-base-200/50 dark:bg-base-200/40 p-3 rounded-xl border border-base-200/60 dark:border-base-300/30">
                                    <p className="text-[11px] font-bold text-base-content/70 italic">
                                        {moyenne >= 15
                                            ? "Excellent ! Vos enfants progressent à merveille !"
                                            : moyenne >= 10
                                                ? "De bons progrès ! Encouragez-les à continuer."
                                                : "Des efforts à fournir. Soutenez vos enfants !"}
                                    </p>
                                </div>
                            </div>

                            {/* COLONNE 3 (lg:col-span-4): Actions Rapides Parent */}
                            <div className="lg:col-span-4 bg-base-100 dark:bg-base-100 p-5 rounded-2xl border border-base-300/60 shadow-sm flex flex-col justify-between space-y-3">
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-base-content/40 mb-1">
                                    Actions rapides
                                </h3>

                                <div className="space-y-2.5">
                                    <button
                                        onClick={() => navigate('/parent/enfants')}
                                        className="btn btn-primary btn-sm w-full rounded-xl font-bold text-xs shadow-md border-none hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-between px-4 py-2.5 h-auto"
                                    >
                                        <span className="flex items-center gap-2.5">
                                            <Users size={16} /> Mes Enfants
                                        </span>
                                        <ChevronRight size={16} />
                                    </button>

                                    <button
                                        onClick={() => navigate('/parent/messagerie')}
                                        className="btn bg-base-200/60 dark:bg-base-200 hover:bg-base-200 border-base-300/50 w-full rounded-xl font-bold text-xs text-base-content hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-between px-4 py-2.5 h-auto shadow-xs"
                                    >
                                        <span className="flex items-center gap-2.5">
                                            <MessageSquare size={16} className="text-indigo-500" /> Messagerie
                                        </span>
                                        <ChevronRight size={16} />
                                    </button>

                                    <button
                                        onClick={() => navigate('/parent/profil')}
                                        className="btn bg-base-200/60 dark:bg-base-200 hover:bg-base-200 border-base-300/50 w-full rounded-xl font-bold text-xs text-base-content hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-between px-4 py-2.5 h-auto shadow-xs"
                                    >
                                        <span className="flex items-center gap-2.5">
                                            <UserCircle size={16} className="text-purple-500" /> Mon Profil
                                        </span>
                                        <ChevronRight size={16} />
                                    </button>
                                </div>

                                <div className="pt-1">
                                    <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 flex items-center gap-2.5 text-primary text-[11px] font-semibold">
                                        <Award size={16} className="shrink-0" />
                                        <span>Consultez les résultats détaillés de chaque enfant.</span>
                                    </div>
                                </div>
                            </div>

                        </div>


                        {/* ══ LIGNE INTERMÉDIAIRE : GRAPHIQUE ÉVOLUTION + MINI-CALENDRIER ══ */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                            {/* GRAPHIQUE AREA (lg:col-span-8) */}
                            <div className="lg:col-span-8 bg-base-100 dark:bg-base-100 p-5 rounded-2xl border border-base-300/60 shadow-sm flex flex-col justify-between">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                            <TrendingUp size={18} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black uppercase tracking-tight">Activité par enfant</h3>
                                            <p className="text-[11px] text-base-content/40 font-semibold italic">Exercices terminés par jour cette semaine</p>
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-black uppercase px-2.5 py-0.5 bg-base-200 dark:bg-base-200 rounded-full text-base-content/60">Hebdomadaire</span>
                                </div>

                                {enfantsNoms.length === 0 ? (
                                    <div className="h-[220px] flex flex-col items-center justify-center opacity-30">
                                        <Users size={36} className="mb-2" />
                                        <p className="font-bold text-xs">Ajoutez des enfants pour voir leur progression graphique.</p>
                                    </div>
                                ) : (
                                    <div className="h-[220px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={graphData}>
                                                <defs>
                                                    {colors.map((color, i) => (
                                                        <linearGradient key={i} id={`par-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
                                                            <stop offset="95%" stopColor={color} stopOpacity={0}/>
                                                        </linearGradient>
                                                    ))}
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: '700' }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: '700' }} allowDecimals={false} />
                                                <Tooltip contentStyle={{ borderRadius: '14px', border: 'none', boxShadow: '0 8px 20px rgba(0,0,0,0.08)', fontSize: '12px' }} />
                                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '5px', fontSize: '11px' }} />
                                                {enfantsNoms.map((nom, index) => (
                                                    <Area
                                                        key={nom}
                                                        type="monotone"
                                                        dataKey={nom}
                                                        stroke={colors[index % colors.length]}
                                                        fill={`url(#par-grad-${index % colors.length})`}
                                                        strokeWidth={2.5}
                                                        animationDuration={1200}
                                                    />
                                                ))}
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>

                            {/* MINI-CALENDRIER (lg:col-span-4) */}
                            <div className="lg:col-span-4 bg-base-100 dark:bg-base-100 p-5 rounded-2xl border border-base-300/60 shadow-sm flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h3 className="text-xs font-black uppercase tracking-wider text-base-content">Calendrier</h3>
                                        <p className="text-[10px] text-base-content/40 font-bold capitalize">
                                            {currentMonthDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={prevMonthDays} className="btn btn-xs btn-circle btn-ghost">
                                            <ChevronLeft size={14} />
                                        </button>
                                        <button onClick={nextMonthDays} className="btn btn-xs btn-circle btn-ghost">
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Grille du calendrier */}
                                <div className="grid grid-cols-7 gap-1 text-center mb-3">
                                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                                        <span key={i} className="text-[9px] font-black opacity-40 uppercase py-0.5">{d}</span>
                                    ))}

                                    {[...Array(firstDayIndex)].map((_, i) => (
                                        <span key={`empty-${i}`} className="py-1"></span>
                                    ))}

                                    {[...Array(daysInMonth)].map((_, i) => {
                                        const dayNum = i + 1;
                                        const currentDayIsToday = isToday(dayNum);
                                        return (
                                            <div
                                                key={dayNum}
                                                className={`py-1 text-[11px] font-bold rounded-xl transition-all cursor-default relative flex flex-col items-center justify-center ${
                                                    currentDayIsToday
                                                        ? 'bg-primary text-white shadow-sm'
                                                        : 'hover:bg-base-200 text-base-content/80'
                                                }`}
                                            >
                                                <span>{dayNum}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Badge date du jour */}
                                <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20 flex items-center gap-2 text-primary text-[11px] font-bold">
                                    <CalendarIcon size={14} className="shrink-0" />
                                    <span>
                                        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </span>
                                </div>
                            </div>

                        </div>


                        {/* ══ LIGNE INFÉRIEURE : DERNIERS SCORES & RÉSUMÉ ACTIVITÉ ══ */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                            {/* DERNIERS SCORES (lg:col-span-7) */}
                            <div className="lg:col-span-7 bg-base-100 dark:bg-base-100 p-5 rounded-2xl border border-base-300/60 shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                                            <Clock size={18} />
                                        </div>
                                        <h3 className="text-sm font-black uppercase tracking-tight">Dernières Activités & Scores</h3>
                                    </div>
                                    <span className="text-[9px] font-black uppercase px-2.5 py-0.5 bg-base-200 dark:bg-base-200 rounded-full text-base-content/50">Récent</span>
                                </div>

                                {recentScores.length === 0 ? (
                                    <p className="text-xs text-base-content/40 font-bold italic py-6 text-center">Aucun score enregistré pour le moment.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {recentScores.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-3 bg-base-200/40 dark:bg-base-200/30 rounded-xl border border-base-200 dark:border-base-300/40 hover:scale-[1.005] transition-transform"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-purple-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                                                        {item.prenom?.[0] || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-primary text-[11px] uppercase tracking-wider">{item.prenom}</p>
                                                        <p className="font-bold text-xs text-base-content">{item.theme}</p>
                                                        {item.date && (
                                                            <p className="text-[9px] text-base-content/40 font-semibold">
                                                                {new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-lg font-black italic ${
                                                        (item.score || 0) >= 15 ? 'text-emerald-500' :
                                                        (item.score || 0) >= 10 ? 'text-amber-500' : 'text-rose-500'
                                                    }`}>
                                                        {item.score}
                                                        <span className="text-[10px] opacity-30 not-italic ml-0.5">/20</span>
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* RÉSUMÉ & ACCÈS RAPIDE (lg:col-span-5) */}
                            <div className="lg:col-span-5 bg-base-100 dark:bg-base-100 p-5 rounded-2xl border border-base-300/60 shadow-sm flex flex-col justify-between space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
                                            <Activity size={18} />
                                        </div>
                                        <h3 className="text-sm font-black uppercase tracking-tight">Suivi & Accès</h3>
                                    </div>
                                    <Bell size={16} className="text-base-content/30" />
                                </div>

                                <div className="space-y-3 flex-1">
                                    <div className="p-3.5 bg-base-200/50 dark:bg-base-200/40 rounded-xl border border-base-200 dark:border-base-300/40 space-y-2">
                                        <p className="text-[9px] font-black uppercase text-base-content/40 tracking-widest">Résumé</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="text-center p-2.5 bg-indigo-500/10 rounded-lg">
                                                <p className="text-xl font-black italic text-indigo-600">{statsGlobales?.totalEnfants || 0}</p>
                                                <p className="text-[9px] font-black uppercase text-indigo-400 mt-0.5">Enfants</p>
                                            </div>
                                            <div className="text-center p-2.5 bg-emerald-500/10 rounded-lg">
                                                <p className="text-xl font-black italic text-emerald-600">{statsGlobales?.exercicesTermines || 0}</p>
                                                <p className="text-[9px] font-black uppercase text-emerald-400 mt-0.5">Exercices</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-base-200/50 dark:bg-base-200/40 rounded-xl border border-base-200 dark:border-base-300/40">
                                        <p className="text-xs font-bold italic text-base-content/70">
                                            {moyenne >= 15
                                                ? "Fantastique ! La famille progresse admirablement."
                                                : moyenne >= 10
                                                    ? "Bonne dynamique ! Continuez d'encourager vos enfants."
                                                    : "Motivez vos enfants ! De belles améliorations à venir."}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate('/parent/enfants')}
                                    className="btn btn-primary btn-sm w-full rounded-xl font-bold text-xs normal-case shadow-sm"
                                >
                                    Voir tous mes enfants
                                </button>
                            </div>

                        </div>

                    </div>
                )}
        </div>
    );
};

export default DashPar;