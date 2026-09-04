import Groq from "groq-sdk";

// Configuration de l'instance Groq
const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
});

// Cache en mémoire des modèles actifs récupérés dynamiquement
let cachedActiveModels = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 10 * 60 * 1000; // Cache 10 minutes

const PREFERRED_CHAT_MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "gemma2-9b-it",
    "mixtral-8x7b-32768"
];

/**
 * Récupère dynamiquement la liste des modèles chat actifs sur le compte Groq
 */
const getActiveGroqModels = async () => {
    const now = Date.now();
    if (cachedActiveModels && cachedActiveModels.length > 0 && (now - lastFetchTime) < CACHE_DURATION_MS) {
        return cachedActiveModels;
    }

    try {
        const response = await groq.models.list();
        const models = response.data || [];
        // Filtrer les modèles chat valides (exclure guard, whisper, specdec, safetensors, etc.)
        const activeModels = models
            .filter(m => m.active !== false && 
                !m.id.includes('whisper') && 
                !m.id.includes('safetensors') && 
                !m.id.includes('tool-use') &&
                !m.id.includes('guard') &&
                !m.id.includes('specdec') &&
                !m.id.includes('embedding') &&
                !m.id.includes('r1') &&
                !m.id.includes('qwq') &&
                !m.id.includes('reasoning') &&
                !m.id.includes('distill')
            )
            .map(m => m.id);

        const sortedModels = [
            ...PREFERRED_CHAT_MODELS.filter(p => activeModels.includes(p)),
            ...activeModels.filter(m => !PREFERRED_CHAT_MODELS.includes(m))
        ];

        if (sortedModels.length > 0) {
            cachedActiveModels = sortedModels;
            lastFetchTime = now;
            console.log("[Groq AI] Modèles chat valides ordonnés :", cachedActiveModels);
            return cachedActiveModels;
        }
    } catch (err) {
        console.warn("[Groq AI] Impossible d'interroger /models, secours sur modèles préférés :", err?.message);
    }

    return PREFERRED_CHAT_MODELS;
};

/**
 * Nettoie la réponse de l'IA pour éliminer toutes les traces de réflexion / CoT (balises <think>,
 * sections "1. Analyze User Input", "2. Deconstruct...", "3. Draft Generation", "4. Check Constraints", etc.)
 * et ne conserver que le texte pur de la leçon finalisée.
 */
const cleanAIResponse = (text) => {
    if (!text) return "";

    let cleaned = text;

    // 1. Supprimer les balises <think>...</think> (DeepSeek-R1, Qwen-QwQ)
    cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

    // 2. Éliminer la section de vérification finale si présente (ex: "4. Check Constraints:")
    const checkConstraintsMatch = cleaned.search(/(?:\n|^)\s*\d*[\.\s-]*\*?\*?Check Constraints\*?\*?/i);
    if (checkConstraintsMatch > 0) {
        cleaned = cleaned.substring(0, checkConstraintsMatch).trim();
    }

    // 3. Si l'IA inclut des phases de réflexion/brouillon (ex: "1. Analyze...", "3. Draft Generation..."),
    // se positionner après le marqueur de rédaction "Draft" s'il existe
    const draftMatch = cleaned.search(/(?:\n|^)\s*\d*[\.\s-]*\*?\*?Draft(?: Generation)?\b/i);
    if (draftMatch !== -1) {
        cleaned = cleaned.substring(draftMatch).trim();
    }

    // 4. Se positionner au vrai premier titre de la leçon Markdown ("## 1.", "*## 1.", "# 1.", "## Introduction")
    const headerMatch = cleaned.search(/(?:^|\n)\s*\*?#+\s*(?:1[\.\s-]|1\b|\bIntroduction\b)/i);
    if (headerMatch !== -1) {
        cleaned = cleaned.substring(headerMatch).trim();
    } else {
        // Fallback: chercher la première occurrence de "## " ou "*## "
        const h2Match = cleaned.search(/(?:^|\n)\s*\*?##\s+/);
        if (h2Match !== -1) {
            cleaned = cleaned.substring(h2Match).trim();
        }
    }

    // 5. Nettoyer les balises de code Markdown (```) si la leçon a été entourée d'un bloc de code
    cleaned = cleaned.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/g, "").trim();

    // 6. Corriger les astérisques d'encadrement sur un titre (ex: *## 1. Intro* -> ## 1. Intro)
    cleaned = cleaned.replace(/^\*+(#+\s+.*)\*+$/gm, '$1');

    return cleaned;
};

/**
 * HELPER : Tente d'exécuter une requête chat completion avec fallback automatique sur les modèles dynamiquement actifs.
 */
const createCompletionWithFallback = async (params) => {
    const availableModels = await getActiveGroqModels();
    let lastError = null;

    for (const modelCandidate of availableModels) {
        try {
            const completion = await groq.chat.completions.create({
                ...params,
                model: modelCandidate,
            });
            return completion;
        } catch (err) {
            lastError = err;
            const errMsg = err?.message || '';
            console.warn(`[Groq AI] Échec du modèle "${modelCandidate}" (${errMsg}). Essai du modèle suivant...`);
        }
    }

    throw lastError || new Error("Aucun modèle Groq n'a pu répondre à la requête.");
};

/**
 * UTILITAIRE : Calcule le nombre d'exercices requis selon le niveau scolaire
 */
const getNombreExercicesParClasse = (classe) => {
    const c = classe.toUpperCase();
    if (c.includes("CP")) return 5;
    if (c.includes("CE")) return 10;
    if (c.includes("CM")) return 15;
    return 5;
};

// --- FONCTIONS EXPORTÉES ---

export const getMathyFeedback = async (question, reponseUtilisateur, isCorrect, explicationBack) => {
    const isHintMode = reponseUtilisateur === "DEMANDE_INDICE";

    try {
        const completion = await createCompletionWithFallback({
            messages: [
                {
                    role: "system",
                    content: `Tu es Mathy, un tuteur IA socratique et bienveillant pour un enfant du primaire au Togo.
                    Tu t'adresses directement à l'enfant par "tu".
                    
                    REGLES STRICTES :
                    1. ZERO EMOJI : Ne mets JAMAIS d'émojis dans ta réponse. Aucun émoji n'est autorisé.
                    2. MODE INDICE (INTERDICTION DE DONNER LA RÉPONSE) :
                       - Tu ne dois JAMAIS donner le résultat final, le chiffre exact ou la bonne option.
                       - Donne un guide étape par étape ou pose une petite question intermédiaire pour mettre l'enfant sur la voie.
                       - Exemple pour 7 + 5 : "Pense d'abord à compléter 7 pour aller jusqu'à 10, puis ajoute ce qu'il reste."
                       - Exemple pour un problème : "Demande-toi d'abord si la quantité augmente ou diminue."
                    3. MODE FEEDBACK (Après validation de la réponse) :
                       - Si correct : Félicite brièvement et rappelle la règle mathématique.
                       - Si incorrect : Encourage et réexplique l'étape où se trouve l'erreur sans réprimande.
                    4. Format : 1 à 2 phrases courtes maximum, claires et sans émoji.`
                },
                {
                    role: "user",
                    content: isHintMode
                        ? `DEMANDE D'INDICE : Question: "${question}". Guide l'enfant avec une question d'étape ou une méthode guidée. NE DONNE PAS la réponse.`
                        : `FEEDBACK : Question: "${question}" | Réponse choisie: "${reponseUtilisateur}" | Correct: ${isCorrect ? 'OUI' : 'NON'}. Explique la méthode.`
                }
            ],
            temperature: 0.6,
            max_tokens: 150,
        });

        const reply = completion.choices[0]?.message?.content;
        if (reply) return reply;

        if (isHintMode) {
            return "Réfléchis bien à la première étape du calcul. Que dois-tu poser ou compter en premier ?";
        }
        return isCorrect ? "Bravo, tu as appliqué la bonne méthode !" : "Regarde bien l'explication pour comprendre l'étape du calcul.";
    } catch (error) {
        console.error("Erreur Groq feedback:", error);
        if (isHintMode) {
            return "Réfléchis bien à la première étape du calcul. Que dois-tu poser ou compter en premier ?";
        }
        return isCorrect ? "Bravo ! Tu as trouvé la bonne réponse !" : "Ce n'est pas grave, observe bien l'étape pour réessayer !";
    }
};

/**
 * FONCTION 2 : Génération du cours complet (Version courte & Structurée)
 */
export const genererContenuLecon = async (titre, description, classe) => {
    try {
        const completion = await createCompletionWithFallback({
            messages: [
                {
                    role: "system",
                    content: `Tu es Mathy, un tuteur expert pour un enfant (niveau ${classe}) au Togo.
                    
                    OBJECTIF : Générer une leçon courte (150 à 200 mots maximum), très concrète et structurée.
                    
                    STYLE DE RÉDACTION :
                    - Parle directement à l'enfant ("Tu").
                    - Pas de phrases trop longues (facile à lire et à écouter).
                    - Utilise des exemples togolais concrets et réels (marché, francs CFA, prénoms locaux).
                    - Évite les phrases générales et le blabla inutile, va droit au concept mathématique concret.
                    
                    INTERDICTIONS STRICTES :
                    - Ne mets AUCUN émoji dans ton texte. Les émojis sont strictement interdits.
                    - NE RÉDIGE AUCUNE ÉTAPE DE PENSÉE NI DE BROUILLON : Interdiction d'inclure des parties d'analyse comme "Analyze User Input", "Deconstruct Constraints", "Draft", ou "Check Constraints". Réponds UNIQUEMENT et DIRECTEMENT par la leçon finalisée en Markdown en commençant par "## 1. Introduction".

                    STRUCTURE OBLIGATOIRE :
                    ## 1. Introduction
                    (Une phrase d'accroche directe et claire)
                    
                    ## 2. Le concept
                    (Explication simplifiée et concrète du sujet en 2-3 phrases)
                    
                    ## 3. Exemples pour comprendre
                    (Maximum 2 exemples très concrets tirés du quotidien avec des listes à puces)
                    
                    ## 4. À retenir
                    (Les 2 points clés les plus importants pour appliquer la règle)
                    
                    FORMATAGE :
                    - Utilise le Markdown (## pour les titres, ** pour les mots importants).
                    - Saute deux lignes entre les sections.`
                },
                {
                    role: "user",
                    content: `Écris uniquement la leçon au format Markdown final. Titre : "${titre}". Description : "${description}".`
                }
            ],
            temperature: 0.7,
            max_tokens: 600,
        });

        const rawContent = completion.choices[0]?.message?.content;
        return cleanAIResponse(rawContent);
    } catch (error) {
        console.error("Erreur Groq génération leçon:", error);
        return null;
    }
};

/**
 * FONCTION 2b : Reformatage et amélioration d'un contenu de document importé (PDF/Word)
 */
export const genererContenuLeconDepuisDocument = async (titre, classe, documentText, consignes = '') => {
    try {
        const texteLimité = documentText.substring(0, 4000);

        const completion = await createCompletionWithFallback({
            messages: [
                {
                    role: "system",
                    content: `Tu es Mathy, un tuteur expert pour la classe ${classe} au Togo.
                    
                    MISSION : Tu reçois un contenu brut extrait d'un document (PDF ou Word) fourni par un enseignant.
                    Tu dois :
                    1. Extraire les informations mathématiques essentielles de ce contenu.
                    2. Rendre le texte clair, direct, extrêmement concret et adapté aux enfants.
                    3. Utiliser des exemples concrets du quotidien togolais (marché, francs CFA, prénoms locaux).
                    4. Structurer proprement en Markdown selon ce format :

                    ## 1. Introduction
                    (Phrase d'accroche directe)

                    ## 2. Le concept
                    (Explication simplifiée et concrète, 2-4 phrases max)

                    ## 3. Exemples pour comprendre
                    (1-2 exemples très concrets avec listes à puces)

                    ## 4. À retenir
                    (2-3 points clés concrets)

                    CONTRAINTES ET INTERDICTIONS :
                    - Maximum 300 mots.
                    - Parle directement à l'enfant avec "tu".
                    - ZERO EMOJI : N'inclus aucun émoji dans tout ton texte. Les émojis sont strictement interdits.
                    - NE RÉDIGE AUCUNE ÉTAPE DE PENSÉE NI DE BROUILLON : Interdiction d'inclure des parties d'analyse comme "Analyze User Input", "Deconstruct Constraints", "Draft", ou "Check Constraints". Réponds UNIQUEMENT et DIRECTEMENT par la leçon finalisée en Markdown en commençant par "## 1. Introduction".`
                },
                {
                    role: "user",
                    content: `Titre de la leçon : "${titre}"
Niveau : ${classe}
${consignes ? `Consignes de l'enseignant : ${consignes}\n` : ''}Contenu brut du document :
---
${texteLimité}
---
Génère directement et uniquement le cours final en Markdown.`
                }
            ],
            temperature: 0.6,
            max_tokens: 700,
        });

        const rawContent = completion.choices[0]?.message?.content;
        return cleanAIResponse(rawContent);
    } catch (error) {
        console.error("Erreur Groq reformatage document:", error);
        return null;
    }
};

/**
 * FONCTION 3 : Génération dynamique d'exercices (JSON)
 */
export const genererExercices = async (titre, classe, contenu, theme = '') => {
    const nbExercices = getNombreExercicesParClasse(classe);

    try {
        const completion = await createCompletionWithFallback({
            messages: [
                {
                    role: "system",
                    content: `Tu es un expert en pédagogie primaire au Togo. 
                    Génère exactement ${nbExercices} exercices au format JSON avec des types variés adaptés au thème et au contenu de la leçon.
                    
                    ADAPTATION DES TYPES D'EXERCICES AU THÈME :
                    - Si le thème est "CALCUL" (Calcul et Opérations), propose un mélange équilibré de CALCUL_ECRIT, CALCUL_MENTAL, PROBLEME et QCM.
                    - Si le thème est "GEOMETRIE", "DENOMBREMENT" ou "GRANDEURS", propose principalement des QCM, des PROBLEME (ex: calcul de périmètre, conversion de mesure) et éventuellement du CALCUL_MENTAL. N'utilise CALCUL_ECRIT (calcul posé en colonnes) que si cela s'y prête directement (ex: additionner des grandeurs/mesures).
                    
                    CONSIGNES POUR LES EXERCICES :
                    - Propose des exercices très concrets et pratiques, basés sur des situations de la vie réelle togolaise.
                    - Les questions doivent être claires et avoir un intérêt mathématique rigoureux.
                    - ZERO EMOJI : Ne mets aucun émoji dans tes questions ou explications.

                    RÈGLES POUR LES TYPES D me D'EXERCICES :
                    1. QCM : Questions théoriques classiques. Renseigne "question", "reponse_correcte", "mauvaises_reponses" (séparées par des virgules) et laisse "donnees_exercice" à null.
                    2. CALCUL_ECRIT : Exercices de calcul posé en colonnes (ex: addition, soustraction, multiplication). Renseigne "type_exercice": "CALCUL_ECRIT", "question": "Pose et effectue : A [opérateur] B", "reponse_correcte": "résultat", et "donnees_exercice": {"operande1": "A", "operande2": "B", "operateur": "+ ou - ou x"}. Les opérandes doivent être des nombres entiers ou décimaux cohérents avec le niveau scolaire.
                    3. CALCUL_MENTAL : Exercices de calcul rapide en ligne. Renseigne "type_exercice": "CALCUL_MENTAL", "question": "Calcule : A x B", "reponse_correcte": "résultat", et laisse "donnees_exercice" à null.
                    4. PROBLEME : Petit énoncé guidé. Renseigne "type_exercice": "PROBLEME", "question": "L'énoncé de l'histoire...", "reponse_correcte": "résultat", et "donnees_exercice": {"operation_attendue": "addition | soustraction | multiplication | division", "unite": "FCFA | ignames | etc."}.

                    RÈGLES DE RÉDACTION POUR LA VOIX (CRITIQUE) :
                    1. LONGUEUR : La question doit faire entre 50 et 120 caractères maximum.
                    2. STRUCTURE : Fais des phrases courtes et directes. Utilise des points (.) pour créer des pauses.
                    3. STYLE : Utilise des prénoms (Koffi, Ablavi) et des contextes locaux (marché d'Assigamé, francs CFA).
                    4. EXPLICATION : Doit être très concrète, courte (max 80 caractères) et commencer par "C'est simple !". Explique la méthode mathématique directement.

                    FORMAT JSON STRICT (Ne retourne rien d'autre que le tableau JSON) :
                    [
                        {
                            "type_exercice": "QCM ou CALCUL_ECRIT ou CALCUL_MENTAL ou PROBLEME",
                            "question": "Texte court et concret.",
                            "reponse_correcte": "La réponse",
                            "mauvaises_reponses": "r1, r2, r3 (seulement si QCM)",
                            "donnees_exercice": null (ou objet JSON comme spécifié ci-dessus),
                            "explication": "C'est simple ! On fait...",
                            "ordre": 1
                        }
                    ]`
                },
                {
                    role: "user",
                    content: `Niveau ${classe}. Thème de la leçon : "${theme || 'Calcul'}". Titre : "${titre}". Contenu de la leçon : "${contenu?.substring(0, 1000)}".`
                }
            ],
            temperature: 0.5,
            max_tokens: 3800,
        });

        const responseText = completion.choices[0]?.message?.content;
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);

        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return null;
    } catch (error) {
        console.error("Erreur Groq génération exercices:", error);
        return null;
    }
};

/**
 * FONCTION 4 : Complétion d'un exercice manuel
 */
export const genererReponseExercice = async (question, classe) => {
    try {
        const completion = await createCompletionWithFallback({
            messages: [
                {
                    role: "system",
                    content: `Expert math primaire. 
                    Génère une réponse, 3 erreurs possibles et une explication très courte et concrète.
                    ZERO EMOJI : N'utilise jamais d'émojis dans ta réponse.
                    CONSIGNE VOCALE : L'explication ne doit pas dépasser 100 caractères, elle doit être directe et concrète.`
                },
                {
                    role: "user",
                    content: `Question: "${question}" | Niveau: ${classe}. Format JSON: {"reponse_correcte": "", "mauvaises_reponses": "r1, r2, r3", "explication": ""}`
                }
            ],
            temperature: 0.3,
            max_tokens: 400,
        });

        const responseText = completion.choices[0]?.message?.content;
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return null;
    } catch (error) {
        console.error("Erreur Groq génération réponse:", error);
        return null;
    }
};

/**
 * FONCTION 5 : Génération de la Procédure Complète de résolution pour un Problème
 */
export const getProblemeProcedure = async (probleme, userAnswers, totalScore) => {
    try {
        const questionsList = (probleme.questions || []).map((q, i) => {
            const userAns = userAnswers[q.sous_id] || 'Non répondu';
            return `Étape ${i + 1} - Question: "${q.question}" | Réponse élève: "${userAns}" | Réponse attendue: "${q.reponse_correcte} ${q.unite || ''}" | Explication: "${q.explication || ''}"`;
        }).join('\n');

        const prompt = `Énoncé du problème : "${probleme.enonce}"

Étapes :
${questionsList}`;

        const completion = await createCompletionWithFallback({
            messages: [
                {
                    role: "system",
                    content: `Tu es Mathy, un tuteur de mathématiques pour un enfant du primaire.
                    
                    CONSIGNES DE FORMATAGE (STRICTES) :
                    1. Rédige une explication COURTE et CONCISE (maximum 80 à 120 mots). Va droit à l'essentiel.
                    2. Résume uniquement la démarche pas à pas pour trouver le bon résultat de chaque étape.
                    3. PAS DE TABLEAUX Markdown.
                    4. PAS DE FORMULES LaTeX complexes (ne mets jamais de \\[ \\] ni de \\text{}). Écris les calculs simplement sur une ligne (ex: 44 + 15 = 59).
                    5. PAS de longs conseils de méthode généraux ou d'introduction inutile.
                    6. ZERO EMOJI : Aucun émoji n'est autorisé.
                    7. Utilise des puces simples et courtes pour chaque étape.`
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.4,
            max_tokens: 250,
        });

        const reply = completion.choices[0]?.message?.content;
        if (reply) return cleanAIResponse(reply);
    } catch (err) {
        console.warn("[Groq AI] Impossible de générer la procédure via AI, secours sur procédure locale :", err);
    }

    // Procédure locale de secours épurée
    return (probleme.questions || []).map((q, i) => 
        `Étape ${i + 1} (${q.question}) :\n• Démarche & Calcul : ${q.explication || `Effectuer le calcul pour obtenir ${q.reponse_correcte} ${q.unite || ''}.`}\n• Résultat : ${q.reponse_correcte} ${q.unite || ''}`
    ).join('\n\n');
};