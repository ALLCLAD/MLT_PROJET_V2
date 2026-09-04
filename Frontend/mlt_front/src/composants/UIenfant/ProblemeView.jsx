import React, { useState, useEffect } from 'react';
import { BookOpen, HelpCircle } from 'lucide-react';
import LecteurVocal from '../LecteurVocal';

const ProblemeView = ({ question, onResolve, disabled }) => {
    // Ex de donnees: {"operation_attendue": "multiplication", "unite": "FCFA"}
    const metadata = question.donnees_exercice || {};
    const operationAttendue = String(metadata.operation_attendue || question.operation_attendue || '').toLowerCase();
    const unite = metadata.unite || question.unite || '';
    const correctAns = String(question.reponse_correcte).trim();
    const questionText = question.question || question.texte || '';

    const [etape, setEtape] = useState(1); // Étape 1 : Choisir l'opération | Étape 2 : Calculer le résultat
    const [operationChoisie, setOperationChoisie] = useState('');
    const [resultInput, setResultInput] = useState('');
    const [erreurMessage, setErreurMessage] = useState('');

    useEffect(() => {
        setEtape(1);
        setOperationChoisie('');
        setResultInput('');
        setErreurMessage('');
    }, [question]);

    const handleSelectOperation = (op) => {
        if (disabled) return;
        setOperationChoisie(op);
        
        // Si l'opération attendue est spécifiée, on valide l'étape 1
        if (operationAttendue) {
            if (op.toLowerCase() === operationAttendue) {
                setErreurMessage('');
                setEtape(2); // Passe à l'étape du résultat
            } else {
                setErreurMessage("Ce n'est pas la bonne opération pour résoudre ce problème. Réfléchis bien !");
            }
        } else {
            // Par défaut, s'il n'y a pas d'opération spécifiée, on passe direct à l'étape 2
            setEtape(2);
        }
    };

    const handleResultSubmit = (e) => {
        e.preventDefault();
        if (disabled || !resultInput.trim()) return;

        // On envoie le résultat final au moteur d'évaluation principal
        onResolve(resultInput.trim());
    };

    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col md:flex-row gap-6 animate-in zoom-in-95 duration-300">
            
            {/* PANNEAU DE GAUCHE : L'ÉNONCÉ DU PROBLÈME (STYLE CAHIER) */}
            <div className="flex-1 bg-amber-50 border-2 border-amber-200 rounded-[2rem] p-6 shadow-md relative overflow-hidden">
                {/* Lignes horizontales de cahier d'écolier */}
                <div 
                    className="absolute inset-0 opacity-15"
                    style={{
                        backgroundImage: 'linear-gradient(#2563eb 1px, transparent 1px)',
                        backgroundSize: '100% 28px',
                        paddingTop: '20px'
                    }}
                />
                
                <div className="relative z-10 space-y-3">
                    <div className="flex items-center justify-between gap-2 mb-4">
                        <div className="flex items-center gap-2 text-amber-800 font-black uppercase tracking-wider text-xs">
                            <BookOpen size={16} /> Énoncé du problème
                        </div>
                        <LecteurVocal texte={questionText} title="Écouter" variant="compact" />
                    </div>
                    <p className="text-lg md:text-xl font-bold leading-relaxed text-slate-800 italic">
                        "{questionText}"
                    </p>
                </div>
            </div>

            {/* PANNEAU DE DROITE : LE CHEMIN DE RÉSOLUTION DE L'ÉLÈVE */}
            <div className="w-full md:w-[280px] bg-base-100 p-6 rounded-[2rem] border border-base-200 shadow-xl flex flex-col justify-between shrink-0">
                <div>
                    <span className="badge badge-warning text-white font-black uppercase mb-4 py-3 tracking-widest text-[9px]">
                        Problème guidé
                    </span>

                    {/* ÉTAPE 1 : CHOISIR L'OPÉRATION */}
                    {etape === 1 && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <h3 className="text-sm font-black text-base-content/70">
                                1. Quelle opération dois-tu faire ?
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { label: 'Addition (+)', val: 'addition' },
                                    { label: 'Soustraction (-)', val: 'soustraction' },
                                    { label: 'Multiplication (x)', val: 'multiplication' },
                                    { label: 'Division (/)', val: 'division' }
                                ].map((op) => (
                                    <button
                                        key={op.val}
                                        onClick={() => handleSelectOperation(op.val)}
                                        disabled={disabled}
                                        className="btn btn-sm btn-outline btn-primary rounded-xl font-bold text-xs py-2 h-auto"
                                    >
                                        {op.label}
                                    </button>
                                ))}
                            </div>
                            {erreurMessage && (
                                <p className="text-xs text-error font-bold mt-2 text-center animate-pulse">
                                    {erreurMessage}
                                </p>
                            )}
                        </div>
                    )}

                    {/* ÉTAPE 2 : CALCULER LE RÉSULTAT */}
                    {etape === 2 && (
                        <form onSubmit={handleResultSubmit} className="space-y-4 animate-in slide-in-from-right duration-300">
                            <h3 className="text-sm font-black text-base-content/70">
                                2. Calcule et écris le résultat :
                            </h3>
                            <div className="flex flex-col gap-2">
                                <input
                                    type="text"
                                    pattern="[0-9]*"
                                    inputMode="numeric"
                                    placeholder="Écris le nombre..."
                                    value={resultInput}
                                    onChange={(e) => setResultInput(e.target.value.replace(/[^0-9]/g, ''))}
                                    disabled={disabled}
                                    required
                                    autoFocus
                                    className="input input-bordered input-primary w-full rounded-2xl text-center text-xl font-black focus:outline-none"
                                />
                                {unite && (
                                    <span className="text-xs font-black text-center text-primary/80 uppercase">
                                        Unité : {unite}
                                    </span>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={disabled || !resultInput.trim()}
                                className="btn btn-primary btn-block rounded-2xl font-black shadow-md mt-4"
                            >
                                VALIDER LE RÉSULTAT
                            </button>

                            {operationChoisie && (
                                <button
                                    type="button"
                                    onClick={() => setEtape(1)}
                                    disabled={disabled}
                                    className="btn btn-xs btn-ghost text-slate-400 font-bold w-full mt-2"
                                >
                                    ← Changer d'opération
                                </button>
                            )}
                        </form>
                    )}
                </div>

                <div className="mt-6 p-3 bg-base-200/50 rounded-xl flex gap-2 items-start border border-base-200">
                    <HelpCircle size={16} className="text-primary shrink-0 mt-0.5" />
                    <p className="text-[10px] text-base-content/60 leading-tight font-medium">
                        Tu peux ouvrir l'**Ardoise de Brouillon** en haut à tout moment pour faire tes calculs à la main !
                    </p>
                </div>
            </div>

        </div>
    );
};

export default ProblemeView;
