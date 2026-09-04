import React, { useState, useEffect } from 'react';
import { Plus, Users, ArrowRight, Loader2, UserMinus, AlertCircle, LayoutGrid, List, GraduationCap, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../apiDjango/api.jsx';

// 🦴 SKELETON LOADER COMPONENT (Premium experience)
const StudentCardSkeleton = ({ viewMode }) => {
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
                <div className="w-12 h-12 bg-base-300 rounded-[1.5rem] shrink-0"></div>
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

const MesEleves = () => {
    const navigate = useNavigate();
    const [eleves, setEleves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalSupprimer, setModalSupprimer] = useState(null);
    const [loadingSupprimer, setLoadingSupprimer] = useState(false);
    const [viewMode, setViewMode] = useState('grid');

    // PAGINATION STATES
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // 1. RÉCUPÉRATION DE LA LISTE (délai min. 1.2s pour afficher les skeletons)
    const fetchEleves = async () => {
        try {
            setLoading(true);
            const minDelay = new Promise(resolve => setTimeout(resolve, 1200));
            const [response] = await Promise.all([
                api.get('/enseignant/eleves/'),
                minDelay
            ]);
            setEleves(response.data);
        } catch (err) {
            console.error("Erreur chargement élèves:", err);
            setError("Impossible de charger la liste de vos élèves.");
        } finally {
            setLoading(false);
        }
    };

    const handleSupprimerEleve = async (eleveId) => {
        try {
            setLoadingSupprimer(true);
            await api.delete(`/enseignant/eleves/${eleveId}/supprimer/`);
            setEleves(prev => prev.filter(e => e.id !== eleveId));
            setModalSupprimer(null);
        } catch (err) {
            console.error("Erreur suppression:", err);
            alert("Erreur lors du retrait de l'élève.");
        } finally {
            setLoadingSupprimer(false);
        }
    };

    useEffect(() => { fetchEleves(); }, []);

    // Réinitialiser la page si on change de mode d'affichage ou si la liste change
    useEffect(() => {
        setCurrentPage(1);
    }, [viewMode, eleves.length]);

    // LOGIQUE DE CALCUL DE LA PAGINATION
    const totalPages = Math.ceil(eleves.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedEleves = eleves.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="space-y-5 font-sans antialiased">
            
            {/* HEADER COMPACT */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-100 dark:bg-base-100 p-5 rounded-2xl border border-base-300/60 shadow-sm">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-extrabold uppercase tracking-wider mb-1">
                        <Users size={12} /> Espace Enseignant
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-base-content tracking-tight uppercase">
                        Gestion de mes Élèves
                    </h1>
                    <p className="text-base-content/50 text-xs font-medium italic mt-0.5">
                        Suivez l'évolution globale et les statistiques détaillées de vos élèves.
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    {eleves.length > 0 && (
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
                        onClick={() => navigate('/enseignant/ajouter-eleve')}
                        className="btn btn-primary btn-sm rounded-xl px-4 font-bold text-xs shadow-sm normal-case hover:scale-[1.01] active:scale-95 transition-transform"
                    >
                        <Plus size={16} className="mr-1" /> Ajouter un élève
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
                                <StudentCardSkeleton key={i} viewMode={viewMode} />
                            ))}
                        </div>
                    ) : eleves.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
                            <div className="bg-gradient-to-tr from-primary/10 to-primary/5 w-28 h-28 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <Users size={54} className="text-primary animate-pulse" />
                            </div>
                            <h3 className="text-2xl font-black text-base-content">Votre classe est vide</h3>
                            <p className="text-base-content/60 max-w-sm mx-auto mb-8 font-semibold mt-2">
                                Aucun élève n'est encore inscrit dans votre classe. Créez un profil élève pour commencer à assigner des leçons et des exercices.
                            </p>
                            <button
                                onClick={() => navigate('/enseignant/ajouter-eleve')}
                                className="btn btn-primary rounded-2xl px-8 font-black shadow-lg shadow-primary/25 normal-case"
                            >
                                <Plus size={20} className="mr-1" /> Inscrire mon premier élève
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className={viewMode === 'grid'
                                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500"
                                : "space-y-4 max-w-4xl mx-auto animate-in fade-in duration-500"
                            }>
                                {paginatedEleves.map((eleve) => (
                                    <div
                                        key={eleve.id}
                                        className={`group relative bg-base-100 border border-base-200 transition-all duration-300 ${
                                            viewMode === 'grid'
                                                ? "card rounded-[2.5rem] hover:shadow-2xl hover:-translate-y-1 hover:border-primary/20 p-8 shadow-lg shadow-base-200/50 flex flex-col items-center text-center"
                                                : "flex flex-col sm:flex-row items-center justify-between p-6 rounded-[2rem] hover:shadow-xl hover:border-primary/20 border shadow-md gap-6 w-full"
                                        }`}
                                    >
                                        {/* BOUTON SUPPRIMER (Retirer de la classe) */}
                                        <button
                                            onClick={() => setModalSupprimer(eleve)}
                                            className={`absolute top-4 right-4 p-2 rounded-xl text-error opacity-60 md:opacity-0 group-hover:opacity-100 hover:bg-error/10 hover:text-error transition-all`}
                                            title="Retirer cet élève"
                                        >
                                            <UserMinus size={18} />
                                        </button>

                                        {/* CORPS PRINCIPAL */}
                                        <div className={`flex items-center ${viewMode === 'grid' ? 'flex-col text-center' : 'flex-row text-left'} gap-5 w-full`}>
                                            <div className="w-16 h-16 bg-gradient-to-tr from-primary/80 to-primary text-primary-content rounded-[1.5rem] flex items-center justify-center text-2xl font-black shadow-lg shadow-primary/20 shrink-0 transform group-hover:scale-105 transition-transform duration-300">
                                                {eleve.prenom ? eleve.prenom[0].toUpperCase() : '?'}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-xl font-black text-base-content truncate group-hover:text-primary transition-colors">
                                                    {eleve.prenom} {eleve.nom}
                                                </h3>
                                                <div className={`flex flex-wrap items-center gap-2 mt-2 ${viewMode === 'grid' ? 'justify-center' : ''}`}>
                                                    <span className="text-[10px] font-black uppercase opacity-40 tracking-wider flex items-center gap-1">
                                                        <User size={12} /> {eleve.username}
                                                    </span>
                                                    <div className="badge badge-sm bg-primary/10 border-none text-primary font-black px-2.5 py-2.5 rounded-lg flex items-center gap-1">
                                                        <GraduationCap size={12} /> {eleve.classe}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {viewMode === 'grid' && <div className="divider my-4 opacity-50 w-full"></div>}

                                        {/* BOUTON D'ACTION PRINCIPAL */}
                                        <div className={viewMode === 'grid' ? "w-full" : "shrink-0 w-full sm:w-auto"}>
                                            <button
                                                onClick={() => navigate(`/enseignant/eleves/${eleve.id}/scores`)}
                                                className={`btn ${viewMode === 'grid' ? 'btn-block btn-primary rounded-2xl shadow-md shadow-primary/15' : 'btn-primary px-6 rounded-xl'} font-black text-sm uppercase tracking-wide transition-all`}
                                            >
                                                {viewMode === 'grid' ? 'Voir les scores' : (
                                                    <span className="flex items-center gap-1">
                                                        Voir les scores <ArrowRight size={16} />
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

            {/* Modal Confirmation Retrait Élève */}
            {modalSupprimer && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
                    <div className="bg-base-100 rounded-[2.5rem] p-8 md:p-10 max-w-md w-full shadow-2xl text-center border border-base-200 animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-error/10 text-error rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <UserMinus size={32} />
                        </div>
                        <h3 className="text-2xl font-black mb-2 text-base-content">Retirer l'élève de la classe ?</h3>
                        <p className="opacity-60 font-semibold mb-8 text-sm">
                            Voulez-vous vraiment retirer <b>{modalSupprimer.prenom} {modalSupprimer.nom}</b> ?<br/>
                            L'élève ne fera plus partie de votre classe, mais ses données de compte seront préservées.
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setModalSupprimer(null)} 
                                disabled={loadingSupprimer}
                                className="btn btn-ghost flex-1 rounded-2xl font-black normal-case border border-base-300"
                            >
                                Annuler
                            </button>
                            <button 
                                onClick={() => handleSupprimerEleve(modalSupprimer.id)} 
                                disabled={loadingSupprimer}
                                className="btn btn-error flex-1 rounded-2xl font-black normal-case text-white shadow-lg shadow-error/20"
                            >
                                {loadingSupprimer ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Retirer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MesEleves;