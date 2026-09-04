import React from 'react';
import { ChevronRight } from 'lucide-react';

const MissionCard = ({ title, subtitle, icon: Icon, color, status, onClick }) => {
    // Si la couleur passée est 'secondary', on force 'primary'
    const finalColor = color.includes('secondary') ? 'bg-primary' : color;
    const textColor = finalColor.replace('bg-', 'text-');

    return (
        <div
            onClick={onClick}
            className="flex items-center justify-between p-4 bg-base-100 rounded-2xl border border-base-content/5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer group"
        >
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${finalColor} bg-opacity-10 ${textColor}`}>
                    <Icon size={20} />
                </div>
                <div>
                    <h4 className="font-black text-sm">{title}</h4>
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{subtitle}</p>
                </div>
            </div>

            {status === 'locked' ? (
                <div className="badge badge-ghost badge-sm opacity-50 italic uppercase text-[9px]">Verrouillé</div>
            ) : (
                <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-primary" />
            )}
        </div>
    );
};

export default MissionCard;