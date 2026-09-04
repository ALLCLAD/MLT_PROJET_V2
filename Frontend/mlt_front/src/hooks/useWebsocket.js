import { useEffect, useRef } from 'react';

export const useWebsocket = (url, onMessage) => {
    const ws = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const fullUrl = `${url}?token=${token}`;
        ws.current = new WebSocket(fullUrl);

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            onMessage(data);
        };

        ws.current.onerror = (err) => console.error("Erreur WebSocket:", err);

        return () => {
            if (ws.current) ws.current.close();
        };
    }, [url]);

    return { ws: ws.current };
};
