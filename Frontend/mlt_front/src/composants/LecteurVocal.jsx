import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Play, Pause, RotateCcw, Loader2 } from 'lucide-react';
import api from '../apiDjango/api.jsx';
import { stopAllAudio, setCurrentAudio, setCurrentAbortController, registerInterruptCallback } from '../apiDjango/ttsService';

const LecteurVocal = ({ texte, title = '', variant = 'full' }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [indexPhrase, setIndexPhrase] = useState(0);
    const [totalPhrases, setTotalPhrases] = useState(0);

    const audioRef = useRef(null);
    const indexRef = useRef(0);
    const phrasesRef = useRef([]);
    const abortControllerRef = useRef(null);
    const userPausedRef = useRef(false);
    const cacheRef = useRef({}); // Cache pour stocker les segments pré-chargés
    
    // Identifiant de session de lecture pour éviter les chevauchements asynchrones
    const lectureSessionIdRef = useRef(0);
    
    // Réf pour avoir la valeur de isSpeaking en temps réel dans les callbacks
    const isSpeakingRef = useRef(false);
    useEffect(() => {
        isSpeakingRef.current = isSpeaking;
    }, [isSpeaking]);

    // Nettoyage strict : Markdown + Émojis + Pauses de lecture
    const filtrerTexte = (txt) => {
        if (!txt) return "";
        return txt
            // 1. Suppression des émojis et symboles spéciaux
            .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')
            // 2. Nettoyage Markdown
            .replace(/[#*`_~]/g, '')
            // 3. Texte des liens uniquement
            .replace(/\[(.*?)\]\(.*?\)/g, '$1')
            // 4. Remplacement des sauts de ligne par des points (pour marquer des pauses)
            .replace(/[\r\n]+/g, '. ')
            // 5. Nettoyage des espaces doubles
            .replace(/\s+/g, ' ')
            .trim();
    };

    const decouperEnPhrases = (texteNettoye) => {
        if (!texteNettoye) return [];
        const phrases = [];
        let accumule = "";
        for (let i = 0; i < texteNettoye.length; i++) {
            const char = texteNettoye[i];
            accumule += char;
            // Découper sur les points de ponctuation principaux
            if (char === '.' || char === '?' || char === '!') {
                const texteTrimme = accumule.trim();
                // Éviter de découper sur les numéros de liste comme "1.", "2.", etc.
                const estNumeroListe = char === '.' && /^\d+$/.test(texteTrimme.substring(0, texteTrimme.length - 1));
                
                if (!estNumeroListe) {
                    phrases.push(texteTrimme);
                    accumule = "";
                }
            }
        }
        if (accumule.trim()) {
            phrases.push(accumule.trim());
        }
        
        // Sécurité supplémentaire : si une phrase est extrêmement longue, on la recoupe par morceaux plus petits
        const phrasesFinales = [];
        for (const p of phrases) {
            if (p.length > 800) {
                const parties = p.split(',');
                for (let i = 0; i < parties.length; i++) {
                    let fragment = parties[i].trim();
                    if (fragment) {
                        if (i < parties.length - 1) {
                            fragment += ',';
                        }
                        phrasesFinales.push(fragment);
                    }
                }
            } else {
                phrasesFinales.push(p);
            }
        }
        
        return phrasesFinales.filter(p => p.length > 0);
    };

    // Initialiser les phrases au chargement ou changement de texte
    useEffect(() => {
        const texteNettoye = filtrerTexte(texte);
        const listePhrases = decouperEnPhrases(texteNettoye);
        phrasesRef.current = listePhrases;
        setTotalPhrases(listePhrases.length);
        
        // Enregistrer le callback d'interruption globale
        registerInterruptCallback(() => {
            if (isSpeakingRef.current) {
                stop();
            }
        });

        return () => {
            // Nettoyage complet lors du démontage du composant
            stopSilencieusement();
            registerInterruptCallback(null);
        };
    }, [texte]);

    const nettoyerCache = () => {
        Object.keys(cacheRef.current).forEach(key => {
            const item = cacheRef.current[key];
            if (item.controller) {
                try { item.controller.abort(); } catch (e) {}
            }
            if (item.url) {
                try { URL.revokeObjectURL(item.url); } catch (e) {}
            }
        });
        cacheRef.current = {};
    };

    const stopSilencieusement = () => {
        // Incrémenter la session de lecture annule immédiatement toute boucle ou promesse en cours
        lectureSessionIdRef.current += 1;

        nettoyerCache();

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        if (audioRef.current) {
            try {
                audioRef.current.onended = null;
                audioRef.current.onerror = null;
                audioRef.current.onpause = null;
                audioRef.current.pause();
            } catch (e) {}
            audioRef.current = null;
        }
        setCurrentAudio(null);
        setCurrentAbortController(null);
    };

    const stop = () => {
        stopSilencieusement();
        indexRef.current = 0;
        setIndexPhrase(0);
        setIsSpeaking(false);
        setIsPaused(false);
        setIsLoading(false);
        userPausedRef.current = false;
    };

    const pause = () => {
        userPausedRef.current = true;
        setIsSpeaking(false);
        setIsPaused(true);
        setIsLoading(false);

        // On incrémente la session de lecture pour annuler les requêtes asynchrones en cours
        lectureSessionIdRef.current += 1;

        if (audioRef.current) {
            audioRef.current.pause();
        }

        // Annuler la requête du segment en cours si elle est toujours active
        const cachedItem = cacheRef.current[indexRef.current];
        if (cachedItem && cachedItem.controller) {
            try {
                cachedItem.controller.abort();
            } catch (e) {}
        }
    };

    const prefetchSegment = async (index, sessionId) => {
        if (index >= phrasesRef.current.length) return;
        if (cacheRef.current[index]) return; // Déjà en cours ou chargé

        const phrase = phrasesRef.current[index];
        const controller = new AbortController();
        
        cacheRef.current[index] = {
            state: 'loading',
            controller: controller,
            promise: null,
            url: null
        };

        const promise = (async () => {
            try {
                const response = await api.post(
                    '/tts/synthesize/',
                    { text: phrase },
                    { 
                        responseType: 'blob',
                        signal: controller.signal
                    }
                );
                
                if (lectureSessionIdRef.current !== sessionId) return;

                const audioBlob = new Blob([response.data], { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                
                if (cacheRef.current[index]) {
                    cacheRef.current[index].state = 'loaded';
                    cacheRef.current[index].url = audioUrl;
                }
            } catch (err) {
                if (err.name !== 'AbortError' && err.message !== 'canceled') {
                    console.error(`Erreur prefetch segment ${index}:`, err);
                    if (cacheRef.current[index]) {
                        cacheRef.current[index].state = 'error';
                    }
                }
            }
        })();

        cacheRef.current[index].promise = promise;
    };

    const jouerSegment = async (index) => {
        const sessionId = lectureSessionIdRef.current;

        if (index >= phrasesRef.current.length) {
            stop();
            return;
        }

        indexRef.current = index;
        setIndexPhrase(index);

        // Lancer le pré-chargement des segments suivants (index + 1 et index + 2)
        prefetchSegment(index + 1, sessionId);
        prefetchSegment(index + 2, sessionId);

        let cachedItem = cacheRef.current[index];

        if (!cachedItem) {
            prefetchSegment(index, sessionId);
            cachedItem = cacheRef.current[index];
        }

        // Si le segment est en cours de téléchargement, on attend la fin du chargement
        if (cachedItem && cachedItem.state === 'loading') {
            setIsLoading(true);
            await cachedItem.promise;
            setIsLoading(false);
        }

        if (lectureSessionIdRef.current !== sessionId) return;

        if (cachedItem && cachedItem.state === 'loaded' && cachedItem.url) {
            const audio = new Audio(cachedItem.url);
            audioRef.current = audio;
            setCurrentAudio(audio);

            audio.onended = () => {
                if (lectureSessionIdRef.current !== sessionId) return;
                
                // Nettoyer l'URL du segment joué pour libérer la mémoire
                try {
                    URL.revokeObjectURL(cachedItem.url);
                    delete cacheRef.current[index];
                } catch (e) {}

                audioRef.current = null;
                setCurrentAudio(null);
                
                // Jouer immédiatement le segment suivant
                jouerSegment(indexRef.current + 1);
            };

            audio.onerror = (err) => {
                console.error("Erreur lecture audio segment:", err);
                if (lectureSessionIdRef.current !== sessionId) return;

                audioRef.current = null;
                setCurrentAudio(null);
                
                // Passer au suivant après un court instant
                setTimeout(() => {
                    if (lectureSessionIdRef.current === sessionId && isSpeakingRef.current && !userPausedRef.current) {
                        jouerSegment(indexRef.current + 1);
                    }
                }, 400);
            };

            try {
                await audio.play();
                if (lectureSessionIdRef.current !== sessionId) {
                    audio.pause();
                    return;
                }
            } catch (err) {
                console.error("Erreur de lecture audio :", err);
            }
        } else {
            console.warn(`Segment ${index} indisponible. Passage au suivant.`);
            jouerSegment(indexRef.current + 1);
        }
    };

    const lire = async () => {
        // 1. Si on reprend après une pause utilisateur
        if (isPaused && userPausedRef.current) {
            userPausedRef.current = false;
            setIsSpeaking(true);
            setIsPaused(false);
            
            // Relancer une session pour cette reprise
            lectureSessionIdRef.current += 1;
            const sessionId = lectureSessionIdRef.current;
            
            if (audioRef.current) {
                try {
                    await audioRef.current.play();
                    // Vérifier si une interruption a eu lieu pendant le play
                    if (lectureSessionIdRef.current !== sessionId) {
                        audioRef.current.pause();
                    }
                } catch (err) {
                    console.error("Erreur de reprise lecture :", err);
                    jouerSegment(indexRef.current);
                }
            } else {
                jouerSegment(indexRef.current);
            }
            return;
        }

        // 2. Sinon, on démarre une nouvelle lecture
        stopAllAudio(); // Coupe tout autre audio du site. Le callback d'interruption n'aura pas d'effet car isSpeaking est encore false !

        if (phrasesRef.current.length === 0) return;

        // Démarrer une nouvelle session de lecture
        lectureSessionIdRef.current += 1;
        
        setIsSpeaking(true);
        setIsPaused(false);
        userPausedRef.current = false;
        
        jouerSegment(indexRef.current);
    };

    if (variant === 'compact') {
        return (
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 via-indigo-500/10 to-primary/5 hover:from-primary/20 hover:to-indigo-500/15 border border-primary/25 hover:border-primary/50 rounded-full px-3.5 py-1.5 shadow-xs hover:shadow-md transition-all duration-200 text-xs font-black text-primary shrink-0 select-none">
                {isLoading ? (
                    <div className="flex items-center gap-2 text-primary">
                        <Loader2 size={15} className="animate-spin" />
                        <span className="text-[11px] font-black uppercase tracking-wider">Chargement...</span>
                    </div>
                ) : !isSpeaking ? (
                    <button
                        type="button"
                        onClick={lire}
                        className="flex items-center gap-2 text-primary hover:text-primary-dark group transition-colors"
                        title={title || (isPaused ? "Reprendre la lecture" : "Cliquer pour écouter")}
                    >
                        <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
                            <Play size={10} fill="currentColor" className="ml-0.5" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-wider">
                            {title || (isPaused ? "Reprendre" : "Écouter l'énoncé")}
                        </span>
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={pause}
                        className="flex items-center gap-2 text-primary group transition-colors"
                        title="Mettre en pause"
                    >
                        <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
                            <Pause size={10} fill="currentColor" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                            <span>Pause</span>
                            <span className="flex gap-0.5 items-end h-2.5">
                                <span className="w-0.5 h-full bg-primary animate-bounce rounded-full" style={{ animationDelay: '0ms' }} />
                                <span className="w-0.5 h-2/3 bg-primary animate-bounce rounded-full" style={{ animationDelay: '150ms' }} />
                                <span className="w-0.5 h-full bg-primary animate-bounce rounded-full" style={{ animationDelay: '300ms' }} />
                            </span>
                        </span>
                    </button>
                )}

                {(isSpeaking || isPaused) && (
                    <div className="flex items-center border-l border-primary/20 pl-2 ml-0.5">
                        <button
                            type="button"
                            onClick={stop}
                            className="text-base-content/50 hover:text-error hover:bg-error/10 p-1 rounded-full transition-colors flex items-center gap-1"
                            title="Recommencer depuis le début"
                        >
                            <RotateCcw size={13} />
                            <span className="text-[10px] font-bold uppercase hidden sm:inline">Recommencer</span>
                        </button>
                    </div>
                )}
            </div>
        );
    }

    if (variant === 'mini') {
        return (
            <div className="inline-flex items-center gap-1 shrink-0 select-none">
                {isLoading ? (
                    <div className="px-2.5 py-1 rounded-full bg-primary/10 text-primary flex items-center gap-1.5 text-[11px] font-bold">
                        <Loader2 size={12} className="animate-spin" />
                        <span>Chargement</span>
                    </div>
                ) : !isSpeaking ? (
                    <button
                        type="button"
                        onClick={lire}
                        className="group flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 hover:border-primary font-black text-[11px] uppercase tracking-wider transition-all duration-200 shadow-2xs hover:shadow-xs active:scale-95"
                        title={title || "Écouter la question"}
                    >
                        <Volume2 size={13} className="group-hover:scale-110 transition-transform" />
                        <span>{title || (isPaused ? "Reprendre" : "Écouter")}</span>
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={pause}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-white border border-primary font-black text-[11px] uppercase tracking-wider transition-all duration-200 shadow-xs active:scale-95"
                        title="Mettre en pause"
                    >
                        <Pause size={12} fill="currentColor" />
                        <span className="animate-pulse">Pause</span>
                    </button>
                )}

                {(isSpeaking || isPaused) && (
                    <button
                        type="button"
                        onClick={stop}
                        className="p-1 rounded-full text-base-content/40 hover:text-error hover:bg-error/10 transition-colors"
                        title="Recommencer"
                    >
                        <RotateCcw size={12} />
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4 bg-primary/10 p-5 rounded-[2rem] border-2 border-primary/20 mb-8 animate-in fade-in zoom-in duration-500">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Volume2 size={24} className={isSpeaking && !isLoading ? "animate-pulse" : ""} />
            </div>

            <div className="flex-1">
                <p className="font-black text-primary text-xs uppercase tracking-widest">Écoute ta leçon</p>
                <p className="text-[10px] font-bold opacity-70 text-base-content/85">
                    {isLoading 
                        ? "Mathy prépare sa voix..." 
                        : isSpeaking 
                            ? `Lecture : phrase ${indexPhrase + 1} sur ${totalPhrases}...` 
                            : isPaused 
                                ? "Lecture suspendue" 
                                : "Clique sur play pour écouter Mathy"
                    }
                </p>
                {totalPhrases > 0 && (isSpeaking || isPaused) && (
                    <div className="w-full bg-base-300 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div 
                            className="bg-primary h-full transition-all duration-300 rounded-full"
                            style={{ width: `${((indexPhrase + (isSpeaking && !isLoading ? 0.5 : 0)) / totalPhrases) * 100}%` }}
                        />
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                {isLoading ? (
                    <button className="btn btn-circle btn-primary shadow-lg cursor-not-allowed">
                        <Loader2 size={20} className="animate-spin" />
                    </button>
                ) : !isSpeaking ? (
                    <button
                        onClick={lire}
                        className="btn btn-circle btn-primary shadow-lg hover:scale-110 transition-transform"
                    >
                        <Play size={20} fill="currentColor" />
                    </button>
                ) : (
                    <button
                        onClick={pause}
                        className="btn btn-circle btn-primary shadow-lg hover:scale-110 transition-transform"
                    >
                        <Pause size={20} fill="currentColor" />
                    </button>
                )}

                <button
                    onClick={stop}
                    className="btn btn-circle btn-ghost text-error hover:bg-error/10"
                    disabled={!isSpeaking && !isPaused && indexPhrase === 0}
                >
                    <RotateCcw size={20} />
                </button>
            </div>
        </div>
    );
};

export default LecteurVocal;