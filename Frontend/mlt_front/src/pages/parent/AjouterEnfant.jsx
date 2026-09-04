/**
 * COMPOSANT : AjouterEnfant
 * DESCRIPTION : Interface permettant au parent d'inscrire un nouvel enfant.
 * LOGIQUE : Envoie les données au backend et redirige vers la liste des enfants en cas de succès.
 * API : POST '/auth/ajouterEnfant/'
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Baby, BookOpen, TrendingUp, Award, Shield, AlertCircle } from 'lucide-react';
import FormulaireEnfant from '../../composants/UI/FormulaireEnfant';
import api from '../../apiDjango/api';

const AjouterEnfant = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState(null);

    const handleInscriptionEnfant = async (data) => {
        setLoading(true);
        setErrors(null);
        try {
            const response = await api.post('/auth/ajouterEnfant/', data);
            navigate('/parent/enfants', { state: { message: response.data.message } });
        } catch (err) {
            setErrors(err.response?.data || "Une erreur est survenue.");
        } finally {
            setLoading(false);
        }
    };

    // Helper pour afficher les erreurs globales
    const renderGlobalError = () => {
        if (!errors) return null;

        let errorMsg = null;
        if (typeof errors === 'string') {
            errorMsg = errors;
        } else if (errors.detail) {
            errorMsg = errors.detail;
        } else if (errors.non_field_errors) {
            errorMsg = Array.isArray(errors.non_field_errors) ? errors.non_field_errors[0] : errors.non_field_errors;
        }

        if (!errorMsg) return null;

        return (
            <div className="alert alert-error rounded-2xl mb-8 font-bold shadow-md border-none flex gap-3 items-center animate-in fade-in">
                <AlertCircle size={20} className="shrink-0" />
                <span>{errorMsg}</span>
            </div>
        );
    };

    return (
        <div className="space-y-5 font-sans antialiased">

            {/* HEADER COMPACT */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-100 dark:bg-base-100 p-5 rounded-2xl border border-base-300/60 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="btn btn-sm btn-circle btn-ghost border border-base-300/60 hover:bg-primary hover:text-white transition-all shadow-xs shrink-0"
                        title="Retour à la liste"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-extrabold uppercase tracking-wider mb-1">
                            <Baby size={12} /> Espace Famille
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-base-content tracking-tight uppercase leading-none">
                            Inscrire un enfant
                        </h1>
                        <p className="text-base-content/50 text-xs font-medium italic mt-0.5">
                            Créez un compte d'accès et suivez l'évolution de votre nouveau petit mathématicien.
                        </p>
                    </div>
                </div>
            </div>

            {/* ZONE DE CONTENU */}
            <div className="bg-base-100 dark:bg-base-100 p-5 md:p-8 rounded-2xl border border-base-300/60 shadow-sm min-h-[60vh]">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
                    
                    {/* Colonne GAUCHE : Cadre d'incitation adaptatif */}
                    <div className="lg:col-span-5 bg-gradient-to-br from-primary/10 via-base-200/50 to-purple-500/10 text-base-content rounded-2xl p-6 shadow-xs flex flex-col justify-between relative overflow-hidden border border-base-300/60">
                        {/* Effets lumineux subtils */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none"></div>

                        <div className="relative z-10 space-y-6">
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-wider mb-2">
                                    <Baby size={12} className="animate-pulse" /> Espace Famille
                                </div>
                                <h3 className="text-lg md:text-xl font-black leading-tight tracking-tight uppercase">
                                    Rejoignez l'aventure MLT
                                </h3>
                                <p className="text-base-content/70 font-medium text-xs mt-1.5 leading-relaxed">
                                    Offrez à votre enfant un parcours de mathématiques interactif et adapté à son rythme.
                                </p>
                            </div>

                            <div className="space-y-3">
                                {/* Item 1 */}
                                <div className="flex gap-3 items-start p-2.5 rounded-xl bg-base-100/70 dark:bg-base-200/50 border border-base-200/80 dark:border-base-300/40">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        <BookOpen size={16} />
                                    </div>
                                    <div>
                                        <h4 className="text-[11px] font-black uppercase tracking-wide">Quiz Interactifs</h4>
                                        <p className="text-[10px] text-base-content/65 mt-0.5 leading-snug">
                                            Du CP1 au CM2 adaptés au programme scolaire.
                                        </p>
                                    </div>
                                </div>

                                {/* Item 2 */}
                                <div className="flex gap-3 items-start p-2.5 rounded-xl bg-base-100/70 dark:bg-base-200/50 border border-base-200/80 dark:border-base-300/40">
                                    <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                                        <TrendingUp size={16} />
                                    </div>
                                    <div>
                                        <h4 className="text-[11px] font-black uppercase tracking-wide">Suivi de Progression</h4>
                                        <p className="text-[10px] text-base-content/65 mt-0.5 leading-snug">
                                            Scores et maîtrise par thème en temps réel.
                                        </p>
                                    </div>
                                </div>

                                {/* Item 3 */}
                                <div className="flex gap-3 items-start p-2.5 rounded-xl bg-base-100/70 dark:bg-base-200/50 border border-base-200/80 dark:border-base-300/40">
                                    <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                                        <Award size={16} />
                                    </div>
                                    <div>
                                        <h4 className="text-[11px] font-black uppercase tracking-wide">Motivation Vocale</h4>
                                        <p className="text-[10px] text-base-content/65 mt-0.5 leading-snug">
                                            Des voix TTS bienveillantes pour motiver votre enfant.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 pt-4 mt-4 border-t border-base-300/40 flex gap-2 items-center">
                            <Shield className="text-primary shrink-0" size={14} />
                            <div className="text-[9px] text-base-content/50 leading-relaxed font-bold uppercase tracking-wider">
                                Données sécurisées • Aucun e-mail obligatoire
                            </div>
                        </div>
                    </div>

                    {/* Colonne DROITE : Formulaire encadré */}
                    <div className="lg:col-span-7 flex flex-col justify-center w-full max-w-xl mx-auto">
                        
                        {/* Affichage des erreurs globales */}
                        {renderGlobalError()}

                        {/* Conteneur de formulaire stylisé */}
                        <div className="relative bg-base-200/40 dark:bg-base-200/30 border border-base-300/60 p-5 md:p-6 rounded-2xl shadow-xs">
                            {loading && (
                                <div className="absolute inset-0 z-10 bg-base-100/70 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                        <span className="font-bold text-xs uppercase tracking-widest text-primary animate-pulse">Inscription en cours...</span>
                                    </div>
                                </div>
                            )}

                            <FormulaireEnfant
                                onSubmit={handleInscriptionEnfant}
                                loading={loading}
                                backendErrors={errors}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AjouterEnfant;