import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ClipboardList, Loader2, Plus, X, Sparkles, CheckCircle, ArrowLeft, AlertCircle, HelpCircle } from 'lucide-react';
import api from '../../apiDjango/api.jsx';
import { genererReponseExercice } from '../../apiDjango/aiService';

const AjouterExercice = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        question: '',
        reponse_correcte: '',
        mauvaises_reponses: '',
        explication: '',
        ordre: 0,
    });

    const [loading, setLoading] = useState(false);
    const [loadingIA, setLoadingIA] = useState(false);
    const [error, setError] = useState(null);
    const [successIA, setSuccessIA] = useState(false);
    const [mauvaisesList, setMauvaisesList] = useState([]);
    const [mauvaiseTemp, setMauvaiseTemp] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddMauvaise = () => {
        if (mauvaiseTemp.trim()) {
            // Éviter les doublons
            if (!mauvaisesList.includes(mauvaiseTemp.trim())) {
                setMauvaisesList([...mauvaisesList, mauvaiseTemp.trim()]);
            }
            setMauvaiseTemp('');
        }
    };

    const handleRemoveMauvaise = (index) => {
        setMauvaisesList(mauvaisesList.filter((_, i) => i !== index));
    };

    const handleGenererIA = async () => {
        if (!formData.question || !formData.reponse_correcte) {
            alert("Veuillez d'abord saisir la question et la réponse correcte.");
            return;
        }
        setLoadingIA(true);
        setSuccessIA(false);
        setError(null);
        try {
            const suggestions = await genererReponseExercice(formData.question, formData.reponse_correcte);
            setMauvaisesList(suggestions.mauvaises_reponses);
            setFormData(prev => ({ ...prev, explication: suggestions.explication }));
            setSuccessIA(true);
            setTimeout(() => setSuccessIA(false), 3000);
        } catch (err) {
            console.error("Erreur IA:", err);
            setError("L'IA n'a pas pu générer les suggestions.");
        } finally {
            setLoadingIA(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (mauvaisesList.length === 0) {
            alert("Veuillez ajouter au moins une mauvaise réponse.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const dataToSend = {
                ...formData,
                lecon: id,
                mauvaises_reponses: mauvaisesList.join('|')
            };
            await api.post(`/enseignant/lecons/${id}/exercices/ajouter/`, dataToSend);
            navigate(`/enseignant/lecons/${id}/exercices`);
        } catch (err) {
            console.error("Erreur ajout exercice:", err);
            setError("Une erreur est survenue lors de la création de l'exercice.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-5 font-sans antialiased">
            
            {/* HEADER COMPACT */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-100 dark:bg-base-100 p-5 rounded-2xl border border-base-300/60 shadow-sm">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(`/enseignant/lecons/${id}/exercices`)} 
                        className="btn btn-sm btn-circle btn-ghost border border-base-300/60 hover:bg-primary hover:text-white transition-all shadow-xs shrink-0"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-extrabold uppercase tracking-wider mb-1">
                            <Plus size={12} /> Nouvel exercice
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-base-content tracking-tight uppercase leading-none">
                            Nouveau Défi
                        </h1>
                        <p className="text-base-content/50 text-xs font-medium italic mt-0.5">
                            Créez une question et laissez l'IA vous proposer des réponses erronées cohérentes.
                        </p>
                    </div>
                </div>
            </div>

            {/* CONTENU */}
            <div className="bg-base-100 dark:bg-base-100 p-5 md:p-8 rounded-2xl border border-base-300/60 shadow-sm min-h-[60vh]">
                <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
                    
                    {error && (
                        <div className="alert bg-error/10 border-none rounded-xl text-error font-bold text-xs p-3 flex gap-2.5 shadow-xs">
                            <AlertCircle size={18} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {successIA && (
                        <div className="alert bg-success/10 border-none rounded-xl text-success font-bold text-xs p-3 flex gap-2.5 shadow-xs">
                            <CheckCircle size={18} className="shrink-0" />
                            <span>Suggestions d'erreurs et explications générées avec succès !</span>
                        </div>
                    )}

                    {/* QUESTION */}
                    <div className="space-y-2">
                        <label className="block font-bold text-sm text-base-content">Question *</label>
                        <textarea 
                            name="question" 
                            value={formData.question} 
                            onChange={handleChange} 
                            className="textarea w-full rounded-xl bg-base-200/50 border border-base-300/60 focus:border-primary focus:outline-none font-medium text-sm h-28 p-4 transition-all leading-relaxed" 
                            placeholder="Ex: Si j'ai 4 pommes et que j'en mange 1, quelle fraction de pommes reste-t-il ?" 
                            required 
                        />
                    </div>

                    {/* BONNE REPONSE & SUGGESTION IA */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div className="space-y-2">
                            <label className="block font-bold text-sm text-base-content">Bonne Réponse *</label>
                            <input 
                                name="reponse_correcte" 
                                value={formData.reponse_correcte} 
                                onChange={handleChange} 
                                className="input w-full rounded-xl bg-base-200/50 border border-base-300/60 focus:border-primary focus:outline-none font-medium text-sm h-12 transition-all" 
                                placeholder="Ex: 3/4" 
                                required 
                            />
                        </div>
                        <div>
                            <button 
                                type="button" 
                                onClick={handleGenererIA} 
                                disabled={loadingIA} 
                                className="btn btn-outline btn-primary btn-sm w-full rounded-xl font-bold gap-1.5 h-12 border hover:scale-[1.01] active:scale-95 transition-all normal-case shadow-xs text-xs"
                            >
                                {loadingIA ? (
                                    <>
                                        <Loader2 className="animate-spin shrink-0" size={16} />
                                        Génération par Mathy...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={16} className="text-primary" />
                                        Suggérer les erreurs (IA)
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* MAUVAISES REPONSES */}
                    <div className="space-y-2">
                        <label className="block font-bold text-sm text-base-content">Réponses incorrectes (choix multiples) *</label>
                        <div className="flex gap-2">
                            <input 
                                value={mauvaiseTemp} 
                                onChange={(e) => setMauvaiseTemp(e.target.value)} 
                                className="input flex-1 rounded-xl bg-base-200/50 border border-base-300/60 focus:border-primary focus:outline-none font-medium text-sm h-12 transition-all" 
                                placeholder="Ajouter une erreur personnalisée..." 
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddMauvaise();
                                    }
                                }}
                            />
                            <button 
                                type="button" 
                                onClick={handleAddMauvaise} 
                                className="btn btn-primary btn-sm rounded-xl h-12 px-4 hover:scale-105 transition-all"
                            >
                                <Plus size={18} />
                            </button>
                        </div>

                        {mauvaisesList.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3 bg-base-200/40 p-3 rounded-xl border border-base-200 dark:border-base-300/40">
                                {mauvaisesList.map((m, i) => (
                                    <div 
                                        key={i} 
                                        className="badge badge-md py-3 px-3 gap-1.5 bg-error/10 border border-error/20 text-error font-bold rounded-lg text-xs"
                                    >
                                        <span>{m}</span> 
                                        <X 
                                            size={12} 
                                            className="cursor-pointer hover:scale-110 transition-transform text-error shrink-0" 
                                            onClick={() => handleRemoveMauvaise(i)} 
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* EXPLICATION */}
                    <div className="space-y-2">
                        <label className="block font-bold text-sm text-base-content flex items-center gap-1.5">
                            <HelpCircle size={16} className="text-primary" />
                            Explication / Aide pédagogique
                        </label>
                        <textarea 
                            name="explication" 
                            value={formData.explication} 
                            onChange={handleChange} 
                            className="textarea w-full rounded-xl bg-base-200/50 border border-base-300/60 focus:border-primary focus:outline-none font-medium text-sm h-24 p-4 transition-all leading-relaxed" 
                            placeholder="Cette explication sera affichée à l'élève en cas de mauvaise réponse ou pour l'aider à comprendre." 
                        />
                    </div>

                    {/* SUBMIT */}
                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="btn btn-primary w-full rounded-xl h-12 font-bold text-sm shadow-xs hover:scale-[1.01] active:scale-95 transition-all normal-case"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={16} />
                                    Enregistrement...
                                </>
                            ) : (
                                <>
                                    <ClipboardList className="mr-2" size={18} />
                                    Enregistrer le défi
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AjouterExercice;