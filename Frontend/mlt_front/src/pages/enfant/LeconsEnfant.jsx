import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    BookOpen, 
    ArrowRight, 
    GraduationCap, 
    Clock, 
    Search, 
    LayoutGrid, 
    List,
    ChevronLeft,
    ChevronRight,
    Award,
    Sparkles,
    RefreshCw,
    AlertTriangle
} from 'lucide-react';
import api from '../../apiDjango/api.jsx';

// Skeleton Loader
const GridSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-base-200/50 border border-base-300/60 rounded-2xl p-5 flex flex-col justify-between space-y-4 h-64">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-base-300 rounded-xl" />
                    <div className="space-y-2 flex-1">
                        <div className="w-3/4 h-5 bg-base-300 rounded-lg" />
                        <div className="w-1/2 h-3 bg-base-200 rounded-lg" />
                    </div>
                </div>
                <div className="w-full h-12 bg-base-200 rounded-xl" />
                <div className="w-full h-9 bg-base-300 rounded-xl mt-auto" />
            </div>
        ))}
    </div>
);

const ListSkeleton = () => (
    <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-base-200/50 border border-base-300/60 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-base-300 rounded-xl" />
                    <div className="space-y-2 flex-1">
                        <div className="w-40 h-4 bg-base-300 rounded-lg" />
                        <div className="w-2/3 h-3 bg-base-200 rounded-lg" />
                    </div>
                </div>
                <div className="w-24 h-8 bg-base-300 rounded-xl" />
            </div>
        ))}
    </div>
);

const themeStyles = {
    CALCUL:        { label: 'Calcul', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' },
    GEOMETRIE:     { label: 'Géométrie', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    DENOMBREMENT:  { label: 'Nombres', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    GRANDEURS:     { label: 'Grandeurs', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
};

const LeconsEnfant = () => {
    const navigate = useNavigate();

    const [lecons, setLecons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTheme, setSelectedTheme] = useState('ALL');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const fetchLecons = async () => {
        try {
            setLoading(true);
            const minDelay = new Promise(resolve => setTimeout(resolve, 800));
            const [response] = await Promise.all([
                api.get('/enseignant/enfant/lecons/'),
                minDelay
            ]);
            setLecons(response.data);
        } catch (err) {
            console.error("Erreur récupération leçons:", err);
            setError("Impossible de charger les leçons pour le moment.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLecons();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedTheme, viewMode]);

    const filteredLecons = lecons.filter(lecon => {
        const matchesSearch = lecon.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (lecon.description && lecon.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesTheme = selectedTheme === 'ALL' || lecon.theme === selectedTheme;
        return matchesSearch && matchesTheme;
    });

    const totalPages = Math.max(1, Math.ceil(filteredLecons.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedLecons = filteredLecons.slice(startIndex, startIndex + itemsPerPage);

    const getThemeStyle = (themeKey) => {
        return themeStyles[themeKey] || { label: themeKey, color: 'bg-slate-500/10 text-slate-600 border-slate-500/20' };
    };

    return (
        <div className="space-y-5 font-sans antialiased">
            {/* ── TOP HEADER UNIFORMISÉ COMPACT ── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-100 dark:bg-base-100 p-5 rounded-2xl border border-base-300/60 shadow-sm">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-extrabold uppercase tracking-wider mb-1">
                        <Sparkles size={12} className="animate-pulse" /> Espace Apprentissage
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-base-content uppercase">
                        Mes Leçons
                    </h1>
                    <p className="text-base-content/50 text-xs font-medium italic mt-0.5">
                        Apprends en t'amusant et progresse à ton rythme !
                    </p>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                    {/* Selecteur de vue Grid/List */}
                    <div className="join bg-base-200/70 p-1 rounded-xl border border-base-300/40">
                        <button 
                            onClick={() => setViewMode('grid')} 
                            className={`btn btn-xs join-item border-none rounded-lg ${viewMode === 'grid' ? 'btn-primary text-white shadow-xs' : 'btn-ghost opacity-60'}`}
                        >
                            <LayoutGrid size={14} />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')} 
                            className={`btn btn-xs join-item border-none rounded-lg ${viewMode === 'list' ? 'btn-primary text-white shadow-xs' : 'btn-ghost opacity-60'}`}
                        >
                            <List size={14} />
                        </button>
                    </div>

                    <button
                        onClick={fetchLecons}
                        className="btn btn-sm btn-circle btn-ghost text-primary hover:bg-primary/10 transition-transform active:scale-95"
                        title="Actualiser"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* ── BARRE DE RECHERCHE ET FILTRES ── */}
            <div className="bg-base-100 dark:bg-base-100 p-4 rounded-2xl border border-base-300/60 shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <div className="relative flex-grow">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40 text-base-content" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Rechercher une leçon..."
                        className="input input-sm w-full rounded-xl pl-10 bg-base-200/50 border-base-300/60 text-xs font-bold focus:outline-none focus:border-primary"
                    />
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    <button
                        onClick={() => setSelectedTheme('ALL')}
                        className={`btn btn-xs rounded-xl font-bold uppercase tracking-wider border-none px-3 ${
                            selectedTheme === 'ALL'
                                ? 'btn-primary text-white shadow-xs'
                                : 'bg-base-200/70 text-base-content/70 hover:bg-base-200'
                        }`}
                    >
                        Tous
                    </button>
                    {Object.keys(themeStyles).map(key => (
                        <button
                            key={key}
                            onClick={() => setSelectedTheme(key)}
                            className={`btn btn-xs rounded-xl font-bold uppercase tracking-wider border-none px-3 ${
                                selectedTheme === key
                                    ? 'btn-primary text-white shadow-xs'
                                    : 'bg-base-200/70 text-base-content/70 hover:bg-base-200'
                            }`}
                        >
                            {themeStyles[key].label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── CONTENU DES LEÇONS ── */}
            <div className="bg-base-100 dark:bg-base-100 p-5 rounded-2xl border border-base-300/60 shadow-sm min-h-[400px] flex flex-col justify-between">
                {error ? (
                    <div className="p-4 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-600 font-bold text-xs flex items-center gap-2 max-w-md mx-auto my-10">
                        <AlertTriangle size={16} />
                        <p>{error}</p>
                    </div>
                ) : loading ? (
                    viewMode === 'grid' ? <GridSkeleton /> : <ListSkeleton />
                ) : filteredLecons.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center my-auto">
                        <div className="p-4 bg-base-200/60 rounded-2xl mb-3">
                            <BookOpen size={36} className="opacity-30 text-primary" />
                        </div>
                        <h3 className="text-base font-black uppercase text-base-content">Aucune leçon trouvée</h3>
                        <p className="text-xs text-base-content/50 font-medium italic max-w-xs mt-1">
                            Essaie de modifier tes mots clés ou filtre par un autre thème.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col justify-between flex-1">
                        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-3"}>
                            {paginatedLecons.map((lecon) => {
                                const themeStyle = getThemeStyle(lecon.theme);
                                return (
                                    <div 
                                        key={lecon.id}
                                        onClick={() => navigate(`/enfant/lecons/${lecon.id}`)}
                                        className={`bg-base-200/40 dark:bg-base-200/30 border border-base-200 dark:border-base-300/40 hover:border-primary/40 hover:shadow-md hover:scale-[1.01] transition-all duration-200 cursor-pointer flex items-center group p-4 rounded-xl ${
                                            viewMode === 'grid' 
                                            ? "flex-col text-left justify-between h-56" 
                                            : "flex-row justify-between"
                                        }`}
                                    >
                                        <div className={`flex items-start gap-3 ${viewMode === 'grid' ? "w-full" : "flex-1 min-w-0"}`}>
                                            <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                                <BookOpen size={20} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-sm font-black text-base-content group-hover:text-primary transition-colors truncate">
                                                    {lecon.titre}
                                                </h3>
                                                <p className="text-[11px] text-base-content/60 font-medium italic line-clamp-2 mt-0.5">
                                                    {lecon.description || "Découvre cette nouvelle leçon passionnante !"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className={`flex items-center gap-1.5 flex-wrap ${viewMode === 'grid' ? "w-full my-2" : "mx-4 shrink-0"}`}>
                                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                                {lecon.classe}
                                            </span>
                                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${themeStyle.color}`}>
                                                {themeStyle.label}
                                            </span>
                                            {viewMode === 'grid' && (
                                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-base-300/50 text-base-content/60">
                                                    {lecon.duree || '45 min'}
                                                </span>
                                            )}
                                        </div>

                                        <button className="btn btn-primary btn-xs w-full rounded-lg font-black uppercase tracking-wider text-[10px] shadow-xs group-hover:scale-[1.02] transition-transform flex items-center justify-center gap-1 mt-auto">
                                            <span>Commencer</span>
                                            <ArrowRight size={12} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* PAGINATION */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 pt-6 mt-4 border-t border-base-200 dark:border-base-300/40">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    className="btn btn-xs btn-circle btn-ghost"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                                
                                {Array.from({ length: totalPages }).map((_, i) => {
                                    const page = i + 1;
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`btn btn-xs btn-circle font-black ${
                                                currentPage === page
                                                    ? 'btn-primary text-white'
                                                    : 'btn-ghost text-base-content/70'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}

                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    className="btn btn-xs btn-circle btn-ghost"
                                >
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeconsEnfant;