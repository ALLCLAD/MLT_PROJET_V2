import React, { useState } from 'react';
import { User, Mail, Lock, School, UserPlus, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const FormulaireEnfant = ({ onSubmit, loading, backendErrors }) => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        password: '',
        password_confirm: '',
        classe_inscription: 'CP1'
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [errors, setErrors] = useState({});

    const classes = ['CP1', 'CP2', 'CE1', 'CE2', 'CM1', 'CM2'];

    const inputStyle = `input input-bordered w-full pl-12 rounded-2xl bg-base-200/50 
        border-2 border-transparent focus:border-primary focus:ring-0
        transition-all no-native-eye h-14 font-medium`;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validerEmail = (email) => {
        if (!email) return "";
        const regex = /^[a-zA-Z0-9]+@gmail\.com$/;
        if (!regex.test(email)) return "Format: prenomnom@gmail.com";
        return "";
    };

    const validerMotDePasse = (password) => {
        if (!password) return "Le mot de passe est requis.";
        if (password.length < 8) return "8 caractères minimum.";
        if (!/[A-Z]/.test(password)) return "Une majuscule requise.";
        if (!/[0-9]/.test(password)) return "Un chiffre requis.";
        return "";
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        let msg = "";
        if (name === "email") msg = validerEmail(value);
        if (name === "password") msg = validerMotDePasse(value);
        if (name === "password_confirm" && value !== formData.password) msg = "Les mots de passe diffèrent.";
        setErrors(prev => ({ ...prev, [name]: msg }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const pErr = validerMotDePasse(formData.password);
        const cErr = formData.password !== formData.password_confirm ? "Les mots de passe diffèrent." : "";

        if (pErr || cErr) {
            setErrors({ password: pErr, password_confirm: cErr });
            return;
        }
        onSubmit(formData);
    };

    return (
        <>
            <style>
                {`
                    .no-native-eye::-ms-reveal, .no-native-eye::-ms-clear { display: none !important; }
                    .no-native-eye::-webkit-contacts-auto-fill-button, .no-native-eye::-webkit-credentials-auto-fill-button { display: none !important; }
                `}
            </style>

            <form onSubmit={handleFormSubmit} className="space-y-5">
                {/* Alerte globale si erreur inconnue */}
                {typeof backendErrors === 'string' && (
                    <div className="alert alert-error rounded-2xl text-sm font-bold shadow-lg animate-in fade-in">
                        <AlertCircle size={20} />
                        <span>{backendErrors}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Prénom de l'enfant">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
                        <input type="text" name="first_name" required onChange={handleChange} className={inputStyle} placeholder="Ex: Lucas" />
                    </Field>
                    <Field label="Nom de famille">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
                        <input type="text" name="last_name" required onChange={handleChange} className={inputStyle} placeholder="Ex: Dupont" />
                    </Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Identifiant avec erreur Backend */}
                    <Field label="Identifiant" error={backendErrors?.username?.[0]}>
                        <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
                        <input type="text" name="username" required onChange={handleChange} className={`${inputStyle} ${backendErrors?.username ? "border-error/50" : ""}`} placeholder="lucas_2024" />
                    </Field>

                    {/* Email avec erreur locale ou backend */}
                    <Field label="Email (optionnel)" error={errors.email || backendErrors?.email?.[0]}>
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
                        <input type="email" name="email" onChange={handleChange} onBlur={handleBlur} className={`${inputStyle} ${(errors.email || backendErrors?.email) ? "border-error/50" : ""}`} placeholder="enfant@mail.com" />
                    </Field>
                </div>

                <Field label="Classe de l'enfant">
                    <School className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 z-10" size={18} />
                    <select name="classe_inscription" value={formData.classe_inscription} onChange={handleChange} className={`${inputStyle} pl-12 appearance-none cursor-pointer`}>
                        {classes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                        <label className="label-text font-bold mb-2 ml-1 opacity-70">Mot de passe</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                required
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`${inputStyle} pr-12 ${errors.password ? "border-error/50" : ""}`}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 transition-opacity">
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2 px-1">
                            <Rule label="8+ car." active={formData.password.length >= 8} />
                            <Rule label="Majuscule" active={/[A-Z]/.test(formData.password)} />
                            <Rule label="Chiffre" active={/[0-9]/.test(formData.password)} />
                        </div>
                        {errors.password && <p className="text-error text-[10px] font-bold mt-1 ml-1">{errors.password}</p>}
                    </div>

                    <div className="form-control">
                        <label className="label-text font-bold mb-2 ml-1 opacity-70">Confirmation</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
                            <input
                                type={showConfirm ? "text" : "password"}
                                name="password_confirm"
                                required
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`${inputStyle} pr-12 ${errors.password_confirm ? "border-error/50" : ""}`}
                            />
                            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 transition-opacity">
                                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {errors.password_confirm && <p className="text-error text-[10px] font-bold mt-1 ml-1">{errors.password_confirm}</p>}
                    </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary w-full rounded-2xl font-black text-lg shadow-xl shadow-primary/20 mt-4 h-14 hover:scale-[1.01] active:scale-95 transition-all">
                    {loading ? <span className="loading loading-spinner"></span> : "Inscrire mon enfant"}
                </button>
            </form>
        </>
    );
};

const Field = ({ label, children, error }) => (
    <div className="form-control w-full">
        <label className="label-text font-bold mb-2 ml-1 opacity-70">{label}</label>
        <div className="relative">{children}</div>
        {error && (
            <p className="text-error text-[10px] font-bold mt-1 ml-1 flex items-center gap-1 animate-in slide-in-from-left-1">
                <AlertCircle size={12} /> {error}
            </p>
        )}
    </div>
);

const Rule = ({ label, active }) => (
    <div className={`flex items-center gap-1 transition-all ${active ? "text-success opacity-100" : "opacity-20"}`}>
        <CheckCircle2 size={10} strokeWidth={3} />
        <span className="text-[9px] font-black uppercase tracking-tight">{label}</span>
    </div>
);

export default FormulaireEnfant;