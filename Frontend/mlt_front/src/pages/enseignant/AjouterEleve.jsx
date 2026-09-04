import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Loader2, CheckCircle, AlertCircle, ArrowLeft, User, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../apiDjango/api.jsx';

// 🦴 SKELETON LOADER FOR SEARCH RESULTS
const ResultCardSkeleton = () => (
    <div className="flex items-center justify-between p-6 bg-base-100 rounded-[2rem] border border-base-200 shadow-md animate-pulse gap-6">
        <div className="flex items-center gap-5 w-full">
            <div className="w-14 h-14 bg-base-300 rounded-[1.2rem] shrink-0"></div>
            <div className="flex-1 space-y-2">
                <div className="w-48 h-6 bg-base-300 rounded-lg"></div>
                <div className="flex gap-2">
                    <div className="w-20 h-4 bg-base-300 rounded-lg"></div>
                    <div className="w-16 h-4 bg-base-300 rounded-lg"></div>
                </div>
            </div>
        </div>
        <div className="w-24 h-12 bg-base-300 rounded-2xl shrink-0"></div>
    </div>
);

const AjouterEleve = () => {
    const navigate = useNavigate();

    // --- ÉTATS ---
    const [recherche, setRecherche] = useState('');
    const [resultats, setResultats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingAjout, setLoadingAjout] = useState(null);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [classeEnseignant, setClasseEnseignant] = useState('');

    // --- CHARGEMENT INITIAL ---
    useEffect(() => {
        const init = async () => {
            try {
                const profil = await api.get('/auth/user-profile/');
                setClasseEnseignant(profil.data.classe_enseignement);
                await fetchEleves('', profil.data.classe_enseignement);
            } catch (err) {
                console.error("Erreur init:", err);
                setLoading(false);
            }
        };
        init();
    }, []);

    // --- FETCH ÉLÈVES (délai min. 800ms pour skeleton) ---
    const fetchEleves = async (query, classe) => {
        try {
            setLoading(true);
            const minDelay = new Promise(resolve => setTimeout(resolve, 800));
            const [response] = await Promise.all([
                api.get(`/enseignant/rechercher-eleve/?q=${query}&classe=${classe || classeEnseignant}`),
                minDelay
            ]);
            setResultats(response.data);
        } catch (err) {
            console.error("Erreur recherche:", err);
            setResultats([]);
        } finally {
            setLoading(false);
        }
    };

    // --- GESTION RECHERCHE ---
    const handleRecherche = (e) => {
        const valeur = e.target.value;
        setRecherche(valeur);
        setSuccess(null);
        setError(null);
        fetchEleves(valeur, classeEnseignant);
    };

    // --- AJOUT ---
    const handleAjouter = async (eleve) => {
        setLoadingAjout(eleve.id);
        setSuccess(null);
        setError(null);

        try {
            await api.post('/enseignant/eleves/', { eleve_id: eleve.id });
            setSuccess(`${eleve.prenom} ${eleve.nom} a été ajouté à votre classe !`);
            setResultats(resultats.filter(r => r.id !== eleve.id));
        } catch (err) {
            setError(err.response?.data?.message || "Cet élève est déjà dans votre classe.");
            setResultats(resultats.filter(r => r.id !== eleve.id));
        } finally {
            setLoadingAjout(null);
        }
    };

    return (
        <div className="space-y-5 font-sans antialiased">
            
            {/* HEADER COMPACT */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-100 dark:bg-base-100 p-5 rounded-2xl border border-base-300/60 shadow-sm">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/enseignant/eleves')} 
                        className="btn btn-sm btn-circle btn-ghost border border-base-300/60 hover:bg-primary hover:text-white transition-all shadow-xs shrink-0"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-extrabold uppercase tracking-wider mb-1">
                            <UserPlus size={12} /> Inscriptions
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-base-content tracking-tight uppercase leading-none">
                            Ajouter un Élève
                        </h1>
                        <p className="text-base-content/50 text-xs font-medium italic mt-0.5">
                            {classeEnseignant
                                ? `Inscrivez des élèves de la classe ${classeEnseignant}`
                                : 'Chargement des informations de classe...'}
                        </p>
                    </div>
                </div>
            </div>

            {/* ZONE DE CONTENU */}
            <div className="bg-base-100 dark:bg-base-100 p-5 md:p-8 rounded-2xl border border-base-300/60 shadow-sm min-h-[60vh]">
                <div className="max-w-3xl mx-auto space-y-6">
                    
                    {/* Barre de recherche */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 text-base-content" size={18} />
                        <input
                            type="text"
                            value={recherche}
                            onChange={handleRecherche}
                            placeholder={`Rechercher un élève de la classe ${classeEnseignant || '...'}...`}
                            className="input w-full pl-12 rounded-xl bg-base-200/50 border border-base-300/60 focus:border-primary focus:outline-none font-bold h-12 text-sm transition-all"
                        />
                    </div>

                    {/* Notifications */}
                    {success && (
                        <div className="alert bg-success/10 border-none rounded-xl text-success font-bold text-xs p-3 flex gap-2.5 shadow-xs">
                            <CheckCircle size={18} className="shrink-0" />
                            <span>{success}</span>
                        </div>
                    )}

                    {error && (
                        <div className="alert bg-error/10 border-none rounded-xl text-error font-bold text-xs p-3 flex gap-2.5 shadow-xs">
                            <AlertCircle size={18} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Résultats */}
                    <div className="space-y-3">
                        {loading ? (
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <ResultCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : resultats.length > 0 ? (
                            <>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 px-1">
                                    {resultats.length} élève(s) disponible(s) en {classeEnseignant}
                                </p>
                                <div className="grid gap-3">
                                    {resultats.map(eleve => (
                                        <div
                                            key={eleve.id}
                                            className="flex flex-col sm:flex-row items-center justify-between p-4 bg-base-200/40 dark:bg-base-200/30 border border-base-200 dark:border-base-300/40 rounded-xl hover:scale-[1.005] shadow-xs gap-4 transition-all duration-300 group"
                                        >
                                            <div className="flex items-center gap-3.5 w-full">
                                                <div className="w-10 h-10 bg-gradient-to-tr from-primary/80 to-primary text-primary-content rounded-xl flex items-center justify-center text-lg font-black shadow-xs shrink-0">
                                                    {eleve.prenom ? eleve.prenom[0].toUpperCase() : '?'}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-black text-sm text-base-content truncate group-hover:text-primary transition-colors">
                                                        {eleve.prenom} {eleve.nom}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                                        <span className="text-[10px] font-black uppercase opacity-40 tracking-wider flex items-center gap-1">
                                                            <User size={10} /> {eleve.username}
                                                        </span>
                                                        <div className="badge badge-sm bg-primary/10 border-none text-primary font-bold px-2 py-1 rounded-md text-[10px] flex items-center gap-1">
                                                            <GraduationCap size={10} /> {eleve.classe}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleAjouter(eleve)}
                                                disabled={loadingAjout === eleve.id}
                                                className="btn btn-primary btn-sm rounded-xl normal-case font-bold shadow-xs px-4 w-full sm:w-auto hover:scale-[1.01] active:scale-95 transition-transform shrink-0"
                                            >
                                                {loadingAjout === eleve.id ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <span className="flex items-center gap-1 text-xs">
                                                        <UserPlus size={15} /> Ajouter
                                                    </span>
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12 bg-base-200/30 dark:bg-base-200/20 rounded-2xl border border-base-200 dark:border-base-300/40">
                                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search size={24} className="text-primary animate-pulse" />
                                </div>
                                <p className="text-lg font-black text-base-content">Aucun élève disponible</p>
                                <p className="text-base-content/60 max-w-sm mx-auto font-medium mt-1 text-xs leading-relaxed">
                                    Tous les élèves de la classe <span className="text-primary font-bold italic">{classeEnseignant}</span> sont déjà inscrits ou aucun élève ne correspond à votre recherche.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 text-center">
                        <button
                            onClick={() => navigate('/enseignant/eleves')}
                            className="btn btn-ghost btn-sm font-bold text-xs opacity-60 hover:opacity-100"
                        >
                            ← Retour à la liste de mes élèves
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AjouterEleve;