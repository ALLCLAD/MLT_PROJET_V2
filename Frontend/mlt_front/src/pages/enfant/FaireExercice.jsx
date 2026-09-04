import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, BrainCircuit, Trophy, ArrowRight, Timer, Lightbulb, Star, ChevronLeft, Sparkles, Pencil, LayoutGrid, CheckCircle2, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../../apiDjango/api.jsx';
import { getMathyFeedback } from '../../apiDjango/aiService';
import { speakText, speakTextSafe, stopAllAudio } from '../../apiDjango/ttsService';
import BrouillonCanvas from '../../composants/UIenfant/BrouillonCanvas';
import BatonnetsComptage from '../../composants/UIenfant/BatonnetsComptage';
import ExerciseRenderer from '../../composants/UIenfant/ExerciseRenderer';

const CORRECT_PHRASES = [
    "Bravo ! C'est la bonne réponse.",
    "Super ! Tu as trouvé du premier coup.",
    "Génial ! Excellent calcul.",
    "Parfait ! Continue comme ça."
];

const INCORRECT_PHRASES = [
    "Dommage ! Lis bien l'explication ci-dessous.",
    "Pas de soucis ! Regarde la méthode ci-dessous.",
    "Ne baisse pas les bras ! Lis l'explication en bas.",
    "Presque ! Lis la démarche pour t'améliorer."
];

// 🦴 SKELETON LOADERS
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
        {/* Progression Skeleton */}
        <div className="w-full max-w-2xl space-y-2">
            <div className="flex justify-between">
                <div className="w-28 h-4 bg-base-300 rounded-lg"></div>
                <div className="w-12 h-4 bg-base-300 rounded-lg"></div>
            </div>
            <div className="w-full h-3 bg-base-300 rounded-full"></div>
        </div>

        {/* Question Title Skeleton */}
        <div className="w-full max-w-2xl text-center py-6 space-y-2">
            <div className="w-3/4 h-8 bg-base-300 rounded-xl mx-auto"></div>
            <div className="w-1/2 h-6 bg-base-300 rounded-xl mx-auto"></div>
        </div>

        {/* Grid Options Skeleton */}
        <div className="w-full max-w-2xl flex flex-col md:flex-row items-center gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 w-full">
                <div className="h-16 bg-base-300 rounded-2xl w-full"></div>
                <div className="h-16 bg-base-300 rounded-2xl w-full"></div>
                <div className="h-16 bg-base-300 rounded-2xl w-full"></div>
                <div className="h-16 bg-base-300 rounded-2xl w-full"></div>
            </div>
            <div className="w-20 h-20 bg-base-300 rounded-3xl shrink-0"></div>
        </div>

        {/* Bulb Icon Skeleton */}
        <div className="w-16 h-16 bg-base-300 rounded-full mx-auto"></div>
    </div>
);

const FaireExercice = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [exercices, setExercices] = useState([]);
    const [leconTitre, setLeconTitre] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [score, setScore] = useState(0);

    const [showFeedback, setShowFeedback] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isCorrect, setIsCorrect] = useState(false);

    const [aiFeedback, setAiFeedback] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [hint, setHint] = useState('');
    const [hintsLeft, setHintsLeft] = useState(3);
    const [showHintBox, setShowHintBox] = useState(false);

    // CHANGEMENT : Timer passé à 60 secondes
    const [timeLeft, setTimeLeft] = useState(60);
    const [quizFinished, setQuizFinished] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [isReading, setIsReading] = useState(false);
    const [isBrouillonOpen, setIsBrouillonOpen] = useState(false);
    const [brouillonMode, setBrouillonMode] = useState('docked'); // 'docked' | 'floating' | 'modal'
    const [isBatonnetsOpen, setIsBatonnetsOpen] = useState(false);
    const [batonnetsMode, setBatonnetsMode] = useState('docked'); // 'docked' | 'floating' | 'modal'

    const timerRef = useRef(null);
    const scoreRef = useRef(0);

    // --- 1. CHARGEMENT DES DONNÉES ---
    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                // Réinitialiser les états pour la nouvelle leçon
                setExercices([]);
                setCurrentIndex(0);
                setScore(0);
                scoreRef.current = 0;
                setShowFeedback(false);
                setSelectedAnswer(null);
                setAiFeedback('');
                setHint('');
                setHintsLeft(3);
                setShowHintBox(false);
                setQuizFinished(false);
                stopAllAudio(); // Arrêter toute lecture en cours

                const minDelay = new Promise(resolve => setTimeout(resolve, 1200));
                const [resEx, resLecon] = await Promise.all([
                    api.get(`/enseignant/enfant/lecons/${id}/exercices/`),
                    api.get(`/enseignant/enfant/lecons/${id}/`),
                    minDelay
                ]);
                setExercices(resEx.data);
                setLeconTitre(resLecon.data.titre || 'une leçon');
            } catch (err) {
                console.error("Erreur chargement:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [id]);

    // Arrêter la lecture quand l'enfant quitte l'exercice (unmount)
    useEffect(() => {
        return () => {
            stopAllAudio();
        };
    }, []);

    // --- LECTURE VOCALE DE LA QUESTION ---
    useEffect(() => {
        if (loading || quizFinished || !exercices || exercices.length === 0 || !exercices[currentIndex]) return;

        const readQuestion = async () => {
            setIsReading(true);
            try {
                await speakText(exercices[currentIndex].question);
            } catch (err) {
                console.error('TTS error:', err);
            } finally {
                setIsReading(false);
            }
        };

        readQuestion();
    }, [currentIndex, loading, quizFinished, exercices]);

    // --- 2. MÉLANGE DES OPTIONS ---
    const optionsStyleQuiz = useMemo(() => {
        if (!exercices[currentIndex]) return [];
        const exo = exercices[currentIndex];
        const bonne = String(exo.reponse_correcte).trim();
        let mauvaises = Array.isArray(exo.mauvaises_reponses)
            ? exo.mauvaises_reponses
            : (exo.mauvaises_reponses?.split(',') || []);

        const toutes = [bonne, ...mauvaises].map(r => String(r).trim()).filter(r => r && r !== ",");
        return [...new Set(toutes)].sort(() => Math.random() - 0.5);
    }, [currentIndex, exercices]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // --- 3. LOGIQUE DU TIMER ---
    useEffect(() => {
        if (loading || quizFinished || showFeedback || isReading) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }

        const currentExo = exercices[currentIndex];
        const typeEx = currentExo?.type_exercice || currentExo?.type || 'QCM';

        const initialTime = typeEx === 'PROBLEME' ? 1800
            : typeEx === 'CALCUL_ECRIT' ? 900
            : typeEx === 'CALCUL_MENTAL' ? 30
            : 60;
        setTimeLeft(initialTime);
        
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleOptionClick('TEMPS_ECOULE');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [currentIndex, loading, quizFinished, showFeedback, isReading, exercices]);

    // --- 4. ACTIONS ---
    const handleOptionClick = async (option) => {
        if (showFeedback || isAiLoading) return;

        // Arrêter immédiatement toute lecture audio en cours
        stopAllAudio();

        if (timerRef.current) clearInterval(timerRef.current);
        setShowHintBox(false);

        const currentExo = exercices[currentIndex];
        const check = option === currentExo.reponse_correcte;

        setSelectedAnswer(option);
        setIsCorrect(check);

        if (check) {
            setScore(s => {
                const newScore = s + 1;
                scoreRef.current = newScore;
                return newScore;
            });
        }

        setShowFeedback(true);
        setIsAiLoading(true);

        try {
            const feedback = await getMathyFeedback(currentExo.question, option, check, currentExo.explication);
            const textToDisplay = feedback || currentExo.explication || (check ? "Bien joué ! C'est la bonne réponse." : "Regarde la méthode pour comprendre.");
            setAiFeedback(textToDisplay);
            
            // Phrase d'encouragement vocale
            const phrases = check ? CORRECT_PHRASES : INCORRECT_PHRASES;
            const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
            speakTextSafe(randomPhrase);
        } catch (error) {
            const defaultFeedback = currentExo.explication || (check ? "Bien joué ! C'est la bonne réponse." : "Regarde la méthode pour comprendre.");
            setAiFeedback(defaultFeedback);
            speakTextSafe(check ? "Bravo !" : "Essaie encore !");
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleNext = () => {
        stopAllAudio(); // Arrête la lecture audio en cours
        if (currentIndex < exercices.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setShowFeedback(false);
            setSelectedAnswer(null);
            setAiFeedback('');
            setHint('');
        } else {
            handleFinExercices();
        }
    };

    const handleFinExercices = async () => {
        setIsSaving(true);
        try {
            await api.post('/communication/fin-exercices/', {
                score: scoreRef.current,
                total: exercices.length,
                lecon_titre: leconTitre,
                lecon_id: id,
            });
        } catch (err) {
            console.error("Erreur sauvegarde finale:", err);
        } finally {
            setIsSaving(false);
            setQuizFinished(true);
            confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 } });
        }
    };

    const handleUseHint = async () => {
        if (hintsLeft <= 0 || showHintBox || showFeedback || isAiLoading) return;

        stopAllAudio(); // Arrête toute lecture vocale en cours avant d'annoncer l'aide
        setIsAiLoading(true);
        setShowHintBox(true);
        setHintsLeft(prev => prev - 1);

        const currentExo = exercices[currentIndex];
        try {
            const hintMsg = await getMathyFeedback(currentExo.question, "DEMANDE_INDICE", false, "");
            const textHint = hintMsg || "Analyse bien l'énoncé et demande-toi quelle opération faire en premier.";
            setHint(textHint);
            speakTextSafe(textHint);
        } catch (err) {
            const fallbackHint = "Observe bien la consigne pour trouver l'étape à suivre.";
            setHint(fallbackHint);
            speakTextSafe(fallbackHint);
        } finally {
            setIsAiLoading(false);
        }
    };

    if (loading) return (
        <div className="w-full max-w-4xl mx-auto bg-base-100 dark:bg-base-100 rounded-2xl shadow-sm border border-base-300/60 overflow-hidden flex flex-col min-h-[500px]">
            <ExerciseHeaderSkeleton />
            <ExerciseContentSkeleton />
        </div>
    );

    const anyOpen = isBrouillonOpen || isBatonnetsOpen;

    const cardContent = (
        <div className="flex-1 flex flex-col justify-between">
            {/* TOP BAR EXÉCUTION UNIFORMISÉE */}
            <div className="px-5 py-3.5 flex justify-between items-center border-b border-base-200 dark:border-base-300/60 bg-base-100 dark:bg-base-100">
                <button 
                    onClick={() => { stopAllAudio(); navigate(-1); }} 
                    className="btn btn-xs btn-ghost text-base-content/60 hover:text-error font-black uppercase text-[10px] tracking-wider gap-1"
                >
                    <ChevronLeft size={14} /> Quitter
                </button>
                
                <div className="flex gap-2">
                    <button 
                        onClick={() => {
                            setIsBrouillonOpen(!isBrouillonOpen);
                            if (!isBrouillonOpen) setIsBatonnetsOpen(false);
                        }}
                        className={`btn btn-xs rounded-xl font-bold flex items-center gap-1 text-[10px] uppercase tracking-wider ${isBrouillonOpen ? 'btn-primary text-white shadow-xs' : 'btn-outline btn-primary'}`}
                    >
                        <Pencil size={12} />
                        <span>Brouillon</span>
                    </button>
                    <button 
                        onClick={() => {
                            setIsBatonnetsOpen(!isBatonnetsOpen);
                            if (!isBatonnetsOpen) setIsBrouillonOpen(false);
                        }}
                        className={`btn btn-xs rounded-xl font-bold flex items-center gap-1 text-[10px] uppercase tracking-wider ${isBatonnetsOpen ? 'btn-warning text-white shadow-xs' : 'btn-outline btn-warning'}`}
                    >
                        <LayoutGrid size={12} />
                        <span>Bâtonnets</span>
                    </button>
                </div>

                <div className="flex gap-1 items-center bg-amber-500/10 px-2 py-0.5 rounded-full">
                    {[...Array(3)].map((_, i) => (
                        <Star key={i} size={14} className={i < hintsLeft ? 'text-amber-500 fill-amber-500' : 'text-base-300'} />
                    ))}
                </div>
            </div>

            {/* PROGRESSION */}
            <div className="px-8 pt-4 pb-2">
                <div className="flex justify-between items-end mb-2 px-1">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Leçon : {leconTitre}</span>
                    <span className="text-[10px] font-black opacity-30 italic">{currentIndex + 1} / {exercices.length}</span>
                </div>
                <div className="w-full h-3 bg-base-200 rounded-full overflow-hidden p-[2px] border border-base-300 shadow-inner">
                    <div
                        className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${((currentIndex + 1) / exercices.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-[50vh]">
                {!quizFinished ? (
                    <div className="w-full max-w-2xl flex-1 flex flex-col">
                        {/* INDICATEUR DE LECTURE VOCALE */}
                        {isReading && (
                            <div className="flex items-center justify-center gap-2 text-primary animate-pulse py-3">
                                <span className="text-xs font-black uppercase tracking-widest">
                                    Lecture en cours...
                                </span>
                            </div>
                        )}

                        {/* QUESTION */}
                        {(exercices[currentIndex]?.type_exercice || exercices[currentIndex]?.type || 'QCM') !== 'PROBLEME' && (
                            <div className="text-center py-6">
                                <h1 className="text-2xl md:text-3xl font-bold text-base-content leading-tight">
                                    {exercices[currentIndex]?.question}
                                </h1>
                            </div>
                        )}

                        {/* OPTIONS & TIMER */}
                        <div className="flex flex-col md:flex-row items-center gap-6 mb-8 w-full">
                            <div className="flex-1 w-full flex justify-center">
                                <ExerciseRenderer
                                    question={exercices[currentIndex]}
                                    onResolve={handleOptionClick}
                                    showFeedback={showFeedback}
                                    selectedAnswer={selectedAnswer}
                                    disabled={isAiLoading}
                                />
                            </div>

                            <div className="bg-primary/10 p-4 rounded-3xl border border-primary/20 flex md:flex-col items-center gap-2 min-w-[90px] shrink-0">
                                <Timer size={18} className="text-primary" />
                                <span className="font-black text-xl tabular-nums text-primary">{formatTime(timeLeft)}</span>
                            </div>
                        </div>

                        {/* ZONE INDICE */}
                        <div className="flex flex-col items-center justify-center py-4 mt-auto">
                            {showHintBox && (
                                <div className="mb-4 bg-base-100 border border-primary/20 p-4 rounded-2xl shadow-xl animate-in zoom-in-95 max-w-sm text-center">
                                    <p className="text-base-content/80 font-bold text-sm italic">
                                        {isAiLoading ? "Mathy réfléchit..." : hint}
                                    </p>
                                </div>
                            )}
                            <button
                                onClick={handleUseHint}
                                disabled={hintsLeft <= 0 || showFeedback || isAiLoading || showHintBox}
                                className={`relative group transition-all duration-300 ${hintsLeft > 0 && !showFeedback ? 'hover:scale-110 active:scale-90' : 'opacity-40 grayscale'}`}
                            >
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 shadow-lg relative z-10 ${showHintBox ? 'bg-amber-400 border-white text-white' : 'bg-base-100 border-amber-100 text-amber-500'}`}>
                                    <Lightbulb size={32} fill={showHintBox ? "white" : "none"} />
                                    <div className="absolute -top-1 -right-1 bg-base-content text-base-100 text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-base-100">
                                        {hintsLeft}
                                    </div>
                                </div>
                            </button>
                        </div>

                        {/* ZONE FEEDBACK AVEC EXPLICATION PAS À PAS EN BAS */}
                        {showFeedback && (
                            <div className="mt-6 animate-in slide-in-from-bottom-4 duration-300">
                                <div className="bg-neutral text-neutral-content p-5 rounded-[2rem] shadow-xl space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                            {isCorrect ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-sm uppercase tracking-wide">
                                                {isCorrect ? 'Excellente réponse !' : 'Oups, ce n\'est pas tout à fait ça !'}
                                            </h4>
                                            <p className="text-[11px] font-semibold opacity-70">
                                                {isCorrect ? 'Découvre la méthode ci-dessous' : `Réponse attendue : ${exercices[currentIndex]?.reponse_correcte}`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Petite explication pas à pas tout en bas */}
                                    <div className="bg-base-100/10 p-4 rounded-2xl border border-white/10 text-xs md:text-sm font-medium leading-relaxed">
                                        <p className="font-black text-amber-300 mb-1 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                                            <BrainCircuit size={16} /> Explication de la réponse :
                                        </p>
                                        <p className="text-white/90 italic">
                                            {isAiLoading ? "Mathy analyse et rédige l'explication..." : (aiFeedback || exercices[currentIndex]?.explication || "Lis attentivement pour bien comprendre la démarche.")}
                                        </p>
                                    </div>

                                    <button onClick={handleNext} className="btn btn-primary btn-block rounded-2xl h-12 font-black shadow-lg">
                                        {currentIndex < exercices.length - 1 ? 'CONTINUER' : 'VOIR MON RÉSULTAT'} <ArrowRight size={18} className="ml-2" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* ÉCRAN DE FIN */
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95">
                        <div className="relative">
                            <Trophy size={100} className="text-amber-400" />
                            <Sparkles size={40} className="absolute -top-4 -right-4 text-primary animate-pulse" />
                        </div>
                        <h2 className="text-4xl font-black text-base-content uppercase">Bravo !</h2>
                        <div className="bg-primary text-primary-content p-10 rounded-[3rem] shadow-2xl">
                            <span className="text-7xl font-black italic">
                                {exercices.length > 0 ? Math.round((scoreRef.current / exercices.length) * 20) : 0}
                            </span>
                            <span className="text-2xl opacity-50">/20</span>
                        </div>
                        <p className="text-base-content/40 font-bold italic">Leçon : {leconTitre}</p>
                        {isSaving && <p className="text-[10px] font-black uppercase opacity-50 animate-pulse tracking-widest">Enregistrement...</p>}
                        <button onClick={() => navigate('/enfant/lecons')} className="btn btn-outline btn-primary rounded-2xl px-12 font-black border-4">
                            RETOUR AUX LEÇONS
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    const isDockedToolOpen = isBrouillonOpen || isBatonnetsOpen;

    return (
        <div className={`transition-all duration-300 ${isDockedToolOpen ? 'w-full' : 'max-w-4xl mx-auto'}`}>
            <div className={`bg-base-100 dark:bg-base-100 rounded-2xl shadow-sm border border-base-300/60 overflow-hidden flex flex-col ${isDockedToolOpen ? 'lg:flex-row' : ''}`}>
                
                {/* ── COLONNE PRINCIPALE ── */}
                <div className="flex-1 flex flex-col min-h-[500px]">
                    {cardContent}
                </div>

                {/* ── PANNEAU OUTIL DOCKÉ ── */}
                {isDockedToolOpen && (
                    <div className="w-full lg:w-[380px] shrink-0 border-t lg:border-t-0 lg:border-l border-base-300/60 bg-base-200/40 p-4 flex flex-col h-[450px] lg:h-auto justify-stretch">
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

export default FaireExercice;