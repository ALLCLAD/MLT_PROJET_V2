import React, { useState } from 'react';
import { 
    Clock, 
    BookOpen, 
    TrendingUp, 
    Star, 
    Activity, 
    LayoutGrid, 
    List, 
    ChevronDown, 
    BarChart3,
    History as HistoryIcon
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts';

const PerformanceDetails = ({ data }) => {
    const [viewMode, setViewMode] = useState('grid');
    const [graphType, setGraphType] = useState('notes'); // 'notes' ou 'exercices'
    const [showAllHistory, setShowAllHistory] = useState(false);

    if (!data) return null;

    const { 
        stats_par_theme, 
        historique, 
        progression_notes, 
        progression_exercices 
    } = data;

    const displayedHistory = showAllHistory ? historique : historique.slice(0, 5);

    return (
        <div className="space-y-6 animate-in fade-in duration-700 font-sans antialiased">
            
            {/* 1. SECTION GRAPHIQUE COMMUTABLE */}
            <div className="bg-base-100 dark:bg-base-100 p-5 rounded-2xl border border-base-300/60 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-black uppercase tracking-tight">Analyse de Progression</h3>
                            <p className="text-xs opacity-50 font-medium italic">Visualisez l'évolution des performances</p>
                        </div>
                    </div>

                    <div className="join bg-base-200 p-0.5 rounded-xl border border-base-300/60">
                        <button 
                            onClick={() => setGraphType('notes')}
                            className={`btn btn-xs join-item border-none px-4 ${graphType === 'notes' ? 'btn-primary shadow-xs' : 'btn-ghost opacity-60'}`}
                        >
                            Notes / 20
                        </button>
                        <button 
                            onClick={() => setGraphType('exercices')}
                            className={`btn btn-xs join-item border-none px-4 ${graphType === 'exercices' ? 'btn-primary shadow-xs' : 'btn-ghost opacity-60'}`}
                        >
                            Activité
                        </button>
                    </div>
                </div>

                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        {graphType === 'notes' ? (
                            <LineChart data={progression_notes}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#9ca3af', fontSize: 12, fontWeight: '900'}} 
                                    dy={10} 
                                />
                                <YAxis 
                                    domain={[0, 20]} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#9ca3af', fontSize: 12, fontWeight: '900'}} 
                                />
                                <Tooltip 
                                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}}
                                    formatter={(value) => [`${value}/20`, 'Note']}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="note" 
                                    stroke="#6366f1" 
                                    strokeWidth={4} 
                                    dot={{ r: 6, fill: '#6366f1', strokeWidth: 3, stroke: '#fff' }}
                                    activeDot={{ r: 8 }}
                                    animationDuration={1500}
                                />
                            </LineChart>
                        ) : (
                            <AreaChart data={progression_exercices}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#9ca3af', fontSize: 12, fontWeight: '900'}} 
                                    dy={10} 
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#9ca3af', fontSize: 12, fontWeight: '900'}} 
                                    allowDecimals={false}
                                />
                                <Tooltip 
                                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="count" 
                                    stroke="#10b981" 
                                    fillOpacity={1} 
                                    fill="url(#colorCount)" 
                                    strokeWidth={4}
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 2. SECTION MAÎTRISE PAR THÈME */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-amber-500/10 rounded-xl text-amber-600">
                            <BarChart3 size={18} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-wider">Maîtrise par Thème</h3>
                    </div>
                    
                    <div className="join bg-base-200 p-0.5 rounded-xl border border-base-300/60 hidden sm:flex">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`btn btn-xs join-item border-none ${viewMode === 'grid' ? 'btn-primary shadow-xs' : 'btn-ghost opacity-60'}`}
                        >
                            <LayoutGrid size={14} />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`btn btn-xs join-item border-none ${viewMode === 'list' ? 'btn-primary shadow-xs' : 'btn-ghost opacity-60'}`}
                        >
                            <List size={14} />
                        </button>
                    </div>
                </div>

                <div className={viewMode === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" 
                    : "space-y-3"
                }>
                    {stats_par_theme.map((stat, index) => {
                        const scoreMoyenne = parseFloat(stat.moyenne) || 0;
                        const pourcentage = Math.min(Math.round((scoreMoyenne / 20) * 100), 100);

                        // Thèmes de couleurs vibrants et distincts par index de thème
                        const themeConfigs = [
                            {
                                text: 'text-indigo-500',
                                bgLight: 'bg-indigo-500/10',
                                borderHover: 'hover:border-indigo-500/30',
                                stroke: 'stroke-indigo-500',
                                gradient: 'from-indigo-500 to-purple-600',
                                badgeBg: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
                            },
                            {
                                text: 'text-emerald-500',
                                bgLight: 'bg-emerald-500/10',
                                borderHover: 'hover:border-emerald-500/30',
                                stroke: 'stroke-emerald-500',
                                gradient: 'from-emerald-400 to-teal-600',
                                badgeBg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            },
                            {
                                text: 'text-amber-500',
                                bgLight: 'bg-amber-500/10',
                                borderHover: 'hover:border-amber-500/30',
                                stroke: 'stroke-amber-500',
                                gradient: 'from-amber-400 to-orange-500',
                                badgeBg: 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            },
                            {
                                text: 'text-rose-500',
                                bgLight: 'bg-rose-500/10',
                                borderHover: 'hover:border-rose-500/30',
                                stroke: 'stroke-rose-500',
                                gradient: 'from-rose-400 to-pink-600',
                                badgeBg: 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                            },
                            {
                                text: 'text-cyan-500',
                                bgLight: 'bg-cyan-500/10',
                                borderHover: 'hover:border-cyan-500/30',
                                stroke: 'stroke-cyan-500',
                                gradient: 'from-cyan-400 to-blue-600',
                                badgeBg: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20'
                            },
                            {
                                text: 'text-violet-500',
                                bgLight: 'bg-violet-500/10',
                                borderHover: 'hover:border-violet-500/30',
                                stroke: 'stroke-violet-500',
                                gradient: 'from-violet-500 to-fuchsia-600',
                                badgeBg: 'bg-violet-500/10 text-violet-600 border-violet-500/20'
                            }
                        ];

                        const config = themeConfigs[index % themeConfigs.length];

                        return viewMode === 'grid' ? (
                            <div key={index} className={`group bg-base-100 dark:bg-base-100 border border-base-300/60 rounded-2xl p-5 shadow-sm hover:shadow-md ${config.borderHover} transition-all duration-300 relative overflow-hidden flex flex-col justify-between`}>
                                 {/* Halo lumineux en arrière-plan */}
                                 <div className={`absolute -right-12 -top-12 w-36 h-36 rounded-full opacity-[0.05] bg-gradient-to-br ${config.gradient} transition-transform duration-700 group-hover:scale-150`}></div>

                                 <div>
                                     {/* Entête du thème */}
                                     <div className="flex justify-between items-start mb-3">
                                         <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider border ${config.badgeBg}`}>
                                             {stat.theme_label}
                                         </span>
                                         <div className="text-right">
                                             <span className="text-[9px] font-black opacity-30 uppercase tracking-widest block">Note moy.</span>
                                             <span className={`text-xl font-black italic ${config.text}`}>
                                                 {scoreMoyenne}<span className="text-[10px] opacity-30 not-italic">/20</span>
                                             </span>
                                         </div>
                                     </div>

                                    {/* Forme 'Blob' Organique Ondulée aux couleurs du thème */}
                                    <div className="my-4 flex justify-center items-center">
                                        <div className="relative w-36 h-36 flex items-center justify-center">

                                            {/* 1. Halo extérieur diffusé */}
                                            <div className={`absolute inset-0 rounded-[42%_58%_70%_30%/45%_55%_45%_55%] blur-xl opacity-30 animate-pulse transition-all duration-1000 bg-gradient-to-tr ${config.gradient}`}></div>

                                            {/* 2. Blob ondulé principal */}
                                            <div className={`absolute inset-1.5 rounded-[42%_58%_70%_30%/45%_55%_45%_55%] p-0.5 transition-all duration-1000 shadow-sm bg-gradient-to-tr ${config.gradient}`}>
                                                <div className="w-full h-full rounded-[40%_60%_68%_32%/48%_52%_48%_52%] bg-gradient-to-br from-white/30 to-transparent"></div>
                                            </div>

                                            {/* 3. Zone circulaire centrale */}
                                            <div className="relative z-10 w-24 h-24 rounded-full bg-white dark:bg-base-100 shadow-inner flex flex-col items-center justify-center p-1 border border-base-200/50 dark:border-base-300">
                                                <span className={`text-2xl font-black italic tracking-tighter leading-none ${config.text}`}>
                                                    {pourcentage}
                                                    <span className="text-[10px] font-bold not-italic opacity-40">%</span>
                                                </span>
                                                <span className={`text-[8px] font-extrabold uppercase tracking-wider mt-0.5 ${config.text}`}>
                                                    Maîtrise
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Détails (Quiz faits & Temps moyen) */}
                                <div className="grid grid-cols-2 gap-3 bg-base-200/50 p-4 rounded-2xl border border-base-200/60">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl ${config.bgLight} ${config.text}`}>
                                            <BookOpen size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase opacity-40 leading-none">Quiz faits</p>
                                            <p className="font-black text-sm text-base-content mt-0.5">{stat.nb_exercices}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 border-l border-base-300/40 pl-3">
                                        <div className={`p-2 rounded-xl ${config.bgLight} ${config.text}`}>
                                            <Clock size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase opacity-40 leading-none">Temps moy.</p>
                                            <p className="font-black text-sm text-base-content mt-0.5">{stat.temps_moyen}s</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div key={index} className={`flex flex-col md:flex-row items-center justify-between p-6 bg-base-100 border border-base-200 rounded-3xl ${config.borderHover} hover:bg-base-200/30 transition-all duration-300 group shadow-sm gap-6`}>
                                <div className="flex items-center gap-6 flex-1 w-full">
                                    {/* Mini cercle pourcentage pour vue liste */}
                                    <div className="relative w-14 h-14 shrink-0">
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="38" fill="none" className="stroke-base-200" strokeWidth="10" />
                                            <circle
                                                cx="50" cy="50" r="38"
                                                fill="none"
                                                className={`stroke-current ${config.text}`}
                                                strokeWidth="10"
                                                strokeLinecap="round"
                                                strokeDasharray={`${pourcentage * 2.38} 238`}
                                                style={{ transition: 'stroke-dasharray 1s ease-out' }}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className={`text-xs font-black italic ${config.text}`}>{pourcentage}%</span>
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${config.badgeBg}`}>
                                            {stat.theme_label}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-base-200 pt-3 md:pt-0">
                                    <div className="text-center">
                                        <p className="text-[10px] font-black opacity-40 uppercase mb-0.5">Exercices</p>
                                        <p className="font-black text-base">{stat.nb_exercices}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black opacity-40 uppercase mb-0.5">Temps moy.</p>
                                        <p className="font-black text-base">{stat.temps_moyen}s</p>
                                    </div>
                                    <div className="text-right min-w-[90px]">
                                        <p className="text-[10px] font-black opacity-40 uppercase mb-0.5">Note Moyenne</p>
                                        <p className={`font-black text-xl italic ${config.text}`}>
                                            {scoreMoyenne}
                                            <span className="text-xs opacity-30 not-italic ml-0.5">/20</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 3. SECTION HISTORIQUE DES SCORES */}
            <div className="bg-base-200/40 rounded-[3rem] p-8 md:p-12 border border-base-200">
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-violet-500/10 rounded-2xl text-violet-600">
                        <HistoryIcon size={24} />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-widest">Dernières Activités</h3>
                </div>

                <div className="grid gap-4">
                    {displayedHistory.map((score, index) => (
                        <div 
                            key={score.id} 
                            className="bg-base-100 border border-base-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center justify-between"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black">
                                    {historique.length - index}
                                </div>
                                <div>
                                    <p className="font-black text-lg">{score.theme}</p>
                                    <p className="text-xs opacity-40 font-bold italic">
                                        {new Date(score.date).toLocaleDateString('fr-FR', {
                                            day: 'numeric', month: 'long', year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className={`text-3xl font-black italic ${
                                score.note >= 15 ? 'text-success' : 
                                score.note >= 10 ? 'text-warning' : 'text-error'
                            }`}>
                                {score.note}
                                <span className="text-xs opacity-30 not-italic ml-1">/20</span>
                            </div>
                        </div>
                    ))}
                </div>

                {historique.length > 5 && (
                    <div className="mt-8 flex justify-center">
                        <button 
                            onClick={() => setShowAllHistory(!showAllHistory)}
                            className="btn btn-ghost rounded-2xl gap-2 font-black opacity-50 hover:opacity-100"
                        >
                            {showAllHistory ? "Voir moins" : "Voir tout l'historique"}
                            <ChevronDown className={`transition-transform duration-300 ${showAllHistory ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PerformanceDetails;










