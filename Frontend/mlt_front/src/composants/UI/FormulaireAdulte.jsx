import React, { useState, useEffect } from 'react';
import { 
    Eye, EyeOff, AlertCircle, CheckCircle2, User, Mail, Lock, School, UserPlus, Users, GraduationCap, Loader2
} from 'lucide-react';
import api from '../../apiDjango/api.jsx';

const FormulaireAdulte = ({ formData, handleChange, handleSubmit, loading, backendErrors }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    
    // States for local validation and async availability checks
    const [localErrors, setLocalErrors] = useState({});
    const [availabilityErrors, setAvailabilityErrors] = useState({});
    const [checking, setChecking] = useState({ username: false, email: false });

    // CSS styling helper
    const inputStyle = `input input-bordered w-full pl-12 rounded-2xl bg-base-200/50 
        border-2 border-transparent focus:border-primary focus:ring-0
        transition-all no-native-eye h-14 font-medium`;

    // Prioritize Backend Errors first, then Availability Errors, then Local validation Errors
    const getErrorMessage = (fieldName) => {
        if (backendErrors && backendErrors[fieldName]) {
            return Array.isArray(backendErrors[fieldName]) ? backendErrors[fieldName][0] : backendErrors[fieldName];
        }
        if (availabilityErrors[fieldName]) {
            return availabilityErrors[fieldName];
        }
        return localErrors[fieldName] || null;
    };

    // Helper for validating email format locally (matches backend valider_email_gmail)
    const validerEmail = (email) => {
        if (!email) return "L'adresse email est requise.";
        
        if (!email.includes('@')) {
            return "Email invalide : le symbole '@' est manquant.";
        }
        if (!email.endsWith('@gmail.com')) {
            return "Email invalide : seules les adresses @gmail.com sont acceptées.";
        }
        
        const regex = /^[a-zA-ZÀ-ÿ0-9]+@gmail\.com$/;
        if (!regex.test(email)) {
            return "Email invalide : le format attendu est prenomnom@gmail.com (sans point ni espace avant le @).";
        }
        return "";
    };

    // Helper for validating password locally (matches backend valider_complexite_mot_de_passe)
    const validerMotDePasse = (password) => {
        if (!password) return "Le mot de passe est requis.";
        if (password.length < 8) {
            return "Le mot de passe doit contenir au moins 8 caractères.";
        }
        if (!/[A-Z]/.test(password)) {
            return "Le mot de passe doit contenir au moins une lettre majuscule (ex: A, B...).";
        }
        if (!/[a-z]/.test(password)) {
            return "Le mot de passe doit contenir au moins une lettre minuscule (ex: a, b...).";
        }
        if (!/[0-9]/.test(password)) {
            return "Le mot de passe doit contenir au moins un chiffre (ex: 1, 2...).";
        }
        if (!/[@#$%^&*!?.,;:\-_+=]/.test(password)) {
            return "Le mot de passe doit contenir au moins un caractère spécial (ex: @, #, !, ?, ...).";
        }
        return "";
    };

    // Async call to check username/email availability
    const checkAvailability = async (field, value) => {
        if (!value) return;
        setChecking(prev => ({ ...prev, [field]: true }));
        try {
            const response = await api.get(`/auth/verifier-disponibilite/?${field}=${encodeURIComponent(value)}`);
            const key = `${field}_disponible`;
            const disponible = response.data[key];
            
            setAvailabilityErrors(prev => ({
                ...prev,
                [field]: disponible ? "" : `Ce ${field === 'username' ? "nom d'utilisateur" : "adresse email"} est déjà pris.`
            }));
        } catch (err) {
            console.error(`Erreur de validation ${field}:`, err);
        } finally {
            setChecking(prev => ({ ...prev, [field]: false }));
        }
    };

    // Handle blur events to trigger validation and availability check
    const handleBlur = (e) => {
        const { name, value } = e.target;
        let msg = "";

        if (name === "email") {
            msg = validerEmail(value);
            setLocalErrors(prev => ({ ...prev, email: msg }));
            if (!msg) {
                checkAvailability('email', value);
            } else {
                setAvailabilityErrors(prev => ({ ...prev, email: "" }));
            }
        }

        if (name === "username" && value) {
            checkAvailability('username', value);
        }

        if (name === "password") {
            msg = validerMotDePasse(value);
            setLocalErrors(prev => ({ ...prev, password: msg }));
        }

        if (name === "password_confirm" && value !== formData.password) {
            setLocalErrors(prev => ({ ...prev, password_confirm: "Les mots de passe diffèrent." }));
        } else if (name === "password_confirm") {
            setLocalErrors(prev => ({ ...prev, password_confirm: "" }));
        }
    };

    // Reset validation state when switching roles or modifying fields
    useEffect(() => {
        setAvailabilityErrors({});
        setLocalErrors({});
    }, [formData.role]);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        
        // Final sanity check before submission
        const pErr = validerMotDePasse(formData.password);
        const cErr = formData.password !== formData.password_confirm ? "Les mots de passe diffèrent." : "";
        const eErr = validerEmail(formData.email);

        if (pErr || cErr || eErr || availabilityErrors.username || availabilityErrors.email) {
            setLocalErrors({
                password: pErr,
                password_confirm: cErr,
                email: eErr
            });
            return;
        }

        handleSubmit();
    };

    return (
        <form onSubmit={handleFormSubmit} className="space-y-6">
            <style>{`.no-native-eye::-ms-reveal { display: none; }`}</style>

            {/* CHOIX DU RÔLE */}
            <div className="w-full">
                <label className="block text-xs font-black uppercase opacity-45 mb-3 tracking-widest">
                    Je m'inscris en tant que :
                </label>
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { role: 'PARENT', label: 'Parent', desc: 'Suivre mes enfants', icon: <Users size={20} /> },
                        { role: 'ENSEIGNANT', label: 'Enseignant', desc: 'Gérer mes classes', icon: <GraduationCap size={20} /> }
                    ].map((item) => (
                        <label 
                            key={item.role} 
                            className={`flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all hover:scale-[0.99] ${
                                formData.role === item.role 
                                    ? "border-primary bg-primary/5 text-primary" 
                                    : "border-base-200 bg-base-200/40 text-base-content/70 hover:border-primary/20"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <input 
                                    type="radio" 
                                    name="role" 
                                    value={item.role} 
                                    checked={formData.role === item.role} 
                                    onChange={handleChange} 
                                    className="radio radio-primary radio-sm mt-0.5" 
                                />
                                <div className="p-2 bg-base-100 rounded-xl flex items-center justify-center shadow-sm">
                                    {item.icon}
                                </div>
                            </div>
                            <div className="text-center sm:text-left">
                                <span className="font-black text-sm block">{item.label}</span>
                                <span className="text-[10px] opacity-60 font-semibold block mt-0.5">{item.desc}</span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* PRÉNOM & NOM DE FAMILLE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Prénom">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
                    <input 
                        type="text" 
                        name="first_name" 
                        value={formData.first_name} 
                        placeholder="Ex: Koffi" 
                        onChange={handleChange} 
                        className={inputStyle} 
                        required 
                    />
                </Field>

                <Field label="Nom">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
                    <input 
                        type="text" 
                        name="last_name" 
                        value={formData.last_name} 
                        placeholder="Ex: Mensah" 
                        onChange={handleChange} 
                        className={inputStyle} 
                        required 
                    />
                </Field>
            </div>

            {/* USERNAME (Nom d'utilisateur) */}
            <Field label="Nom d'utilisateur" error={getErrorMessage('username')} checking={checking.username}>
                <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
                <input
                    type="text"
                    name="username"
                    value={formData.username}
                    placeholder="Ex: koffi_pro"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`${inputStyle} ${getErrorMessage('username') ? "border-error/50" : ""}`}
                    required
                />
            </Field>

            {/* EMAIL */}
            <Field label="Adresse email" error={getErrorMessage('email')} checking={checking.email}>
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
                <input
                    type="text"
                    name="email"
                    value={formData.email}
                    placeholder="koffi.mensah@gmail.com"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`${inputStyle} ${getErrorMessage('email') ? "border-error/50" : ""}`}
                    required
                />
            </Field>

            {/* CHAMPS DÉDIÉS AUX ENSEIGNANTS */}
            {formData.role === "ENSEIGNANT" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Field label="Établissement scolaire">
                        <School className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
                        <input 
                            type="text" 
                            name="etablissement_inscription" 
                            value={formData.etablissement_inscription} 
                            placeholder="Ex: École publique" 
                            onChange={handleChange} 
                            className={inputStyle} 
                            required 
                        />
                    </Field>

                    <Field label="Classe enseignée">
                        <School className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 z-10" size={18} />
                        <select 
                            name="classe_enseignement_inscription" 
                            value={formData.classe_enseignement_inscription} 
                            onChange={handleChange} 
                            className={`${inputStyle} pl-12 font-bold cursor-pointer appearance-none`}
                        >
                            {['CP1', 'CP2', 'CE1', 'CE2', 'CM1', 'CM2'].map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </Field>
                </div>
            )}

            {/* MOT DE PASSE */}
            <div className="form-control w-full">
                <label className="label-text font-bold mb-2 ml-1 opacity-70">Mot de passe</label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        placeholder="Créer un mot de passe fort"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`${inputStyle} pr-14 ${getErrorMessage('password') ? "border-error/50" : ""}`}
                        required
                    />
                    <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 opacity-40 hover:opacity-100 transition-opacity"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 px-2">
                    <Rule label="8+ car." active={formData.password?.length >= 8} />
                    <Rule label="Majuscule" active={/[A-Z]/.test(formData.password)} />
                    <Rule label="Minuscule" active={/[a-z]/.test(formData.password)} />
                    <Rule label="Chiffre" active={/[0-9]/.test(formData.password)} />
                    <Rule label="Car. spécial" active={/[@#$%^&*!?.,;:\-_+=]/.test(formData.password)} />
                </div>
                {getErrorMessage('password') && (
                    <p className="text-error text-[10px] font-bold mt-1 ml-1 flex items-center gap-1 animate-in slide-in-from-left-1">
                        <AlertCircle size={12}/> {getErrorMessage('password')}
                    </p>
                )}
            </div>

            {/* CONFIRMATION DU MOT DE PASSE */}
            <Field label="Confirmer le mot de passe" error={getErrorMessage('password_confirm')}>
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
                <input
                    type={showConfirm ? "text" : "password"}
                    name="password_confirm"
                    value={formData.password_confirm}
                    placeholder="Confirmer le mot de passe"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`${inputStyle} pr-14 ${getErrorMessage('password_confirm') ? "border-error/50" : ""}`}
                    required
                />
                <button 
                    type="button" 
                    onClick={() => setShowConfirm(!showConfirm)} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 opacity-40 hover:opacity-100 transition-opacity"
                >
                    {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </Field>

            {/* BOUTON D'INSCRIPTION */}
            <button 
                type="submit" 
                disabled={loading || checking.username || checking.email} 
                className="btn btn-primary w-full h-14 rounded-2xl font-black text-lg shadow-lg hover:scale-[1.01] active:scale-95 transition-all text-white mt-4"
            >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "CRÉER MON COMPTE"}
            </button>
        </form>
    );
};

// Sub-component for form field layout
const Field = ({ label, children, error, checking }) => (
    <div className="form-control w-full">
        <div className="flex justify-between items-center mb-2 ml-1">
            <label className="label-text font-bold opacity-70">{label}</label>
            {checking && <span className="loading loading-spinner loading-xs text-primary"></span>}
        </div>
        <div className="relative">{children}</div>
        {error && (
            <p className="text-error text-[10px] font-bold mt-1 ml-1 flex items-center gap-1 animate-in slide-in-from-left-1">
                <AlertCircle size={12} /> {error}
            </p>
        )}
    </div>
);

// Sub-component for password requirement validation rules
const Rule = ({ label, active }) => (
    <div className={`flex items-center gap-1 transition-all ${active ? "text-success opacity-100" : "opacity-20"}`}>
        <CheckCircle2 size={10} strokeWidth={3} />
        <span className="text-[9px] font-black uppercase tracking-tight">{label}</span>
    </div>
);

export default FormulaireAdulte;