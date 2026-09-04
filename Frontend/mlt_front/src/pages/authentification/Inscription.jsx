import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../assets/logo.jpeg';
import { inscriptionAdulte } from '../../apiDjango/authService';
import FormulaireAdulte from '../../composants/UI/FormulaireAdulte';
import NavbarAuth from '../../composants/UI/NavbarAuth';
import Footer from '../../composants/UI/Footer';
import { AlertCircle } from 'lucide-react';

const Inscription = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [backendErrors, setBackendErrors] = useState({});

    const [formData, setFormData] = useState({
        role: 'PARENT',
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        password_confirm: '',
        etablissement_inscription: '',
        classe_enseignement_inscription: 'CP1'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Nettoyage immédiat de l'erreur quand l'utilisateur tape à nouveau
        if (backendErrors[name]) {
            setBackendErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
        if (name === 'role') setBackendErrors({});
    };

    const handleSubmit = async () => {
        setLoading(true);
        setBackendErrors({});

        const dataToSubmit = { ...formData };
        if (formData.role === 'PARENT') {
            delete dataToSubmit.etablissement_inscription;
            delete dataToSubmit.classe_enseignement_inscription;
        }

        try {
            await inscriptionAdulte(dataToSubmit);
            navigate('/login', { state: { message: "Compte créé ! Connectez-vous." } });
        } catch (err) {
            if (err.response && err.response.data) {
                const bErrors = err.response.data;

                // On prépare le message d'alerte général
                let msg = "Une erreur est survenue.";
                if (bErrors.email && bErrors.username) msg = "Email et Pseudo déjà utilisés.";
                else if (bErrors.email) msg = "Cette adresse email est déjà utilisée.";
                else if (bErrors.username) msg = "Ce nom d'utilisateur est déjà utilisé.";

                // On fusionne les erreurs de champs avec le message général
                setBackendErrors({ ...bErrors, general: msg });
            } else {
                setBackendErrors({ general: "Erreur de connexion au serveur." });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-base-100 text-base-content">
            <NavbarAuth />
            <main className="flex-grow flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-5xl bg-base-200 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-base-content/5">

                    {/* Colonne Gauche (Design) */}
                    <div className="hidden lg:flex lg:w-5/12 bg-primary p-12 relative overflow-hidden flex-col items-center justify-start pt-16">
                        <div className="z-10 mb-8 transform hover:rotate-3 transition-transform duration-500">
                            <img src={Logo} alt="Logo" className="w-28 h-28 rounded-3xl shadow-2xl border-4 border-white/20 object-cover" />
                        </div>
                        <div className="text-center z-10 text-primary-content">
                            <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">Bienvenue</h2>
                            <p className="opacity-90 font-medium leading-relaxed italic">
                                "{formData.role === 'PARENT' ? "Suivez les progrès de vos enfants." : "Gérez vos classes en toute simplicité."}"
                            </p>
                        </div>
                    </div>

                    {/* Colonne Droite (Formulaire) */}
                    <div className="w-full lg:w-7/12 p-8 md:p-12 bg-base-100">
                        <div className="mb-10">
                            <h2 className="text-4xl font-black tracking-tight">Créer un compte</h2>
                            <p className="text-base-content/50 font-bold text-sm mt-1">Étape d'inscription rapide</p>
                        </div>

                        {/* Alerte rouge en haut */}
                        {backendErrors.general && (
                            <div className="alert alert-error mb-6 rounded-2xl font-bold text-xs animate-in fade-in zoom-in-95">
                                <AlertCircle size={16} />
                                <span>{backendErrors.general}</span>
                            </div>
                        )}

                        <FormulaireAdulte
                            formData={formData}
                            handleChange={handleChange}
                            handleSubmit={handleSubmit}
                            loading={loading}
                            backendErrors={backendErrors}
                        />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Inscription;