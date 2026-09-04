import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { ACCESS_TOKEN } from '../apiDjango/constantes';

const NotFound = () => {
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.exp * 1000 > Date.now()) {
                    setUserRole(decoded.role);
                }
            } catch (err) {
                setUserRole(null);
            }
        }
    }, []);

    const routesDashboard = {
        'PARENT': '/parent/dashboard',
        'ENSEIGNANT': '/enseignant/dashboard',
        'ENFANT': '/enfant/dashboard'
    };

    const dashboardPath = userRole ? routesDashboard[userRole] : null;

    return (
        <div className="min-h-screen bg-base-100 flex flex-col overflow-hidden relative">

            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(22px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes float-404 {
                    0%, 100% { transform: translateY(0px);    }
                    50%      { transform: translateY(-16px);  }
                }
                @keyframes grow-line {
                    from { width: 0; opacity: 0; }
                    to   { width: 56px; opacity: 1; }
                }
                @keyframes orb-pulse {
                    0%, 100% { opacity: 0.15; }
                    50%      { opacity: 0.28; }
                }

                .fade-up { animation: fade-in-up 0.65s cubic-bezier(.16,1,.3,1) both; }
                .delay-1 { animation-delay: 0.10s; }
                .delay-2 { animation-delay: 0.22s; }
                .delay-3 { animation-delay: 0.34s; }
                .delay-4 { animation-delay: 0.46s; }

                .num-404   { animation: float-404 4s ease-in-out infinite; display: inline-block; }
                .orb       { animation: orb-pulse 7s ease-in-out infinite; }
                .color-bar {
                    height: 4px; border-radius: 99px;
                    animation: grow-line 0.7s 0.25s cubic-bezier(.16,1,.3,1) both;
                }
            `}</style>

            {/* ── ORBES DE FOND ── */}
            <div className="orb absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full pointer-events-none bg-primary blur-3xl" />
            <div className="orb absolute -bottom-32 -left-32 w-[380px] h-[380px] rounded-full pointer-events-none bg-secondary blur-3xl" style={{ animationDelay: '-3.5s' }} />

            {/* ── NAVBAR ── */}
            <nav className="relative z-10 border-b border-base-content/10 px-6 md:px-12 py-4">
                <Link
                    to={dashboardPath || "/"}
                    className="inline-flex items-center gap-2 text-base-content/50 hover:text-primary font-semibold text-sm transition-colors"
                >
                    <ArrowLeft size={15} />
                    Math Learning Tool
                </Link>
            </nav>

            {/* ── CONTENU ── */}
            <main className="flex-1 relative z-10 flex flex-col items-center justify-center px-6 text-center">

                {/* 404 bien visible avec dégradé Tailwind */}
                <div className="num-404 fade-up leading-none mb-2 select-none">
                    <span className="text-[clamp(130px,22vw,200px)] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-primary via-purple-500 to-secondary drop-shadow-2xl">
                        404
                    </span>
                </div>

                {/* Barre colorée */}
                <div className="color-bar bg-gradient-to-r from-primary to-secondary mb-7" />

                {/* Titre */}
                <h1 className="text-2xl md:text-3xl font-black text-base-content mb-3 fade-up delay-1">
                    Page introuvable
                </h1>

                {/* Description */}
                <p className="max-w-sm text-base-content/50 text-base font-medium leading-relaxed mb-10 fade-up delay-2">
                    L'adresse que vous avez saisie n'existe pas ou a été déplacée.
                    {dashboardPath ? " Retournez à votre tableau de bord en toute sécurité." : " Vérifiez l'URL ou retournez à l'accueil."}
                </p>

                {/* CTAs DYNAMIQUES */}
                <div className="flex flex-col sm:flex-row gap-3 fade-up delay-3">
                    {dashboardPath ? (
                        <Link
                            to={dashboardPath}
                            id="btn-retour-dashboard"
                            className="btn btn-primary rounded-xl px-7 font-bold shadow-md border-none
                                       hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-2"
                        >
                            <LayoutDashboard size={16} />
                            Mon Tableau de Bord
                        </Link>
                    ) : (
                        <Link
                            to="/"
                            id="btn-retour-accueil"
                            className="btn btn-primary rounded-xl px-7 font-bold shadow-md border-none
                                       hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-2"
                        >
                            <Home size={16} />
                            Retour à l'accueil
                        </Link>
                    )}

                    <button
                        id="btn-retour-historique"
                        onClick={() => navigate(-1)}
                        className="btn btn-ghost rounded-xl px-7 font-bold border border-base-content/10
                                   hover:bg-base-200 transition-all flex items-center gap-2"
                    >
                        <ArrowLeft size={16} />
                        Page précédente
                    </button>
                </div>

                {/* Code erreur discret */}
                <p className="mt-12 text-xs text-base-content/25 font-mono tracking-widest fade-up delay-4">
                    ERREUR · 404 · NOT FOUND
                </p>

            </main>

        </div>
    );
};

export default NotFound;