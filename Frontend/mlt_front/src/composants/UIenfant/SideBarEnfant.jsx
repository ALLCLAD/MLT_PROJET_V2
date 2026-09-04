import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, BrainCircuit, Gamepad2, UserCircle, LogOut, ChevronRight, BookOpen, MessageSquare } from 'lucide-react';
import Logo from '../../assets/logo.jpeg';
import { LogoutAction } from '../../apiDjango/authService';

const SidebarEnfant = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        LogoutAction();
        navigate('/login');
    };

    const menuItems = [
    { name: 'Mon Tableau', icon: <LayoutDashboard size={24} />, path: '/enfant/dashboard' },
    { name: "S'exercer",   icon: <BrainCircuit size={24} />,    path: '/enfant/exercices' },
    { name: 'Mes Leçons',  icon: <BookOpen size={24} />,        path: '/enfant/lecons' },
    { name: 'Messagerie',  icon: <MessageSquare size={24} />,   path: '/enfant/messagerie' },
    { name: 'Mon Profil',  icon: <UserCircle size={24} />,      path: '/enfant/profil' },
    ];


    return (
        <aside className="w-20 lg:w-72 h-screen flex flex-col sticky top-0 z-50 transition-colors duration-300 bg-base-100 dark:bg-base-100">

            {/* 1. Logo et Branding (Inspiré du Parent) */}
            <div className="h-32 flex items-center px-8">
                <div
                    className="flex items-center gap-4 cursor-pointer group"
                    onClick={() => navigate('/enfant/dashboard')}
                >
                    <img src={Logo} alt="Logo" className="w-14 h-14 rounded-2xl object-cover border border-base-200 shadow-sm group-hover:scale-105 transition-transform" />
                    <div className="hidden lg:block">
                        <h1 className="text-2xl font-black tracking-tighter text-base-content leading-none">
                            M L T<span className="text-primary italic"></span>
                        </h1>
                        <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.3em] mt-2">Espace Enfant</p>
                    </div>
                </div>
            </div>

            {/* 2. Menu de Navigation */}
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
                                        ? 'bg-primary/5 border-primary text-primary'
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

            {/* 3. Actions Utilisateur (Style Premium) */}
            <div className="mt-auto p-4 border-t border-base-200/50">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 px-6 py-5 w-full rounded-2xl font-black text-error hover:bg-error/10 transition-all group"
                >
                    <div className="p-2.5 bg-base-200 rounded-xl group-hover:bg-error group-hover:text-error-content transition-all shadow-sm">
                        <LogOut size={22} />
                    </div>
                    <span className="hidden lg:block text-sm uppercase tracking-widest">Quitter</span>
                </button>
            </div>
        </aside>
    );
};

export default SidebarEnfant;