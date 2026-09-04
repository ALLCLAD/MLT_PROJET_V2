import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const FormulaireLogin = ({ credentials, handleChange, handleSubmit, loading }) => {

    // ───── État : afficher/cacher le mot de passe ─────
    const [showPassword, setShowPassword] = useState(false);

    // ───── État : erreurs de validation locales ─────
    const [errors, setErrors] = useState({});

    // VALIDATION AU FLOU (Blur)
    const handleBlur = (e) => {
        const { name, value } = e.target;
        let erreurMessage = "";

        if (!value.trim()) {
            if (name === "username") erreurMessage = "Le nom d'utilisateur est obligatoire.";
            if (name === "password") erreurMessage = "Le mot de passe est obligatoire.";
        }

        setErrors(prev => ({ ...prev, [name]: erreurMessage }));
    };

    // SOUMISSION DU FORMULAIRE
    const handleFormSubmit = (e) => {
        e.preventDefault();

        const nouvellesErreurs = {
            username: !credentials.username.trim() ? "Le nom d'utilisateur est obligatoire." : "",
            password: !credentials.password.trim() ? "Le mot de passe est obligatoire." : "",
        };

        setErrors(nouvellesErreurs);

        const aDesErreurs = Object.values(nouvellesErreurs).some(err => err !== "");
        if (!aDesErreurs) {
            handleSubmit(e);
        }
    };

    // ───── STYLE DES CHAMPS + FIX NAVIGATEURS ─────
    // [&::-ms-reveal] cache l'oeil natif de Microsoft Edge
    // [&::-ms-clear] cache la croix native de suppression
    const inputStyle = `w-full h-14 px-4 rounded-2xl font-medium
        bg-base-200 border-2 border-base-300
        focus:outline-none focus:border-primary
        text-base-content placeholder:opacity-40
        transition-all
        [&::-ms-reveal]:hidden [&::-ms-clear]:hidden`;

    return (
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">

            {/* ── CHAMP : NOM D'UTILISATEUR ── */}
            <div className="flex flex-col gap-1">
                <label className="text-sm font-bold opacity-70 ml-1">
                    Nom d'utilisateur
                </label>
                <input
                    type="text"
                    name="username"
                    value={credentials.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`${inputStyle} ${errors.username ? 'border-error' : ''}`}
                    placeholder="Votre nom d'utilisateur"
                />
                {errors.username && (
                    <p className="text-error text-xs font-semibold mt-1 flex items-center gap-1">
                        <span>⚠</span> {errors.username}
                    </p>
                )}
            </div>

            {/* ── CHAMP : MOT DE PASSE ── */}
            <div className="flex flex-col gap-1">
                <label className="text-sm font-bold opacity-70 ml-1">
                    Mot de passe
                </label>
                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={credentials.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        className={`${inputStyle} pr-12 ${errors.password ? 'border-error' : ''}`}
                        placeholder="Votre mot de passe"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 transition-opacity"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                {errors.password && (
                    <p className="text-error text-xs font-semibold mt-1 flex items-center gap-1">
                        <span>⚠</span> {errors.password}
                    </p>
                )}
            </div>

            {/* ── BOUTON DE CONNEXION ── */}
            <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full normal-case text-white font-bold text-lg h-14 rounded-2xl shadow-lg mt-4"
            >
                {loading ? <span className="loading loading-spinner"></span> : "Se connecter"}
            </button>
        </form>
    );
};

export default FormulaireLogin;