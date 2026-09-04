import React from 'react';
import { Outlet } from 'react-router-dom';
import SidebarEnfant from '../UIenfant/SidebarEnfant';
import NavEnfant from '../UIenfant/NavEnfant';

const LayoutEnfant = () => {
    return (
        <div className="flex h-screen bg-base-100 dark:bg-base-100 overflow-hidden font-sans">
            <SidebarEnfant />
            <div className="flex-grow flex flex-col min-w-0 bg-base-100 dark:bg-base-100">
                <NavEnfant />
                {/* Zone de contenu principale encastrée unifiée */}
                <main className="flex-grow overflow-y-auto bg-base-200/80 dark:bg-base-300/40 rounded-tl-2xl border-t border-l border-base-300/70 shadow-inner flex flex-col justify-between p-4 sm:p-5">
                    <div className="w-full h-full flex flex-col flex-grow">
                        <div className="flex-grow">
                            <Outlet />
                        </div>
                        <footer className="mt-auto py-4 opacity-30 text-center text-[10px] font-bold uppercase tracking-widest">
                            Math Learning Tool — Ton aventure mathématique
                        </footer>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default LayoutEnfant;