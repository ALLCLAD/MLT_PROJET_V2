import React, { useState, useEffect } from 'react';
import { 
    Calendar as CalendarIcon, 
    TrendingUp, 
    Loader2, 
    Clock, 
    BookOpen, 
    Users, 
    Bell, 
    ChevronRight, 
    RefreshCw,
    Sparkles,
    ChevronLeft,
    CheckCircle2,
    Award,
    ClipboardList,
    Activity,
    Search,
    Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import api from '../../apiDjango/api.jsx';

const DashEns = () => {
    const navigate = useNavigate();
    const [prochainsEvenements, setProchainsEvenements] = useState([]);
    const [loadingCalendrier, setLoadingCalendrier] = useState(true);
    const [graphData, setGraphData] = useState([]);
    const [elevesNoms, setElevesNoms] = useState([]);
    const [recentScores, setRecentScores] = useState([]);
    const [statsGlobales, setStatsGlobales] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    // État pour le mini calendrier interactif One UI
    const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

    const colors = ["#8b5cf6", "#ec4899", "#3b82f6", "#10b981", "#f59e0b"];

    const fetchStats = async () => {
        try {
            setLoadingStats(true);
            setLoadingCalendrier(true);

            // Délai minimum de transition pour loader fluide lors du clic sur actualiser
            const minDelay = new Promise(resolve => setTimeout(resolve, 800));

            const [statsRes, calRes] = await Promise.all([
                api.get('/enseignant/stats/'),
                api.get('/enseignant/calendrier/'),
                minDelay
            ]);

            setStatsGlobales(statsRes.data);
            setGraphData(statsRes.data.graphData || []);
            setRecentScores(statsRes.data.recentActivity || []);

            if (statsRes.data.graphData && statsRes.data.graphData.length > 0) {
                const noms = Object.keys(statsRes.data.graphData[0]).filter(k => k !== 'name');
                setElevesNoms(noms);
            }

            const aujourdhui = new Date();
            aujourdhui.setHours(0, 0, 0, 0);
            const aVenir = calRes.data
                .filter(event => new Date(event.date) >= aujourdhui)
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(0, 3);
            setProchainsEvenements(aVenir);

        } catch (err) {
            console.error("Erreur chargement dashboard:", err);
        } finally {
            setLoadingStats(false);
            setLoadingCalendrier(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [refreshKey]);

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    const moyenne = statsGlobales?.moyenneGenerale || 0;
    const pourcentageMoyenne = Math.min((moyenne / 20) * 100, 100);

    // --- Génération de la grille du mini calendrier ---
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfWeek = (year, month) => {
        let day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // Ajuster pour que Lundi soit index 0
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

    const today = new Date();
    const isToday = (day) => {
        return today.getDate() === day &&
            today.getMonth() === currentMonth &&
            today.getFullYear() === currentYear;
    };

    const hasEvent = (day) => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return prochainsEvenements.some(e => e.date === dateStr);
    };

    return (
        // ── DASHBOARD ENSEIGNANT UNIFORMISÉ & COMPACT ──
        <div className="space-y-5 font-sans antialiased">
            
            {/* ── TOP HEADER COMPACT ── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-100 dark:bg-base-100 p-5 rounded-2xl border border-base-300/60 shadow-sm">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-extrabold uppercase tracking-wider mb-1">
                        <Sparkles size={12} className="animate-pulse" /> Espace Enseignant
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-base-content uppercase">
                        Tableau de bord
                    </h1>
                    <p className="text-base-content/50 text-xs font-medium italic mt-0.5">
                        Bienvenue ! Voici la vue d'ensemble de vos classes et activités.
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
                    /* ── DISPOSITION EN GRILLE REEL STYLE ONE UI 8.5 (Layout IMG.jpeg) ── */
                    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-700">

                        {/* ══ LIGNE SUPERIEURE 3 COLONNES ══ */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                            {/* COLONNE 1 (lg:col-span-4): Stats Rapides de Classe */}
                            <div className="lg:col-span-4 bg-base-200/40 dark:bg-base-200/30 p-6 rounded-[2.5rem] border border-base-200/80 dark:border-base-300/40 flex flex-col justify-between space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-base-content/40 mb-2">
                                    Statistiques de la classe
                                </h3>

                                {/* Stat Card 1 */}
                                <div className="bg-base-100 dark:bg-base-100 p-5 rounded-3xl border border-base-200 dark:border-base-300 shadow-sm flex items-center justify-between group hover:scale-[1.02] transition-transform">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20">
                                            <Users size={22} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-base-content/40 tracking-wider">Élèves inscrits</p>
                                            <p className="text-2xl font-black text-base-content italic mt-0.5">
                                                {statsGlobales?.totalEleves || 0}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-extrabold bg-blue-500/10 text-blue-600 px-3 py-1 rounded-full uppercase">Classe</span>
                                </div>

                                {/* Stat Card 2 */}
                                <div className="bg-base-100 dark:bg-base-100 p-5 rounded-3xl border border-base-200 dark:border-base-300 shadow-sm flex items-center justify-between group hover:scale-[1.02] transition-transform">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-violet-500 to-purple-600 text-white shadow-md shadow-purple-500/20">
                                            <BookOpen size={22} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-base-content/40 tracking-wider">Leçons publiées</p>
                                            <p className="text-2xl font-black text-base-content italic mt-0.5">
                                                {statsGlobales?.totalLecons || 0}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-extrabold bg-purple-500/10 text-purple-600 px-3 py-1 rounded-full uppercase">Cours</span>
                                </div>

                                {/* Stat Card 3 */}
                                <div className="bg-base-100 dark:bg-base-100 p-5 rounded-3xl border border-base-200 dark:border-base-300 shadow-sm flex items-center justify-between group hover:scale-[1.02] transition-transform">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-600 text-white shadow-md shadow-teal-500/20">
                                            <ClipboardList size={22} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-base-content/40 tracking-wider">Exercices créés</p>
                                            <p className="text-2xl font-black text-base-content italic mt-0.5">
                                                {statsGlobales?.totalExercices || 0}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full uppercase">Pratique</span>
                                </div>
                            </div>

                            {/* COLONNE 2 (lg:col-span-4): Progression Générale - Forme 'Blob' Organique Ondulée Unique avec Gradient Dynamique */}
                            <div className="lg:col-span-4 bg-base-100 dark:bg-base-100 p-6 rounded-[2.5rem] border border-base-200 dark:border-base-300 shadow-sm flex flex-col justify-between items-center text-center relative overflow-hidden group">
                                
                                <div className="w-full flex justify-center items-center mb-2">
                                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${
                                        moyenne >= 15 ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' :
                                        moyenne >= 10 ? 'text-amber-600 bg-amber-500/10 border-amber-500/20' :
                                        'text-rose-600 bg-rose-500/10 border-rose-500/20'
                                    }`}>
                                        Vue Globale
                                    </span>
                                </div>

                                {/* Forme 'Blob' Organique Ondulée Unique avec Flou Diffusé & Couleur Dynamique */}
                                <div className="relative w-48 h-48 my-3 flex items-center justify-center">
                                    
                                    {/* 1. Halo extérieur diffusé (Effet de lumière en arrière-plan) */}
                                    <div className={`absolute inset-0 rounded-[42%_58%_70%_30%/45%_55%_45%_55%] blur-2xl opacity-40 animate-pulse transition-all duration-1000 ${
                                        moyenne >= 15 ? 'bg-gradient-to-tr from-emerald-600 to-teal-400' :
                                        moyenne >= 10 ? 'bg-gradient-to-tr from-amber-500 to-orange-400' :
                                        'bg-gradient-to-tr from-rose-600 to-red-400'
                                    }`}></div>

                                    {/* 2. Blob ondulé principal unique (Organic Wavy Blob Shape de IMG.jpeg) */}
                                    <div className={`absolute inset-2 rounded-[42%_58%_70%_30%/45%_55%_45%_55%] p-1 transition-all duration-1000 shadow-lg ${
                                        moyenne >= 15 ? 'bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500' :
                                        moyenne >= 10 ? 'bg-gradient-to-tr from-amber-500 via-orange-400 to-yellow-500' :
                                        'bg-gradient-to-tr from-rose-500 via-red-500 to-pink-500'
                                    }`}>
                                        {/* Dégradé intérieur pour donner du volume 3D au blob */}
                                        <div className="w-full h-full rounded-[40%_60%_68%_32%/48%_52%_48%_52%] bg-gradient-to-br from-white/30 to-transparent"></div>
                                    </div>

                                    {/* 3. Zone circulaire blanche centrale (Central White Circular Area) */}
                                    <div className="relative z-10 w-32 h-32 rounded-full bg-white dark:bg-base-100 shadow-inner flex flex-col items-center justify-center p-2 border border-base-200/50 dark:border-base-300">
                                        {/* Note sur 20 en grand et en gras */}
                                        <span className={`text-3xl font-black italic tracking-tighter leading-none ${
                                            moyenne >= 15 ? 'text-teal-900 dark:text-emerald-400' :
                                            moyenne >= 10 ? 'text-amber-900 dark:text-amber-400' :
                                            'text-rose-900 dark:text-rose-400'
                                        }`}>
                                            {moyenne}
                                            <span className="text-xs font-bold not-italic opacity-40">/20</span>
                                        </span>
                                        {/* Titre 'Moyenne Générale' sous la note */}
                                        <span className={`text-[9px] font-extrabold uppercase tracking-wider mt-1 ${
                                            moyenne >= 15 ? 'text-teal-700 dark:text-emerald-500' :
                                            moyenne >= 10 ? 'text-amber-700 dark:text-amber-500' :
                                            'text-rose-700 dark:text-rose-500'
                                        }`}>
                                            Moyenne Générale
                                        </span>
                                    </div>
                                </div>

                                <div className="w-full bg-base-200/50 dark:bg-base-200/40 p-4 rounded-2xl border border-base-200/60 dark:border-base-300/30 shadow-sm">
                                    <p className="text-xs font-bold text-base-content/70 italic">
                                        {moyenne >= 15
                                            ? "Résultats excellents ! La classe progresse à merveille."
                                            : moyenne >= 10
                                                ? "Des progrès encourageants. Continuez sur cette lancée !"
                                                : "Des efforts à fournir. Motivez vos élèves !"}
                                    </p>
                                </div>
                            </div>

                            {/* COLONNE 3 (lg:col-span-4): Actions Rapides (Mes Élèves, Mes Leçons, Calendrier) */}
                            <div className="lg:col-span-4 bg-base-200/40 dark:bg-base-200/30 p-6 rounded-[2.5rem] border border-base-200/80 dark:border-base-300/40 flex flex-col justify-between space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-base-content/40 mb-2">
                                    Actions rapides
                                </h3>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => navigate('/enseignant/eleves')}
                                        className="btn btn-primary w-full rounded-2xl font-black text-sm shadow-lg shadow-primary/25 border-none hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-between px-6 py-4 h-auto"
                                    >
                                        <span className="flex items-center gap-3">
                                            <Users size={20} /> Mes Élèves
                                        </span>
                                        <ChevronRight size={18} />
                                    </button>

                                    <button
                                        onClick={() => navigate('/enseignant/lecons')}
                                        className="btn bg-base-100 dark:bg-base-100 hover:bg-base-200 border-base-200 dark:border-base-300 w-full rounded-2xl font-black text-sm text-base-content hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-between px-6 py-4 h-auto shadow-sm"
                                    >
                                        <span className="flex items-center gap-3">
                                            <BookOpen size={20} className="text-purple-500" /> Mes Leçons
                                        </span>
                                        <ChevronRight size={18} />
                                    </button>

                                    <button
                                        onClick={() => navigate('/enseignant/calendrier')}
                                        className="btn bg-base-100 dark:bg-base-100 hover:bg-base-200 border-base-200 dark:border-base-300 w-full rounded-2xl font-black text-sm text-base-content hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-between px-6 py-4 h-auto shadow-sm"
                                    >
                                        <span className="flex items-center gap-3">
                                            <CalendarIcon size={20} className="text-blue-500" /> Calendrier
                                        </span>
                                        <ChevronRight size={18} />
                                    </button>
                                </div>

                                <div className="pt-2">
                                    <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 flex items-center gap-3 text-primary text-xs font-bold">
                                        <Award size={20} className="shrink-0" />
                                        <span>Planifiez vos révisions directement dans le calendrier.</span>
                                    </div>
                                </div>
                            </div>

                        </div>


                        {/* ══ LIGNE INTERMÉDIAIRE : GRAPHIQUE ÉVOLUTION + MINI-CALENDRIER (Format IMG.jpeg) ══ */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                            {/* GRAPHIQUE AIR (lg:col-span-8) */}
                            <div className="lg:col-span-8 bg-base-100 dark:bg-base-100 p-8 rounded-[2.5rem] border border-base-200 dark:border-base-300 shadow-sm flex flex-col justify-between">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                            <TrendingUp size={22} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black uppercase tracking-tight">Activité par élève</h3>
                                            <p className="text-xs text-base-content/40 font-bold italic">Exercices terminés par jour cette semaine</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black uppercase px-3 py-1 bg-base-200 dark:bg-base-200 rounded-full text-base-content/60">Hebdomadaire</span>
                                </div>

                                {elevesNoms.length === 0 ? (
                                    <div className="h-[280px] flex flex-col items-center justify-center opacity-30">
                                        <Users size={48} className="mb-2" />
                                        <p className="font-bold text-sm">Ajoutez des élèves pour voir leur progression graphique.</p>
                                    </div>
                                ) : (
                                    <div className="h-[280px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={graphData}>
                                                <defs>
                                                    {colors.map((color, i) => (
                                                        <linearGradient key={i} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
                                                            <stop offset="95%" stopColor={color} stopOpacity={0}/>
                                                        </linearGradient>
                                                    ))}
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: '800' }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: '800' }} allowDecimals={false} />
                                                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                                                {elevesNoms.map((nom, index) => (
                                                    <Area
                                                        key={nom}
                                                        type="monotone"
                                                        dataKey={nom}
                                                        stroke={colors[index % colors.length]}
                                                        fill={`url(#grad-${index % colors.length})`}
                                                        strokeWidth={3}
                                                        animationDuration={1500}
                                                    />
                                                ))}
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>

                            {/* MINI-CALENDRIER DESIGN (lg:col-span-4) comme l'image IMG.jpeg */}
                            <div className="lg:col-span-4 bg-base-100 dark:bg-base-100 p-6 rounded-[2.5rem] border border-base-200 dark:border-base-300 shadow-sm flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-wider text-base-content">Calendrier</h3>
                                        <p className="text-[10px] text-base-content/40 font-bold capitalize">
                                            {currentMonthDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={prevMonthDays} className="btn btn-xs btn-circle btn-ghost">
                                            <ChevronLeft size={16} />
                                        </button>
                                        <button onClick={nextMonthDays} className="btn btn-xs btn-circle btn-ghost">
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Grille du calendrier */}
                                <div className="grid grid-cols-7 gap-1 text-center mb-4">
                                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                                        <span key={i} className="text-[10px] font-black opacity-30 uppercase py-1">{d}</span>
                                    ))}

                                    {/* Cases vides de début de mois */}
                                    {[...Array(firstDayIndex)].map((_, i) => (
                                        <span key={`empty-${i}`} className="py-2"></span>
                                    ))}

                                    {/* Jours du mois */}
                                    {[...Array(daysInMonth)].map((_, i) => {
                                        const dayNum = i + 1;
                                        const currentDayIsToday = isToday(dayNum);
                                        const currentDayHasEv = hasEvent(dayNum);

                                        return (
                                            <div 
                                                key={dayNum}
                                                className={`py-2 text-xs font-extrabold rounded-2xl transition-all cursor-pointer relative flex flex-col items-center justify-center ${
                                                    currentDayIsToday 
                                                        ? 'bg-primary text-white shadow-md shadow-primary/30' 
                                                        : 'hover:bg-base-200 text-base-content/80'
                                                }`}
                                            >
                                                <span>{dayNum}</span>
                                                {currentDayHasEv && (
                                                    <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${currentDayIsToday ? 'bg-white' : 'bg-pink-500'}`}></span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Raccourci vers la page calendrier */}
                                <button
                                    onClick={() => navigate('/enseignant/calendrier')}
                                    className="btn btn-sm btn-ghost hover:bg-primary/10 text-primary w-full rounded-2xl font-black text-xs normal-case flex items-center justify-center gap-2"
                                >
                                    Gérer le calendrier complet <ChevronRight size={14} />
                                </button>
                            </div>

                        </div>


                        {/* ══ LIGNE INFÉRIEURE : DERNIERS SCORES & ÉVÉNEMENTS À VENIR (Layout IMG.jpeg) ══ */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                            {/* DERNIERS SCORES (lg:col-span-7) */}
                            <div className="lg:col-span-7 bg-base-100 dark:bg-base-100 p-8 rounded-[2.5rem] border border-base-200 dark:border-base-300 shadow-sm space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600">
                                            <Clock size={20} />
                                        </div>
                                        <h3 className="text-lg font-black uppercase tracking-tight">Dernières Activités & Scores</h3>
                                    </div>
                                    <span className="text-[10px] font-black uppercase px-3 py-1 bg-base-200 dark:bg-base-200 rounded-full text-base-content/50">Récent</span>
                                </div>

                                {recentScores.length === 0 ? (
                                    <p className="text-xs text-base-content/40 font-bold italic py-8 text-center">Aucun score d'élève enregistré pour le moment.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {recentScores.map((item, index) => (
                                            <div 
                                                key={index}
                                                className="flex items-center justify-between p-4 bg-base-200/40 dark:bg-base-200/30 rounded-2xl border border-base-200/60 dark:border-base-300/40 hover:scale-[1.01] transition-transform"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-purple-600 text-white flex items-center justify-center font-black text-base shadow-sm">
                                                        {item.prenom?.[0] || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-primary text-xs uppercase tracking-wider">{item.prenom}</p>
                                                        <p className="font-extrabold text-sm text-base-content">{item.theme}</p>
                                                        <p className="text-[10px] text-base-content/40 font-bold">
                                                            {new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <p className={`text-2xl font-black italic ${
                                                        item.note >= 15 ? 'text-emerald-500' :
                                                        item.note >= 10 ? 'text-amber-500' : 'text-rose-500'
                                                    }`}>
                                                        {item.note}
                                                        <span className="text-xs opacity-30 not-italic ml-0.5">/20</span>
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* À VENIR / ÉVÉNEMENTS PROGRAMMÉS (lg:col-span-5) */}
                            <div className="lg:col-span-5 bg-gradient-to-br from-primary/5 via-base-100 to-purple-500/5 dark:bg-base-100 p-8 rounded-[2.5rem] border border-base-200 dark:border-base-300 shadow-sm flex flex-col justify-between space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600">
                                            <Bell size={20} />
                                        </div>
                                        <h3 className="text-lg font-black uppercase tracking-tight">Prochains événements</h3>
                                    </div>
                                    <CalendarIcon size={18} className="text-base-content/30" />
                                </div>

                                <div className="space-y-4 flex-1">
                                    {prochainsEvenements.length > 0 ? (
                                        prochainsEvenements.map((ev) => (
                                            <div 
                                                key={ev.id} 
                                                className="p-5 bg-base-100 dark:bg-base-200/50 rounded-3xl border border-base-200 dark:border-base-300 shadow-sm space-y-2 hover:scale-[1.01] transition-transform"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                        ev.type_evenement === 'reunion' ? 'bg-orange-500/10 text-orange-600' :
                                                        ev.type_evenement === 'autre' ? 'bg-rose-500/10 text-rose-600' :
                                                        'bg-primary/10 text-primary'
                                                    }`}>
                                                        {ev.type_evenement || "Événement"}
                                                    </span>
                                                    <span className="text-[10px] font-black opacity-40 italic">{ev.heure || "Toute la journée"}</span>
                                                </div>
                                                <p className="font-extrabold text-base leading-snug text-base-content">{ev.titre}</p>
                                                <div className="flex items-center gap-2 text-xs opacity-50 font-bold">
                                                    <CalendarIcon size={12} />
                                                    <span>{new Date(ev.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 opacity-30 border-2 border-dashed border-base-300 rounded-3xl">
                                            <Bell size={28} className="mx-auto mb-2" />
                                            <p className="text-xs font-bold italic">Aucun événement à venir</p>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => navigate('/enseignant/calendrier')}
                                    className="btn btn-primary w-full rounded-2xl font-black text-xs normal-case shadow-md shadow-primary/20"
                                >
                                    Voir l'emploi du temps complet
                                </button>
                            </div>

                        </div>

                    </div>
                )}
        </div>
    );
};

export default DashEns;


