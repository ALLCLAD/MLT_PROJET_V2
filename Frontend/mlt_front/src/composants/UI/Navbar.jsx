import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Palette, Sun, Moon, Bell } from 'lucide-react';
import Logo from '../../assets/logo.jpeg';

const Navbar = () => {

    const [theme, setTheme] = useState("light");

    // Changement de thème
    const changeTheme = (newTheme) => {
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    return (
        <div className="navbar bg-base-100/80 backdrop-blur-md sticky top-0 z-[100] py-3 px-4 md:px-10 border-b border-base-content/10 shadow-sm">
            <div className="container mx-auto flex items-center justify-between">

                {/* LOGO */}
                <div className="flex-1">
                    <Link to="/" className="flex items-center gap-2 group">
                        <img 
                            src={Logo} 
                            alt="MLT Logo" 
                            className="rounded-full shadow-md transition-transform group-hover:scale-110 object-cover" 
                            style={{ width: '40px', height: '40px' }} 
                        />
                        <span className="text-2xl font-black text-primary tracking-tighter">M L T</span>
                    </Link>
                </div>

                {/* MENU & THEMES */}
                <div className="flex-none flex items-center gap-4">

                    <ul className="hidden lg:flex menu menu-horizontal px-1 gap-2 font-bold text-base-content/70">
                        <li><a href="#enfants" className="hover:text-primary">Enfants</a></li>
                        <li><a href="#parent" className="hover:text-primary">Parents</a></li>
                        <li><a href="#enseignant" className="hover:text-primary">Enseignant</a></li>
                    </ul>

                    {/* SELECTEUR DE THEME */}
                    <div className="flex-none flex items-center gap-2">

                        <button
                            onClick={() => changeTheme(theme === "light" ? "dark" : "light")}
                            className="btn btn-ghost btn-circle"
                        >
                            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
                        </button>

                    </div>

                    {/* GROUPE DE BOUTONS D'AUTH */}
                    <div className="flex items-center gap-2">

                        <Link
                            to="/login"
                            className="btn btn-ghost rounded-full px-6 font-bold hover:bg-primary/10 hover:text-primary transition-all"
                        >
                            Se connecter
                        </Link>

                        <Link
                            to="/inscription"
                            className="btn btn-primary rounded-full px-8 text-primary-content shadow-lg border-none hover:scale-105 transition-all font-black"
                        >
                            S'inscrire
                        </Link>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default Navbar;