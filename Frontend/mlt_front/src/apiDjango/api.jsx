import axios from "axios"
import { ACCESS_TOKEN} from "./constantes.jsx";

/**
 * Configuration de l'instance Axios personnalisée
 */

const api = axios.create({
    // on récupère l'url de base de l'API depuis les variables d'environnement .env
    baseURL: import.meta.env.VITE_MON_URL_DJANGO
})


/**
 * Intercepteur de requête : s'exécute AVANT que la requête ne parte vers le serveur
 */
api.interceptors.request.use(
    (config) => {

        // on cherche le jeton d'accès dans le Local storage du navigateur
        const token = localStorage.getItem(ACCESS_TOKEN);

        // Liste des routes qui ne nécessitent PAS de jeton (Public)
        const publicRoutes = ["/auth/inscription/", "/auth/Login/"];

        // On n'ajoute le token QUE si la route n'est pas publique ET si le token existe
        if (token && !publicRoutes.some(route => config.url.includes(route))) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },

    // Au cas ou une erreur survenait lors de la préparation de la requête on la renvoie
    (error) => {
        return Promise.reject(error);
    }
)

export default api
