import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../apiDjango/authService';
import Logo from '../../assets/logo.jpeg';
import FormulaireLogin from '../../composants/UI/FormulaireLogin';
import NavbarAuth from '../../composants/UI/NavbarAuth';
import Footer from '../../composants/UI/Footer';

const Login = () => {
    // Hook pour naviguer programmatiquement entre les pages
    const navigate = useNavigate();

    // États pour gérer l'affichage
    const [loading, setLoading] = useState(false); // Spinner de chargement
    const [credentials, setCredentials] = useState({ username: '', password: '' }); // Données saisies
    const [error, setError] = useState(""); // Message d'erreur éventuel

    /**
     * Met à jour l'état 'credentials' à chaque fois qu'un utilisateur tape dans un champ
     */
    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    /**
     * Gère la soumission du formulaire
     */
    const handleSubmit = async (e) => {
        e.preventDefault(); // Empêche le rechargement de la page
        setLoading(true);
        setError("");

        try
        {
            // Appel au service login qui stocke aussi les tokens dans localStorage
            const userData = await login(credentials);

            // Mapping pour la redirection intelligente selon le rôle reçu du backend
            const routes = {
                'PARENT': '/parent/dashboard',

                'ENSEIGNANT': '/enseignant/dashboard',
             
                'ENFANT': '/enfant/dashboard'
            };

            // Redirige vers la route correspondante ou l'accueil par défaut
            navigate(routes[userData.role] || '/');
        }
        catch (err)
        {
            // Affiche un message d'erreur si les identifiants sont faux ou problème réseau
            setError("Identifiants incorrects. Veuillez réessayer.");
        }
        finally
        {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-base-100 text-base-content">
            <NavbarAuth />

            <main className="flex-grow flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-md bg-base-100 border border-base-content/10 p-8 md:p-12 rounded-[3rem] shadow-2xl">
                    <div className="text-center mb-10">
                        {/* REMIS ICI : Ton logo original centré */}
                        <img src={Logo} alt="Logo" className="w-24 h-24 mx-auto mb-4 rounded-2xl object-cover shadow-md" />
                        <h2 className="text-3xl font-black tracking-tight">Bon retour !</h2>
                        <p className="opacity-50 text-sm mt-2 italic font-medium">L'aventure continue ici.</p>
                    </div>

                    {error && (
                        <div className="alert alert-error mb-6 rounded-xl text-sm font-bold">
                            <span>{error}</span>
                        </div>
                    )}

                    <FormulaireLogin
                        credentials={credentials}
                        handleChange={handleChange}
                        handleSubmit={handleSubmit}
                        loading={loading}
                    />
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Login;