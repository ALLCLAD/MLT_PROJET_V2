import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, UserCircle, LogOut, Calendar, ChevronRight, MessageSquare } from 'lucide-react';
import Logo from '../../assets/logo.jpeg';
import { LogoutAction } from '../../apiDjango/authService';

const SidebarEnseignant = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // --- DÉCONNEXION ---
    const handleLogout = () => {
        LogoutAction();
        navigate('/login');
    };

    // --- MENU ITEMS ---
    const menuItems = [
    { name: 'Aperçu',      icon: <LayoutDashboard size={24} />, path: '/enseignant/dashboard' },
    { name: 'Mes Élèves',  icon: <Users size={24} />,           path: '/enseignant/eleves' },
    { name: 'Mes Leçons',  icon: <BookOpen size={24} />,        path: '/enseignant/lecons' },
    { name: 'Messagerie',  icon: <MessageSquare size={24} />,   path: '/enseignant/messagerie' },
    { name: 'Calendrier',  icon: <Calendar size={24} />,        path: '/enseignant/calendrier' },
    { name: 'Mon Profil',  icon: <UserCircle size={24} />,      path: '/enseignant/profil' },
    ];



    return (
        <aside className="w-20 lg:w-72 h-screen flex flex-col sticky top-0 z-50 transition-colors duration-300 bg-base-100 dark:bg-base-100">
            
            {/* Logo et Branding MLT (Style Parent) */}
            <div className="h-32 flex items-center px-8">
                <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate('/enseignant/dashboard')}>
                    <img src={Logo} alt="Logo" className="w-14 h-14 rounded-2xl object-cover border border-base-200" />
                    <div className="hidden lg:block">
                        <h1 className="text-2xl font-black tracking-tighter text-base-content leading-none">M L T <span className="text-primary italic"></span></h1>
                        <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.3em] mt-2">Espace Enseignant</p>
                    </div>
                </div>
            </div>

            {/* Menu de Navigation */}
            <nav className="flex-grow px-0 mt-2">
                <p className="hidden lg:block text-[11px] font-black opacity-20 uppercase tracking-[0.4em] px-8 mb-6">Menu Principal</p>
                <div className="space-y-1">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`flex items-center justify-between px-8 py-4 transition-all duration-300 group border-l-4 ${
                                    isActive 
                                        ? 'bg-base-200 border-primary text-primary' 
                                        : 'bg-transparent border-transparent text-base-content/60 hover:text-primary hover:bg-base-200/50'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className={`${isActive ? 'text-primary' : 'opacity-40 group-hover:text-primary'}`}>
                                        {item.icon}
                                    </span>
                                    <span className={`hidden lg:block text-base tracking-tight ${isActive ? 'font-black' : 'font-bold'}`}>
                                        {item.name}
                                    </span>
                                </div>
                                {isActive && <ChevronRight size={18} className="hidden lg:block opacity-40" />}
                            </NavLink>
                        );
                    })}
                </div>
            </nav>

            {/* Actions Utilisateur */}
            <div className="mt-auto p-4">
                <button onClick={handleLogout} className="flex items-center gap-4 px-6 py-5 w-full rounded-2xl font-black text-error hover:bg-error/10 transition-all group">
                    <div className="p-2.5 bg-base-200 rounded-xl group-hover:bg-error group-hover:text-error-content transition-all">
                        <LogOut size={22} />
                    </div>
                    <span className="hidden lg:block text-sm uppercase tracking-widest">Quitter</span>
                </button>
            </div>
        </aside>
    );
};

export default SidebarEnseignant;