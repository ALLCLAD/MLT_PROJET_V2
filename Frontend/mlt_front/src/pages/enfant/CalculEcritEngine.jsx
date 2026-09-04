import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Timer, Trophy, CheckCircle2, XCircle, BrainCircuit, Lightbulb, Star, Pencil, LayoutGrid, Loader2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../../apiDjango/api.jsx';
import { getMathyFeedback } from '../../apiDjango/aiService';
import { speakTextSafe, stopAllAudio } from '../../apiDjango/ttsService';
import LecteurVocal from '../../composants/LecteurVocal';
import CalculEcritView from '../../composants/UIenfant/CalculEcritView';
import BrouillonCanvas from '../../composants/UIenfant/BrouillonCanvas';
import BatonnetsComptage from '../../composants/UIenfant/BatonnetsComptage';

const TIMER_TOTAL = 15 * 60;

const CalculEcritEngine = ({ onBack }) => {
    const [questions, setQuestions]         = useState([]);
    const [currentIndex, setCurrentIndex]   = useState(0);
    const [loading, setLoading]             = useState(true);
    const [score, setScore]                 = useState(0);
    const [answers, setAnswers]             = useState([]);

    const [showFeedback, setShowFeedback]   = useState(false);
    const [lastCorrect, setLastCorrect]     = useState(false);
    const [aiFeedback, setAiFeedback]       = useState('');
    const [isAiLoading, setIsAiLoading]     = useState(false);

    const [hint, setHint]                   = useState('');
    const [hintsLeft, setHintsLeft]         = useState(3);
    const [showHintBox, setShowHintBox]     = useState(false);

    const [timeLeft, setTimeLeft]           = useState(TIMER_TOTAL);
    const [finished, setFinished]           = useState(false);
    const [isSaving, setIsSaving]           = useState(false);

    const [isBrouillonOpen, setIsBrouillonOpen] = useState(false);
    const [isBatonnetsOpen, setIsBatonnetsOpen] = useState(false);

    const timerRef = useRef(null);

    // ── CHARGEMENT ─────────────────────────────────────────────────────────────
    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const minDelay = new Promise(r => setTimeout(r, 800));
                const [res] = await Promise.all([api.get('/quiz/calcul-ecrit/'), minDelay]);
                setQuestions(res.data.questions || []);
            } catch (e) {
                console.error('Erreur chargement calcul écrit:', e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
        return () => stopAllAudio();
    }, []);

    // ── TIMER ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (loading || finished) { clearInterval(timerRef.current); return; }
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) { clearInterval(timerRef.current); handleFinish(true); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [loading, finished]);

    const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    // ── SOUMETTRE UNE RÉPONSE ──────────────────────────────────────────────────
    const handleAnswer = async (userAnswer) => {
        if (showFeedback || finished) return;
        stopAllAudio();
        clearInterval(timerRef.current);

        const q = questions[currentIndex];
        const correct = String(userAnswer).trim() === String(q.reponse_correcte).trim();
        setLastCorrect(correct);
        if (correct) setScore(s => s + 1);

        const newAnswers = [...answers, {
            question:         q.consigne || q.question || '',
            operande_gauche:  q.operande_gauche,
            operande_droit:   q.operande_droit,
            operation:        q.operation,
            userAnswer,
            correct,
            reponse_correcte: q.reponse_correcte,
            explication:      q.explication || '',
        }];
        setAnswers(newAnswers);
        setShowFeedback(true);

        setIsAiLoading(true);
        try {
            const type = correct ? 'BONNE_REPONSE' : 'MAUVAISE_REPONSE';
            const fb = await getMathyFeedback(q.consigne || q.question, type, correct, q.explication);
            setAiFeedback(fb);
            speakTextSafe(fb);
        } catch {
            setAiFeedback(correct ? 'Excellent calcul !' : `La bonne réponse était ${q.reponse_correcte}. ${q.explication}`);
        } finally {
            setIsAiLoading(false);
        }

        if (currentIndex >= questions.length - 1) {
            setTimeout(() => handleFinish(false, newAnswers, correct ? score + 1 : score), 2500);
        }
    };

    // ── QUESTION SUIVANTE ──────────────────────────────────────────────────────
    const handleNext = () => {
        stopAllAudio();
        if (currentIndex >= questions.length - 1) { handleFinish(false); return; }
        setShowFeedback(false);
        setAiFeedback('');
        setHint('');
        setShowHintBox(false);
        setCurrentIndex(i => i + 1);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) { clearInterval(timerRef.current); handleFinish(true); return 0; }
                return prev - 1;
            });
        }, 1000);
    };

    // ── TERMINER ───────────────────────────────────────────────────────────────
    const handleFinish = async (timeout = false, finalAnswers = answers, finalScore = score) => {
        stopAllAudio();
        clearInterval(timerRef.current);
        setFinished(true);
        if (finalScore > 0) confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        setIsSaving(true);
        try {
            await api.post('/quiz/save-score/', {
                theme: 'CALCUL_ECRIT',
                points: finalScore,
                total_questions: questions.length,
                temps: TIMER_TOTAL - timeLeft,
            });
        } catch (e) { console.error('Erreur sauvegarde score:', e); }
        finally { setIsSaving(false); }
    };

    // ── INDICE ─────────────────────────────────────────────────────────────────
    const handleHint = async () => {
        if (hintsLeft <= 0 || showHintBox || showFeedback || isAiLoading) return;
        stopAllAudio();
        setIsAiLoading(true);
        setShowHintBox(true);
        setHintsLeft(h => h - 1);
        const q = questions[currentIndex];
        try {
            const msg = await getMathyFeedback(q.consigne || q.question, 'DEMANDE_INDICE', false, q.explication);
            setHint(msg);
            speakTextSafe(msg);
        } catch {
            setHint('Regarde bien les chiffres de droite à gauche. Pense aux retenues !');
        } finally {
            setIsAiLoading(false);
        }
    };

const ExerciseHeaderSkeleton = () => (
    <div className="px-6 py-4 flex justify-between items-center border-b border-base-200 bg-gradient-to-r from-base-100 to-base-200/20 animate-pulse">
        <div className="w-16 h-5 bg-base-300 rounded-lg"></div>
        <div className="flex gap-1">
            <div className="w-5 h-5 bg-base-300 rounded-full"></div>
            <div className="w-5 h-5 bg-base-300 rounded-full"></div>
            <div className="w-5 h-5 bg-base-300 rounded-full"></div>
        </div>
    </div>
);

const ExerciseContentSkeleton = () => (
    <div className="flex-1 p-6 md:p-8 flex flex-col items-center space-y-8 animate-pulse w-full">
        <div className="w-full max-w-2xl space-y-2">
            <div className="flex justify-between">
                <div className="w-28 h-4 bg-base-300 rounded-lg"></div>
                <div className="w-12 h-4 bg-base-300 rounded-lg"></div>
            </div>
            <div className="w-full h-3 bg-base-300 rounded-full"></div>
        </div>
        <div className="w-full max-w-2xl text-center py-6 space-y-2">
            <div className="w-3/4 h-8 bg-base-300 rounded-xl mx-auto"></div>
            <div className="w-1/2 h-6 bg-base-300 rounded-xl mx-auto"></div>
        </div>
        <div className="w-full max-w-2xl flex flex-col md:flex-row items-center gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 w-full">
                <div className="h-16 bg-base-300 rounded-2xl w-full"></div>
                <div className="h-16 bg-base-300 rounded-2xl w-full"></div>
                <div className="h-16 bg-base-300 rounded-2xl w-full"></div>
                <div className="h-16 bg-base-300 rounded-2xl w-full"></div>
            </div>
            <div className="w-20 h-20 bg-base-300 rounded-3xl shrink-0"></div>
        </div>
        <div className="w-16 h-16 bg-base-300 rounded-full mx-auto"></div>
    </div>
);

    // ── CHARGEMENT ─────────────────────────────────────────────────────────────
    if (loading) return (
        <div className="w-full max-w-4xl mx-auto bg-base-100 dark:bg-base-100 rounded-2xl shadow-sm border border-base-300/60 overflow-hidden flex flex-col min-h-[500px]">
            <ExerciseHeaderSkeleton />
            <ExerciseContentSkeleton />
        </div>
    );

    // ── RÉSULTATS ──────────────────────────────────────────────────────────────
    if (finished) {
        const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
        return (
            <div className="min-h-screen bg-base-200/30 p-4 flex items-center justify-center">
                <div className="w-full max-w-2xl bg-base-100 rounded-[2.5rem] shadow-2xl overflow-hidden border border-base-200">

                    {/* Score */}
                    <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-8 text-white text-center">
                        <Trophy size={40} className="mx-auto mb-3 opacity-90" />
                        <div className="flex items-center justify-center gap-8 mt-4">
                            <div className="text-center">
                                <p className="text-4xl font-black">{score}/{questions.length}</p>
                                <p className="text-xs font-bold uppercase tracking-widest text-white/60 mt-1">Score</p>
                            </div>
                            <div className="w-px h-10 bg-white/30" />
                            <div className="text-center">
                                <p className="text-4xl font-black">{pct}%</p>
                                <p className="text-xs font-bold uppercase tracking-widest text-white/60 mt-1">Réussite</p>
                            </div>
                        </div>
                    </div>

                    {/* Corrections */}
                    <div className="p-5 max-h-[48vh] overflow-y-auto space-y-3">
                        {answers.map((a, i) => (
                            <div key={i} className={`rounded-2xl p-4 border-2 ${a.correct ? 'border-emerald-200 bg-emerald-50/60' : 'border-red-200 bg-red-50/60'}`}>
                                <div className="flex items-start gap-3">
                                    {a.correct
                                        ? <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                                        : <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                                    }
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 font-mono text-sm flex-wrap">
                                            <span className="text-base-content/60">
                                                {a.operande_gauche} {a.operation === 'addition' ? '+' : a.operation === 'soustraction' ? '−' : a.operation === 'multiplication' ? '×' : '÷'} {a.operande_droit}
                                            </span>
                                            <span className={`font-black ${a.correct ? 'text-emerald-600' : 'text-red-500 line-through'}`}>= {a.userAnswer}</span>
                                            {!a.correct && <span className="text-emerald-600 font-black">✓ {a.reponse_correcte}</span>}
                                        </div>
                                        {a.explication && (
                                            <div className="mt-2 flex items-start gap-2 text-xs text-base-content/60 bg-base-200/50 rounded-xl p-2">
                                                <BrainCircuit size={11} className="shrink-0 mt-0.5 text-primary" />
                                                <span>{a.explication}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-5 border-t border-base-200">
                        <button onClick={onBack} className="btn btn-primary btn-block rounded-2xl font-black">
                            Retour
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── ÉCRAN PRINCIPAL ────────────────────────────────────────────────────────
    const q = questions[currentIndex];
    const anyOpen = isBrouillonOpen || isBatonnetsOpen;
    const opSymbol = q.operation === 'addition' ? '+' : q.operation === 'soustraction' ? '−' : q.operation === 'multiplication' ? '×' : '÷';

    return (
        <div className={`transition-all duration-300 ${anyOpen ? 'w-full' : 'max-w-4xl mx-auto'}`}>
            <div className={`bg-base-100 rounded-2xl shadow-sm border border-base-300/60 overflow-hidden flex flex-col ${anyOpen ? 'lg:flex-row' : ''}`}>

                    {/* ── COLONNE PRINCIPALE ── */}
                    <div className="flex-1 flex flex-col">

                        {/* HEADER */}
                        <div className="px-6 py-4 flex justify-between items-center border-b border-base-200 bg-gradient-to-r from-base-100 to-rose-50/20">
                            <button onClick={() => { stopAllAudio(); onBack(); }} className="text-base-content/40 hover:text-error font-black text-xs flex items-center gap-1 transition-colors">
                                <ChevronLeft size={16} /> QUITTER
                            </button>

                            {/* Outils */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => { setIsBrouillonOpen(!isBrouillonOpen); if (!isBrouillonOpen) setIsBatonnetsOpen(false); }}
                                    className={`btn btn-sm rounded-xl font-black flex items-center gap-1.5 text-[11px] hover:scale-105 transition-all ${isBrouillonOpen ? 'btn-primary px-3' : 'btn-outline btn-primary'}`}
                                    title="Brouillon"
                                >
                                    <Pencil size={12} />
                                    {!anyOpen && <span className="hidden sm:inline">Brouillon</span>}
                                </button>
                                <button
                                    onClick={() => { setIsBatonnetsOpen(!isBatonnetsOpen); if (!isBatonnetsOpen) setIsBrouillonOpen(false); }}
                                    className={`btn btn-sm rounded-xl font-black flex items-center gap-1.5 text-[11px] hover:scale-105 transition-all ${isBatonnetsOpen ? 'btn-warning text-white px-3' : 'btn-outline btn-warning'}`}
                                    title="Bâtonnets"
                                >
                                    <LayoutGrid size={12} />
                                    {!anyOpen && <span className="hidden sm:inline">Bâtonnets</span>}
                                </button>
                            </div>

                            {/* Timer + indices */}
                            <div className="flex items-center gap-2">
                                <div className={`flex items-center gap-1.5 font-black text-sm px-3 py-1.5 rounded-xl border ${timeLeft < 120 ? 'text-red-500 border-red-200 bg-red-50 animate-pulse' : 'text-base-content/60 border-base-200'}`}>
                                    <Timer size={14} /> {formatTime(timeLeft)}
                                </div>
                                <div className="flex gap-0.5">
                                    {[...Array(3)].map((_, i) => (
                                        <Star key={i} size={14} className={i < hintsLeft ? 'text-amber-400 fill-amber-400' : 'text-base-300'} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* BARRE DE PROGRESSION */}
                        <div className="px-8 pt-4 pb-1">
                            <div className="flex justify-between items-center mb-1.5 px-0.5">
                                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Calcul Écrit</span>
                                <span className="text-[10px] font-black text-base-content/30">{currentIndex + 1} / {questions.length}</span>
                            </div>
                            <div className="w-full bg-base-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-700"
                                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* CORPS */}
                        <div className="flex-1 p-6 md:p-8 flex flex-col items-center gap-6">

                            {/* Consigne + Bouton d'écoute vocal */}
                            <div className="flex flex-col sm:flex-row items-center gap-3 bg-base-200/40 p-4 rounded-2xl border border-base-200/60 max-w-xl w-full justify-between">
                                <p className="text-base md:text-lg font-bold text-base-content leading-relaxed text-center sm:text-left flex-1">
                                    {q.consigne || q.question || `Pose et effectue l'opération : ${q.operande_gauche} ${opSymbol} ${q.operande_droit}`}
                                </p>
                                <LecteurVocal 
                                    texte={q.consigne || q.question || `Pose et effectue l'opération : ${q.operande_gauche} ${opSymbol} ${q.operande_droit}`} 
                                    title="Écouter" 
                                    variant="compact" 
                                />
                            </div>

                            {/* Grille de calcul ou feedback */}
                            {!showFeedback ? (
                                <CalculEcritView
                                    key={currentIndex}
                                    question={q}
                                    data={{
                                        operande1: String(q.operande_gauche),
                                        operande2: String(q.operande_droit),
                                        operateur: opSymbol,
                                    }}
                                    onResolve={handleAnswer}
                                    disabled={false}
                                />
                            ) : (
                                <div className="w-full max-w-sm animate-in slide-in-from-bottom-4 duration-300">
                                    <div className={`rounded-2xl p-5 border-2 space-y-4 ${lastCorrect ? 'border-emerald-300 bg-emerald-50/60' : 'border-red-300 bg-red-50/60'}`}>
                                        <div className="flex items-center gap-3">
                                            {lastCorrect
                                                ? <CheckCircle2 size={24} className="text-emerald-500 shrink-0" />
                                                : <XCircle size={24} className="text-red-500 shrink-0" />
                                            }
                                            <p className="font-black text-base-content">
                                                {lastCorrect ? 'Bravo !' : `Réponse : ${q.reponse_correcte}`}
                                            </p>
                                        </div>

                                        {/* Feedback Mathy */}
                                        <div className="flex items-start gap-2 bg-base-100/80 rounded-xl p-3 border border-base-200">
                                            <BrainCircuit size={16} className="text-primary shrink-0 mt-0.5" />
                                            <p className="text-sm text-base-content/80 font-medium italic leading-relaxed">
                                                {isAiLoading ? 'Mathy analyse...' : aiFeedback}
                                            </p>
                                        </div>

                                        <button
                                            onClick={handleNext}
                                            disabled={isAiLoading}
                                            className="btn btn-primary btn-block rounded-2xl font-black flex items-center gap-2"
                                        >
                                            {currentIndex >= questions.length - 1
                                                ? <><Trophy size={15} /> Résultats</>
                                                : <>Suivant <ArrowRight size={15} /></>
                                            }
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Bouton indice */}
                            {!showFeedback && (
                                <div className="flex flex-col items-center gap-3">
                                    {showHintBox && (
                                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 max-w-xs text-center animate-in zoom-in-95">
                                            <p className="text-amber-800 font-bold text-sm italic">
                                                {isAiLoading ? 'Mathy réfléchit...' : hint}
                                            </p>
                                        </div>
                                    )}
                                    <button
                                        onClick={handleHint}
                                        disabled={hintsLeft <= 0 || showFeedback || isAiLoading || showHintBox}
                                        className={`relative transition-all duration-300 ${hintsLeft > 0 && !showFeedback ? 'hover:scale-110 active:scale-90' : 'opacity-40 grayscale'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 shadow-md relative z-10 ${showHintBox ? 'bg-amber-400 border-white text-white' : 'bg-base-100 border-amber-100 text-amber-500'}`}>
                                            <Lightbulb size={22} fill={showHintBox ? 'white' : 'none'} />
                                            <div className="absolute -top-1 -right-1 bg-base-content text-base-100 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-base-100">
                                                {hintsLeft}
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── PANNEAU OUTIL DOCKÉ ── */}
                    {anyOpen && (
                        <div className="w-full lg:w-[480px] shrink-0 border-t lg:border-t-0 lg:border-l border-base-200/60 bg-base-200/5 p-4 flex flex-col h-[50vh] lg:h-auto justify-stretch">
                            {isBrouillonOpen && (
                                <BrouillonCanvas
                                    isOpen={isBrouillonOpen}
                                    onClose={() => setIsBrouillonOpen(false)}
                                />
                            )}
                            {isBatonnetsOpen && (
                                <BatonnetsComptage
                                    isOpen={isBatonnetsOpen}
                                    onClose={() => setIsBatonnetsOpen(false)}
                                />
                            )}
                        </div>
                    )}

                </div>
            </div>
    );
};

export default CalculEcritEngine;
