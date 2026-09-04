import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../apiDjango/api.jsx';
import { ACCESS_TOKEN } from '../apiDjango/constantes.jsx';

const CommunicationContext = createContext();

export const CommunicationProvider = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifs, setNotifs] = useState([]);
    const socket = useRef(null);

    const fetchInitialNotifs = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) return;

        try {
            const res = await api.get('/communication/notifications/');
            setNotifs(res.data);
            const nonLues = res.data.filter(n => !n.est_lu).length;
            setUnreadCount(nonLues);
        } catch (err) {
            console.error("Erreur chargement notifications initiales:", err);
        }
    };

    useEffect(() => {
        fetchInitialNotifs();

        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) return;

        // Connexion au canal global de notification temps réel
        const wsUrl = `ws://localhost:8000/ws/notify/?token=${token}`;
        socket.current = new WebSocket(wsUrl);

        socket.current.onmessage = (event) => {
            const data = JSON.parse(event.data);

            // Éviter les doublons à l'insertion immédiate
            setNotifs(prev => {
                const existe = prev.find(n => n.id === data.id);
                if (existe) return prev;
                return [data, ...prev];
            });

            if (!data.est_lu) {
                setUnreadCount(prev => prev + 1);
            }
        };

        socket.current.onclose = () => {
            console.log("WebSocket notifications déconnecté. Recherche de signal...");
        };

        return () => {
            if (socket.current) socket.current.close();
        };
    }, []);

    return (
        <CommunicationContext.Provider value={{ unreadCount, notifs, setNotifs, setUnreadCount, fetchInitialNotifs }}>
            {children}
        </CommunicationContext.Provider>
    );
};

export const useCommunication = () => useContext(CommunicationContext);