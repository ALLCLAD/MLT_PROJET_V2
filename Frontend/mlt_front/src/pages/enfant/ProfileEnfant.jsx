import React, { useState, useEffect } from 'react';
import { Mail, GraduationCap, Loader2, UserCircle, ShieldCheck, AtSign, Award, Star } from 'lucide-react';
import api from '../../apiDjango/api.jsx';

const ProfilEnfant = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/auth/user-profile/');
                setProfile(response.data);
            } catch (err) {
                console.error("Erreur profil enfant:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
    );

    const initiale = profile?.first_name ? profile.first_name[0].toUpperCase() : (profile?.username ? profile.username[0].toUpperCase() : 'E');

    const infos = [
        { icon: <AtSign size={16} />,        label: 'Identifiant',          value: profile?.username || 'Non renseigné',                            color: 'text-primary' },
        { icon: <Mail size={16} />,          label: 'Email des parents',   value: profile?.email || 'Non renseigné',                               color: 'text-blue-500' },
        { icon: <UserCircle size={16} />,    label: 'Nom et Prenom',        value: ((profile?.first_name || '') + ' ' + (profile?.last_name || '')).trim() || 'Non renseigné', color: 'text-indigo-500' },
        { icon: <GraduationCap size={16} />, label: 'Ma Classe',            value: profile?.classe || 'Explorateur',                                color: 'text-emerald-500' },
    ];

    return (
        <div className="space-y-5 font-sans antialiased">
            {/* Header Uniformisé */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-100 dark:bg-base-100 p-5 rounded-2xl border border-base-300/60 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary text-primary-content flex items-center justify-center text-2xl font-black shadow-sm shrink-0">
                        {initiale}
                    </div>
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-extrabold uppercase tracking-wider mb-1">
                            <ShieldCheck size={12} /> Compte Eleve
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-base-content tracking-tight uppercase leading-none">
                            {profile?.first_name} {profile?.last_name}
                        </h1>
                        <p className="text-base-content/50 text-xs font-medium italic mt-0.5">@{profile?.username}</p>
                    </div>
                </div>
            </div>

            {/* Carte des Informations */}
            <div className="bg-base-100 dark:bg-base-100 p-5 md:p-6 rounded-2xl border border-base-300/60 shadow-sm">
                <div className="max-w-lg mx-auto space-y-3">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-base-content/40 pb-1 border-b border-base-200 mb-4">
                        Details du Profil Eleve
                    </p>
                    {infos.map((info, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-base-200/40 rounded-xl border border-base-300/60 transition-all hover:border-primary/30 hover:shadow-xs">
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
                        Mathy Aventure • M L T
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProfilEnfant;