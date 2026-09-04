/**
 * COMPOSANT : EnfantsPage
 * DESCRIPTION : Affiche la liste des enfants et permet la gestion (vue/suppression).
 * LOGIQUE :
 * - GET /auth/ajouterEnfant/ -> Liste des enfants liés au parent
 * - DELETE /auth/ajouterEnfant/${id}/ -> Suppression définitive du compte enfant
 */

import React, { useState, useEffect } from 'react';
import { Plus, Baby, ArrowRight, Loader2, AlertCircle, LayoutGrid, List, Trash2, GraduationCap, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../apiDjango/api.jsx';

// 🦴 SKELETON LOADER COMPONENT (Premium experience)
const ChildCardSkeleton = ({ viewMode }) => {
    if (viewMode === 'grid') {
        return (
            <div className="card rounded-[2.5rem] border border-base-300 p-8 shadow-md bg-base-100 animate-pulse">
                <div className="flex flex-col items-center gap-5 w-full">
                    {/* Avatar Skeleton */}
                    <div className="w-16 h-16 bg-base-300 rounded-[1.5rem]"></div>
                    {/* Name Skeleton */}
                    <div className="w-3/4 h-6 bg-base-300 rounded-lg"></div>
                    {/* Metadata Badges Skeleton */}
                    <div className="flex gap-2 w-full justify-center">
                        <div className="w-20 h-4 bg-base-300 rounded-lg"></div>
                        <div className="w-16 h-4 bg-base-300 rounded-lg"></div>
                    </div>
                </div>
                <div className="divider my-4 opacity-50"></div>
                {/* Button Skeleton */}
                <div className="w-full h-12 bg-base-300 rounded-2xl"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-[2rem] border border-base-300 shadow-md bg-base-100 animate-pulse gap-6 w-full">
            <div className="flex items-center gap-5 w-full">
                {/* Avatar Skeleton */}
                <div className="w-16 h-16 bg-base-300 rounded-[1.5rem] shrink-0"></div>
                <div className="flex-1 space-y-2">
                    {/* Name Skeleton */}
                    <div className="w-48 h-6 bg-base-300 rounded-lg"></div>
                    {/* Metadata Skeleton */}
                    <div className="flex gap-2">
                        <div className="w-20 h-4 bg-base-300 rounded-lg"></div>
                        <div className="w-16 h-4 bg-base-300 rounded-lg"></div>
                    </div>
                </div>
            </div>
            {/* Button Skeleton */}
            <div className="w-full sm:w-36 h-10 bg-base-300 rounded-xl shrink-0"></div>
        </div>
    );
};

const EnfantsPage = () => {
    const navigate = useNavigate();
    const [enfants, setEnfants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [deletingId, setDeletingId] = useState(null);

    // PAGINATION STATES
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // 1. RÉCUPÉRATION DE LA LISTE (délai min. 3s pour afficher les skeletons)
    const fetchEnfants = async () => {
        try {
            setLoading(true);
            const minDelay = new Promise(resolve => setTimeout(resolve, 1200));
            const [response] = await Promise.all([
                api.get('/auth/ajouterEnfant/'),
                minDelay
            ]);
            setEnfants(response.data);
        } catch (err) {
            console.error("Erreur chargement enfants:", err);
            setError("Impossible de charger la liste de vos enfants.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEnfants(); }, []);

    // Réinitialiser la page si on change de mode d'affichage ou si la liste change
    useEffect(() => {
        setCurrentPage(1);
    }, [viewMode, enfants.length]);

    // 2. LOGIQUE DE SUPPRESSION
    const handleDeleteEnfant = async (e, id, prenom) => {
        e.stopPropagation();

        const confirmDelete = window.confirm(
            `⚠️ Attention : Voulez-vous vraiment supprimer le compte de ${prenom} ? \n\nCette action supprimera définitivement ses progrès et ses accès.`
        );

        if (confirmDelete) {
            try {
                setDeletingId(id);
                await api.delete(`/auth/ajouterEnfant/${id}/`);
                setEnfants(prev => prev.filter(enfant => enfant.id !== id));
            } catch (err) {
                console.error("Erreur suppression:", err);
                alert("Erreur lors de la suppression du compte.");
            } finally {
                setDeletingId(null);
            }
        }
    };

    // LOGIQUE DE CALCUL DE LA PAGINATION
    const totalPages = Math.ceil(enfants.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedEnfants = enfants.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="space-y-5 font-sans antialiased">
            
            {/* HEADER COMPACT */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-100 dark:bg-base-100 p-5 rounded-2xl border border-base-300/60 shadow-sm">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-extrabold uppercase tracking-wider mb-1">
                        <Baby size={12} /> Espace Famille
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-base-content tracking-tight uppercase">
                        Suivi de mes Enfants
                    </h1>
                    <p className="text-base-content/50 text-xs font-medium italic mt-0.5">
                        Gérez les comptes d'accès et suivez l'évolution de vos petits mathématiciens.
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    {enfants.length > 0 && (
                        <div className="join bg-base-200 p-0.5 rounded-xl flex border border-base-300/60">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`btn btn-xs join-item border-none rounded-lg ${viewMode === 'grid' ? 'btn-primary shadow-xs' : 'btn-ghost opacity-60'}`}
                            >
                                <LayoutGrid size={14} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`btn btn-xs join-item border-none rounded-lg ${viewMode === 'list' ? 'btn-primary shadow-xs' : 'btn-ghost opacity-60'}`}
                            >
                                <List size={14} />
                            </button>
                        </div>
                    )}
                    <button
                        onClick={() => navigate('/parent/ajouter-enfant')}
                        className="btn btn-primary btn-sm rounded-xl px-4 font-bold text-xs shadow-sm normal-case hover:scale-[1.01] active:scale-95 transition-transform"
                    >
                        <Plus size={16} className="mr-1" /> Inscrire un enfant
                    </button>
                </div>
            </div>

            {/* ZONE DE CONTENU */}
            <div className="bg-base-100 dark:bg-base-100 p-5 rounded-2xl border border-base-300/60 shadow-sm min-h-[60vh]">
                    {error && (
                        <div className="alert alert-error rounded-2xl font-bold mb-8 shadow-md border-none">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    {loading ? (
                        <div className={viewMode === 'grid'
                            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                            : "space-y-4 max-w-4xl mx-auto"
                        }>
                            {[...Array(3)].map((_, i) => (
                                <ChildCardSkeleton key={i} viewMode={viewMode} />
                            ))}
                        </div>
                    ) : enfants.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
                            <div className="bg-gradient-to-tr from-primary/10 to-primary/5 w-28 h-28 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <Baby size={54} className="text-primary animate-pulse" />
                            </div>
                            <h3 className="text-2xl font-black text-base-content">Votre famille est vide</h3>
                            <p className="text-base-content/60 max-w-sm mx-auto mb-8 font-semibold mt-2">
                                Aucun enfant n'est inscrit sous votre responsabilité. Créez un profil pour commencer les activités mathématiques !
                            </p>
                            <button
                                onClick={() => navigate('/parent/ajouter-enfant')}
                                className="btn btn-primary rounded-2xl px-8 font-black shadow-lg shadow-primary/25 normal-case"
                            >
                                <Plus size={20} className="mr-1" /> Inscrire mon premier enfant
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className={viewMode === 'grid'
                                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500"
                                : "space-y-4 max-w-4xl mx-auto animate-in fade-in duration-500"
                            }>
                                {paginatedEnfants.map((enfant) => (
                                    <div
                                        key={enfant.id}
                                        className={`group relative bg-base-100 border border-base-200 transition-all duration-300 ${
                                            viewMode === 'grid'
                                                ? "card rounded-[2.5rem] hover:shadow-2xl hover:-translate-y-1 hover:border-primary/20 p-8 shadow-lg shadow-base-200/50"
                                                : "flex flex-col sm:flex-row items-center justify-between p-6 rounded-[2rem] hover:shadow-xl hover:border-primary/20 border shadow-md gap-6"
                                        }`}
                                    >
                                        {/* BOUTON SUPPRIMER */}
                                        <button
                                            onClick={(e) => handleDeleteEnfant(e, enfant.id, enfant.prenom)}
                                            disabled={deletingId === enfant.id}
                                            className={`absolute top-4 right-4 p-2 rounded-xl text-error opacity-60 md:opacity-0 group-hover:opacity-100 hover:bg-error/10 hover:text-error transition-all ${deletingId === enfant.id ? 'opacity-100' : ''}`}
                                            title="Supprimer définitivement"
                                        >
                                            {deletingId === enfant.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                        </button>

                                        {/* CORPS PRINCIPAL */}
                                        <div className={`flex items-center ${viewMode === 'grid' ? 'flex-col text-center' : 'flex-row text-left'} gap-5 w-full`}>
                                            <div className="w-16 h-16 bg-gradient-to-tr from-primary/80 to-primary text-primary-content rounded-[1.5rem] flex items-center justify-center text-2xl font-black shadow-lg shadow-primary/20 shrink-0 transform group-hover:scale-105 transition-transform duration-300">
                                                {enfant.prenom ? enfant.prenom[0].toUpperCase() : '?'}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-xl font-black text-base-content truncate group-hover:text-primary transition-colors">
                                                    {enfant.prenom} {enfant.nom}
                                                </h3>
                                                <div className={`flex flex-wrap items-center gap-2 mt-2 ${viewMode === 'grid' ? 'justify-center' : ''}`}>
                                                    <span className="text-[10px] font-black uppercase opacity-40 tracking-wider flex items-center gap-1">
                                                        <User size={12} /> {enfant.username}
                                                    </span>
                                                    <div className="badge badge-sm bg-primary/10 border-none text-primary font-black px-2.5 py-2.5 rounded-lg flex items-center gap-1">
                                                        <GraduationCap size={12} /> {enfant.classe}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {viewMode === 'grid' && <div className="divider my-4 opacity-50"></div>}

                                        {/* BOUTON D'ACTION PRINCIPAL */}
                                        <div className={viewMode === 'grid' ? "w-full" : "shrink-0 w-full sm:w-auto"}>
                                            <button
                                                onClick={() => navigate(`/parent/enfants/${enfant.id}`)}
                                                className={`btn ${viewMode === 'grid' ? 'btn-block btn-primary rounded-2xl shadow-md shadow-primary/15' : 'btn-primary px-6 rounded-xl'} font-black text-sm uppercase tracking-wide transition-all`}
                                            >
                                                {viewMode === 'grid' ? 'Suivre les progrès' : (
                                                    <span className="flex items-center gap-1">
                                                        Suivre les progrès <ArrowRight size={16} />
                                                    </span>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* PAGINATION COMPONENT */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 mt-12 border-t border-base-200 pt-8 animate-in fade-in duration-500">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="btn btn-ghost btn-sm rounded-xl font-black uppercase tracking-wider disabled:opacity-40"
                                    >
                                        Précédent
                                    </button>
                                    
                                    {[...Array(totalPages)].map((_, index) => {
                                        const pageNum = index + 1;
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`btn btn-sm rounded-xl w-10 h-10 p-0 font-black ${currentPage === pageNum ? 'btn-primary shadow-md' : 'btn-ghost'}`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="btn btn-ghost btn-sm rounded-xl font-black uppercase tracking-wider disabled:opacity-40"
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

export default EnfantsPage;