import React, { useState, useEffect, useRef } from 'react';
import {
    ChevronLeft, Timer, Trophy, CheckCircle2, XCircle,
    BrainCircuit, Pencil, LayoutGrid, Loader2,
    Send, AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../../apiDjango/api.jsx';
import { getMathyFeedback, getProblemeProcedure } from '../../apiDjango/aiService';
import { speakTextSafe, stopAllAudio } from '../../apiDjango/ttsService';
import LecteurVocal from '../../composants/LecteurVocal';
import BrouillonCanvas from '../../composants/UIenfant/BrouillonCanvas';
import BatonnetsComptage from '../../composants/UIenfant/BatonnetsComptage';

const TIMER_TOTAL = 30 * 60; // 30 minutes

const ProblemeEngine = ({ onBack }) => {
    const [probleme, setProbleme]               = useState(null);
    const [loading, setLoading]                 = useState(true);
    const [userAnswers, setUserAnswers]         = useState({});
    const [submitted, setSubmitted]             = useState(false);
    const [results, setResults]                 = useState([]);
    const [score, setScore]                     = useState(0);
    const [globalFeedback, setGlobalFeedback]   = useState('');
    const [isAiLoading, setIsAiLoading]         = useState(false);
    const [timeLeft, setTimeLeft]               = useState(TIMER_TOTAL);
    const [isSaving, setIsSaving]               = useState(false);

    const [isBrouillonOpen, setIsBrouillonOpen] = useState(false);
    const [isBatonnetsOpen, setIsBatonnetsOpen] = useState(false);

    const timerRef = useRef(null);

    // ── CHARGEMENT ─────────────────────────────────────────────────────────────
    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const minDelay = new Promise(r => setTimeout(r, 800));
                const [res] = await Promise.all([api.get('/quiz/probleme/'), minDelay]);
                const p = res.data.probleme;
                setProbleme(p);
                const init = {};
                (p.questions || []).forEach(q => { init[q.sous_id] = ''; });
                setUserAnswers(init);
            } catch (e) {
                console.error('Erreur chargement problème:', e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
        return () => { stopAllAudio(); clearInterval(timerRef.current); };
    }, []);

    // ── TIMER ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (loading || submitted) { clearInterval(timerRef.current); return; }
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [loading, submitted]);

    const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    // ── SOUMETTRE ──────────────────────────────────────────────────────────────
    const handleSubmit = async (timeout = false) => {
        if (submitted || !probleme) return;
        clearInterval(timerRef.current);
        setSubmitted(true);

        let totalScore = 0;
        const res = probleme.questions.map(q => {
            const userAns = String(userAnswers[q.sous_id] || '').trim();
            const correct = userAns === String(q.reponse_correcte).trim();
            if (correct) totalScore++;
            return { ...q, userAnswer: userAns, correct };
        });
        setResults(res);
        setScore(totalScore);

        if (totalScore > 0) confetti({ particleCount: 60, spread: 55, origin: { y: 0.6 } });

        setIsAiLoading(true);
        try {
            const proc = await getProblemeProcedure(probleme, userAnswers, totalScore);
            setGlobalFeedback(proc);
        } catch (e) {
            console.error("Erreur génération procédure AI:", e);
            const fallbackProc = (probleme.questions || []).map((q, i) => 
                `Étape ${i + 1} (${q.question}) :\n• Démarche : ${q.explication || `Calculer pour trouver ${q.reponse_correcte} ${q.unite || ''}.`}\n• Résultat : ${q.reponse_correcte} ${q.unite || ''}`
            ).join('\n\n');
            setGlobalFeedback(fallbackProc);
        } finally {
            setIsAiLoading(false);
        }

        // Message d'encouragement parlé par la voix (uniquement l'encouragement, pas la procédure)
        const total = probleme.questions.length;
        let msgEncouragement = "";
        if (totalScore === total) {
            msgEncouragement = "Félicitations ! Tu as réussi l'intégralité du problème avec un sans-faute ! C'est un travail formidable !";
        } else if (totalScore > 0) {
            const scoreTxt = totalScore === 1 ? "une" : totalScore;
            msgEncouragement = `Bravo pour tes efforts ! Tu as trouvé ${scoreTxt} bonne${totalScore > 1 ? 's' : ''} réponse${totalScore > 1 ? 's' : ''} sur ${total}. Lis bien la démarche de résolution ci-dessous !`;
        } else {
            msgEncouragement = "Ne te décourage surtout pas ! Analyse attentivement la démarche de chaque question ci-dessous pour bien comprendre.";
        }
        speakTextSafe(msgEncouragement);

        setIsSaving(true);
        try {
            await api.post('/quiz/save-score/', {
                theme: 'PROBLEME',
                points: totalScore,
                total_questions: probleme.questions.length,
                temps: TIMER_TOTAL - timeLeft,
            });
        } catch (e) { console.error('Erreur sauvegarde:', e); }
        finally { setIsSaving(false); }
    };

    const allAnswered = probleme && probleme.questions.every(q => String(userAnswers[q.sous_id] || '').trim() !== '');
    const filledCount = probleme ? Object.values(userAnswers).filter(v => v !== '').length : 0;

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

// ── ÉTATS SPÉCIAUX ─────────────────────────────────────────────────────────
    if (loading) return (
        <div className="w-full max-w-4xl mx-auto bg-base-100 dark:bg-base-100 rounded-2xl shadow-sm border border-base-300/60 overflow-hidden flex flex-col min-h-[500px]">
            <ExerciseHeaderSkeleton />
            <ExerciseContentSkeleton />
        </div>
    );

    if (!probleme) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
                <AlertCircle size={40} className="text-error mx-auto" />
                <p className="font-black text-base-content">Impossible de charger le problème.</p>
                <button onClick={onBack} className="btn btn-primary rounded-2xl">Retour</button>
            </div>
        </div>
    );

    // ── VARIABLES D'ÉTAT ────────────────────────────────────────────────────────
    const anyOpen = isBrouillonOpen || isBatonnetsOpen;

    // ── RENDU PRINCIPAL ────────────────────────────────────────────────────────
    return (
        <div className={`transition-all duration-300 ${anyOpen ? 'w-full' : 'max-w-4xl mx-auto'}`}>
            <div className={`bg-base-100 rounded-2xl shadow-sm border border-base-300/60 overflow-hidden flex flex-col ${anyOpen ? 'lg:flex-row' : ''}`}>

                    {/* ── COLONNE PRINCIPALE ── */}
                    <div className="flex-1 flex flex-col min-h-0">

                        {/* HEADER */}
                        <div className="px-6 py-4 flex justify-between items-center border-b border-base-200 bg-gradient-to-r from-base-100 to-violet-50/20 shrink-0">
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

                            {/* Timer */}
                            <div className={`flex items-center gap-1.5 font-black text-sm px-3 py-1.5 rounded-xl border ${timeLeft < 300 ? 'text-red-500 border-red-200 bg-red-50 animate-pulse' : 'text-base-content/60 border-base-200'}`}>
                                <Timer size={14} /> {formatTime(timeLeft)}
                            </div>
                        </div>

                        {/* CORPS SCROLLABLE */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-5">

                            {/* ── ÉNONCÉ ── */}
                            <div className="rounded-2xl border border-base-200 bg-base-200/30 p-5 space-y-3">
                                <div className="flex justify-between items-center gap-2">
                                    <p className="text-xs font-black uppercase tracking-widest text-primary/70">Énoncé du problème</p>
                                    <LecteurVocal texte={probleme.enonce} title="Écouter l'énoncé" variant="compact" />
                                </div>
                                <p className="text-base md:text-lg font-bold leading-relaxed text-base-content">
                                    {probleme.enonce}
                                </p>
                            </div>

                            {/* ── QUESTIONS ── */}
                            <div className="space-y-3">
                                {probleme.questions.map((q, i) => {
                                    const result = submitted ? results.find(r => r.sous_id === q.sous_id) : null;
                                    const isCorrect = result?.correct;

                                    return (
                                        <div key={q.sous_id} className={`rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                                            submitted
                                                ? isCorrect
                                                    ? 'border-emerald-300 bg-emerald-50/60'
                                                    : 'border-red-300 bg-red-50/60'
                                                : 'border-base-200 bg-base-100'
                                        }`}>
                                            <div className="p-4 flex flex-col gap-3">
                                                {/* Numéro + question + lecteur vocal */}
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-start gap-3 flex-1">
                                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-black text-xs ${
                                                            submitted
                                                                ? isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                                                                : 'bg-primary/10 text-primary'
                                                        }`}>
                                                            {submitted
                                                                ? isCorrect ? <CheckCircle2 size={14} /> : <XCircle size={14} />
                                                                : i + 1
                                                            }
                                                        </div>
                                                        <p className="font-semibold text-base-content leading-relaxed text-sm md:text-base pt-0.5">{q.question}</p>
                                                    </div>
                                                    <LecteurVocal texte={q.question} title="Écouter" variant="mini" />
                                                </div>

                                                {/* Saisie + correction */}
                                                <div className="flex items-center gap-3 ml-10">
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        value={userAnswers[q.sous_id] || ''}
                                                        onChange={e => !submitted && setUserAnswers(prev => ({
                                                            ...prev,
                                                            [q.sous_id]: e.target.value.replace(/[^0-9]/g, '')
                                                        }))}
                                                        disabled={submitted}
                                                        placeholder="?"
                                                        className={`input input-bordered w-28 text-center text-lg font-black rounded-xl focus:outline-none focus:ring-2 focus:ring-primary ${
                                                            submitted
                                                                ? isCorrect
                                                                    ? 'border-emerald-400 bg-emerald-100/50 text-emerald-700'
                                                                    : 'border-red-400 bg-red-100/50 text-red-700'
                                                                : ''
                                                        }`}
                                                    />
                                                    {q.unite && (
                                                        <span className="text-xs font-black text-base-content/40 uppercase tracking-widest">{q.unite}</span>
                                                    )}
                                                    {submitted && !isCorrect && (
                                                        <div className="flex items-center gap-1 text-emerald-600 font-black text-sm">
                                                            <CheckCircle2 size={13} /> {q.reponse_correcte}{q.unite ? ` ${q.unite}` : ''}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Explication / Procédure de résolution */}
                                                {submitted && q.explication && (
                                                    <div className="ml-10 flex items-start gap-2.5 bg-primary/5 dark:bg-base-200/50 rounded-2xl p-3.5 border border-primary/20">
                                                        <BrainCircuit size={16} className="text-primary shrink-0 mt-0.5" />
                                                        <div className="space-y-1">
                                                            <p className="text-[11px] font-black uppercase tracking-wider text-primary">Démarche & Explication :</p>
                                                            <p className="text-xs md:text-sm text-base-content/85 font-medium leading-relaxed">{q.explication}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* ── RÉSULTAT FINAL ── */}
                            {submitted && (
                                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500 pt-2">
                                    {/* Score */}
                                    <div className="rounded-2xl bg-gradient-to-br from-primary to-violet-600 p-6 text-white text-center shadow-xl">
                                        <Trophy size={32} className="mx-auto mb-2 opacity-90" />
                                        <p className="text-4xl font-black">{score}/{probleme.questions.length}</p>
                                        <p className="text-white/70 font-bold mt-1 text-sm">bonnes réponses</p>
                                    </div>

                                    {/* Feedback Mathy */}
                                    {(isAiLoading || globalFeedback) && (
                                        <div className="rounded-2xl bg-base-200/40 border border-base-200 p-4 flex items-start gap-3">
                                            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shrink-0">
                                                <BrainCircuit size={16} className="text-primary-content" />
                                            </div>
                                            <p className="text-sm text-base-content/80 font-medium italic leading-relaxed pt-1">
                                                {isAiLoading ? 'Mathy analyse tes réponses...' : globalFeedback}
                                            </p>
                                        </div>
                                    )}

                                    <button onClick={onBack} className="btn btn-primary btn-block rounded-2xl font-black">
                                        Retour
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* ── PIED FIXE : BOUTON TERMINER ── */}
                        {!submitted && (
                            <div className="px-6 py-4 border-t border-base-200 bg-base-100 shrink-0 flex items-center justify-between gap-4">
                                <p className="text-xs font-bold text-base-content/40">
                                    {allAnswered ? 'Prêt à soumettre !' : `${filledCount} / ${probleme.questions.length} réponses`}
                                </p>
                                <button
                                    onClick={() => handleSubmit(false)}
                                    disabled={!allAnswered}
                                    className="btn btn-primary rounded-2xl font-black flex items-center gap-2 min-w-[140px] disabled:opacity-40"
                                >
                                    <Send size={15} /> Terminer
                                </button>
                            </div>
                        )}
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

export default ProblemeEngine;
