import React, { useMemo } from 'react';
import CalculEcritView from './CalculEcritView';
import CalculMentalView from './CalculMentalView';
import ProblemeView from './ProblemeView';

const ExerciseRenderer = ({ question, onResolve, showFeedback, selectedAnswer, disabled }) => {
    // Unifier les clés d'objet :
    // - Dans QuizEngine (JSON), la question s'appelle 'texte', le type 'type'.
    // - Dans FaireExercice (Backend Model), la question s'appelle 'question', le type 'type_exercice'.
    const questionText = question.question || question.texte || '';
    // Support les deux formats : 'type' (JSON) et 'type_exercice' (backend Django)
    const typeExercice = question.type_exercice || question.type || 'QCM';
    
    // Normaliser les données pour CALCUL_ECRIT :
    // JSON utilise operande_gauche/operande_droit/operation
    // ExerciseRenderer attend donnees_exercice: {operande1, operande2, operateur}
    let metadata = question.donnees_exercice || null;
    if (!metadata && typeExercice === 'CALCUL_ECRIT' && question.operande_gauche !== undefined) {
        const opMap = { addition: '+', soustraction: '-', multiplication: 'x', division: '/' };
        metadata = {
            operande1: String(question.operande_gauche),
            operande2: String(question.operande_droit),
            operateur: opMap[question.operation] || '+'
        };
    }
    // Normaliser pour PROBLEME :
    if (!metadata && typeExercice === 'PROBLEME' && question.operation_attendue) {
        metadata = {
            operation_attendue: question.operation_attendue,
            unite: question.unite || ''
        };
    }

    // Mélanger et mémoïser les options uniquement pour le mode QCM et CALCUL_MENTAL
    const qcmOptions = useMemo(() => {
        if (typeExercice !== 'QCM' && typeExercice !== 'CALCUL_MENTAL') return [];

        const bonne = String(question.reponse_correcte || '').trim();
        let mauvaises = [];
        
        if (Array.isArray(question.mauvaises_reponses) && question.mauvaises_reponses.length > 0) {
            mauvaises = question.mauvaises_reponses;
        } else if (typeof question.mauvaises_reponses === 'string' && question.mauvaises_reponses.trim() !== '') {
            mauvaises = question.mauvaises_reponses.split(',').map(r => r.trim());
        } else {
            // Générer de fausses réponses proches si non fournies
            const num = parseInt(bonne, 10);
            if (!isNaN(num)) {
                const offsets = [1, -1, 2, -2, 3, -3, 5, -5, 10, -10];
                const set = new Set();
                while (set.size < 3) {
                    const off = offsets[Math.floor(Math.random() * offsets.length)];
                    const val = num + off;
                    if (val >= 0 && val !== num) {
                        set.add(String(val));
                    }
                }
                mauvaises = Array.from(set);
            } else {
                mauvaises = [bonne + '2', bonne + '5', bonne + '0'];
            }
        }

        const toutes = [bonne, ...mauvaises].map(r => String(r).trim()).filter(r => r && r !== ",");
        return [...new Set(toutes)].sort(() => Math.random() - 0.5);
    }, [question, typeExercice]);

    switch (typeExercice) {
        case 'CALCUL_ECRIT':
            return (
                <CalculEcritView
                    question={question}
                    data={metadata}
                    onResolve={onResolve}
                    disabled={showFeedback || disabled}
                />
            );

        case 'PROBLEME':
            return (
                <ProblemeView
                    question={question}
                    onResolve={onResolve}
                    disabled={showFeedback || disabled}
                />
            );

        case 'CALCUL_MENTAL':
            return (
                <CalculMentalView
                    question={question}
                    onResolve={onResolve}
                    disabled={showFeedback || disabled}
                />
            );

        case 'QCM':
        default:
            return (
                <div className="flex flex-col md:flex-row items-center gap-6 mb-8 w-full max-w-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 w-full">
                        {qcmOptions.map((option, index) => {
                            const isOptionCorrect = option === String(question.reponse_correcte).trim();
                            const isOptionSelected = option === selectedAnswer;

                            let btnStyle = 'bg-base-100 border-base-200 hover:border-primary hover:bg-primary/5 text-base-content shadow-sm';
                            if (showFeedback) {
                                if (isOptionCorrect) {
                                    btnStyle = 'bg-success/10 border-success text-success';
                                } else if (isOptionSelected) {
                                    btnStyle = 'bg-error/10 border-error text-error opacity-70';
                                } else {
                                    btnStyle = 'bg-base-100 border-base-200 opacity-40';
                                }
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => onResolve(option)}
                                    disabled={showFeedback || disabled}
                                    className={`flex items-center p-4 rounded-2xl border-2 transition-all font-bold text-lg ${btnStyle}`}
                                >
                                    <div className="w-7 h-7 rounded-lg bg-base-200 flex items-center justify-center text-[10px] mr-3 text-base-content/50 shadow-inner shrink-0">
                                        {String.fromCharCode(65 + index)}
                                    </div>
                                    <span className="flex-1 text-center">{option}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            );
    }
};

export default ExerciseRenderer;
