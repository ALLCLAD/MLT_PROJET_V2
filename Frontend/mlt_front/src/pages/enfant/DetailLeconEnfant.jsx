import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, ClipboardList, Loader2, Clock, GraduationCap, PlayCircle, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import api from '../../apiDjango/api.jsx';
import ReactMarkdown from 'react-markdown';
import LecteurVocal from '../../composants/LecteurVocal';

const DetailSkeleton = () => (
    <div className="animate-pulse space-y-5">
        <div className="h-20 bg-base-200/50 rounded-2xl p-5" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-16 bg-base-200/50 rounded-xl" />
            <div className="h-16 bg-base-200/50 rounded-xl" />
            <div className="h-16 bg-base-200/50 rounded-xl" />
        </div>
        <div className="h-64 bg-base-200/50 rounded-2xl p-6" />
    </div>
);

const DetailLeconEnfant = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [lecon, setLecon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLecon = async () => {
        try {
            setLoading(true);
            const minDelay = new Promise(resolve => setTimeout(resolve, 800));
            const [response] = await Promise.all([
                api.get(`/enseignant/enfant/lecons/${id}/`),
                minDelay
            ]);
            setLecon(response.data);
        } catch (err) {
            console.error("Erreur récupération leçon:", err);
            setError("Impossible de charger cette leçon.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLecon();
        const enregistrerLecture = async () => {
            try {
                await api.post(`/communication/lecture/${id}/`);
            } catch (err) { console.error("Erreur enregistrement lecture"); }
        };
        enregistrerLecture();
    }, [id]);

    return (
        <div className="space-y-5 font-sans antialiased">
            {/* ── TOP BAR NAVIGATION UNIFORMISÉE ── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-100 dark:bg-base-100 p-5 rounded-2xl border border-base-300/60 shadow-sm">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate('/enfant/lecons')} 
                        className="btn btn-sm btn-circle btn-ghost text-base-content hover:bg-base-200"
                        title="Retour aux leçons"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-extrabold uppercase tracking-wider mb-1">
                            <Sparkles size={12} className="animate-pulse" /> Cours de Mathématiques
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-base-content uppercase truncate max-w-md">
                            {lecon?.titre || "Détail de la leçon"}
                        </h1>
                    </div>
                </div>
            </div>

            {/* ── CONTENU DE LA LEÇON ── */}
            {error ? (
                <div className="bg-base-100 dark:bg-base-100 p-8 rounded-2xl border border-base-300/60 shadow-sm text-center max-w-md mx-auto space-y-4">
                    <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h3 className="text-base font-black uppercase">Oups !</h3>
                        <p className="text-xs text-base-content/60 font-bold mt-1">{error || "Leçon introuvable."}</p>
                    </div>
                    <button 
                        onClick={() => navigate('/enfant/lecons')} 
                        className="btn btn-sm btn-primary rounded-xl font-bold w-full"
                    >
                        Retour aux leçons
                    </button>
                </div>
            ) : loading ? (
                <DetailSkeleton />
            ) : !lecon ? (
                <div className="text-center py-12 text-xs opacity-50 font-bold italic">Leçon vide</div>
            ) : (
                <div className="space-y-5 animate-in fade-in duration-300">
                    
                    {/* ── RESUME CARD COMPACT ── */}
                    <div className="bg-base-100 dark:bg-base-100 p-5 rounded-2xl border border-base-300/60 shadow-sm space-y-4">
                        <p className="text-xs text-base-content/60 font-medium italic">
                            {lecon.description || "Pas de description fournie."}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="bg-base-200/50 p-3 rounded-xl border border-base-200 flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-600">
                                    <GraduationCap size={18} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black opacity-40 uppercase tracking-widest">Classe</p>
                                    <p className="text-sm font-black text-indigo-600">{lecon.classe}</p>
                                </div>
                            </div>

                            <div className="bg-base-200/50 p-3 rounded-xl border border-base-200 flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600">
                                    <Clock size={18} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black opacity-40 uppercase tracking-widest">Temps estimé</p>
                                    <p className="text-sm font-black text-emerald-600">{lecon.duree || '45 min'}</p>
                                </div>
                            </div>

                            <div className="bg-base-200/50 p-3 rounded-xl border border-base-200 flex items-center gap-3">
                                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600">
                                    <ClipboardList size={18} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black opacity-40 uppercase tracking-widest">Exercices associés</p>
                                    <p className="text-sm font-black text-amber-600">{lecon.nombre_exercices || 0} exercices</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── CORPS DE LA LEÇON AVEC LECTEUR VOCAL ── */}
                    <div className="bg-base-100 dark:bg-base-100 p-5 md:p-6 rounded-2xl border border-base-300/60 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-base-200/60">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-primary/10 rounded-xl text-primary shrink-0">
                                    <BookOpen size={18} />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black uppercase text-base-content">Lecture du cours</h2>
                                    <p className="text-[11px] opacity-50 font-semibold italic">Lis attentivement ou utilise le lecteur vocal.</p>
                                </div>
                            </div>

                            {/* LECTEUR VOCAL */}
                            {lecon.contenu && (
                                <div className="w-full sm:w-auto">
                                    <LecteurVocal texte={lecon.contenu} />
                                </div>
                            )}
                        </div>

                        <div className="prose max-w-none text-sm leading-relaxed text-base-content/90 p-4 bg-base-200/30 rounded-xl border border-base-200/50">
                            {lecon.contenu ? (
                                <ReactMarkdown>{lecon.contenu}</ReactMarkdown>
                            ) : (
                                <div className="text-center py-8 opacity-40 italic text-xs">
                                    Le contenu de cette leçon n'est pas encore disponible.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── ACTION FINALE ── */}
                    <div className="bg-base-100 dark:bg-base-100 p-5 rounded-2xl border border-base-300/60 shadow-sm text-center">
                        {lecon.nombre_exercices > 0 ? (
                            <div className="space-y-3 max-w-sm mx-auto">
                                <div className="flex items-center justify-center gap-1.5 text-emerald-600 text-xs font-black uppercase">
                                    <CheckCircle size={16} />
                                    <span>Prêt à tester tes connaissances ?</span>
                                </div>
                                <button
                                    onClick={() => navigate(`/enfant/lecons/${id}/exercices`)}
                                    className="btn btn-primary btn-sm w-full rounded-xl font-bold uppercase tracking-wider shadow-sm flex items-center justify-center gap-2"
                                >
                                    <PlayCircle size={16} />
                                    <span>Faire les exercices ({lecon.nombre_exercices})</span>
                                </button>
                            </div>
                        ) : (
                            <p className="text-xs font-bold opacity-40 italic">
                                Pas encore d'exercices disponibles pour cette leçon.
                            </p>
                        )}
                    </div>

                </div>
            )}
        </div>
    );
};

export default DetailLeconEnfant;