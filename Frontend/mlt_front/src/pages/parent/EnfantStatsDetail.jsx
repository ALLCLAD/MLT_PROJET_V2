/**
 * COMPOSANT : EnfantStatsDetail
 * DESCRIPTION : Affiche les scores par thème, le temps moyen et la progression d'un enfant précis.
 * API : GET '/quiz/stats-par-enfant/{enfantId}/'
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Loader2,
    Star,
    TrendingUp,
    Award,
    BookOpen,
    Clock,
    Target
} from 'lucide-react';
import api from '../../apiDjango/api';
import PerformanceDetails from '../../composants/Shared/PerformanceDetails';

// 🦴 SKELETON LOADERS
const HeaderSkeleton = () => (
    <div className="p-8 md:p-12 border-b border-base-200 bg-gradient-to-r from-base-100 to-base-200/20 animate-pulse">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-base-300 rounded-full"></div>
                <div className="space-y-3">
                    <div className="w-64 h-8 bg-base-300 rounded-xl"></div>
                    <div className="w-40 h-4 bg-base-300 rounded-lg"></div>
                </div>
            </div>
            <div className="w-44 h-20 bg-base-300 rounded-2xl hidden md:block"></div>
        </div>
    </div>
);

const StatCardSkeleton = () => (
    <div className="bg-base-100 border border-base-300 rounded-[2rem] p-6 animate-pulse">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-base-300 rounded-2xl"></div>
            <div className="flex-1 space-y-2">
                <div className="w-20 h-3 bg-base-300 rounded-lg"></div>
                <div className="w-16 h-7 bg-base-300 rounded-lg"></div>
            </div>
        </div>
    </div>
);

const ChartSkeleton = () => (
    <div className="bg-base-100 border border-base-300 rounded-[3rem] p-8 animate-pulse">
        <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-base-300 rounded-2xl"></div>
                <div className="space-y-2">
                    <div className="w-48 h-6 bg-base-300 rounded-lg"></div>
                    <div className="w-32 h-3 bg-base-300 rounded-lg"></div>
                </div>
            </div>
            <div className="w-40 h-10 bg-base-300 rounded-2xl"></div>
        </div>
        <div className="w-full h-[300px] bg-base-200 rounded-3xl"></div>
    </div>
);

const ThemeCardSkeleton = () => (
    <div className="bg-base-100 border border-base-300 rounded-[2.5rem] p-8 animate-pulse">
        <div className="flex justify-between items-start mb-8">
            <div className="w-28 h-8 bg-base-300 rounded-xl"></div>
            <div className="space-y-1 text-right">
                <div className="w-16 h-10 bg-base-300 rounded-lg ml-auto"></div>
                <div className="w-20 h-3 bg-base-300 rounded-lg ml-auto"></div>
            </div>
        </div>
        <div className="w-full h-2 bg-base-300 rounded-full mb-8"></div>
        <div className="bg-base-200 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between">
                <div className="w-24 h-4 bg-base-300 rounded-lg"></div>
                <div className="w-10 h-5 bg-base-300 rounded-lg"></div>
            </div>
            <div className="flex justify-between">
                <div className="w-24 h-4 bg-base-300 rounded-lg"></div>
                <div className="w-10 h-5 bg-base-300 rounded-lg"></div>
            </div>
        </div>
    </div>
);

const EnfantStatsDetail = () => {
    const { enfantId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const minDelay = new Promise(resolve => setTimeout(resolve, 1200));
                const [response] = await Promise.all([
                    api.get(`/quiz/stats-par-enfant/${enfantId}/`),
                    minDelay
                ]);
                setData(response.data);
            } catch (err) {
                console.error("Erreur récupération stats enfant:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [enfantId]);

    // Calcul des statistiques globales depuis les données
    const globalStats = data?.stats_par_theme ? {
        moyenneGenerale: (data.stats_par_theme.reduce((acc, s) => acc + parseFloat(s.moyenne), 0) / data.stats_par_theme.length).toFixed(1),
        totalExercices: data.stats_par_theme.reduce((acc, s) => acc + s.nb_exercices, 0),
        tempsMoyen: Math.round(data.stats_par_theme.reduce((acc, s) => acc + parseFloat(s.temps_moyen), 0) / data.stats_par_theme.length),
        nbThemes: data.stats_par_theme.length
    } : null;

    return (
        <div className="space-y-5 font-sans antialiased">

            {/* HEADER COMPACT */}
            {loading ? (
                <HeaderSkeleton />
            ) : (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-100 dark:bg-base-100 p-5 rounded-2xl border border-base-300/60 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="btn btn-sm btn-circle btn-ghost border border-base-300/60 hover:bg-primary hover:text-white transition-all shadow-xs shrink-0"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-extrabold uppercase tracking-wider mb-1">
                                <TrendingUp size={12} /> Tableau de bord
                            </div>
                            <h1 className="text-xl sm:text-2xl font-black text-base-content tracking-tight uppercase leading-none">
                                {data?.enfant || 'Profil Enfant'}
                            </h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-primary font-bold italic text-xs">Classe : {data?.classe || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex bg-primary/10 px-3.5 py-2 rounded-xl border border-primary/20 items-center gap-2.5">
                            <Award className="text-primary" size={22} />
                            <div>
                                <p className="text-[9px] font-black uppercase opacity-50 leading-none">Statut Global</p>
                                <p className="font-black text-sm text-primary uppercase italic">
                                    {globalStats && parseFloat(globalStats.moyenneGenerale) >= 15 ? 'Super Champion' :
                                     globalStats && parseFloat(globalStats.moyenneGenerale) >= 10 ? 'Bonne Progression' : 'Encouragement'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ZONE DE CONTENU */}
            <div className="bg-base-100 dark:bg-base-100 p-5 rounded-2xl border border-base-300/60 shadow-sm min-h-[60vh]">

                    {loading ? (
                        /* SKELETON COMPLET */
                        <div className="space-y-12 animate-in fade-in duration-500">
                            {/* Stats Summary Skeletons */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
                            </div>
                            {/* Chart Skeleton */}
                            <ChartSkeleton />
                            {/* Theme Cards Skeletons */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[...Array(3)].map((_, i) => <ThemeCardSkeleton key={i} />)}
                            </div>
                        </div>
                    ) : !data || !data.historique || data.historique.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
                            <div className="bg-gradient-to-tr from-primary/10 to-primary/5 w-28 h-28 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <Star size={54} className="text-primary animate-pulse" />
                            </div>
                            <h3 className="text-2xl font-black text-base-content">Aucune donnée disponible</h3>
                            <p className="text-base-content/60 max-w-sm mx-auto font-semibold mt-2">
                                {data?.enfant} n'a pas encore terminé d'exercices. Les statistiques apparaîtront dès qu'il commencera à travailler !
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-12 animate-in fade-in duration-700">
                            {/* CARTES RÉSUMÉ STATISTIQUES */}
                            {globalStats && (
                                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                     <div className="bg-base-200/50 dark:bg-base-200/40 border border-base-200 dark:border-base-300/40 rounded-xl p-4 hover:scale-[1.01] transition-transform">
                                         <div className="flex items-center gap-3">
                                             <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                                                 <TrendingUp size={18} />
                                             </div>
                                             <div>
                                                 <p className="text-[9px] font-black uppercase opacity-40 tracking-wider">Moyenne</p>
                                                 <p className="text-xl font-black text-primary italic">{globalStats.moyenneGenerale}<span className="text-[10px] opacity-40 not-italic">/20</span></p>
                                             </div>
                                         </div>
                                     </div>
                                     <div className="bg-base-200/50 dark:bg-base-200/40 border border-base-200 dark:border-base-300/40 rounded-xl p-4 hover:scale-[1.01] transition-transform">
                                         <div className="flex items-center gap-3">
                                             <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-600">
                                                 <BookOpen size={18} />
                                             </div>
                                             <div>
                                                 <p className="text-[9px] font-black uppercase opacity-40 tracking-wider">Exercices</p>
                                                 <p className="text-xl font-black text-base-content">{globalStats.totalExercices}</p>
                                             </div>
                                         </div>
                                     </div>
                                     <div className="bg-base-200/50 dark:bg-base-200/40 border border-base-200 dark:border-base-300/40 rounded-xl p-4 hover:scale-[1.01] transition-transform">
                                         <div className="flex items-center gap-3">
                                             <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-600">
                                                 <Clock size={18} />
                                             </div>
                                             <div>
                                                 <p className="text-[9px] font-black uppercase opacity-40 tracking-wider">Temps moy.</p>
                                                 <p className="text-xl font-black text-base-content">{globalStats.tempsMoyen}<span className="text-[10px] opacity-40 ml-0.5">s</span></p>
                                             </div>
                                         </div>
                                     </div>
                                     <div className="bg-base-200/50 dark:bg-base-200/40 border border-base-200 dark:border-base-300/40 rounded-xl p-4 hover:scale-[1.01] transition-transform">
                                         <div className="flex items-center gap-3">
                                             <div className="p-2.5 bg-violet-500/10 rounded-xl text-violet-600">
                                                 <Target size={18} />
                                             </div>
                                             <div>
                                                 <p className="text-[9px] font-black uppercase opacity-40 tracking-wider">Thèmes</p>
                                                 <p className="text-xl font-black text-base-content">{globalStats.nbThemes}</p>
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                             )}

                            {/* COMPOSANT DE DÉTAILS DE PERFORMANCE */}
                            <PerformanceDetails data={data} />
                        </div>
                    )}
            </div>
        </div>
    );
};

export default EnfantStatsDetail;