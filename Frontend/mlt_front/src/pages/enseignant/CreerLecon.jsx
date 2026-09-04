import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    BookOpen, Loader2, Sparkles, CheckCircle, ArrowLeft, ClipboardList,
    FileText, MessageSquare, CloudUpload, X, Eye, Edit3, ChevronRight,
    Lightbulb, AlertCircle, Calendar, GraduationCap
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import api from "../../apiDjango/api.jsx";
import { genererContenuLecon, genererContenuLeconDepuisDocument, genererExercices } from "../../apiDjango/aiService";

// ─────────────────────────────────────────────
// ÉTAPE 1 : Formulaire de configuration
// ─────────────────────────────────────────────
const EtapeConfig = ({ formData, setFormData, sourceMode, setSourceMode, fichier, setFichier, consignes, setConsignes, onNext, loading }) => {
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef(null);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleFile = (file) => {
        if (!file) return;
        const ext = file.name.split(".").pop().toLowerCase();
        if (!["pdf", "docx", "doc"].includes(ext)) {
            alert("Format non supporté. Veuillez utiliser un fichier PDF ou Word (.docx, .doc)");
            return;
        }
        setFichier(file);
    };

    const onDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files[0]);
    }, []);

    const isFormValid = formData.titre && formData.classe && formData.theme &&
        (sourceMode === "description" ? formData.description.trim() : fichier !== null);

    return (
        <div className="flex-grow p-8 md:p-12 bg-base-100">
            <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">

                {/* SÉLECTEUR DE MODE SOURCE */}
                <div className="space-y-4">
                    <label className="block font-black text-lg text-base-content">Source du contenu *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button 
                            type="button" 
                            onClick={() => setSourceMode("description")}
                            className={`flex items-start gap-4 p-6 rounded-[2rem] border-2 transition-all duration-300 text-left ${
                                sourceMode === "description" 
                                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" 
                                    : "border-base-200 hover:border-primary/40 bg-base-200/10 hover:bg-base-200/30"
                            }`}
                        >
                            <div className={`p-3 rounded-2xl shrink-0 transition-colors ${
                                sourceMode === "description" ? "bg-primary/20 text-primary" : "bg-base-300/50 text-base-content/40"
                            }`}>
                                <MessageSquare size={22} />
                            </div>
                            <div className="flex-1">
                                <p className="font-black text-base text-base-content">Description libre</p>
                                <p className="text-xs text-base-content/50 mt-1.5 font-medium leading-relaxed">
                                    Décrivez votre idée de leçon et Mathy se chargera de rédiger tout le cours.
                                </p>
                            </div>
                            {sourceMode === "description" && <CheckCircle size={18} className="text-primary shrink-0 mt-0.5" />}
                        </button>

                        <button 
                            type="button" 
                            onClick={() => setSourceMode("fichier")}
                            className={`flex items-start gap-4 p-6 rounded-[2rem] border-2 transition-all duration-300 text-left ${
                                sourceMode === "fichier" 
                                    ? "border-secondary bg-secondary/5 shadow-lg shadow-secondary/10" 
                                    : "border-base-200 hover:border-secondary/40 bg-base-200/10 hover:bg-base-200/30"
                            }`}
                        >
                            <div className={`p-3 rounded-2xl shrink-0 transition-colors ${
                                sourceMode === "fichier" ? "bg-secondary/20 text-secondary" : "bg-base-300/50 text-base-content/40"
                            }`}>
                                <CloudUpload size={22} />
                            </div>
                            <div className="flex-1">
                                <p className="font-black text-base text-base-content">Importer un document</p>
                                <p className="text-xs text-base-content/50 mt-1.5 font-medium leading-relaxed">
                                    Téléversez un PDF ou Word existant — Mathy l'améliore et le structure.
                                </p>
                            </div>
                            {sourceMode === "fichier" && <CheckCircle size={18} className="text-secondary shrink-0 mt-0.5" />}
                        </button>
                    </div>
                </div>

                {/* TITRE */}
                <div className="space-y-3">
                    <label className="block font-black text-lg text-base-content">Titre de la leçon *</label>
                    <input 
                        type="text" 
                        name="titre" 
                        value={formData.titre} 
                        onChange={handleChange} 
                        required 
                        disabled={loading}
                        className="input w-full rounded-2xl bg-base-200/50 border border-base-300 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 font-bold h-14 transition-all"
                        placeholder="Ex: Les fractions simples" 
                    />
                </div>

                {/* ZONE CONDITIONNELLE */}
                {sourceMode === "description" ? (
                    <div className="space-y-3">
                        <label className="block font-black text-lg text-base-content">Description *</label>
                        <textarea 
                            name="description" 
                            value={formData.description} 
                            onChange={handleChange} 
                            required 
                            disabled={loading}
                            className="textarea w-full rounded-2xl bg-base-200/50 border border-base-300 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 font-bold h-36 p-5 transition-all leading-relaxed"
                            placeholder="Décrivez le contenu ou les notions clés... Mathy rédigera un cours structuré et adapté aux élèves." 
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <label className="block font-black text-lg text-base-content">Document à importer *</label>
                        {!fichier ? (
                            <div 
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} 
                                onDragLeave={() => setDragOver(false)} 
                                onDrop={onDrop}
                                onClick={() => fileRef.current?.click()}
                                className={`w-full border-2 border-dashed rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 ${
                                    dragOver 
                                        ? "border-secondary bg-secondary/5 scale-[0.99] shadow-inner" 
                                        : "border-base-300 hover:border-secondary/40 bg-base-200/20 hover:bg-secondary/5"
                                }`}
                            >
                                <div className={`p-5 rounded-2xl transition-colors ${
                                    dragOver ? "bg-secondary/20 text-secondary" : "bg-base-300/50 text-base-content/30"
                                }`}>
                                    <CloudUpload size={40} />
                                </div>
                                <div className="text-center">
                                    <p className="font-black text-base text-base-content">Glissez votre fichier ici</p>
                                    <p className="text-sm text-base-content/50 mt-1 font-medium">ou cliquez pour sélectionner un fichier sur votre appareil</p>
                                    <p className="text-[10px] text-base-content/30 mt-4 font-black uppercase tracking-widest bg-base-200/50 px-3 py-1 rounded-md inline-block">PDF • DOCX • DOC</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 p-5 bg-secondary/5 border border-secondary/20 rounded-[1.5rem] animate-in slide-in-from-bottom duration-200">
                                <div className="p-3 bg-secondary/15 rounded-xl text-secondary shrink-0">
                                    <FileText size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-base text-base-content truncate">{fichier.name}</p>
                                    <p className="text-xs text-base-content/40 mt-0.5 font-bold">{(fichier.size / 1024).toFixed(1)} Ko</p>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => setFichier(null)} 
                                    className="btn btn-circle btn-ghost btn-sm text-error/60 hover:text-error hover:bg-error/10"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                        <input ref={fileRef} type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />

                        <div className="space-y-2 mt-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4">
                            <label className="flex items-center gap-1.5 font-black text-sm text-amber-700">
                                <Lightbulb size={16} className="text-amber-500" />
                                Consignes optionnelles pour Mathy (IA)
                            </label>
                            <input 
                                type="text" 
                                value={consignes} 
                                onChange={(e) => setConsignes(e.target.value)}
                                className="input w-full rounded-xl bg-base-100 border border-base-200 focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 font-bold h-12 text-sm transition-all"
                                placeholder="Ex: Simplifie les termes mathématiques, donne des exemples concrets..." 
                            />
                        </div>
                    </div>
                )}

                {/* CLASSE & DUREE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="block font-black text-lg text-base-content">Classe</label>
                        <div className="w-full h-14 px-6 rounded-2xl font-black bg-base-200/50 text-primary border border-base-300 flex items-center gap-2 select-none">
                            <GraduationCap size={20} />
                            <span>{formData.classe || "Chargement..."}</span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="block font-black text-lg text-base-content">Durée estimée</label>
                        <input 
                            type="text" 
                            name="duree" 
                            value={formData.duree} 
                            onChange={handleChange} 
                            disabled={loading}
                            className="input w-full rounded-2xl bg-base-200/50 border border-base-300 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 font-bold h-14 transition-all" 
                            placeholder="Ex: 45 min" 
                        />
                    </div>
                </div>

                {/* THEME */}
                <div className="space-y-3">
                    <label className="block font-black text-lg text-base-content">Thème *</label>
                    <select 
                        name="theme" 
                        value={formData.theme} 
                        onChange={handleChange} 
                        required 
                        disabled={loading}
                        className="select w-full h-14 px-6 rounded-2xl font-black bg-base-200/50 border border-base-300 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 text-primary transition-all cursor-pointer"
                    >
                        <option value="" disabled className="bg-base-100 text-base-content/50">Choisir un thème...</option>
                        <option value="CALCUL" className="bg-base-100 text-base-content py-4">Calcul et Opérations</option>
                        <option value="GEOMETRIE" className="bg-base-100 text-base-content py-4">Géométrie et Formes</option>
                        <option value="DENOMBREMENT" className="bg-base-100 text-base-content py-4">Dénombrement et Nombres</option>
                        <option value="GRANDEURS" className="bg-base-100 text-base-content py-4">Grandeurs et Mesures</option>
                    </select>
                </div>

                {/* INFO IA */}
                <div className={`flex items-start gap-4 border rounded-[2rem] p-6 shadow-sm transition-all duration-300 ${
                    sourceMode === "fichier" 
                        ? "bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20 text-secondary" 
                        : "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 text-primary"
                }`}>
                    <div className={`p-3 rounded-2xl shrink-0 ${sourceMode === "fichier" ? "bg-secondary/15" : "bg-primary/15"}`}>
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <p className="font-black text-base text-base-content leading-none">
                            {sourceMode === "fichier" ? "Mathy améliore votre cours existant" : "Mathy rédige la leçon de A à Z"}
                        </p>
                        <p className="text-sm text-base-content/60 font-semibold leading-relaxed mt-2">
                            {sourceMode === "fichier"
                                ? "Votre document sera analysé, enrichi d'exemples pédagogiques et structuré proprement. Vous pourrez réviser la structure finale avant publication."
                                : "Le support de cours complet ainsi que les exercices d'accompagnement seront rédigés par l'IA en fonction du niveau des élèves."}
                        </p>
                    </div>
                </div>

                {/* BOUTON SUIVANT */}
                <div className="pt-6">
                    <button 
                        type="button" 
                        onClick={onNext} 
                        disabled={!isFormValid || loading}
                        className={`btn w-full rounded-[2rem] h-16 font-black text-xl shadow-xl hover:scale-[1.01] active:scale-95 transition-all duration-300 ${
                            sourceMode === "fichier" 
                                ? "btn-secondary text-white shadow-secondary/20" 
                                : "btn-primary shadow-primary/20"
                        }`}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={24} className="animate-spin mr-2" />
                                Génération en cours...
                            </>
                        ) : (
                            <>
                                <Sparkles size={24} className="mr-2" />
                                Générer avec Mathy
                                <ChevronRight size={20} className="ml-1" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// ÉTAPE 2 : Preview & Édition du contenu généré
// ─────────────────────────────────────────────
const EtapePreview = ({ contenu, setContenu, formData, etape, loading, onConfirm, onBack }) => {
    const [viewMode, setViewMode] = useState("split");

    return (
        <div className="flex-grow flex flex-col p-8 md:p-12 bg-base-100 gap-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-base-content leading-none">Leçon générée par Mathy ✨</h2>
                    <p className="text-sm text-base-content/50 font-semibold italic mt-2">Relisez, éditez et validez la leçon avant la création des exercices.</p>
                </div>
                <div className="flex items-center gap-1 bg-base-200 p-1 rounded-2xl border border-base-300">
                    {[["edit", "Éditer"], ["split", "Double vue"], ["preview", "Rendu final"]].map(([mode, label]) => (
                        <button 
                            key={mode} 
                            type="button" 
                            onClick={() => setViewMode(mode)}
                            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all duration-300 ${
                                viewMode === mode 
                                    ? "bg-base-100 shadow-md text-primary" 
                                    : "text-base-content/40 hover:text-base-content/75"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {loading && etape && (
                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 animate-in slide-in-from-top duration-300 flex items-center gap-3">
                    <Loader2 className="text-primary animate-spin shrink-0" size={20} />
                    <p className="font-black text-primary text-sm">{etape}</p>
                </div>
            )}

            <div className={`flex-1 grid gap-6 ${viewMode === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
                {(viewMode === "edit" || viewMode === "split") && (
                    <div className="flex flex-col gap-2">
                        {viewMode === "split" && <p className="text-xs font-black uppercase tracking-widest text-base-content/30 px-1">Éditeur (Markdown)</p>}
                        <textarea 
                            value={contenu} 
                            onChange={(e) => setContenu(e.target.value)}
                            className="flex-1 w-full min-h-[450px] p-6 rounded-[2rem] bg-base-200/50 border border-base-300 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 font-mono text-sm leading-relaxed resize-none transition-all"
                            placeholder="Le contenu Markdown de la leçon apparaîtra ici..." 
                        />
                    </div>
                )}
                {(viewMode === "preview" || viewMode === "split") && (
                    <div className="flex flex-col gap-2">
                        {viewMode === "split" && <p className="text-xs font-black uppercase tracking-widest text-base-content/30 px-1">Aperçu du cours</p>}
                        <div className="flex-1 p-8 rounded-[2rem] bg-base-100 border border-base-300 shadow-sm overflow-y-auto min-h-[450px]">
                            <div className="prose prose-sm max-w-none text-base-content prose-headings:font-black prose-p:font-semibold prose-p:leading-relaxed">
                                <ReactMarkdown>{contenu || "*Aucun contenu à prévisualiser...*"}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-base-200">
                <button 
                    type="button" 
                    onClick={onBack} 
                    disabled={loading}
                    className="btn btn-ghost rounded-[1.5rem] h-14 font-black gap-2 border-2 border-base-300 normal-case w-full sm:w-auto hover:bg-base-200"
                >
                    <ArrowLeft size={18} /> Modifier les paramètres
                </button>
                {loading && etape ? (
                    <div className="flex-1 flex items-center justify-center gap-3 bg-primary/5 border border-primary/10 rounded-[1.5rem] h-14 px-6">
                        <Loader2 className="text-primary animate-spin" size={20} />
                        <span className="font-black text-primary text-sm">{etape}</span>
                    </div>
                ) : (
                    <button 
                        type="button" 
                        onClick={onConfirm} 
                        disabled={!contenu.trim() || loading}
                        className="flex-1 btn btn-primary rounded-[1.5rem] h-14 font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all gap-2 normal-case"
                    >
                        <CheckCircle size={20} /> Valider et générer les exercices
                    </button>
                )}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────
const CreerLecon = () => {
    const navigate = useNavigate();
    const [etapeUI, setEtapeUI] = useState(1);
    const [formData, setFormData] = useState({ titre: "", description: "", classe: "", duree: "45 min", theme: "" });
    const [sourceMode, setSourceMode] = useState("description");
    const [fichier, setFichier] = useState(null);
    const [consignes, setConsignes] = useState("");
    const [contenuGenere, setContenuGenere] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [etape, setEtape] = useState("");

    useEffect(() => {
        const fetchClasse = async () => {
            try {
                const response = await api.get("/auth/user-profile/");
                setFormData(prev => ({ ...prev, classe: response.data.classe_enseignement }));
            } catch (err) { console.error("Erreur profil:", err); }
        };
        fetchClasse();
    }, []);

    const handleGenerer = async () => {
        setLoading(true);
        setError(null);
        setContenuGenere("");
        try {
            let contenu = null;
            if (sourceMode === "fichier") {
                setEtape("Mathy extrait le texte de votre document...");
                const formFile = new FormData();
                formFile.append("fichier", fichier);
                const extractResponse = await api.post("/enseignant/extraire-texte/", formFile, { headers: { "Content-Type": "multipart/form-data" } });
                const texteExtrait = extractResponse.data.texte;
                setEtape("Mathy améliore et reformate votre document...");
                contenu = await genererContenuLeconDepuisDocument(formData.titre, formData.classe, texteExtrait, consignes);
            } else {
                setEtape("Mathy génère le contenu de votre leçon...");
                contenu = await genererContenuLecon(formData.titre, formData.description, formData.classe);
            }
            if (!contenu) throw new Error("Impossible de générer le contenu de la leçon.");
            setContenuGenere(contenu);
            setEtape("");
            setEtapeUI(2);
        } catch (err) {
            console.error("Erreur génération:", err);
            setError(err.response?.data?.error || err.message || "Une erreur est survenue lors de la génération. Veuillez réessayer.");
        } finally { setLoading(false); }
    };

    const handleConfirmer = async () => {
        setLoading(true);
        setError(null);
        try {
            setEtape("Sauvegarde de la leçon...");
            const leconResponse = await api.post("/enseignant/lecons/", { ...formData, contenu: contenuGenere });
            const leconId = leconResponse.data.id;
            setEtape("Mathy génère les exercices associés...");
            const exercices = await genererExercices(formData.titre, formData.classe, contenuGenere, formData.theme);
            if (exercices && exercices.length > 0) {
                setEtape("Sauvegarde des exercices...");
                for (const exercice of exercices) {
                    await api.post(`/enseignant/lecons/${leconId}/exercices/`, exercice);
                }
            }
            setEtape("Leçon créée avec succès !");
            setTimeout(() => navigate(`/enseignant/lecons/${leconId}`), 1000);
        } catch (err) {
            console.error("Erreur création leçon:", err);
            setError("Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.");
            setEtape("");
        } finally { setLoading(false); }
    };

    return (
        <div className="space-y-5 font-sans antialiased">
            
            {/* HEADER COMPACT */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-100 dark:bg-base-100 p-5 rounded-2xl border border-base-300/60 shadow-sm">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => etapeUI === 2 ? setEtapeUI(1) : navigate("/enseignant/lecons")} 
                        className="btn btn-sm btn-circle btn-ghost border border-base-300/60 hover:bg-primary hover:text-white transition-all shadow-xs shrink-0"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-extrabold uppercase tracking-wider mb-1">
                            <Sparkles size={12} className="animate-pulse" /> IA Mathy
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-base-content tracking-tight uppercase leading-none">
                            {etapeUI === 2 ? "Validation du cours" : "Nouvelle Leçon"}
                        </h1>
                        <p className="text-base-content/50 text-xs font-medium italic mt-0.5">
                            {etapeUI === 2 
                                ? "Relisez et modifiez le cours avant de générer automatiquement les exercices." 
                                : "Renseignez les objectifs et laissez l'IA concevoir le cours et les questions."}
                        </p>
                    </div>
                </div>

                {/* STEP INDICATOR */}
                <div className="flex items-center gap-1 text-xs font-bold bg-base-200 p-1 border border-base-300/60 rounded-xl w-full sm:w-auto justify-center">
                    {[["1", "Configuration"], ["2", "Validation"]].map(([num, label], i) => (
                        <React.Fragment key={num}>
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 ${
                                etapeUI === i + 1 
                                    ? "bg-primary text-primary-content shadow-xs" 
                                    : etapeUI > i + 1 
                                        ? "bg-success/20 text-success" 
                                        : "text-base-content/30"
                            }`}>
                                {etapeUI > i + 1 ? <CheckCircle size={12} /> : <span className="bg-base-100/10 text-[9px] w-4 h-4 rounded-full flex items-center justify-center border font-black">{num}</span>}
                                <span className="text-xs">{label}</span>
                            </div>
                            {i === 0 && <ChevronRight size={14} className="text-base-content/20" />}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* CONTENU */}
            <div className="bg-base-100 dark:bg-base-100 rounded-2xl border border-base-300/60 shadow-sm overflow-hidden min-h-[60vh]">
                {/* ERROR NOTIFICATIONS */}
                {error && (
                    <div className="mx-5 mt-5 flex items-center gap-3 bg-error/10 border border-error/20 rounded-xl p-3.5 animate-in slide-in-from-top duration-300">
                        <AlertCircle size={18} className="text-error shrink-0" />
                        <span className="font-bold text-error text-xs flex-1">{error}</span>
                        <button onClick={() => setError(null)} className="btn btn-ghost btn-circle btn-xs text-error/50 hover:text-error hover:bg-error/10">
                            <X size={14} />
                        </button>
                    </div>
                )}

                {/* MAIN CONTENT */}
                {etapeUI === 1 ? (
                    <EtapeConfig 
                        formData={formData} 
                        setFormData={setFormData} 
                        sourceMode={sourceMode} 
                        setSourceMode={setSourceMode}
                        fichier={fichier} 
                        setFichier={setFichier} 
                        consignes={consignes} 
                        setConsignes={setConsignes}
                        onNext={handleGenerer} 
                        loading={loading} 
                    />
                ) : (
                    <EtapePreview 
                        contenu={contenuGenere} 
                        setContenu={setContenuGenere} 
                        formData={formData} 
                        etape={etape}
                        loading={loading} 
                        onConfirm={handleConfirmer} 
                        onBack={() => setEtapeUI(1)} 
                    />
                )}
            </div>
        </div>
    );
};

export default CreerLecon;
