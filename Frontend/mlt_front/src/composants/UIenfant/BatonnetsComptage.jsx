import React, { useState } from 'react';
import { Plus, Minus, X, RotateCcw } from 'lucide-react';

const BatonnetsComptage = ({ isOpen, onClose }) => {
    const [unites, setUnites] = useState(0);     // Bâtonnets simples
    const [dizaines, setDizaines] = useState(0);  // Fagots de 10
    const [centaines, setCentaines] = useState(0); // Plaques de 100

    const total = centaines * 100 + dizaines * 10 + unites;

    const handleAddUnite = () => setUnites(u => u + 1);
    const handleSubUnite = () => setUnites(u => Math.max(0, u - 1));

    const handleAddDizaine = () => setDizaines(d => d + 1);
    const handleSubDizaine = () => setDizaines(d => Math.max(0, d - 1));

    const handleAddCentaine = () => setCentaines(c => c + 1);
    const handleSubCentaine = () => setCentaines(c => Math.max(0, c - 1));

    // Transformer 10 unités en 1 fagot de 10
    const groupUnits = () => {
        if (unites >= 10) {
            setUnites(u => u - 10);
            setDizaines(d => d + 1);
        }
    };

    // Transformer 1 fagot en 10 unités
    const ungroupDizaine = () => {
        if (dizaines >= 1) {
            setDizaines(d => d - 1);
            setUnites(u => u + 10);
        }
    };

    // Tout réinitialiser
    const handleReset = () => {
        setUnites(0);
        setDizaines(0);
        setCentaines(0);
    };

    if (!isOpen) return null;

    // Rendu graphique d'un bâtonnet (Aspect bois minimaliste et moderne)
    const renderStick = (key) => (
        <svg 
            key={key}
            className="w-2.5 h-14 md:h-16 shrink-0 transform rotate-12 transition-all duration-300 animate-in zoom-in-50"
            viewBox="0 0 10 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect x="1" y="1" width="8" height="58" rx="2" fill="#d97706" stroke="#b45309" strokeWidth="1" />
            <line x1="3" y1="8" x2="3" y2="52" stroke="#f59e0b" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
    );

    // Rendu graphique d'un fagot de 10 (10 bâtonnets attachés)
    const renderBundle = (key) => (
        <div key={key} className="relative flex items-center justify-center w-10 h-14 md:h-16 shrink-0 transform -rotate-6 transition-all duration-300 animate-in zoom-in-50">
            <div className="flex gap-[-1.5px] items-center">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-[3px] h-[50px] md:h-[60px] bg-amber-600 border border-amber-800 rounded-sm -mx-[0.8px] transform odd:rotate-2 even:-rotate-2" />
                ))}
            </div>
            <div className="absolute top-[40%] left-0 right-0 h-3 bg-red-500 border-t border-b border-red-700 rounded-sm flex items-center justify-center shadow-md">
                <span className="text-[6.5px] text-white font-black leading-none">10</span>
            </div>
        </div>
    );

    // Rendu graphique d'une plaque de 100
    const renderPlate = (key) => (
        <div key={key} className="relative w-16 h-16 bg-amber-700/10 border border-amber-800 rounded-xl p-1.5 flex flex-col justify-between shrink-0 transition-all duration-300 animate-in zoom-in-50 shadow-sm">
            <div className="flex flex-wrap gap-0.5 justify-center items-center h-full">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-1.5 h-10 bg-amber-600 border border-amber-700 rounded-sm flex items-center justify-center">
                        <div className="w-[0.5px] h-full bg-red-500" />
                    </div>
                ))}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border border-red-700 shadow">
                100
            </div>
        </div>
    );

    return (
        <div className="w-full h-[55vh] lg:h-full animate-in zoom-in-95 duration-200">
            <div className="bg-base-100 flex flex-col overflow-hidden h-full border border-base-300 rounded-[2rem] shadow-sm">
                
                {/* BARRE D'OUTILS SUPÉRIEURE (Design sobre et épuré) */}
                <div className="bg-base-100 text-base-content p-4 flex justify-between items-center border-b border-base-200 select-none">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-warning/10 text-warning flex items-center justify-center font-black">
                            10
                        </div>
                        <span className="text-xs font-black tracking-wider uppercase">Bâtonnets</span>
                    </div>
                    
                    {onClose && (
                        <button 
                            onClick={onClose}
                            className="btn btn-xs btn-circle btn-ghost"
                            title="Fermer"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* ZONE CENTRALE : TABLEAU CDU (Centaines, Dizaines, Unités) */}
                <div className="flex-1 bg-base-200/20 p-4 flex flex-col md:flex-row gap-3 overflow-y-auto min-h-0">
                    
                    {/* COLONNE CENTAINES (C) */}
                    <div className="flex-1 bg-base-100 rounded-[1.5rem] p-4 border border-base-200 flex flex-col shadow-sm min-h-[140px]">
                        <div className="flex justify-between items-center border-b border-base-200 pb-2 mb-3">
                            <span className="font-black text-[10px] text-base-content/60 tracking-wider">CENTAINES (C)</span>
                            <div className="text-[8px] bg-accent/10 text-accent font-black px-2 py-0.5 rounded-full">Plaques</div>
                        </div>
                        <div className="flex-1 flex flex-wrap gap-2 items-center justify-center bg-base-200/30 rounded-2xl p-2 border border-dashed border-base-300">
                            {centaines > 0 ? (
                                [...Array(centaines)].map((_, i) => renderPlate(i))
                            ) : (
                                <span className="text-[9px] text-base-content/40 italic">Aucune plaque</span>
                            )}
                        </div>
                        <div className="flex justify-center gap-1.5 mt-3">
                            <button onClick={handleSubCentaine} className="btn btn-xs btn-circle btn-outline border-base-300 hover:bg-warning hover:text-white hover:border-warning">
                                <Minus size={12} />
                            </button>
                            <span className="font-black text-sm w-8 text-center">{centaines}</span>
                            <button onClick={handleAddCentaine} className="btn btn-xs btn-circle btn-warning text-white border-none">
                                <Plus size={12} />
                            </button>
                        </div>
                    </div>

                    {/* COLONNE DIZAINES (D) */}
                    <div className="flex-1 bg-base-100 rounded-[1.5rem] p-4 border border-base-200 flex flex-col shadow-sm min-h-[140px]">
                        <div className="flex justify-between items-center border-b border-base-200 pb-2 mb-3">
                            <span className="font-black text-[10px] text-base-content/60 tracking-wider">DIZAINES (D)</span>
                            <div className="text-[8px] bg-error/10 text-error font-black px-2 py-0.5 rounded-full">Fagots</div>
                        </div>
                        <div className="flex-1 flex flex-wrap gap-2 items-center justify-center bg-base-200/30 rounded-2xl p-2 border border-dashed border-base-300">
                            {dizaines > 0 ? (
                                [...Array(dizaines)].map((_, i) => renderBundle(i))
                            ) : (
                                <span className="text-[9px] text-base-content/40 italic">Aucun fagot</span>
                            )}
                        </div>
                        <div className="flex flex-col gap-1.5 mt-3">
                            <div className="flex justify-center items-center gap-1.5">
                                <button onClick={handleSubDizaine} className="btn btn-xs btn-circle btn-outline border-base-300 hover:bg-warning hover:text-white hover:border-warning">
                                    <Minus size={12} />
                                </button>
                                <span className="font-black text-sm w-8 text-center">{dizaines}</span>
                                <button onClick={handleAddDizaine} className="btn btn-xs btn-circle btn-warning text-white border-none">
                                    <Plus size={12} />
                                </button>
                            </div>
                            {dizaines >= 1 && (
                                <button onClick={ungroupDizaine} className="text-[10px] text-error font-black hover:underline mt-1">
                                    Dégrouper 1 fagot
                                </button>
                            )}
                        </div>
                    </div>

                    {/* COLONNE UNITÉS (U) */}
                    <div className="flex-1 bg-base-100 rounded-[1.5rem] p-4 border border-base-200 flex flex-col shadow-sm min-h-[140px]">
                        <div className="flex justify-between items-center border-b border-base-200 pb-2 mb-3">
                            <span className="font-black text-[10px] text-base-content/60 tracking-wider">UNITÉS (U)</span>
                            <div className="text-[8px] bg-warning/10 text-warning font-black px-2 py-0.5 rounded-full">Bâtonnets</div>
                        </div>
                        <div className="flex-1 flex flex-wrap gap-1.5 items-center justify-center bg-base-200/30 rounded-2xl p-2 border border-dashed border-base-300">
                            {unites > 0 ? (
                                [...Array(unites)].map((_, i) => renderStick(i))
                            ) : (
                                <span className="text-[9px] text-base-content/40 italic">Aucun bâtonnet</span>
                            )}
                        </div>
                        <div className="flex flex-col gap-1.5 mt-3">
                            <div className="flex justify-center items-center gap-1.5">
                                <button onClick={handleSubUnite} className="btn btn-xs btn-circle btn-outline border-base-300 hover:bg-warning hover:text-white hover:border-warning">
                                    <Minus size={12} />
                                </button>
                                <span className="font-black text-sm w-8 text-center">{unites}</span>
                                <button onClick={handleAddUnite} className="btn btn-xs btn-circle btn-warning text-white border-none">
                                    <Plus size={12} />
                                </button>
                            </div>
                            {unites >= 10 && (
                                <button onClick={groupUnits} className="text-[10px] text-primary font-black hover:underline mt-1">
                                    Grouper en 1 fagot
                                </button>
                            )}
                        </div>
                    </div>

                </div>

                {/* PIED DE L'ÉCRAN : ÉQUATION MATHEMATIQUE ET RÉSULTAT */}
                <div className="bg-base-100 p-4 border-t border-base-200 flex justify-between items-center gap-2 select-none">
                    <div className="flex flex-wrap items-center gap-1 text-[10px] font-black text-base-content/60 uppercase">
                        <span className="bg-base-200 px-2 py-0.5 rounded-lg border border-base-300">{centaines} C</span>
                        <span>+</span>
                        <span className="bg-base-200 px-2 py-0.5 rounded-lg border border-base-300">{dizaines} D</span>
                        <span>+</span>
                        <span className="bg-base-200 px-2 py-0.5 rounded-lg border border-base-300">{unites} U</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <div className="bg-warning/20 text-warning-content border border-warning/30 px-3 py-1.5 rounded-xl flex items-center gap-1">
                            <span className="text-[9px] uppercase font-black opacity-60">Total =</span>
                            <span className="text-sm font-black">{total}</span>
                        </div>
                        <button onClick={handleReset} className="btn btn-xs btn-circle btn-outline border-base-300 hover:bg-base-200" title="Ranger tout">
                            <RotateCcw size={12} />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BatonnetsComptage;
