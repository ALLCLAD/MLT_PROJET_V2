import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Moon, Sun } from 'lucide-react'; //  ajout Moon et Sun
import Logo from '../../assets/logo.jpeg';

const NavbarAuth = () => {

    const location = useLocation();

    //  useState DOIT être dans le composant
    const [theme, setTheme] = useState("light");

    //  fonction corrigée
    const changeTheme = (newTheme) => {
        setTheme(newTheme); // met à jour React
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    return (
        <div className="navbar bg-base-100/80 backdrop-blur-md sticky top-0 z-[100] py-3 px-4 md:px-10 border-b border-base-content/10 shadow-sm">
            <div className="container mx-auto flex items-center justify-between">

                {/* LOGO - Retour à l'accueil */}
                <div className="flex-1">
                    <Link to="/" className="flex items-center gap-2 group">
                        <img 
                            src={Logo} 
                            alt="MLT Logo" 
                            className="rounded-full shadow-md transition-transform group-hover:scale-110 object-cover" 
                            style={{ width: '40px', height: '40px' }} 
                        />
                        <span className="text-2xl font-black text-primary tracking-tighter">MLT</span>
                    </Link>
                </div>

                {/* SELECTEUR DE THEME */}
                <div className="flex-none flex items-center gap-6">

                    <button
                        onClick={() => changeTheme(theme === "light" ? "dark" : "light")}
                        className="btn btn-ghost btn-circle"
                    >
                        {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
                    </button>

                </div>



                {/* BOUTON DYNAMIQUE */}
                {location.pathname === '/inscription' ? (
                    <Link to="/login" className="btn btn-outline btn-primary rounded-full px-8">
                        Se connecter
                    </Link>
                ) : (
                    <Link to="/inscription" className="btn btn-primary rounded-full px-8 text-primary-content border-none shadow-lg hover:scale-105 transition-all">
                        S'inscrire
                    </Link>
                )}

            </div> {/*  fermeture container */}
        </div> /*  suppression du div en trop */
    );
};

export default NavbarAuth;