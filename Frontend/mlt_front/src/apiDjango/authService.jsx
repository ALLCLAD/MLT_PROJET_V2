import api from "./api";
import {ACCESS_TOKEN, REFRESH_TOKEN} from "./constantes.jsx";

/**
 *
 * Service pour gérer l'authentification inscriptionAdulte
 */

export const inscriptionAdulte = async (userData) => {

    try
    {
        // On essaie l'envoi des données à l'url de notre api django qui nous renvoie vers la vue qui gère l'inscription
        const response = await api.post("/auth/inscription/", userData);

        // On retourne les données de la réponse
        return response.data;
    }
    catch(error)
    {
        // Au cas où une erreur survenait (le serveur niveau back qui renvoie) on la renvoie
        throw error.response ? error.response.data : new Error("Erreur");
    }

};

/**
 * Service pour gérer la connexion (login)
 * @param {Object} credentials - Contient l'username et le password
 */
export const login = async (credentials) => {
    try
    {
        // Envoi des identifiants au back django sur l'url menant vers la vue qui gère le login
        const response = await api.post("/auth/Login/", credentials);

        // On vérifie la validité de la reponse par le serveur en tchequant le statut 200 (ok)
        if (response.status === 200)
        {

            // Sauvegarde des jetons reçus pour rester connecté lors des prochaines visites
            localStorage.setItem(ACCESS_TOKEN, response.data.access);
            localStorage.setItem(REFRESH_TOKEN, response.data.refresh);

            // Retour des informations de l(utilisateur pour la redirection vers son tableau de bord (ou ses pages)
            return response.data;
        }
    }
    catch(error)
    {
        // Au cas où une erreur survenaie, on renvoie (lance) l'erreur du back de façon détaillée
        throw error.response ? error.response.data : new Error("Identifiants incorrects");
    }

}

/**
 * Action de déconnexion (Logout)
 * Exportée nommée pour être accessible partout
 */
export const LogoutAction = () => {
    localStorage.clear();
};