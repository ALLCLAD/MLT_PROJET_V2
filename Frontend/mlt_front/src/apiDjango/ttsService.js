import api from './api.jsx';

// Variable de module pour garder une référence vers l'audio en cours de lecture
let currentAudio = null;
// Variable de module pour garder une référence vers l'AbortController de la requête HTTP en cours
let currentAbortController = null;

/**
 * Arrête tout audio en cours de lecture, annule la requête en cours et libère ses ressources.
 */
let interruptCallback = null;

/**
 * Permet d'enregistrer un callback d'interruption (par exemple pour arrêter
 * la lecture d'une leçon si un autre son démarre).
 */
export function registerInterruptCallback(callback) {
    interruptCallback = callback;
}

export function stopAllAudio() {
    // 1. Annuler la requête HTTP en cours si elle existe
    if (currentAbortController) {
        try {
            currentAbortController.abort();
        } catch (e) {
            console.warn("Erreur lors de l'annulation de la requête de synthèse :", e);
        }
        currentAbortController = null;
    }

    // 2. Arrêter l'audio en cours
    if (currentAudio) {
        try {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        } catch (e) {
            console.warn("Erreur lors de l'arrêt de l'audio :", e);
        }
        currentAudio = null;
    }

    // 3. Notifier l'interruption
    if (interruptCallback) {
        try {
            interruptCallback();
        } catch (e) {
            console.warn("Erreur lors de l'appel du callback d'interruption :", e);
        }
    }
}

/**
 * Envoie le texte au backend Piper TTS et joue l'audio reçu.
 * Retourne une Promise qui se résout quand la lecture audio est terminée.
 *
 * @param {string} text - Le texte à lire (peut contenir des symboles math)
 * @returns {Promise<void>}
 */
export async function speakText(text) {
    // Arrêter immédiatement tout audio déjà en cours pour éviter les chevauchements
    stopAllAudio();

    // Nettoyer les emojis pour éviter qu'ils soient lus littéralement
    const cleanText = (text || "")
        .replace(/\p{Extended_Pictographic}/gu, '')
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
        .trim();

    if (!cleanText) return;

    // Créer un nouvel AbortController pour cette requête
    const controller = new AbortController();
    currentAbortController = controller;

    try {
        const response = await api.post(
            '/tts/synthesize/',
            { text: cleanText },
            { 
                responseType: 'blob',
                signal: controller.signal
            }
        );

        // Si le controller a été annulé entre-temps
        if (controller.signal.aborted) {
            return;
        }

        // Créer une URL temporaire pour le blob audio
        const audioBlob = new Blob([response.data], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        const audio = new Audio(audioUrl);
        currentAudio = audio; // Assigner comme audio courant

        return new Promise((resolve, reject) => {
            audio.onended = () => {
                if (currentAudio === audio) {
                    currentAudio = null;
                }
                URL.revokeObjectURL(audioUrl);
                resolve();
            };
            audio.onerror = (err) => {
                if (currentAudio === audio) {
                    currentAudio = null;
                }
                URL.revokeObjectURL(audioUrl);
                reject(err);
            };
            audio.play().then(() => {
                // Audio démarré avec succès
            }).catch((err) => {
                if (currentAudio === audio) {
                    currentAudio = null;
                }
                URL.revokeObjectURL(audioUrl);
                reject(err);
            });
        });
    } catch (err) {
        // Si la requête a été annulée, on s'arrête là silencieusement
        if (err.name === 'AbortError' || err.message === 'canceled') {
            return;
        }
        throw err;
    } finally {
        // Nettoyer la référence si c'est toujours le même controller
        if (currentAbortController === controller) {
            currentAbortController = null;
        }
    }
}

/**
 * Version "safe" qui ne throw pas en cas d'erreur.
 * Utile pour les feedbacks où le TTS est un bonus, pas critique.
 *
 * @param {string} text - Le texte à lire
 * @returns {Promise<void>}
 */
export async function speakTextSafe(text) {
    try {
        await speakText(text);
    } catch (err) {
        console.warn('TTS indisponible, on continue sans audio:', err);
    }
}

/**
 * Permet à un composant externe de définir l'audio en cours de lecture
 * afin qu'il puisse être arrêté par stopAllAudio().
 */
export function setCurrentAudio(audio) {
    currentAudio = audio;
}

/**
 * Permet à un composant externe de définir l'AbortController en cours
 * afin qu'il puisse être annulé par stopAllAudio().
 */
export function setCurrentAbortController(controller) {
    currentAbortController = controller;
}


