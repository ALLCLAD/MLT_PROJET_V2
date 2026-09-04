import {Navigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import api from "../apiDjango/api"
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../apiDjango/constantes";
import {useState, useEffect} from "react";

/**
 * Composant pour gérer la protection des routes vers les pages de chaque utilisateurs en fonctions biensûr du role
 * @param {ReactNode} children - la page que l'on souhaite afficher
 * @param {string} roleAttendu - le rôle nécessaire pour accéder à cette page
 * @returns {*|React.JSX.Element}
 * @constructor
 */


function ProtectionRoutes({children, roleAttendu})
{

    // état pour savoir si l'utilisateur est autorisé ou non
    const [estAutorise, setEstAutorise] = useState(null);

    // état pour stocker le rôle extrait du jeton JWT
    const [roleUtilisateur, setRoleUtilisateur] = useState(null);

    // Hook useEffect pour lancer la procédure de vérification au chargement du composant
    useEffect(() => {
        auth().catch(() => setEstAutorise(false));
    }, []);

    /**
     * constante pour le rafraichissement du jeton d'accès si celui-ci a expiré
     */
    const refreshToken = async ()=>
    {

        // On récupère le jeton de raffraichissement depuis le local storage
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);

        try
        {

            // On essaie d'appeler la vue qui gère le raffraichissement du jeton sur l'url
            const reponse = await api.post("/auth/token/refresh/", {refresh: refreshToken});

            if (reponse.status === 200)
            {
                // En cas de succès, on met à jour le nouveau jeton d'acccès
                localStorage.setItem(ACCESS_TOKEN, reponse.data.access)
                setEstAutorise(true);
            }
            else
            {
                setEstAutorise(false);
            }
        }
        catch (error)
        {
            console.log(error);
            setEstAutorise(false);
        }
    };

    /**
     * Là notre logique principale d'authentification et de décodage du rôle
     */
    const auth = async () =>
    {

        // Vérification de l'existance du jeton d'accès (dans le local storage)
        const token = localStorage.getItem(ACCESS_TOKEN);

        if (!token)
        {
            setEstAutorise(false);
            return;
        }

        // Décodage du jeton pour les lire les informations qu'il contient
        const decodage = jwtDecode(token)

        // Récupération du rôle injecté par le back django dans le jeton
        setRoleUtilisateur(decodage.role);

        // Gestion de l'expiration du jeton
        const tokenExpiration = decodage.exp
        const instant = Date.now() / 1000

        if (tokenExpiration < instant)
        {
            await refreshToken();
        }
        else
        {
            setEstAutorise(true);
        }


    }

    // Tant que la vérification n'est pas finie, on affiche un écran d'attente
    if (estAutorise === null)
    {
        return <div className="flex justify-center items-center h-screen">Chargement...</div>;
    }

    // Si l'utilisateur n'est pas connecté ( ou que le rafraichissement du jetons a échoué), redirection de l'utilisateur vers la page de login
    if (!estAutorise)
    {
        return <Navigate to="/login" />;
    }

    // Si un rôle spécifique est requis Et que l'utilisateur n'a pas ce rôle
    if (roleAttendu && roleUtilisateur !== roleAttendu)
    {
        console.warn(`Accès refusé : rôle ${roleAttendu} attendu, mais l'utilisateur est ${roleUtilisateur}`);

        // Redirection intelligente selon le vrai rôle de l'utilisateur connecté
        const routesParRole = {
            'PARENT': '/parent/dashboard',
            'ENSEIGNANT': '/enseignant/dashboard',
            'ENFANT': '/enfant/dashboard'
        };

        return <Navigate to={routesParRole[roleUtilisateur] || "/login"} replace />;
    }

    // Tout est bon, on affiche la page ( tableau de bord ) correspondant, ou demandée
    return children;
}

export default ProtectionRoutes;