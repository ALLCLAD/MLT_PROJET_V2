/**
 * COMPOSANT : AperçuStats
 * DESCRIPTION : Centralise les statistiques globales du parent (total enfants, moyenne, activité).
 * API : Consomme '/quiz/stats-global/'
 */

import React, { useState, useEffect } from 'react';
import { Users, Star, Trophy, RefreshCw, Activity, Clock, TrendingUp } from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import api from '../../apiDjango/api';

// 🦴 SKELETON LOADERS
const HeaderSkeleton = () => (
    <div className="p-8 md:p-12 border-b border-base-200 bg-gradient-to-r from-base-100 to-base-200/20 animate-pulse">
        <div className="flex justify-between items-center">
            <div className="space-y-3">
                <div className="w-56 h-8 bg-base-300 rounded-xl"></div>
                <div className="w-40 h-4 bg-base-300 rounded-lg"></div>
            </div>
            <div className="w-12 h-12 bg-base-300 rounded-full"></div>
        </div>
    </div>
);

const StatCardSkeleton = () => (
    <div className="bg-base-100 border border-base-300 rounded-[2.5rem] p-8 animate-pulse">
        <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 bg-base-300 rounded-2xl"></div>
            <div className="w-16 h-6 bg-base-300 rounded-full"></div>
        </div>
        <div className="space-y-3">
            <div className="w-24 h-4 bg-base-300 rounded-lg"></div>
            <div className="w-16 h-10 bg-base-300 rounded-xl"></div>
        </div>
    </div>
);

const ChartSkeleton = () => (
    <div className="bg-base-100 border border-base-300 rounded-[3rem] p-8 animate-pulse">
        <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-base-300 rounded-2xl"></div>
            <div className="space-y-2">
                <div className="w-48 h-6 bg-base-300 rounded-lg"></div>
                <div className="w-32 h-3 bg-base-300 rounded-lg"></div>
            </div>
        </div>
        <div className="w-full h-[350px] bg-base-200 rounded-[2rem]"></div>
    </div>
);

const ActivityCardSkeleton = () => (
    <div className="flex justify-between items-center p-6 bg-base-100 rounded-3xl border border-base-200 shadow-sm animate-pulse">
        <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-base-300 rounded-2xl"></div>
            <div className="space-y-2">
                <div className="w-20 h-4 bg-base-300 rounded-lg"></div>
                <div className="w-36 h-6 bg-base-300 rounded-lg"></div>
            </div>
        </div>
        <div className="w-16 h-8 bg-base-300 rounded-xl"></div>
    </div>
);

const StatCard = ({ title, value, icon, color, label }) => (
    <div className="bg-base-100 p-8 rounded-[2.5rem] border border-base-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 ${color} transition-transform group-hover:scale-150`}></div>
        <div className="flex justify-between items-start mb-6 relative">
            <div className={`p-4 rounded-2xl text-white ${color} shadow-lg shadow-current/20`}>
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

const AperçuStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // Récupération des données statistiques depuis le backend
    const fetchData = async () => {
        try {
            setLoading(true);
            const minDelay = new Promise(resolve => setTimeout(resolve, 1200));
            const [response] = await Promise.all([
                api.get('/quiz/stats-global/'),
                minDelay
            ]);
            setStats(response.data);
        } catch (err) {
            console.error("Erreur stats:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return (
        <div className="bg-base-200/30 min-h-screen py-6 px-2 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-6xl mx-auto bg-base-100 rounded-[3rem] shadow-2xl border border-base-200 min-h-[80vh] flex flex-col overflow-hidden animate-in fade-in duration-500">
                <HeaderSkeleton />
                <div className="p-8 md:p-12 space-y-10 bg-base-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                    </div>
                    <ChartSkeleton />
                    <div className="bg-base-200/40 rounded-[2.5rem] p-8 md:p-10 border border-base-200 space-y-4 animate-pulse">
                        <div className="w-48 h-6 bg-base-300 rounded-lg mb-6"></div>
                        <ActivityCardSkeleton />
                        <ActivityCardSkeleton />
                    </div>
                </div>
            </div>
        </div>
    );

    const childNames = stats?.graphData?.length > 0
        ? Object.keys(stats.graphData[0]).filter(key => key !== 'name')
        : [];

    const colors = ["#6366f1", "#f59e0b", "#10b981", "#ef4444"];

    return (
        /* 1. L'ESPACE DE FOND (Standardisé, identique aux autres pages) */
        <div className="bg-base-200/30 min-h-screen py-6 px-2 sm:px-6 lg:px-8 font-sans">
            
            {/* 2. LE CONTENANT PRINCIPAL (Cadre Premium identique aux autres pages) */}
            <div className="max-w-6xl mx-auto bg-base-100 rounded-[3rem] shadow-2xl border border-base-200 min-h-[80vh] flex flex-col overflow-hidden animate-in fade-in duration-500">

                {/* HEADER AVEC EFFET DE DÉGRADÉ */}
                <div className="p-8 md:p-12 flex justify-between items-center border-b border-base-200 bg-gradient-to-r from-base-100 to-base-200/20">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-wider mb-3">
                            <Activity size={14} className="animate-pulse" /> Espace Parent
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase leading-none text-base-content">Tableau de Bord</h1>
                        <p className="text-base-content/50 font-medium italic mt-2 text-sm flex items-center gap-2">
                            Aperçu de l'activité globale et suivi en temps réel.
                        </p>
                    </div>
                    <button 
                        onClick={fetchData} 
                        className="btn btn-circle btn-ghost text-primary hover:rotate-180 transition-transform duration-500"
                        title="Actualiser les données"
                    >
                        <RefreshCw size={24} />
                    </button>
                </div>

                <div className="p-8 md:p-12 space-y-10 bg-base-100">
                    {/* Cartes de statistiques principales avec dégradés premium */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <StatCard 
                            title="Enfants" 
                            value={stats?.totalEnfants || 0} 
                            icon={<Users />} 
                            color="bg-gradient-to-tr from-blue-500 to-indigo-600" 
                            label="Inscrits" 
                        />
                        <StatCard 
                            title="Moyenne" 
                            value={stats?.moyenneGenerale ? `${stats.moyenneGenerale}/20` : "N/A"} 
                            icon={<Star />} 
                            color="bg-gradient-to-tr from-amber-400 to-orange-500" 
                            label="Globale" 
                        />
                        <StatCard 
                            title="Exercices" 
                            value={stats?.exercicesTermines || 0} 
                            icon={<Trophy />} 
                            color="bg-gradient-to-tr from-emerald-400 to-teal-500" 
                            label="Terminés" 
                        />
                    </div>

                    {/* GRAPHIQUE UNIQUE ADAPTATIF */}
                    <div className="bg-base-100 p-8 rounded-[3rem] border border-base-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="p-3 bg-primary/10 rounded-2xl text-primary"><TrendingUp size={24} /></div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-widest text-base-content">Activité par enfant</h3>
                                <p className="text-xs opacity-40 font-bold italic">Nombre d'exercices réussis cette semaine</p>
                            </div>
                        </div>

                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats?.graphData || []}>
                                    {/* stroke="currentColor" + className="opacity-[0.06]" pour s'adapter au thème sombre/clair */}
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-[0.06]" />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fill: 'currentColor', fontSize: 12, fontWeight: '700', opacity: 0.5}} 
                                        dy={10} 
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fill: 'currentColor', fontSize: 12, fontWeight: '700', opacity: 0.5}} 
                                    />
                                    {/* Tooltip adaptatif utilisant les variables de DaisyUI */}
                                    <Tooltip 
                                        contentStyle={{
                                            borderRadius: '1.25rem', 
                                            border: '1px solid var(--fallback-bc,oklch(var(--bc)/0.1))', 
                                            backgroundColor: 'var(--fallback-b1,oklch(var(--b1)))',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                                            color: 'var(--fallback-bc,oklch(var(--bc)))'
                                        }} 
                                    />
                                    <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', color: 'var(--fallback-bc,oklch(var(--bc)))'}} />
                                    {childNames.map((name, index) => (
                                        <Line
                                            key={name}
                                            type="monotone"
                                            dataKey={name}
                                            stroke={colors[index % colors.length]}
                                            strokeWidth={5}
                                            dot={{ r: 6, fill: colors[index % colors.length], strokeWidth: 3, stroke: 'var(--fallback-b1,oklch(var(--b1)))' }}
                                            activeDot={{ r: 10 }}
                                            animationDuration={1500}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Liste des dernières réussites */}
                    <div className="bg-base-200/40 rounded-[2.5rem] p-8 md:p-10 border border-base-200">
                        <h3 className="text-xl font-black uppercase flex items-center gap-3 mb-8 tracking-widest text-base-content">
                            <Clock size={24} className="text-primary" /> Derniers scores
                        </h3>
                        
                        {!stats?.recentActivity || stats.recentActivity.length === 0 ? (
                            <div className="text-center py-10 bg-base-100 rounded-3xl border border-base-200/60 shadow-inner">
                                <p className="font-bold opacity-30 italic">Aucune activité récente enregistrée pour le moment.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {stats.recentActivity.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center p-6 bg-base-100 rounded-3xl border border-base-200 shadow-sm hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 bg-gradient-to-tr from-primary/80 to-primary text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-md shadow-primary/20 uppercase">
                                                {item.prenom[0]}
                                            </div>
                                            <div>
                                                <p className="font-black text-primary text-xs uppercase">{item.prenom}</p>
                                                <p className="text-lg font-bold italic text-base-content">{item.theme}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-black italic text-primary">{item.score}<span className="text-sm opacity-30 not-italic">/20</span></p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AperçuStats;