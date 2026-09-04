import React from 'react';
import { Outlet } from 'react-router-dom';
import SidebarParent from '../UIparent/SidebarParent';
import NavbarDash from '../UI/NavDash.jsx';

const LayoutParent = () => {
    return (
        <div className="flex h-screen bg-base-100 dark:bg-base-100 overflow-hidden font-sans">
            {/* Sidebar unifiée (Même fond blanc que le Header) */}
            <SidebarParent />

            {/* Conteneur de droite (Navbar blanche + Zone de contenu grise encastrée avec coin arrondi concave) */}
            <div className="flex-grow flex flex-col min-w-0 bg-base-100 dark:bg-base-100">
                <NavbarDash />

                {/* Zone de contenu principale encastrée unifiée */}
                <main className="flex-grow overflow-y-auto bg-base-200/80 dark:bg-base-300/40 rounded-tl-2xl border-t border-l border-base-300/70 shadow-inner flex flex-col justify-between p-4 sm:p-5">
                    <div className="w-full h-full flex flex-col flex-grow">
                        <div className="flex-grow">
                            <Outlet />
                        </div>

                        <footer className="mt-auto py-4 border-t border-base-300/40 text-center opacity-40">
                            <p className="text-[10px] font-bold uppercase tracking-widest">
                                Math Learning Tool — Plateforme Éducative
                            </p>
                        </footer>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default LayoutParent;