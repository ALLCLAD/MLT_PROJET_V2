import React, { useState, useEffect, useCallback } from 'react';
import {
    ChevronLeft, ChevronRight, Plus, X, Loader2, BookOpen,
    Users, Calendar, Clock, Zap, Eye, CheckCircle2, AlertTriangle, Bell, Info
} from 'lucide-react';
import api from '../../apiDjango/api.jsx';

// =========================================================
// COMPOSANTS SQUELETTES
// =========================================================
const CalendrierSkeleton = () => (
    <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-7 gap-3">
            {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-6 bg-base-300 rounded-lg w-16 mx-auto" />
            ))}
        </div>
        <div className="grid grid-cols-7 gap-3">
            {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-28 bg-base-200/60 rounded-3xl" />
            ))}
        </div>
    </div>
);

// Badge de type d'événement
const TypeBadge = ({ type }) => {
    const styles = {
        cours:   'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
        reunion: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
        autre:   'bg-slate-500/10 text-slate-600 border-slate-500/20',
    };
    const labels = { cours: 'Cours', reunion: 'Réunion', autre: 'Autre' };
    return (
        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${styles[type] || styles.autre}`}>
            {labels[type] || type}
        </span>
    );
};

// =========================================================
// COMPOSANT PRINCIPAL
// =========================================================
const Calendrier = () => {
    const [dateActuelle, setDateActuelle]       = useState(new Date());
    const [evenements, setEvenements]           = useState([]);
    const [lecons, setLecons]                   = useState([]);
    const [loading, setLoading]                 = useState(true);
    const [submitting, setSubmitting]           = useState(false);
    const [showModal, setShowModal]             = useState(false);
    const [jourSelectionne, setJourSelectionne] = useState(null);
    const [toast, setToast]                     = useState(null);
    const [jrDetail, setJrDetail]               = useState(null); // Détail d'un jour sélectionné

    const [nouvelEvenement, setNouvelEvenement] = useState({
        titre:                 '',
        lecon:                 '',
        type_evenement:        '',
        heure:                 '',
        publier_automatiquement: false,
    });

    const mois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const joursNoms = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    // -------------------------------------------------------
    // TOAST helper
    // -------------------------------------------------------
    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    // -------------------------------------------------------
    // CHARGEMENT DES DONNÉES
    // -------------------------------------------------------
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [evtRes, lecRes] = await Promise.all([
                api.get('/enseignant/calendrier/'),
                api.get('/enseignant/lecons/')
            ]);

            // Normalisation des événements
            setEvenements(evtRes.data.map(e => ({
                ...e,
                _dateObj: new Date(e.date + 'T00:00:00'), // évite le bug UTC
                type:     e.type_evenement,
            })));
            setLecons(lecRes.data);
        } catch (err) {
            console.error('Erreur chargement calendrier:', err);
            showToast('Impossible de charger le calendrier.', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // -------------------------------------------------------
    // NAVIGATION MOIS
    // -------------------------------------------------------
    const moisPrecedent = () => setDateActuelle(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    const moisSuivant   = () => setDateActuelle(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

    // -------------------------------------------------------
    // GÉNÉRATION DU CALENDRIER
    // -------------------------------------------------------
    const genererJours = () => {
        const annee     = dateActuelle.getFullYear();
        const moisIndex = dateActuelle.getMonth();
        const premier   = new Date(annee, moisIndex, 1);
        const dernier   = new Date(annee, moisIndex + 1, 0);
        let   debut     = premier.getDay() - 1;
        if (debut < 0) debut = 6;

        const jours = [];
        for (let i = debut; i > 0; i--)
            jours.push({ date: new Date(annee, moisIndex, 1 - i), moisActuel: false });
        for (let i = 1; i <= dernier.getDate(); i++)
            jours.push({ date: new Date(annee, moisIndex, i), moisActuel: true });
        const reste = 42 - jours.length;
        for (let i = 1; i <= reste; i++)
            jours.push({ date: new Date(annee, moisIndex + 1, i), moisActuel: false });

        return jours;
    };

    // -------------------------------------------------------
    // ÉVÉNEMENTS PAR JOUR
    // -------------------------------------------------------
    const getEvenementsJour = (date) =>
        evenements.filter(e => {
            const d = e._dateObj;
            return d.getDate() === date.getDate() &&
                   d.getMonth() === date.getMonth() &&
                   d.getFullYear() === date.getFullYear();
        });

    const estAujourdhui = (date) => {
        const a = new Date();
        return date.getDate() === a.getDate() &&
               date.getMonth() === a.getMonth() &&
               date.getFullYear() === a.getFullYear();
    };

    // -------------------------------------------------------
    // OUVRIR MODAL AJOUT ÉVÉNEMENT
    // -------------------------------------------------------
    const handleClickJour = (date) => {
        setJourSelectionne(date);
        setNouvelEvenement({ titre: '', lecon: '', type_evenement: '', heure: '', publier_automatiquement: false });
        setJrDetail(null);
        setShowModal(true);
    };

    // -------------------------------------------------------
    // OUVRIR DÉTAIL JOUR
    // -------------------------------------------------------
    const handleVoirDetail = (date, e) => {
        e.stopPropagation();
        setJrDetail(date);
    };

    // -------------------------------------------------------
    // AJOUT D'ÉVÉNEMENT
    // -------------------------------------------------------
    const handleAjouterEvenement = async (e) => {
        e.preventDefault();

        if (!nouvelEvenement.type_evenement) {
            showToast("Veuillez sélectionner un type d'événement.", 'error');
            return;
        }
        if (nouvelEvenement.type_evenement === 'cours' && !nouvelEvenement.lecon) {
            showToast("Veuillez sélectionner une leçon.", 'error');
            return;
        }
        if (nouvelEvenement.type_evenement !== 'cours' && !nouvelEvenement.titre.trim()) {
            showToast("Veuillez entrer un titre.", 'error');
            return;
        }
        if (nouvelEvenement.publier_automatiquement && !nouvelEvenement.heure) {
            showToast("Une heure est requise pour la publication automatique.", 'error');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                date:                  jourSelectionne.toISOString().split('T')[0],
                type_evenement:        nouvelEvenement.type_evenement,
                heure:                 nouvelEvenement.heure || null,
                publier_automatiquement: nouvelEvenement.publier_automatiquement,
            };

            if (nouvelEvenement.type_evenement === 'cours') {
                payload.lecon = parseInt(nouvelEvenement.lecon, 10);
            } else {
                payload.titre = nouvelEvenement.titre;
                payload.lecon = null;
            }

            const res = await api.post('/enseignant/calendrier/', payload);

            const newEvt = {
                ...res.data,
                _dateObj: new Date(res.data.date + 'T00:00:00'),
                type:     res.data.type_evenement,
            };
            setEvenements(prev => [...prev, newEvt]);
            setShowModal(false);

            if (nouvelEvenement.publier_automatiquement && nouvelEvenement.heure) {
                showToast(`✅ Publication programmée le ${jourSelectionne.toLocaleDateString('fr-FR')} à ${nouvelEvenement.heure} !`);
            } else {
                showToast('Événement ajouté avec succès !');
            }
        } catch (err) {
            console.error('Erreur ajout événement:', err.response?.data);
            const errMsg = err.response?.data
                ? Object.values(err.response.data).flat().join(' ')
                : 'Erreur serveur';
            showToast(errMsg, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // -------------------------------------------------------
    // SUPPRESSION D'ÉVÉNEMENT
    // -------------------------------------------------------
    const handleSupprimerEvenement = async (id, clickEvt) => {
        if (clickEvt) clickEvt.stopPropagation();
        try {
            await api.delete(`/enseignant/calendrier/${id}/`);
            setEvenements(prev => prev.filter(e => e.id !== id));
            showToast('Événement supprimé.');
        } catch (err) {
            showToast('Erreur lors de la suppression.', 'error');
        }
    };

    // -------------------------------------------------------
    // PUBLICATION MANUELLE MAINTENANT
    // -------------------------------------------------------
    const handlePublierMaintenant = async (leconId) => {
        try {
            await api.patch(`/enseignant/lecons/${leconId}/`, { statut: 'publie' });
            setLecons(prev => prev.map(l => l.id === leconId ? { ...l, statut: 'publie' } : l));
            showToast('✅ Leçon publiée maintenant !');
        } catch {
            showToast('Erreur lors de la publication.', 'error');
        }
    };

    // -------------------------------------------------------
    // COULEUR PAR TYPE
    // -------------------------------------------------------
    const getStyleType = (type) => {
        switch (type) {
            case 'cours':   return 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100/60 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30';
            case 'reunion': return 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100/60 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
            default:        return 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100/60 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800/50';
        }
    };

    const getDotColor = (type) => {
        switch (type) {
            case 'cours':   return 'bg-indigo-500';
            case 'reunion': return 'bg-amber-500';
            default:        return 'bg-slate-400';
        }
    };

    const joursCalendrier = genererJours();
    const today = new Date();

    // Leçons programmées pour l'alerte de rappel
    const leconsProgrammees = lecons.filter(l => l.statut === 'brouillon' && l.date_publication_programmee);

    // Événements d'aujourd'hui
    const evenementsAujourdhui = getEvenementsJour(today);

    return (
        <div className="space-y-5 font-sans antialiased">

            {/* TOAST */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-[200] px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-bold text-sm animate-in slide-in-from-bottom duration-300 ${
                    toast.type === 'error'
                        ? 'bg-error text-error-content'
                        : 'bg-success text-success-content'
                }`}>
                    {toast.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                    {toast.msg}
                </div>
            )}

            {/* HEADER COMPACT */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-100 dark:bg-base-100 p-5 rounded-2xl border border-base-300/60 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-xs shrink-0">
                        <Calendar size={22} />
                    </div>
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-extrabold uppercase tracking-wider mb-1">
                            <Calendar size={12} /> Calendrier
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-base-content tracking-tight uppercase leading-none">
                            Planification
                        </h1>
                        <p className="text-base-content/50 text-xs font-medium italic mt-0.5">
                            Organisez votre emploi du temps et automatisez la diffusion de vos cours.
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => { setJourSelectionne(today); setNouvelEvenement({ titre: '', lecon: '', type_evenement: '', heure: '', publier_automatiquement: false }); setShowModal(true); }}
                    className="btn btn-primary btn-sm rounded-xl px-5 font-bold gap-2 shadow-xs hover:scale-[1.01] active:scale-95 transition-all normal-case text-xs"
                >
                    <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                    Nouvel événement
                </button>
            </div>

            {/* CONTENU : CALENDRIER + SIDEBAR */}
            <div className="bg-base-100 dark:bg-base-100 rounded-2xl border border-base-300/60 shadow-sm overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                    
                    {/* COLONNE CALENDRIER (9/12) */}
                    <div className="lg:col-span-8 p-6 md:p-8 border-r border-base-200 flex flex-col gap-6">
                        
                        {/* NAVIGATION DU CALENDRIER */}
                        <div className="flex items-center justify-between bg-base-200/30 p-3 rounded-3xl border border-base-200/50">
                            <button onClick={moisPrecedent} className="btn btn-ghost btn-circle hover:bg-base-200">
                                <ChevronLeft size={20} />
                            </button>
                            <h2 className="text-xl md:text-2xl font-black tracking-tight text-base-content">
                                {mois[dateActuelle.getMonth()]} {dateActuelle.getFullYear()}
                            </h2>
                            <button onClick={moisSuivant} className="btn btn-ghost btn-circle hover:bg-base-200">
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        {/* GRILLE JOURS DE LA SEMAINE */}
                        <div className="grid grid-cols-7 text-center">
                            {joursNoms.map(j => (
                                <div key={j} className="text-xs font-black uppercase tracking-wider text-base-content/40 py-2">{j}</div>
                            ))}
                        </div>

                        {/* GRILLE DES JOURS */}
                        {loading ? <CalendrierSkeleton /> : (
                            <div className="grid grid-cols-7 gap-2">
                                {joursCalendrier.map((item, index) => {
                                    const evts = getEvenementsJour(item.date);
                                    const auj  = estAujourdhui(item.date);
                                    return (
                                        <div
                                            key={index}
                                            onClick={() => item.moisActuel && handleClickJour(item.date)}
                                            className={`min-h-[115px] p-2.5 rounded-3xl border transition-all flex flex-col justify-between group
                                                ${item.moisActuel ? 'cursor-pointer bg-base-100 hover:border-primary hover:shadow-md' : 'bg-base-200/30 border-transparent opacity-20 cursor-default pointer-events-none'}
                                                ${auj ? 'border-primary ring-2 ring-primary/10 bg-primary/[0.02]' : 'border-base-200'}
                                            `}
                                        >
                                            {/* Header de la case (Numéro du jour) */}
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={`w-8 h-8 flex items-center justify-center rounded-xl text-sm font-black transition-all
                                                    ${auj ? 'bg-primary text-white shadow-md shadow-primary/30'
                                                          : 'group-hover:bg-primary/10 group-hover:text-primary'}
                                                `}>
                                                    {item.date.getDate()}
                                                </span>
                                            </div>

                                            {/* Conteneur d'événements */}
                                            <div className="flex-1 flex flex-col gap-1.5 mt-1 overflow-hidden">
                                                {evts.slice(0, 2).map(evt => (
                                                    <div
                                                        key={evt.id}
                                                        className={`text-[10px] font-bold px-2 py-1.5 rounded-xl border truncate flex items-center justify-between gap-1 transition-all ${getStyleType(evt.type)}`}
                                                    >
                                                        <span className="truncate flex items-center gap-1.5">
                                                            <span className={`w-1.5 h-1.5 rounded-full ${getDotColor(evt.type)}`} />
                                                            {evt.heure && <span className="opacity-70 font-semibold">{evt.heure.slice(0,5)}</span>}
                                                            <span className="truncate font-black">{evt.lecon_titre || evt.titre}</span>
                                                            {evt.publier_automatiquement && <Zap size={10} className="text-amber-500 flex-shrink-0 animate-pulse" />}
                                                        </span>
                                                        <button
                                                            onClick={e => handleSupprimerEvenement(evt.id, e)}
                                                            className="hover:text-error opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                                                            title="Supprimer l'événement"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                                {evts.length > 2 && (
                                                    <button
                                                        onClick={e => handleVoirDetail(item.date, e)}
                                                        className="text-[9.5px] font-black text-primary hover:underline px-1 py-0.5 text-left"
                                                    >
                                                        +{evts.length - 2} autre(s)
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* COLONNE SIDEBAR (4/12) */}
                    <div className="lg:col-span-4 p-6 md:p-8 bg-base-200/10 flex flex-col gap-6">
                        
                        {/* ALERTE PUBLICATIONS PROGRAMMÉES */}
                        {leconsProgrammees.length > 0 ? (
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-5 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-2xl bg-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-600">
                                        <Bell size={18} className="animate-bounce" />
                                    </div>
                                    <h3 className="font-extrabold text-amber-800 text-sm">
                                        Publication programmée
                                    </h3>
                                </div>
                                <div className="space-y-2">
                                    {leconsProgrammees.map(l => (
                                        <div key={l.id} className="bg-white border border-amber-200 rounded-2xl p-3 flex flex-col gap-2 shadow-sm">
                                            <div className="flex justify-between items-start gap-2">
                                                <span className="font-bold text-xs text-amber-900 truncate max-w-[150px]">{l.titre}</span>
                                                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-black">
                                                    {l.classe}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] opacity-75 font-semibold text-amber-800">
                                                <span className="flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {new Date(l.date_publication_programmee).toLocaleString('fr-FR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}
                                                </span>
                                                <button
                                                    onClick={() => handlePublierMaintenant(l.id)}
                                                    className="btn btn-warning btn-xs rounded-xl normal-case font-black gap-1"
                                                >
                                                    <Zap size={10} /> Publier
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-base-200/50 rounded-3xl p-5 border border-base-200 flex items-center gap-3 text-base-content/60">
                                <Info size={18} />
                                <span className="text-xs font-bold">Aucune leçon en attente de publication programmée.</span>
                            </div>
                        )}

                        {/* SECTION : AUJOURD'HUI */}
                        <div className="bg-base-100 border border-base-200 rounded-3xl p-5 space-y-4">
                            <h3 className="text-sm font-black uppercase tracking-wider text-base-content/40">
                                Aujourd'hui — {today.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                            </h3>
                            {evenementsAujourdhui.length > 0 ? (
                                <div className="space-y-2.5">
                                    {evenementsAujourdhui.map(evt => (
                                        <div key={evt.id} className={`p-3 rounded-2xl border flex items-center justify-between ${getStyleType(evt.type)}`}>
                                            <div className="min-w-0">
                                                <p className="font-extrabold text-xs truncate">{evt.lecon_titre || evt.titre}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {evt.heure && (
                                                        <span className="text-[10px] opacity-75 font-semibold flex items-center gap-1">
                                                            <Clock size={10} /> {evt.heure.slice(0,5)}
                                                        </span>
                                                    )}
                                                    <TypeBadge type={evt.type} />
                                                </div>
                                            </div>
                                            <button 
                                                onClick={e => handleSupprimerEvenement(evt.id, e)}
                                                className="btn btn-ghost btn-xs btn-circle text-error hover:bg-error/10"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs opacity-50 italic font-semibold">Aucun événement prévu pour aujourd'hui.</p>
                            )}
                        </div>

                        {/* SECTION : LÉGENDE */}
                        <div className="bg-base-100 border border-base-200 rounded-3xl p-5 space-y-4 mt-auto">
                            <h3 className="text-sm font-black uppercase tracking-wider text-base-content/40">Légende</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { color: 'bg-indigo-500', label: 'Cours' },
                                    { color: 'bg-amber-500', label: 'Réunion' },
                                    { color: 'bg-slate-400', label: 'Autre' },
                                    { color: 'bg-amber-500', icon: <Zap size={10} className="text-white" />, label: 'Auto Publiée' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-base-200/30 p-2.5 rounded-2xl border border-base-200/50">
                                        <div className={`w-5 h-5 rounded-lg ${item.color} flex items-center justify-center flex-shrink-0`}>
                                            {item.icon}
                                        </div>
                                        <span className="text-[10px] font-extrabold opacity-75">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                </div>

            </div>

            {/* ================================================
                MODAL DÉTAIL JOUR
                ================================================ */}
            {jrDetail && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setJrDetail(null)}>
                    <div className="bg-base-100 rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-black">Événements</h3>
                                <p className="text-sm opacity-50 font-bold mt-0.5">
                                    {jrDetail.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </p>
                            </div>
                            <button onClick={() => setJrDetail(null)} className="btn btn-ghost btn-circle hover:bg-error/10 hover:text-error">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                            {getEvenementsJour(jrDetail).map(evt => (
                                <div key={evt.id} className={`flex items-center justify-between p-3.5 rounded-2xl border ${getStyleType(evt.type)}`}>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-extrabold text-sm truncate">{evt.lecon_titre || evt.titre}</div>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            {evt.heure && <span className="text-xs opacity-75 flex items-center gap-1 font-semibold"><Clock size={10} />{evt.heure.slice(0,5)}</span>}
                                            <TypeBadge type={evt.type} />
                                            {evt.publier_automatiquement && (
                                                <span className="text-[9px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-0.5">
                                                    <Zap size={8} />AUTO
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button onClick={e => { handleSupprimerEvenement(evt.id, e); }} className="btn btn-ghost btn-xs btn-circle hover:bg-error/10 hover:text-error ml-2">
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => { handleClickJour(jrDetail); setJrDetail(null); }}
                            className="btn btn-primary w-full rounded-2xl mt-5 font-black normal-case py-3 h-auto"
                        >
                            <Plus size={16} /> Ajouter un événement
                        </button>
                    </div>
                </div>
            )}

            {/* ================================================
                MODAL AJOUT ÉVÉNEMENT
                ================================================ */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-base-100 rounded-[3rem] p-8 md:p-10 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">

                        {/* Header modal */}
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-black">Nouvel événement</h3>
                                {jourSelectionne && (
                                    <p className="text-sm opacity-50 font-bold mt-1">
                                        {jourSelectionne.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </p>
                                )}
                            </div>
                            <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-circle hover:bg-error/10 hover:text-error">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAjouterEvenement} className="flex flex-col gap-5">

                            {/* TYPE D'ÉVÉNEMENT */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black uppercase tracking-widest opacity-40">
                                    Type d'événement *
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { value: 'cours',   label: 'Cours',   icon: <BookOpen size={18} /> },
                                        { value: 'reunion', label: 'Réunion', icon: <Users size={18} /> },
                                        { value: 'autre',   label: 'Autre',   icon: <Calendar size={18} /> },
                                    ].map(type => (
                                        <label
                                            key={type.value}
                                            className={`flex flex-col items-center gap-2 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                                                nouvelEvenement.type_evenement === type.value
                                                    ? 'border-primary bg-primary/5 text-primary'
                                                    : 'border-base-200 hover:border-primary/30'
                                            }`}
                                        >
                                            <input
                                                type="radio" name="type_evenement" value={type.value} className="hidden"
                                                checked={nouvelEvenement.type_evenement === type.value}
                                                onChange={e => setNouvelEvenement(prev => ({ ...prev, type_evenement: e.target.value, titre: '', lecon: '', publier_automatiquement: false }))}
                                            />
                                            {type.icon}
                                            <span className="text-xs font-black">{type.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* SI TYPE = COURS : Sélectionner une leçon */}
                            {nouvelEvenement.type_evenement === 'cours' && (
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-black uppercase tracking-widest opacity-40">
                                        Sélectionner une leçon *
                                    </label>
                                    {lecons.length === 0 ? (
                                        <p className="text-sm opacity-50 italic p-4 bg-base-200/50 rounded-2xl">
                                            Aucune leçon disponible. Veuillez d'abord en créer une.
                                        </p>
                                    ) : (
                                        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                                            {lecons.map(l => {
                                                const isSelected = String(nouvelEvenement.lecon) === String(l.id);
                                                return (
                                                    <div
                                                        key={l.id}
                                                        onClick={() => setNouvelEvenement(prev => ({ ...prev, lecon: String(l.id) }))}
                                                        className={`flex justify-between items-center p-3 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[0.99] ${
                                                            isSelected
                                                                ? 'border-primary bg-primary/5 text-primary shadow-sm'
                                                                : 'border-base-200 hover:border-primary/20 bg-base-200/20'
                                                        }`}
                                                    >
                                                        <div className="min-w-0 pr-2">
                                                            <p className="font-extrabold text-xs truncate text-base-content">{l.titre}</p>
                                                            <span className="text-[9px] font-black uppercase tracking-wider text-base-content/50 mt-1 block">
                                                                {l.classe} • {l.theme}
                                                            </span>
                                                        </div>
                                                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                                            l.statut === 'publie'
                                                                ? 'bg-success/15 text-success border-success/20'
                                                                : 'bg-amber-500/15 text-amber-600 border-amber-500/20'
                                                        }`}>
                                                            {l.statut === 'publie' ? 'Publiée' : 'Brouillon'}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* SI TYPE ≠ COURS : Titre libre */}
                            {nouvelEvenement.type_evenement && nouvelEvenement.type_evenement !== 'cours' && (
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-black uppercase tracking-widest opacity-40">
                                        Titre de l'événement *
                                    </label>
                                    <input
                                        type="text"
                                        value={nouvelEvenement.titre}
                                        onChange={e => setNouvelEvenement(prev => ({ ...prev, titre: e.target.value }))}
                                        placeholder="Ex: Réunion parents-professeurs"
                                        className="input input-bordered w-full rounded-2xl bg-base-200/50 border-none focus:ring-2 ring-primary font-medium h-12"
                                    />
                                </div>
                            )}

                            {/* HEURE */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black uppercase tracking-widest opacity-40">
                                    Heure {nouvelEvenement.publier_automatiquement && <span className="text-amber-500">*</span>}
                                </label>
                                <div className="relative">
                                    <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
                                    <input
                                        type="time"
                                        value={nouvelEvenement.heure}
                                        onChange={e => setNouvelEvenement(prev => ({ ...prev, heure: e.target.value }))}
                                        className="input input-bordered w-full rounded-2xl bg-base-200/50 border-none focus:ring-2 ring-primary font-medium h-12 pl-10"
                                    />
                                </div>
                            </div>

                            {/* PUBLICATION AUTOMATIQUE (uniquement pour les cours avec une leçon en brouillon) */}
                            {nouvelEvenement.type_evenement === 'cours' && nouvelEvenement.lecon && (() => {
                                const leconChoisie = lecons.find(l => l.id === parseInt(nouvelEvenement.lecon));
                                return leconChoisie?.statut === 'brouillon' ? (
                                    <label className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                        nouvelEvenement.publier_automatiquement
                                            ? 'border-amber-400 bg-amber-50'
                                            : 'border-base-200 hover:border-amber-300 bg-base-200/40'
                                    }`}>
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-warning mt-0.5"
                                            checked={nouvelEvenement.publier_automatiquement}
                                            onChange={e => setNouvelEvenement(prev => ({ ...prev, publier_automatiquement: e.target.checked }))}
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Zap size={16} className="text-amber-500" />
                                                <span className="font-black text-sm text-amber-800">Publication automatique</span>
                                            </div>
                                            <p className="text-xs opacity-60 mt-1 leading-relaxed">
                                                La leçon sera automatiquement publiée aux élèves à la date et l'heure sélectionnées. L'heure est requise.
                                            </p>
                                        </div>
                                    </label>
                                ) : leconChoisie?.statut === 'publie' ? (
                                    <div className="flex items-center gap-3 p-3 bg-success/10 rounded-2xl border border-success/20">
                                        <Eye size={16} className="text-success" />
                                        <span className="text-xs font-bold text-success">Cette leçon est déjà publiée aux élèves.</span>
                                    </div>
                                ) : null;
                                // return null
                            })()}

                            {/* BOUTONS */}
                            <div className="flex gap-3 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn btn-ghost flex-1 rounded-2xl normal-case font-black opacity-50 hover:opacity-100"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn btn-primary flex-1 rounded-2xl normal-case font-black shadow-lg shadow-primary/20"
                                >
                                    {submitting ? <Loader2 size={18} className="animate-spin" /> : (
                                        nouvelEvenement.publier_automatiquement
                                            ? <><Zap size={16} /> Programmer</>
                                            : <><Plus size={16} /> Ajouter</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Calendrier;