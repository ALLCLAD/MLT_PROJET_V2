import React, { useState, useEffect, useRef } from 'react';
import { Bell, Sun, Moon, LogOut, UserCircle, ChevronDown, CheckCircle2, Trash2, BookOpen, MessageSquare, Eye, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LogoutAction } from '../../apiDjango/authService.jsx';
import api from '../../apiDjango/api.jsx';
import { useCommunication } from '../../contexte/CommunicationContext.jsx';

/**
 * NAVBAR DASHBOARD UNIFIÉE
 * Gère le thème, les notifications en temps réel et le profil selon le rôle de l'utilisateur.
 */
const NavbarDash = () => {
    const navigate = useNavigate();
    const { notifs, setNotifs, setUnreadCount, unreadCount } = useCommunication();
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
    const [user, setUser] = useState({ first_name: '', username: '', role: '' });
    const [showNotifPopup, setShowNotifPopup] = useState(false);
    const popupRef = useRef(null);

    // 1. Récupération des infos de l'utilisateur connecté
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await api.get('/auth/user-profile/');
                setUser(response.data);
            } catch (err) {
                console.error("Erreur chargement profil nav:", err);
            }
        };
        fetchUserData();
        
        // Application du thème
        document.querySelector('html').setAttribute('data-theme', theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setShowNotifPopup(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        LogoutAction();
        navigate('/login');
    };

    const markAsRead = async (id) => {
        try {
            await api.patch(`/communication/notifications/${id}/lire/`);
            setNotifs(prev => prev.map(n => n.id === id ? { ...n, est_lu: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) { console.error(err); }
    };

    const deleteNotif = async (e, id) => {
        e.stopPropagation();
        try {
            await api.delete(`/communication/notifications/${id}/supprimer/`);
            const deleted = notifs.find(n => n.id === id);
            setNotifs(prev => prev.filter(n => n.id !== id));
            if (deleted && !deleted.est_lu) setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) { console.error(err); }
    };

    const deleteAllNotifs = async () => {
        if (!window.confirm("Voulez-vous supprimer tout l'historique de votre journal ?")) return;
        try {
            await api.post('/communication/notifications/', { action: 'tout-supprimer' });
            setNotifs([]);
            setUnreadCount(0);
        } catch (err) { console.error(err); }
    };

    const markAllAsRead = async () => {
        try {
            await api.post('/communication/notifications/', { action: 'tout-lire' });
            setNotifs(prev => prev.map(n => ({ ...n, est_lu: true })));
            setUnreadCount(0);
        } catch (err) { console.error(err); }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'LECTURE_COURS':  return <Eye className="text-indigo-500" size={16} />;
            case 'EXERCICE_FINI':  return <CheckCircle2 className="text-green-500" size={16} />;
            case 'QUIZ_FINI':      return <Activity className="text-amber-500" size={16} />;
            case 'MESSAGE_RECU':   return <MessageSquare className="text-blue-500" size={16} />;
            case 'LECON_PUBLIEE':  return <BookOpen className="text-teal-500" size={16} />;
            default:               return <Bell className="text-gray-400" size={16} />;
        }
    };

    // Obtenir le libellé et le lien de profil selon le rôle
    const userRole = (user.role || '').toUpperCase();
    const roleLabel = userRole === 'PARENT' ? 'Parent' : userRole === 'ENFANT' ? 'Élève' : 'Enseignant';
    const profilePath = userRole === 'PARENT' ? '/parent/profil' : userRole === 'ENFANT' ? '/enfant/profil' : '/enseignant/profil';

    return (
        <div className="navbar bg-base-100 dark:bg-base-100 px-6 py-4 sticky top-0 z-30">
            <div className="flex-1"></div>

            <div className="flex-none flex items-center gap-2">
                {/* Sélecteur de Thème */}
                <button 
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")} 
                    className="btn btn-ghost btn-circle"
                    title="Changer de thème"
                >
                    {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
                </button>

                {/* CLOCHE DE NOTIFICATION AVEC POPUP DROPDOWN */}
                <div className="relative" ref={popupRef}>
                    <button 
                        id="notif-bell"
                        onClick={() => setShowNotifPopup(!showNotifPopup)} 
                        className="btn btn-ghost btn-circle relative transition-colors"
                    >
                        <Bell size={22} className="text-base-content/70" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 bg-red-500 text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-base-100 font-black animate-bounce text-white">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifPopup && (
                        <div className="absolute right-0 mt-2 w-80 sm:w-[26rem] bg-base-100 border border-base-300 rounded-[2rem] shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[32rem]">
                            {/* HEADER */}
                            <div className="p-5 border-b border-base-200 flex justify-between items-center bg-base-100/50 backdrop-blur-md sticky top-0 rounded-t-[2rem]">
                                <div className="flex items-center gap-2">
                                    <Bell size={18} className="text-primary" />
                                    <span className="font-black text-sm uppercase tracking-tight text-base-content">Journal</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {notifs.length > 0 && (
                                        <>
                                            <button onClick={markAllAsRead} className="btn btn-ghost btn-xs text-[9px] font-black uppercase tracking-wider hover:bg-base-200 rounded-lg py-1 px-2" title="Tout marquer comme lu">
                                                <CheckCircle2 size={12} className="mr-1" /> Tout lire
                                            </button>
                                            <button onClick={deleteAllNotifs} className="btn btn-ghost btn-xs text-error/80 hover:text-error hover:bg-error/10 rounded-lg p-1" title="Tout supprimer">
                                                <Trash2 size={14} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* LIST */}
                            <div className="flex-grow overflow-y-auto p-4 space-y-3 max-h-[24rem]">
                                {notifs.length === 0 ? (
                                    <div className="text-center py-12 flex flex-col items-center opacity-30">
                                        <Bell size={48} strokeWidth={1} />
                                        <p className="text-sm font-black italic mt-2 uppercase">Aucune activité récente</p>
                                    </div>
                                ) : (
                                    notifs.map((n) => (
                                        <div 
                                            key={n.id} 
                                            onClick={() => !n.est_lu && markAsRead(n.id)}
                                            className={`group relative p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${n.est_lu ? 'bg-base-200/30 border-transparent opacity-60' : 'bg-base-100 border-base-200 shadow-md hover:border-primary/30'}`}
                                        >
                                            <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${n.est_lu ? 'bg-base-300/50' : 'bg-primary/5'}`}>
                                                {getIcon(n.type_notif)}
                                            </div>
                                            <div className="flex-grow min-w-0 pr-6">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${n.est_lu ? 'bg-base-300' : 'text-primary bg-primary/10'}`}>
                                                        {n.type_notif.replace('_', ' ')}
                                                    </span>
                                                    {!n.est_lu && <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>}
                                                </div>
                                                <h4 className="font-black text-sm mt-1 leading-tight text-base-content truncate">{n.titre}</h4>
                                                <p className="text-xs text-base-content/60 font-semibold mt-0.5 break-words line-clamp-2">{n.message}</p>
                                                <span className="text-[9px] font-bold opacity-30 mt-1 block">
                                                    {new Date(n.date_creation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} à {new Date(n.date_creation).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <button 
                                                onClick={(e) => deleteNotif(e, n.id)} 
                                                className="absolute right-3 top-3 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-error/10 hover:text-error transition-all"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Menu Profil Dropdown */}
                <div className="dropdown dropdown-end ml-2">
                    <div tabIndex={0} role="button" className="flex items-center gap-3 bg-base-200 hover:bg-base-300 transition-all p-1.5 pr-4 rounded-2xl border border-base-300 cursor-pointer">
                        <div className="avatar">
                            <div className="w-9 rounded-xl bg-primary text-white flex items-center justify-center font-black shadow-md uppercase">
                                {user.first_name ? user.first_name[0] : (user.username ? user.username[0] : 'U')}
                            </div>
                        </div>
                        <div className="hidden sm:flex flex-col items-start leading-tight">
                            <span className="text-sm font-black text-base-content">{user.first_name || user.username || roleLabel}</span>
                            <span className="text-[10px] opacity-40 font-bold uppercase tracking-tight">{roleLabel}</span>
                        </div>
                        <ChevronDown size={14} className="opacity-30" />
                    </div>

                    <ul tabIndex={0} className="dropdown-content z-[2] menu p-2 shadow-2xl bg-base-100 rounded-2xl w-56 mt-4 border border-base-300 animate-in fade-in zoom-in-95 duration-200">
                        <li className="menu-title opacity-40 text-[10px] font-black uppercase tracking-widest px-4 py-2">Mon Compte</li>
                        <li>
                            <button 
                                onClick={() => navigate(profilePath)}
                                className="flex items-center gap-3 py-3 rounded-xl hover:bg-primary/10 hover:text-primary font-bold w-full text-left"
                            >
                                <UserCircle size={18} /> Mon Profil
                            </button>
                        </li>
                        <div className="divider my-1 opacity-5"></div>
                        <li>
                            <button 
                                onClick={handleLogout}
                                className="flex items-center gap-3 py-3 rounded-xl text-error hover:bg-error/5 font-bold w-full text-left"
                            >
                                <LogOut size={18} /> Se déconnecter
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default NavbarDash;