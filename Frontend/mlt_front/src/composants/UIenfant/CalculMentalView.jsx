import React, { useState, useEffect } from 'react';
import { Delete, Check } from 'lucide-react';

const CalculMentalView = ({ question, onResolve, disabled }) => {
    const [inputValue, setInputValue] = useState('');
    const correctAnswer = String(question.reponse_correcte).trim();

    // Réinitialiser la valeur quand l'exercice change
    useEffect(() => {
        setInputValue('');
    }, [question]);

    // Gérer l'appui sur le pavé numérique virtuel
    const handleKeyPress = (char) => {
        if (disabled) return;
        setInputValue(prev => {
            const newVal = prev + char;
            // On peut limiter à la taille maximale de la réponse correcte
            if (newVal.length <= correctAnswer.length + 1) {
                return newVal;
            }
            return prev;
        });
    };

    // Retour arrière
    const handleBackspace = () => {
        if (disabled) return;
        setInputValue(prev => prev.slice(0, -1));
    };

    // Soumettre le résultat
    const handleSubmit = () => {
        if (disabled || !inputValue.trim()) return;
        onResolve(inputValue.trim());
    };

    // Écouter le clavier physique pour être sympa avec les PC
    useEffect(() => {
        const handlePhysicalKey = (e) => {
            if (disabled) return;
            if (/[0-9]/.test(e.key)) {
                handleKeyPress(e.key);
            } else if (e.key === 'Backspace') {
                handleBackspace();
            } else if (e.key === 'Enter') {
                handleSubmit();
            }
        };
        window.addEventListener('keydown', handlePhysicalKey);
        return () => window.removeEventListener('keydown', handlePhysicalKey);
    }, [inputValue, disabled]);

    return (
        <div className="w-full max-w-sm mx-auto flex flex-col items-center animate-in zoom-in-95 duration-300">
            <span className="badge badge-error text-white font-black uppercase mb-4 py-3 tracking-widest text-[10px]">
                Calcul Mental Rapide
            </span>

            {/* AFFICHEUR DU RÉSULTAT SAISI */}
            <div className="w-full text-center mb-6">
                <div className="h-16 w-full max-w-[200px] mx-auto bg-base-200 rounded-2xl flex items-center justify-center border-2 border-primary/20 text-3xl font-black font-mono shadow-inner tracking-wider">
                    {inputValue || <span className="text-base-content/20">?</span>}
                </div>
            </div>

            {/* PAVÉ NUMÉRIQUE VIRTUEL */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                        key={num}
                        onClick={() => handleKeyPress(String(num))}
                        disabled={disabled}
                        className="btn btn-lg btn-outline btn-primary rounded-2xl text-2xl font-black h-16 shadow-sm active:scale-95 transition-transform"
                    >
                        {num}
                    </button>
                ))}
                
                {/* BOUTON CORRIGER / EFFACER */}
                <button
                    onClick={handleBackspace}
                    disabled={disabled}
                    className="btn btn-lg btn-ghost btn-outline text-error rounded-2xl h-16 active:scale-95"
                    title="Effacer"
                >
                    <Delete size={24} />
                </button>

                {/* CHIFFRE 0 */}
                <button
                    onClick={() => handleKeyPress('0')}
                    disabled={disabled}
                    className="btn btn-lg btn-outline btn-primary rounded-2xl text-2xl font-black h-16 active:scale-95"
                >
                    0
                </button>

                {/* BOUTON VALIDER */}
                <button
                    onClick={handleSubmit}
                    disabled={disabled || !inputValue.trim()}
                    className="btn btn-lg btn-success text-white rounded-2xl h-16 shadow-md active:scale-95"
                    title="Valider"
                >
                    <Check size={28} />
                </button>
            </div>
        </div>
    );
};

export default CalculMentalView;
