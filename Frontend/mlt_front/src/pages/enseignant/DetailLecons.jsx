import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, ClipboardList, Loader2, Clock, GraduationCap, Globe, EyeOff, Download, FileText, ChevronDown, Award } from "lucide-react";
import api from "../../apiDjango/api.jsx";
import ReactMarkdown from "react-markdown";

// 🦴 SKELETON LOADERS
const HeaderSkeleton = () => (
    <div className="p-8 md:p-12 border-b border-base-200 bg-gradient-to-r from-base-100 to-base-200/20 animate-pulse">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-base-300 rounded-full"></div>
                <div className="space-y-3">
                    <div className="w-64 h-8 bg-base-300 rounded-xl"></div>
                    <div className="w-40 h-4 bg-base-300 rounded-lg"></div>
                </div>
            </div>
            <div className="w-44 h-12 bg-base-300 rounded-2xl hidden md:block"></div>
        </div>
    </div>
);

const DetailLeconSkeleton = () => (
    <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-base-200/50 h-36 rounded-[2rem]"></div>
            <div className="bg-base-200/50 h-36 rounded-[2rem]"></div>
            <div className="bg-base-200/50 h-36 rounded-[2rem]"></div>
        </div>
        <div className="bg-base-200/30 h-[450px] rounded-[2.5rem]"></div>
    </div>
);

const DetailLecon = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [lecon, setLecon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingStatut, setLoadingStatut] = useState(false);
    const [loadingDownload, setLoadingDownload] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);

    // --- APPEL API ---
    const fetchLecon = async () => {
        try {
            setLoading(true);
            const minDelay = new Promise(resolve => setTimeout(resolve, 1200));
            const [response] = await Promise.all([
                api.get(`/enseignant/lecons/${id}/`),
                minDelay
            ]);
            setLecon(response.data);
        } catch (err) {
            console.error("Erreur récupération leçon:", err);
            setError("Impossible de charger le détail de la leçon.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLecon();
    }, [id]);

    // Change le statut (publié / brouillon)
    const handleToggleStatut = async () => {
        setLoadingStatut(true);
        try {
            const nouveauStatut = lecon.statut === "publie" ? "brouillon" : "publie";
            const response = await api.patch(`/enseignant/lecons/${id}/`, { statut: nouveauStatut });
            setLecon(response.data);
            setSuccessMsg(nouveauStatut === "publie" ? "Leçon publiée aux élèves de la classe !" : "Leçon remise en brouillon.");
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingStatut(false);
        }
    };

    // Télécharger la leçon en PDF ou Word
    const handleDownload = async (format) => {
        setLoadingDownload(true);
        setShowDownloadMenu(false);
        try {
            const response = await api.get(`/enseignant/lecons/${id}/telecharger/?export_format=${format}`, {
                responseType: "blob"
            });
            const mimeType = format === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            const url = window.URL.createObjectURL(new Blob([response.data], { type: mimeType }));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${lecon.titre.replace(/ /g, "_")}_${lecon.classe}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            setSuccessMsg(`Téléchargement ${format.toUpperCase()} lancé !`);
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err) {
            console.error("Erreur téléchargement:", err);
        } finally {
            setLoadingDownload(false);
        }
    };

    return (
        <div className="space-y-5 font-sans antialiased">
            
            {/* HEADER COMPACT */}
            {loading ? (
                <HeaderSkeleton />
            ) : (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-100 dark:bg-base-100 p-5 rounded-2xl border border-base-300/60 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/enseignant/lecons')}
                            className="btn btn-sm btn-circle btn-ghost border border-base-300/60 hover:bg-primary hover:text-white transition-all shadow-xs shrink-0"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-extrabold uppercase tracking-wider mb-1">
                                <BookOpen size={12} /> Fiche de Cours
                            </div>
                            <h1 className="text-xl sm:text-2xl font-black text-base-content tracking-tight uppercase leading-none">
                                {lecon?.titre}
                            </h1>
                            <p className="text-base-content/50 text-xs font-medium italic mt-0.5">
                                Classe : {lecon?.classe} • Thème : {lecon?.theme}
                            </p>
                        </div>
                    </div>

                    {lecon && (
                        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                            {/* Bouton de téléchargement */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowDownloadMenu(prev => !prev)}
                                    disabled={loadingDownload}
                                    className="btn btn-xs sm:btn-sm btn-ghost rounded-xl font-bold gap-1.5 border border-base-300/60 hover:border-primary/30"
                                >
                                    {loadingDownload ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />}
                                    Télécharger
                                    <ChevronDown size={12} />
                                </button>
                                {showDownloadMenu && (
                                    <div className="absolute right-0 top-full mt-2 bg-base-100 dark:bg-base-100 border border-base-300/60 rounded-xl shadow-md z-50 overflow-hidden min-w-[170px] animate-in zoom-in-95 duration-200">
                                        <button onClick={() => handleDownload("pdf")}
                                            className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-base-200/60 font-bold text-xs transition-colors text-left">
                                            <FileText size={14} className="text-error" /> Exporter en PDF
                                        </button>
                                        <button onClick={() => handleDownload("docx")}
                                            className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-base-200/60 font-bold text-xs transition-colors border-t border-base-200 dark:border-base-300/40 text-left">
                                            <FileText size={14} className="text-blue-500" /> Exporter en Word
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Bouton publication */}
                            <button
                                onClick={handleToggleStatut}
                                disabled={loadingStatut}
                                className={`btn btn-xs sm:btn-sm rounded-xl font-bold gap-1.5 ${
                                    lecon.statut === "publie" 
                                        ? "btn-ghost text-warning border border-warning/20 hover:bg-warning/10" 
                                        : "btn-primary shadow-xs hover:scale-[1.01] active:scale-95 transition-transform"
                                }`}
                            >
                                {loadingStatut ? (
                                    <Loader2 className="animate-spin" size={14} />
                                ) : lecon.statut === "publie" ? (
                                    <><EyeOff size={14} /> Retirer</>
                                ) : (
                                    <><Globe size={14} /> Publier</>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ZONE DE CONTENU */}
            <div className="bg-base-100 dark:bg-base-100 p-5 md:p-6 rounded-2xl border border-base-300/60 shadow-sm min-h-[60vh]">
                {error && (
                    <div className="alert alert-error rounded-xl font-bold text-xs p-3 mb-4 shadow-xs">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                {loading ? (
                    <DetailLeconSkeleton />
                ) : (
                    <div className="animate-in fade-in duration-300 space-y-6">
                        {/* Alert Succès */}
                        {successMsg && (
                            <div className="alert bg-success/10 border-none rounded-xl text-success font-bold text-xs p-3 flex gap-2.5 shadow-xs">
                                <Award size={18} className="shrink-0" />
                                <span>{successMsg}</span>
                            </div>
                        )}

                        {/* Cartes d'infos */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-base-200/40 dark:bg-base-200/30 p-4 rounded-xl border border-base-200 dark:border-base-300/40">
                                <p className="text-[9px] font-black uppercase opacity-40 tracking-wider mb-1.5">Objectif pédagogique</p>
                                <p className="font-medium text-xs leading-relaxed text-base-content/85">{lecon.description || "Aucune description de cours."}</p>
                            </div>

                            <div className="bg-base-200/40 dark:bg-base-200/30 p-4 rounded-xl border border-base-200 dark:border-base-300/40 flex items-center justify-between">
                                <div>
                                    <p className="text-[9px] font-black uppercase opacity-40 tracking-wider mb-1">Durée estimée</p>
                                    <p className="font-black text-xl text-primary">{lecon.duree || "45 min"}</p>
                                </div>
                                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                                    <Clock size={20} />
                                </div>
                            </div>

                            <div className="bg-base-200/40 dark:bg-base-200/30 p-4 rounded-xl border border-base-200 dark:border-base-300/40 flex items-center justify-between">
                                <div>
                                    <p className="text-[9px] font-black uppercase opacity-40 tracking-wider mb-1">Niveau ciblé</p>
                                    <p className="font-black text-xl text-primary">{lecon.classe}</p>
                                </div>
                                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                                    <GraduationCap size={20} />
                                </div>
                            </div>
                        </div>

                        {/* Zone de texte du contenu */}
                        <div className="bg-base-200/30 dark:bg-base-200/20 p-5 md:p-6 rounded-2xl border border-base-200 dark:border-base-300/40">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                    <BookOpen size={18} />
                                </div>
                                <h2 className="text-base font-black uppercase tracking-tight">
                                    Contenu de la leçon
                                </h2>
                            </div>

                            <div className="prose prose-sm max-w-none text-base-content opacity-90 font-medium leading-relaxed prose-headings:font-black prose-p:leading-relaxed">
                                {lecon.contenu ? (
                                    <ReactMarkdown>{lecon.contenu}</ReactMarkdown>
                                ) : (
                                    <p className="opacity-40 italic text-center py-8 text-xs">
                                        Le contenu de cette leçon n'a pas encore été rédigé.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* BOUTONS BAS DE PAGE */}
                        <div className="flex justify-end pt-2 border-t border-base-200 dark:border-base-300/40">
                            <button
                                onClick={() => navigate(`/enseignant/lecons/${id}/exercices`)}
                                className="btn btn-primary btn-sm rounded-xl px-6 font-bold shadow-xs gap-2 hover:scale-[1.01] active:scale-95 transition-all text-xs"
                            >
                                <ClipboardList size={16} />
                                Voir les exercices associés
                            </button>
                        </div>
                        </div>
                    )}
            </div>
        </div>
    );
};

export default DetailLecon;