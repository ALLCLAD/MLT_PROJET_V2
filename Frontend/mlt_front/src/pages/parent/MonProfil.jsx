import React, { useState, useEffect } from 'react';
import { Mail, Loader2, ShieldCheck, User, AtSign, BadgeCheck } from 'lucide-react';
import api from '../../apiDjango/api.jsx';

const ProfilParent = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/auth/user-profile/');
                setProfile(response.data);
            } catch (err) {
                console.error("Erreur profil parent:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
    );

    const initiale = profile.first_name ? profile.first_name[0].toUpperCase() : profile.username[0].toUpperCase();

    const infos = [
        { icon: <AtSign size={16} />, label: 'Identifiant',  value: profile.username,                                                                     color: 'text-blue-500' },
        { icon: <Mail size={16} />,   label: 'Email de contact', value: profile.email,                                                                    color: 'text-blue-500' },
        { icon: <User size={16} />,   label: 'Nom et Prenom', value: ((profile.first_name || '') + ' ' + (profile.last_name || '')).trim() || 'Non renseigne', color: 'text-blue-500' },
    ];

    return (
        <div className="space-y-5 font-sans antialiased">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-100 dark:bg-base-100 p-5 rounded-2xl border border-base-300/60 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-black shadow-sm shrink-0">
                        {initiale}
                    </div>
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-[11px] font-extrabold uppercase tracking-wider mb-1">
                            <BadgeCheck size={12} /> Compte Parent
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-base-content tracking-tight uppercase leading-none">
                            {profile.first_name} {profile.last_name}
                        </h1>
                        <p className="text-base-content/50 text-xs font-medium italic mt-0.5">@{profile.username}</p>
                    </div>
                </div>
            </div>
            <div className="bg-base-100 dark:bg-base-100 p-5 md:p-6 rounded-2xl border border-base-300/60 shadow-sm">
                <div className="max-w-lg mx-auto space-y-3">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-base-content/40 pb-1 border-b border-base-200 mb-4">
                        Details de securite
                    </p>
                    {infos.map((info, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-base-200/40 rounded-xl border border-base-300/60 transition-all hover:border-blue-400/30 hover:shadow-xs">
                            <div className={`w-9 h-9 rounded-xl bg-base-100 flex items-center justify-center ${info.color} shadow-xs shrink-0`}>
                                {info.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-black text-base-content/40 uppercase tracking-widest">{info.label}</p>
                                <p className="text-base-content font-bold text-sm truncate">{info.value}</p>
                            </div>
                        </div>
                    ))}
                    <p className="text-center text-[10px] text-base-content/20 font-bold uppercase tracking-widest pt-4">
                        Espace Famille - M L T
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProfilParent;
