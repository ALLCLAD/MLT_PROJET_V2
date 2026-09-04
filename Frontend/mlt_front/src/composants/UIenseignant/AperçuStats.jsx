import React, { useState, useEffect } from 'react';
import { Users, BookOpen, ClipboardList, Star, Sparkles, TrendingUp } from 'lucide-react';
import api from '../../apiDjango/api';

// ═══════════════════════════════════════════════════════════════
// 🦴 SKELETON LOADERS — Transition fluide premium
// ═══════════════════════════════════════════════════════════════

const StatCardSkeleton = () => (
    <div className="bg-base-100 border border-base-300/40 rounded-[2.5rem] p-8 animate-pulse relative overflow-hidden">
        {/* Décor arrière-plan */}
        <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-base-300/20"></div>
        <div className="flex justify-between items-start mb-6 relative">
            <div className="w-14 h-14 bg-base-300 rounded-2xl"></div>
            <div className="w-16 h-6 bg-base-300 rounded-full"></div>
        </div>
        <div className="space-y-3 relative">
            <div className="w-24 h-3 bg-base-300 rounded-lg"></div>
            <div className="w-20 h-10 bg-base-300 rounded-xl"></div>
        </div>
    </div>
);

const MoyenneSkeleton = () => (
    <div className="bg-base-100 border border-base-300/40 rounded-[2.5rem] p-8 animate-pulse md:col-span-3">
        <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-28 h-28 bg-base-300 rounded-full"></div>
            <div className="space-y-3 flex-1">
                <div className="w-40 h-4 bg-base-300 rounded-lg"></div>
                <div className="w-full h-5 bg-base-300 rounded-full"></div>
                <div className="w-56 h-3 bg-base-300 rounded-lg"></div>
            </div>
        </div>
    </div>
);

// ═══════════════════════════════════════════════════════════════
// 🎨 COMPOSANTS DE PRÉSENTATION
// ═══════════════════════════════════════════════════════════════

const StatCard = ({ title, value, icon, gradient, label, delay }) => (
    <div
        className="bg-base-100 p-8 rounded-[2.5rem] border border-base-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden animate-in fade-in slide-in-from-bottom-4"
        style={{ animationDelay: `${delay}ms`, animationFillMode: 'both', animationDuration: '600ms' }}
    >
        {/* Décor arrière-plan animé */}
        <div className={`absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-[0.06] ${gradient} transition-transform duration-700 group-hover:scale-[2]`}></div>
        <div className={`absolute -right-2 -bottom-8 w-20 h-20 rounded-full opacity-[0.04] ${gradient} transition-transform duration-1000 group-hover:scale-[2.5]`}></div>

        <div className="flex justify-between items-start mb-6 relative">
            <div className={`p-4 rounded-2xl text-white ${gradient} shadow-lg shadow-current/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                {React.cloneElement(icon, { size: 28 })}
            </div>
            <div className="text-[10px] font-black bg-base-200 px-3 py-1 rounded-full uppercase tracking-widest opacity-50">
                {label}
            </div>
        </div>
        <div className="relative">
            <p className="text-xs font-black opacity-30 uppercase tracking-[0.2em] mb-1">{title}</p>
            <h3 className="text-4xl font-black italic tracking-tighter text-base-content">{value}</h3>
        </div>
    </div>
);

const MoyenneCard = ({ moyenne }) => {
    const pourcentage = Math.min((moyenne / 20) * 100, 100);
    const couleur = moyenne >= 15 ? 'text-emerald-500' : moyenne >= 10 ? 'text-amber-500' : 'text-rose-500';
    const gradient = moyenne >= 15 ? 'from-emerald-400 to-teal-500' : moyenne >= 10 ? 'from-amber-400 to-orange-500' : 'from-rose-400 to-red-500';
    const bgGradient = moyenne >= 15 ? 'bg-emerald-500' : moyenne >= 10 ? 'bg-amber-500' : 'bg-rose-500';

    return (
        <div
            className="md:col-span-3 bg-base-100 rounded-[2.5rem] border border-base-200 shadow-sm hover:shadow-xl transition-all duration-500 p-8 group relative overflow-hidden animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: '400ms', animationFillMode: 'both', animationDuration: '600ms' }}
        >
            {/* Décor */}
            <div className={`absolute -right-10 -bottom-10 w-40 h-40 rounded-full opacity-[0.04] bg-gradient-to-tr ${gradient} transition-transform duration-700 group-hover:scale-150`}></div>

            <div className="flex flex-col md:flex-row items-center gap-8 relative">
                {/* Cercle de progression */}
                <div className="relative w-28 h-28 shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        {/* Piste */}
                        <circle
                            cx="50" cy="50" r="42"
                            fill="none"
                            className="stroke-base-300"
                            strokeWidth="8"
                        />
                        {/* Progression */}
                        <circle
                            cx="50" cy="50" r="42"
                            fill="none"
                            className={`stroke-current ${couleur}`}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${pourcentage * 2.64} 264`}
                            style={{ transition: 'stroke-dasharray 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-3xl font-black italic tracking-tighter ${couleur}`}>{moyenne}</span>
                        <span className="text-[9px] font-bold uppercase opacity-30 tracking-widest">/20</span>
                    </div>
                </div>

                {/* Texte + Barre */}
                <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={16} className={couleur} />
                        <p className="text-xs font-black uppercase tracking-[0.2em] opacity-40">Moyenne générale de la classe</p>
                    </div>
                    {/* Barre horizontale */}
                    <div className="h-4 w-full bg-base-300/50 rounded-full overflow-hidden p-0.5 shadow-inner border border-base-300/30 mb-3">
                        <div
                            className={`h-full ${bgGradient} rounded-full shadow-lg transition-all duration-1000 ease-out`}
                            style={{ width: `${pourcentage}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-base-content/50 font-medium italic">
                        {moyenne >= 15
                            ? "Résultats excellents ! La classe progresse à merveille."
                            : moyenne >= 10
                                ? "Des progrès encourageants. Continuez sur cette lancée !"
                                : "Des efforts à fournir. Motivez vos élèves !"}
                    </p>
                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// 🏠 COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════

const ApercuStatsEns = ({ refreshKey = 0 }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                // Délai minimum de transition de 1.2s pour une transition fluide
                const minDelay = new Promise(resolve => setTimeout(resolve, 1200));
                const [response] = await Promise.all([
                    api.get('/enseignant/stats/'),
                    minDelay
                ]);
                setStats(response.data);
            } catch (err) {
                console.error("Erreur stats enseignant:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [refreshKey]);

    // ── SKELETON ──
    if (loading) return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <MoyenneSkeleton />
        </div>
    );

    // ── RENDU FINAL ──
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
                title="Élèves inscrits"
                value={stats?.totalEleves || 0}
                icon={<Users />}
                gradient="bg-gradient-to-tr from-blue-500 to-indigo-600"
                label="Classe"
                delay={0}
            />
            <StatCard
                title="Leçons créées"
                value={stats?.totalLecons || 0}
                icon={<BookOpen />}
                gradient="bg-gradient-to-tr from-violet-500 to-purple-600"
                label="Contenu"
                delay={100}
            />
            <StatCard
                title="Exercices donnés"
                value={stats?.totalExercices || 0}
                icon={<ClipboardList />}
                gradient="bg-gradient-to-tr from-emerald-400 to-teal-500"
                label="Pratique"
                delay={200}
            />
            <MoyenneCard moyenne={stats?.moyenneGenerale || 0} />
        </div>
    );
};

export default ApercuStatsEns;