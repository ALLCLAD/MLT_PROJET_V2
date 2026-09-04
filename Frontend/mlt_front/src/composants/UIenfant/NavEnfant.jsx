import React, { useState, useEffect, useRef } from 'react';
import { Bell, LogOut, UserCircle, ChevronDown, Moon, Sun, CheckCircle2, Trash2, BookOpen, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LogoutAction } from '../../apiDjango/authService';
import api from '../../apiDjango/api.jsx';
import { useCommunication } from '../../contexte/CommunicationContext.jsx';

const NavEnfant = () => {
    const navigate = useNavigate();
    const { notifs, setNotifs, setUnreadCount, unreadCount } = useCommunication(); // Connecté au WebSocket global
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
    const [prenom, setPrenom] = useState('');
    const [showNotifPopup, setShowNotifPopup] = useState(false);
    const popupRef = useRef(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await api.get('/auth/user-profile/');
                setPrenom(response.data.first_name);
            } catch (err) {
                const user = JSON.parse(localStorage.getItem('user'));
                if (user) setPrenom(user.first_name);
            }
        };
        fetchUserData();
    }, []);

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

    useEffect(() => {
        document.querySelector('html').setAttribute('data-theme', theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

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
        if (!window.confirm("Veux-tu vraiment supprimer toutes tes notifications ?")) return;
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
            case 'LECON_PUBLIEE':  return <BookOpen className="text-blue-500" size={16} />;
            case 'MESSAGE_RECU':   return <MessageSquare className="text-purple-500" size={16} />;
            default:               return <Bell className="text-gray-400" size={16} />;
        }
    };

    return (
        <header className="h-20 bg-base-100 dark:bg-base-100 sticky top-0 z-30 px-6 lg:px-12 flex items-center justify-end">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                    className="p-2.5 rounded-xl bg-base-200 text-base-content hover:bg-base-300 transition-all"
                >
                    {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
                </button>

                {/* CLOCHE DE NOTIFICATION AVEC POPUP */}
                <div className="relative" ref={popupRef}>
                    <button
                        onClick={() => setShowNotifPopup(!showNotifPopup)}
                        className="btn btn-ghost btn-circle relative"
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
                                    <span className="font-black text-sm uppercase tracking-tight text-base-content">Notifications</span>
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
                                        <p className="text-sm font-black italic mt-2 uppercase">Rien de neuf</p>
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
                                                    <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${n.est_lu ? 'bg-base-300' : 'text-red-600 bg-red-50'}`}>
                                                        {n.type_notif.replace('_', ' ')}
                                                    </span>
                                                    {!n.est_lu && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>}
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

                <div className="h-8 w-[1px] bg-base-300 mx-2"></div>

                {/* Dropdown Profil */}
                <div className="dropdown dropdown-end ml-2">
                    <div tabIndex={0} role="button" className="flex items-center gap-3 bg-base-200 hover:bg-base-300 p-1.5 pr-4 rounded-2xl border border-base-300 cursor-pointer">
                        <div className="avatar">
                            <div className="w-9 rounded-xl bg-primary text-white flex items-center justify-center font-black shadow-md uppercase">
                                {prenom ? prenom[0].toUpperCase() : 'E'}
                            </div>
                        </div>
                        <div className="hidden sm:flex flex-col items-start leading-tight">
                            <span className="text-sm font-black text-base-content">{prenom || 'Enfant'}</span>
                            <span className="text-[10px] opacity-40 font-bold uppercase">Enfant</span>
                        </div>
                        <ChevronDown size={14} className="opacity-30" />
                    </div>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-2xl bg-base-100 rounded-2xl w-52 mt-4 border border-base-300 animate-in fade-in zoom-in-95 duration-200">
                        <li>
                            <button onClick={() => navigate('/enfant/profil')} className="flex items-center gap-3 py-3 rounded-xl font-bold">
                                <UserCircle size={18} /> Mon Profil
                            </button>
                        </li>
                        <div className="divider my-1 opacity-5"></div>
                        <li>
                            <button onClick={handleLogout} className="flex items-center gap-3 py-3 rounded-xl text-error font-bold">
                                <LogOut size={18} /> Quitter
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </header>
    );
};

export default NavEnfant;