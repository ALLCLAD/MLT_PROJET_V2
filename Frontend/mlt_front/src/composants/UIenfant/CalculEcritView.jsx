import React, { useState, useEffect, useRef } from 'react';
import { Delete, RotateCcw, Check } from 'lucide-react';
import LecteurVocal from '../LecteurVocal';

const CalculEcritView = ({ question = {}, data, onResolve, disabled }) => {
    // Ex de data: {"operande1": "135", "operande2": "48", "operateur": "+"}
    const op1Str = String(data?.operande1 || '').trim();
    const op2Str = String(data?.operande2 || '').trim();
    const operator = String(data?.operateur || '+').trim();
    
    // Consigne de l'exercice pour la lecture vocale
    const consigneTexte = question.consigne || question.question || question.texte || `Pose et effectue l'opération : ${op1Str} ${operator} ${op2Str}`;

    // Déterminer la taille maximale pour aligner en colonnes (avec place pour un dépassement éventuel de retenue)
    const maxLen = Math.max(op1Str.length, op2Str.length) + 1;

    // Tableaux pour stocker les chiffres alignés à droite
    const op1Digits = op1Str.padStart(maxLen, ' ').split('');
    const op2Digits = op2Str.padStart(maxLen, ' ').split('');

    // États pour les entrées utilisateur
    const [resultDigits, setResultDigits] = useState(Array(maxLen).fill(''));
    const [retenues, setRetenues] = useState(Array(maxLen).fill(''));

    // Case actuellement sélectionnée pour la saisie (commence par les unités tout à droite)
    const [activeCell, setActiveCell] = useState({ type: 'result', index: maxLen - 1 });

    // Re-initialiser si la question change
    useEffect(() => {
        setResultDigits(Array(maxLen).fill(''));
        setRetenues(Array(maxLen).fill(''));
        setActiveCell({ type: 'result', index: maxLen - 1 });
    }, [op1Str, op2Str, operator, maxLen]);

    // Insérer un chiffre dans la case active
    const handleInsertDigit = (digit) => {
        if (disabled) return;
        const { type, index } = activeCell;

        if (type === 'result') {
            const newDigits = [...resultDigits];
            newDigits[index] = digit;
            setResultDigits(newDigits);

            // Avancer automatiquement vers la gauche (dizaines, centaines...)
            if (index > 0) {
                setActiveCell({ type: 'result', index: index - 1 });
            }
        } else if (type === 'retenue') {
            const newRetenues = [...retenues];
            newRetenues[index] = digit;
            setRetenues(newRetenues);

            if (index > 0) {
                setActiveCell({ type: 'retenue', index: index - 1 });
            }
        }
    };

    // Effacer (Backspace)
    const handleBackspace = () => {
        if (disabled) return;
        const { type, index } = activeCell;

        if (type === 'result') {
            const newDigits = [...resultDigits];
            if (newDigits[index] !== '') {
                newDigits[index] = '';
                setResultDigits(newDigits);
            } else if (index < maxLen - 1) {
                setActiveCell({ type: 'result', index: index + 1 });
            }
        } else if (type === 'retenue') {
            const newRetenues = [...retenues];
            if (newRetenues[index] !== '') {
                newRetenues[index] = '';
                setRetenues(newRetenues);
            } else if (index < maxLen - 1) {
                setActiveCell({ type: 'retenue', index: index + 1 });
            }
        }
    };

    // Effacer tout
    const handleClearAll = () => {
        if (disabled) return;
        setResultDigits(Array(maxLen).fill(''));
        setRetenues(Array(maxLen).fill(''));
        setActiveCell({ type: 'result', index: maxLen - 1 });
    };

    // Soumettre la réponse
    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        const concatted = resultDigits.join('').trim();
        if (concatted && !disabled) {
            onResolve(concatted);
        }
    };

    // Écouteur de clavier physique (PC)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (disabled) return;
            if (/[0-9]/.test(e.key)) {
                handleInsertDigit(e.key);
            } else if (e.key === 'Backspace') {
                handleBackspace();
            } else if (e.key === 'Enter') {
                handleSubmit();
            } else if (e.key === 'ArrowLeft') {
                setActiveCell(prev => ({ ...prev, index: Math.max(0, prev.index - 1) }));
            } else if (e.key === 'ArrowRight') {
                setActiveCell(prev => ({ ...prev, index: Math.min(maxLen - 1, prev.index + 1) }));
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeCell, resultDigits, retenues, disabled]);

    return (
        <div className="w-full max-w-md mx-auto flex flex-col items-center animate-in zoom-in-95 duration-300">
            {/* GRILLE D'OPÉRATION VERTICALE */}

            {/* GRILLE D'OPÉRATION VERTICALE */}
            <div className="flex flex-col items-end font-mono text-3xl md:text-4xl text-base-content select-none my-2">
                
                {/* 1. LIGNE DES RETENUES */}
                <div className="flex mb-2">
                    {retenues.map((val, idx) => {
                        const isActive = activeCell.type === 'retenue' && activeCell.index === idx;
                        return (
                            <div key={`ret-${idx}`} className="w-12 h-12 flex items-center justify-center relative">
                                {idx < maxLen - 1 && (
                                    <button
                                        type="button"
                                        onClick={() => !disabled && setActiveCell({ type: 'retenue', index: idx })}
                                        disabled={disabled}
                                        className={`w-8 h-8 rounded-full border text-center text-xs font-bold transition-all flex items-center justify-center ${
                                            isActive
                                                ? 'border-primary ring-2 ring-primary/40 bg-primary/20 text-primary font-black scale-110'
                                                : val
                                                    ? 'border-primary/40 bg-primary/10 text-primary'
                                                    : 'border-primary/20 bg-primary/5 text-primary/30 hover:border-primary/40'
                                        }`}
                                    >
                                        {val || '+'}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* 2. PREMIER OPÉRANDE */}
                <div className="flex mb-1">
                    {op1Digits.map((char, idx) => (
                        <div key={`op1-${idx}`} className="w-12 text-center font-black">
                            {char}
                        </div>
                    ))}
                </div>

                {/* 3. DEUXIÈME OPÉRANDE (avec opérateur) */}
                <div className="flex items-center mb-2 border-b-4 border-base-content/80 pb-2">
                    <span className="text-2xl mr-2 font-black opacity-65">{operator}</span>
                    <div className="flex">
                        {op2Digits.map((char, idx) => (
                            <div key={`op2-${idx}`} className="w-12 text-center font-black">
                                {char}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. ZONE DE RÉSULTAT */}
                <div className="flex gap-1 py-2">
                    {resultDigits.map((val, idx) => {
                        const isActive = activeCell.type === 'result' && activeCell.index === idx;
                        return (
                            <button
                                key={`res-${idx}`}
                                type="button"
                                onClick={() => !disabled && setActiveCell({ type: 'result', index: idx })}
                                disabled={disabled}
                                className={`w-12 h-14 rounded-xl border-2 text-center text-2xl font-black transition-all flex items-center justify-center
                                ${disabled 
                                    ? 'bg-base-200 border-base-300 text-base-content/50' 
                                    : isActive
                                        ? 'bg-primary/10 border-primary ring-4 ring-primary/20 text-primary scale-105 shadow-md'
                                        : val
                                            ? 'bg-base-100 border-primary/50 text-base-content'
                                            : 'bg-base-100 border-base-300 text-base-content/30 hover:border-primary/40'}`}
                            >
                                {val || <span className="opacity-20 text-sm">?</span>}
                            </button>
                        );
                    })}
                </div>
            </div>

            <p className="mt-2 text-[11px] font-extrabold text-base-content/60 text-center tracking-wide">
                Sélectionne une case et utilise les chiffres ci-dessous (de droite à gauche).
            </p>

            {/* CALCULATRICE VIRTUELLE POUR ÉLÈVES DU PRIMAIRE */}
            {!disabled && (
                <div className="w-full mt-4 pt-4 border-t border-base-200 flex flex-col items-center gap-3">
                    <div className="grid grid-cols-5 gap-2 w-full max-w-xs">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                            <button
                                key={num}
                                type="button"
                                onClick={() => handleInsertDigit(String(num))}
                                disabled={disabled}
                                className="h-12 rounded-2xl bg-base-200/80 hover:bg-primary hover:text-white text-base-content font-black text-xl border border-base-300/60 shadow-xs hover:shadow-md active:scale-95 transition-all duration-150 flex items-center justify-center"
                            >
                                {num}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 w-full max-w-xs">
                        <button
                            type="button"
                            onClick={handleBackspace}
                            disabled={disabled}
                            className="flex-1 h-11 rounded-2xl bg-amber-500/10 hover:bg-amber-500 text-amber-700 hover:text-white font-bold text-xs uppercase tracking-wider border border-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                            title="Effacer le dernier chiffre"
                        >
                            <Delete size={16} /> Effacer
                        </button>
                        <button
                            type="button"
                            onClick={handleClearAll}
                            disabled={disabled}
                            className="h-11 px-3.5 rounded-2xl bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white font-bold text-xs uppercase tracking-wider border border-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-1"
                            title="Effacer tout"
                        >
                            <RotateCcw size={14} /> Tout effacer
                        </button>
                    </div>
                </div>
            )}

            <button
                type="button"
                onClick={handleSubmit}
                disabled={disabled || !resultDigits.join('').trim()}
                className="btn btn-primary btn-block rounded-2xl font-black shadow-md mt-5 h-12 flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
            >
                <Check size={18} /> Valider mon calcul
            </button>
        </div>
    );
};

export default CalculEcritView;
