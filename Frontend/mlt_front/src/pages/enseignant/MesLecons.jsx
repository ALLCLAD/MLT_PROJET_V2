import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, ArrowRight, Loader2, Eye, Trash2, AlertCircle, LayoutGrid, List, GraduationCap, Shapes, Calculator, Hash, Ruler, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../apiDjango/api.jsx';

// 🎨 CONFIGURATION DES THÈMES DE LEÇON
export const getThemeConfig = (themeKey) => {
    const themeUpper = (themeKey || '').toUpperCase();
    
    if (themeUpper.includes('GEOMETRIE') || themeUpper.includes('GÉOMÉTRIE')) {
        return {
            label: 'Géométrie',
            icon: Shapes,
            gradient: 'from-purple-500 to-indigo-600',
            bgLight: 'bg-purple-500/10 dark:bg-purple-500/20',
            text: 'text-purple-600 dark:text-purple-400',
            border: 'border-purple-200 dark:border-purple-800/40',
            badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200/60'
        };
    }
    if (themeUpper.includes('CALCUL')) {
        return {
            label: 'Calcul',
            icon: Calculator,
            gradient: 'from-blue-500 to-cyan-500',
            bgLight: 'bg-blue-500/10 dark:bg-blue-500/20',
            text: 'text-blue-600 dark:text-blue-400',
            border: 'border-blue-200 dark:border-blue-800/40',
            badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/60'
        };
    }
    if (themeUpper.includes('DENOMBREMENT') || themeUpper.includes('DÉNOMBREMENT') || themeUpper.includes('NOMBRE')) {
        return {
            label: 'Dénombrement',
            icon: Hash,
            gradient: 'from-emerald-500 to-teal-600',
            bgLight: 'bg-emerald-500/10 dark:bg-emerald-500/20',
            text: 'text-emerald-600 dark:text-emerald-400',
            border: 'border-emerald-200 dark:border-emerald-800/40',
            badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/60'
        };
    }
    if (themeUpper.includes('GRANDEUR') || themeUpper.includes('MESURE')) {
        return {
            label: 'Grandeurs & Mesures',
            icon: Ruler,
            gradient: 'from-amber-500 to-orange-500',
            bgLight: 'bg-amber-500/10 dark:bg-amber-500/20',
            text: 'text-amber-600 dark:text-amber-400',
            border: 'border-amber-200 dark:border-amber-800/40',
            badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/60'
        };
    }

    // Par défaut
    return {
        label: themeKey || 'Général',
        icon: BookOpen,
        gradient: 'from-primary to-secondary',
        bgLight: 'bg-primary/10',
        text: 'text-primary',
        border: 'border-primary/20',
        badgeBg: 'bg-primary/10 text-primary border-primary/20'
    };
};

// 🦴 SKELETON LOADER COMPONENT
const LessonCardSkeleton = ({ viewMode }) => {
    if (viewMode === 'grid') {
        return (
            <div className="rounded-2xl border border-base-300/60 p-5 shadow-xs bg-base-100 dark:bg-base-100 animate-pulse flex flex-col justify-between h-56">
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <div className="w-10 h-10 bg-base-300 rounded-xl"></div>
                        <div className="w-16 h-5 bg-base-300 rounded-full"></div>
                    </div>
                    <div className="w-3/4 h-5 bg-base-300 rounded-lg mb-2"></div>
                    <div className="w-full h-3 bg-base-300 rounded-lg mb-1"></div>
                    <div className="w-2/3 h-3 bg-base-300 rounded-lg"></div>
                </div>
                <div className="w-full h-10 bg-base-300 rounded-xl mt-4"></div>
            </div>
        );
    }
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl border border-base-300/60 shadow-xs bg-base-100 dark:bg-base-100 animate-pulse gap-4 w-full">
            <div className="flex items-center gap-4 w-full">
                <div className="w-10 h-10 bg-base-300 rounded-xl shrink-0"></div>
                <div className="flex-1 space-y-2">
                    <div className="w-48 h-5 bg-base-300 rounded-lg"></div>
                    <div className="w-24 h-3 bg-base-300 rounded-lg"></div>
                </div>
            </div>
            <div className="w-24 h-9 bg-base-300 rounded-xl shrink-0"></div>
        </div>
    );
};

const MesLecons = () => {
    const navigate = useNavigate();
    const [lecons, setLecons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('grid');

    // PAGINATION STATES
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const fetchLecons = async () => {
        try {
            setLoading(true);
            const minDelay = new Promise(resolve => setTimeout(resolve, 800));
            const [response] = await Promise.all([
                api.get('/enseignant/lecons/'),
                minDelay
            ]);
            setLecons(response.data);
        } catch (err) {
            console.error("Erreur chargement leçons:", err);
            setError("Impossible de charger vos leçons.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLecons(); }, []);

    // Réinitialiser la page si on change de mode d'affichage ou si la liste change
    useEffect(() => {
        setCurrentPage(1);
    }, [viewMode, lecons.length]);

    const handleSupprimer = async (id) => {
        const confirmDelete = window.confirm("⚠️ Attention : Voulez-vous vraiment supprimer cette leçon et tous ses exercices ?");
        if (confirmDelete) {
            try {
                await api.delete(`/enseignant/lecons/${id}/`);
                setLecons(prev => prev.filter(l => l.id !== id));
            } catch (err) {
                console.error("Erreur lors de la suppression de la leçon:", err);
                alert("Erreur lors de la suppression.");
            }
        }
    };

    // LOGIQUE DE CALCUL DE LA PAGINATION
    const totalPages = Math.ceil(lecons.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedLecons = lecons.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="space-y-5 font-sans antialiased">
            
            {/* HEADER COMPACT */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-100 dark:bg-base-100 p-5 rounded-2xl border border-base-300/60 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                        <BookOpen size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-base-content tracking-tight uppercase leading-none">
                            Gestion des Leçons
                        </h1>
                        <p className="text-base-content/50 text-xs font-medium italic mt-0.5">
                            Créez, consultez et organisez le contenu pédagogique de votre classe.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    {/* Commutateur Grille / Liste */}
                    <div className="join bg-base-200 p-0.5 rounded-xl border border-base-300/60">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`btn btn-xs join-item border-none ${viewMode === 'grid' ? 'btn-primary shadow-xs' : 'btn-ghost opacity-60'}`}
                            title="Vue en grille"
                        >
                            <LayoutGrid size={14} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`btn btn-xs join-item border-none ${viewMode === 'list' ? 'btn-primary shadow-xs' : 'btn-ghost opacity-60'}`}
                            title="Vue en liste"
                        >
                            <List size={14} />
                        </button>
                    </div>

                    <button
                        onClick={() => navigate('/enseignant/creer-lecon')}
                        className="btn btn-primary btn-sm rounded-xl font-bold gap-1.5 shadow-xs hover:scale-[1.01] active:scale-95 transition-transform"
                    >
                        <Plus size={16} /> Nouvelle leçon
                    </button>
                </div>
            </div>

            {/* CONTENU */}
            <div className="bg-base-100 dark:bg-base-100 p-5 md:p-6 rounded-2xl border border-base-300/60 shadow-sm min-h-[60vh]">
                {error && (
                    <div className="alert alert-error rounded-xl font-bold text-xs p-3 mb-4 shadow-xs">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                {loading ? (
                    <div className={viewMode === 'grid'
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                        : "space-y-3"
                    }>
                        {[...Array(6)].map((_, i) => (
                            <LessonCardSkeleton key={i} viewMode={viewMode} />
                        ))}
                    </div>
                ) : lecons.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-500">
                        <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                            <BookOpen size={36} className="text-primary animate-pulse" />
                        </div>
                        <h3 className="text-lg font-black text-base-content">Aucune leçon disponible</h3>
                        <p className="text-base-content/60 max-w-sm mx-auto mb-6 text-xs font-medium mt-1">
                            Vous n'avez pas encore créé de leçons. Utilisez Mathy pour concevoir votre premier cours interactif !
                        </p>
                        <button
                            onClick={() => navigate('/enseignant/creer-lecon')}
                            className="btn btn-primary btn-sm rounded-xl px-6 font-bold shadow-xs"
                        >
                            <Plus size={16} className="mr-1" /> Créer ma première leçon
                        </button>
                    </div>
                ) : (
                    <>
                        <div className={viewMode === 'grid'
                            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-300"
                            : "space-y-3 animate-in fade-in duration-300"
                        }>
                            {paginatedLecons.map((lecon) => {
                                const themeCfg = getThemeConfig(lecon.theme);
                                const ThemeIcon = themeCfg.icon;

                                return (
                                    <div
                                        key={lecon.id}
                                        className={`group relative bg-base-100 dark:bg-base-100 border border-base-300/60 transition-all duration-300 ${
                                            viewMode === 'grid'
                                                ? "rounded-2xl hover:shadow-md hover:border-primary/30 p-5 shadow-xs flex flex-col justify-between"
                                                : "flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl hover:shadow-md hover:border-primary/30 shadow-xs gap-4 w-full"
                                        }`}
                                    >
                                        {/* CORPS PRINCIPAL */}
                                        <div className={`flex flex-col ${viewMode === 'grid' ? '' : 'sm:flex-row sm:items-center sm:gap-4'} w-full`}>
                                            
                                            {/* EN-TÊTE DE CARTE : ICÔNE DE THÈME + BADGE STATUT */}
                                            <div className="flex items-center justify-between gap-2 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-2 rounded-xl ${themeCfg.bgLight} ${themeCfg.text} shrink-0`}>
                                                        <ThemeIcon size={20} />
                                                    </div>
                                                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${themeCfg.badgeBg}`}>
                                                        {themeCfg.label}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span className={`badge badge-sm font-extrabold text-[9px] uppercase tracking-wider border-none ${
                                                        lecon.statut === 'publie' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                                                    }`}>
                                                        {lecon.statut === 'publie' ? '✓ Publiée' : '✎ Brouillon'}
                                                    </span>

                                                    {/* BOUTON SUPPRIMER */}
                                                    <button
                                                        onClick={() => handleSupprimer(lecon.id)}
                                                        className="p-1.5 rounded-lg text-error/60 hover:text-error hover:bg-error/10 transition-colors"
                                                        title="Supprimer la leçon"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-base font-black text-base-content truncate group-hover:text-primary transition-colors">
                                                    {lecon.titre}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="badge badge-sm bg-primary/10 border-none text-primary font-bold px-2 py-1 rounded-md text-[10px] flex items-center gap-1">
                                                        <GraduationCap size={11} /> {lecon.classe}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {viewMode === 'grid' && (
                                            <p className="text-xs opacity-60 font-medium line-clamp-2 my-3 leading-relaxed">
                                                {lecon.description || "Aucune description de cours fournie."}
                                            </p>
                                        )}

                                        {/* BOUTON D'ACTION PRINCIPAL */}
                                        <div className={viewMode === 'grid' ? "w-full mt-2" : "shrink-0 w-full sm:w-auto"}>
                                            <button
                                                onClick={() => navigate(`/enseignant/lecons/${lecon.id}`)}
                                                className={`btn btn-sm ${viewMode === 'grid' ? 'btn-block btn-primary rounded-xl shadow-xs' : 'btn-primary px-4 rounded-xl'} font-bold text-xs uppercase tracking-wider transition-all`}
                                            >
                                                {viewMode === 'grid' ? 'Détails de la leçon' : (
                                                    <span className="flex items-center gap-1">
                                                        Détails <ArrowRight size={14} />
                                                    </span>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* PAGINATION COMPONENT */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-8 border-t border-base-200 dark:border-base-300/40 pt-4 animate-in fade-in duration-300">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="btn btn-ghost btn-xs rounded-lg font-bold uppercase tracking-wider disabled:opacity-40"
                                >
                                    Précédent
                                </button>
                                
                                {[...Array(totalPages)].map((_, index) => {
                                    const pageNum = index + 1;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`btn btn-xs rounded-lg w-8 h-8 p-0 font-bold ${currentPage === pageNum ? 'btn-primary shadow-xs' : 'btn-ghost'}`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="btn btn-ghost btn-xs rounded-lg font-bold uppercase tracking-wider disabled:opacity-40"
                                >
                                    Suivant
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MesLecons;