import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MessageSquare, Send, Loader2, ArrowLeft, Users, User, GraduationCap, Heart, BookOpen, Home, CheckCheck, Pencil, Trash2, X } from 'lucide-react';
import api from '../apiDjango/api.jsx';
import { ACCESS_TOKEN } from '../apiDjango/constantes.jsx';

// Extraction des utilitaires
const getConnectedUserId = () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(window.atob(base64)).user_id;
    } catch (e) {
        return null;
    }
};

const getRoleIcon = (userRole, size = 14) => {
    switch (userRole?.toLowerCase()) {
        case 'enseignant':
        case 'professeur':
            return <GraduationCap size={size} className="text-blue-600 dark:text-blue-400" />;
        case 'parent':
            return <Heart size={size} className="text-rose-500 fill-rose-500 dark:text-rose-400 dark:fill-rose-400" />;
        case 'enfant':
        case 'eleve':
        case 'élève':
            return <BookOpen size={size} className="text-emerald-500 dark:text-emerald-400" />;
        default:
            return <User size={size} className="text-base-content/40" />;
    }
};

const BaseMessagerie = ({ role, title, subtitle, icon: Icon, inputPlaceholder, emptyStateText }) => {
    const [rooms, setRooms] = useState({ chats_groupe: [], chats_prives: [] });
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState({});

    // ÉTATS POUR L'ÉDITION
    const [editingMessage, setEditingMessage] = useState(null);

    const currentUserId = useRef(getConnectedUserId());
    const chatWs = useRef(null);
    const notifWs = useRef(null);
    const messagesContainerRef = useRef(null);
    const selectedRoomRef = useRef(selectedRoom);

    useEffect(() => {
        selectedRoomRef.current = selectedRoom;
    }, [selectedRoom]);

    const brandColors = useMemo(() => ({
        primaryBg: 'bg-[#2A26D9]',
        primaryText: 'text-[#2A26D9] dark:text-[#4642ff]',
        focusBorder: 'focus:border-[#2A26D9] dark:focus:border-[#4642ff]',
        bubbleMe: 'bg-[#2A26D9] text-white rounded-tr-none shadow-md',
        bubbleOther: 'bg-base-100 text-base-content rounded-tl-none border border-base-200 shadow-sm'
    }), []);

    const formatSenderLabel = useCallback((msg) => {
        if (String(msg.expediteur) === String(currentUserId.current)) return "Moi";
        const senderName = msg.expediteur_nom || "Utilisateur";
        const senderRole = msg.expediteur_role?.toLowerCase() || "";

        if (role === 'enfant') {
            if (senderRole === 'enfant' || senderRole === 'eleve') return `Camarade ${senderName}`;
            if (senderRole === 'enseignant') return `Prof. ${senderName}`;
        }
        if (role === 'enseignant') {
            if (senderRole === 'enfant' || senderRole === 'eleve') return `Élève ${senderName}`;
            if (senderRole === 'parent') return `Parent ${senderName}`;
        }
        if (role === 'parent') {
            if (senderRole === 'enseignant') return `Prof. ${senderName}`;
            if (senderRole === 'enfant' || senderRole === 'eleve') return `Enfant ${senderName}`;
        }
        return senderName;
    }, [role]);

    // Chargement initial des contacts
    useEffect(() => {
        let isMounted = true;
        const fetchRooms = async () => {
            try {
                const res = await api.get('/communication/contacts/');
                if (isMounted) setRooms(res.data);
            } catch (err) {
                console.error("Erreur contacts:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchRooms();
        return () => { isMounted = false; };
    }, []);

    // WebSocket Notifications
    useEffect(() => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) return;

        const notifUrl = `ws://localhost:8000/ws/notify/?token=${token}`;
        notifWs.current = new WebSocket(notifUrl);

        notifWs.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type_notif === 'MESSAGE_RECU') {
                const key = `${data.room_type}-${data.room_id}`;
                const currentRoom = selectedRoomRef.current;

                if (currentRoom?.id !== data.room_id || currentRoom?.type !== data.room_type) {
                    setNotifications(prev => ({ ...prev, [key]: true }));
                }
            }
        };

        return () => {
            if (notifWs.current) notifWs.current.close();
        };
    }, []);

    // Gestion du salon de chat actif & Écouteurs WebSocket augmentés
    useEffect(() => {
        if (!selectedRoom) return;

        setEditingMessage(null);
        setNewMessage("");

        const roomKey = `${selectedRoom.type}-${selectedRoom.id}`;
        setNotifications(prev => ({ ...prev, [roomKey]: false }));

        api.get(`/communication/messages/${selectedRoom.type}/${selectedRoom.id}/`)
            .then(res => setMessages(res.data))
            .catch(err => console.error("Erreur historique:", err));

        const token = localStorage.getItem(ACCESS_TOKEN);
        const chatUrl = `ws://localhost:8000/ws/chat/${selectedRoom.type}/${selectedRoom.id}/?token=${token}`;

        chatWs.current = new WebSocket(chatUrl);
        chatWs.current.onmessage = (event) => {
            const data = JSON.parse(event.data);

            // 1. RECEPTION D'UN NOUVEAU MESSAGE
            if (data.action === 'message_new') {
                setMessages(prev => [
                    ...prev,
                    {
                        id: data.id,
                        expediteur: data.expediteur,
                        expediteur_nom: data.expediteur_nom,
                        contenu: data.message,
                        date_envoi: data.date_envoi,
                        est_modifie: data.est_modifie
                    }
                ]);
            }
            // 2. RECEPTION D'UNE MODIFICATION EN TEMPS RÉEL
            else if (data.action === 'message_update') {
                setMessages(prev => prev.map(m =>
                    m.id === data.id ? { ...m, contenu: data.message, est_modifie: true } : m
                ));
            }
            // 3. RECEPTION D'UNE SUPPRESSION EN TEMPS RÉEL
            else if (data.action === 'message_delete') {
                setMessages(prev => prev.filter(m => m.id !== data.id));
            }
        };

        return () => {
            if (chatWs.current) chatWs.current.close();
        };
    }, [selectedRoom]);

    // Défilement automatique interne
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // ACTION : ENVOYER OU APPLIQUER LA MODIFICATION
    const handleSend = useCallback(async () => {
        const text = newMessage.trim();
        if (!text) return;

        if (editingMessage) {
            // Mode Édition -> Route HTTP PATCH (views.py s'occupe du push WS)
            try {
                await api.patch(`/communication/messages/${editingMessage.id}/`, { contenu: text });
                setEditingMessage(null);
                setNewMessage("");
            } catch (err) {
                console.error("Erreur modification message:", err);
            }
        } else {
            // Mode Normal -> Envoi WebSocket classique
            if (chatWs.current && chatWs.current.readyState === WebSocket.OPEN) {
                chatWs.current.send(JSON.stringify({ 'message': text }));
                setNewMessage("");
            }
        }
    }, [newMessage, editingMessage]);

    // ACTION : ENCLENCHER LE MODE ÉDITION
    const startEditing = (msg) => {
        setEditingMessage(msg);
        setNewMessage(msg.contenu);
    };

    // ACTION : SUPPRIMER UN MESSAGE
    const handleDelete = async (msgId) => {
        if (!window.confirm("Supprimer ce message définitivement ?")) return;
        try {
            await api.delete(`/communication/messages/${msgId}/`);
            if (editingMessage?.id === msgId) {
                setEditingMessage(null);
                setNewMessage("");
            }
        } catch (err) {
            console.error("Erreur suppression message:", err);
        }
    };

    return (
        <div className="flex h-full min-h-[calc(100vh-140px)] bg-base-200/50 dark:bg-base-200 rounded-2xl border border-base-300/60 shadow-md overflow-hidden font-sans antialiased transition-colors duration-300">

            {/* Sidebar Gauche */}
            <div className={`w-full md:w-96 border-r border-base-300 flex flex-col bg-base-100 ${selectedRoom ? 'hidden md:flex' : 'flex'}`}>
                {/* Header Sidebar */}
                <div className="p-5 flex items-center gap-3 border-b border-base-200 bg-base-200/40">
                    <div className={`p-2.5 rounded-xl bg-base-100 shadow-sm border border-base-200 ${brandColors.primaryText}`}>
                        <Icon size={22} />
                    </div>
                    <div>
                        <h2 className="font-bold text-base-content text-base tracking-tight">{title}</h2>
                        <p className="text-xs text-base-content/60 font-medium">{subtitle}</p>
                    </div>
                </div>

                {/* Liste Salons */}
                <div className="flex-grow overflow-y-auto p-3 space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center pt-20 gap-2 opacity-70">
                            <Loader2 className="animate-spin text-base-content/40" size={24} />
                            <span className="text-xs font-semibold text-base-content/60">Synchronisation...</span>
                        </div>
                    ) : (
                        <>
                            {rooms.chats_groupe?.length > 0 && (
                                <div className="space-y-1">
                                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-base-content/40 px-2 mb-2 flex items-center gap-1.5">
                                        <Users size={12} /> {role === 'parent' ? 'Canaux Familiaux' : 'Salons Collectifs'}
                                    </h3>
                                    {rooms.chats_groupe.map((g) => {
                                        let roomId = g.type === 'classe' ? g.enseignant_id : g.parent_id;
                                        if (role === 'enseignant') roomId = g.enseignant_id;
                                        if (role === 'parent') roomId = g.parent_id;

                                        const roomType = role === 'enfant' ? g.type : (role === 'enseignant' ? 'classe' : 'famille');
                                        const isSelected = selectedRoom?.id === roomId && selectedRoom?.type === roomType;
                                        const roomKey = `${roomType}-${roomId}`;

                                        return (
                                            <div
                                                key={roomKey}
                                                onClick={() => setSelectedRoom({ id: roomId, type: roomType, titre: g.titre, subtitle: g.type === 'classe' ? 'Espace Classe' : 'Foyer Familial' })}
                                                className={`p-3.5 rounded-xl cursor-pointer transition-all flex justify-between items-center ${isSelected ? 'bg-base-200 border border-base-300 font-semibold' : 'hover:bg-base-200/50'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-base-200 flex items-center justify-center text-base-content/70">
                                                        {g.type === 'classe' ? <GraduationCap size={18} /> : <Home size={18} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-base-content font-semibold">{g.titre}</p>
                                                        <p className="text-[11px] text-base-content/50 font-medium">Groupe</p>
                                                    </div>
                                                </div>
                                                {notifications[roomKey] && !isSelected && (
                                                    <span className="h-2.5 w-2.5 rounded-full bg-[#2A26D9]" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {rooms.chats_prives?.length > 0 && (
                                <div className="space-y-1 pt-2">
                                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-base-content/40 px-2 mb-2 flex items-center gap-1.5">
                                        <User size={12} /> {role === 'enseignant' ? "Parents d'élèves" : role === 'parent' ? "Corps Enseignant" : "Discussions Privées"}
                                    </h3>
                                    {rooms.chats_prives.map((p) => {
                                        const target = role === 'enfant' ? p : p.contact;
                                        const contexte = role !== 'enfant' ? p.contexte : null;
                                        const isSelected = selectedRoom?.id === target.id && selectedRoom?.type === 'private';
                                        const roomKey = `private-${target.id}`;

                                        let displaySubtitle = contexte || target.role;

                                        return (
                                            <div
                                                key={roomKey}
                                                onClick={() => setSelectedRoom({ id: target.id, type: 'private', titre: target.nom_complet || target.username, subtitle: displaySubtitle })}
                                                className={`p-3.5 rounded-xl cursor-pointer transition-all flex justify-between items-center ${isSelected ? 'bg-base-200 border border-base-300' : 'hover:bg-base-200/50'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-base-200 border border-base-300 flex items-center justify-center">
                                                        {getRoleIcon(target.role, 18)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-base-content font-semibold">{target.nom_complet || target.username}</p>
                                                        <p className="text-[11px] text-base-content/50 font-medium truncate max-w-[180px]">
                                                            {displaySubtitle}
                                                        </p>
                                                    </div>
                                                </div>
                                                {notifications[roomKey] && !isSelected && (
                                                    <span className="h-2.5 w-2.5 rounded-full bg-[#2A26D9]" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Zone de Conversation Active */}
            <div className={`flex-grow flex flex-col bg-base-100 ${!selectedRoom ? 'hidden md:flex' : 'flex'}`}>
                {selectedRoom ? (
                    <>
                        {/* Header de la discussion */}
                        <div className="p-4 border-b border-base-200 flex items-center gap-4 px-6 bg-base-100 shadow-sm z-10">
                            <button onClick={() => setSelectedRoom(null)} className="md:hidden p-2 hover:bg-base-200 rounded-full transition-colors text-base-content"><ArrowLeft size={20} /></button>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-base-200 border border-base-300 flex items-center justify-center font-bold">
                                    {selectedRoom.type === 'private' ? getRoleIcon(selectedRoom.subtitle, 18) : <Users size={18} className="text-[#2A26D9]" />}
                                </div>
                                <div>
                                    <div className="font-bold text-base-content text-base tracking-tight">{selectedRoom.titre}</div>
                                    <div className="text-[11px] text-base-content/50 font-medium">{selectedRoom.subtitle}</div>
                                </div>
                            </div>
                        </div>

                        {/* Zone d'affichage des bulles */}
                        <div ref={messagesContainerRef} className="flex-grow overflow-y-auto p-6 px-8 space-y-4 bg-base-200/50">
                            {messages.map((m) => {
                                const isMe = String(m.expediteur) === String(currentUserId.current);
                                const senderLabel = formatSenderLabel(m);

                                return (
                                    <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-start gap-2.5 w-full group`}>

                                        {!isMe && (
                                            <div className="w-7 h-7 mt-5 rounded-lg bg-base-100 border border-base-200 flex items-center justify-center shadow-sm shrink-0">
                                                {getRoleIcon(m.expediteur_role, 14)}
                                            </div>
                                        )}

                                        {/* Actions rapides au survol (Seulement pour mes messages) */}
                                        {isMe && (
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity self-center mr-1">
                                                <button onClick={() => startEditing(m)} className="p-1.5 hover:bg-base-300 rounded-lg text-base-content/60 hover:text-blue-600 transition-colors" title="Modifier">
                                                    <Pencil size={13} />
                                                </button>
                                                <button onClick={() => handleDelete(m.id)} className="p-1.5 hover:bg-base-300 rounded-lg text-base-content/60 hover:text-rose-600 transition-colors" title="Supprimer">
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        )}

                                        <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'} space-y-0.5`}>
                                            <span className="text-[10px] font-bold text-base-content/40 px-1 uppercase tracking-wide">
                                                {senderLabel}
                                            </span>

                                            <div className={`px-4 py-2.5 rounded-2xl text-[13.5px] font-medium leading-relaxed relative ${isMe ? brandColors.bubbleMe : brandColors.bubbleOther}`}>
                                                <p className="break-words whitespace-pre-wrap">{m.contenu}</p>

                                                <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-65 text-right select-none">
                                                    {m.est_modifie && <span className="italic mr-1 text-[8.5px] opacity-75">(modifié)</span>}
                                                    <span>
                                                        {new Date(m.date_envoi).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {isMe && <CheckCheck size={12} className="text-white" />}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Zone de Saisie de Message (Gère édition et envoi) */}
                        <div className="flex flex-col border-t border-base-200 bg-base-100 p-4 px-6 gap-2">
                            {editingMessage && (
                                <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-xs px-3 py-1.5 rounded-lg font-medium">
                                    <span className="truncate">Mode édition — Modifiant : "{editingMessage.contenu}"</span>
                                    <button onClick={() => { setEditingMessage(null); setNewMessage(""); }} className="text-blue-500 hover:text-blue-700">
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                            <div className="flex gap-3 items-center">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    className={`input input-bordered flex-grow h-11 rounded-xl text-sm font-medium bg-base-200 border-base-300 text-base-content transition-all ${brandColors.focusBorder}`}
                                    placeholder={editingMessage ? "Modifier le message..." : inputPlaceholder}
                                />
                                <button
                                    onClick={handleSend}
                                    className={`btn h-11 w-11 min-h-0 p-0 rounded-xl shadow-md border-none text-white transition-all transform active:scale-95 ${editingMessage ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#2A26D9] hover:bg-[#1f1ba6]'}`}
                                >
                                    {editingMessage ? <Pencil size={15} /> : <Send size={15} />}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-base-content/30 bg-base-200/20 select-none">
                        <div className="p-6 rounded-3xl bg-base-100 border border-base-200 shadow-sm text-[#2A26D9] mb-4">
                            <MessageSquare size={44} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-base font-bold text-base-content tracking-tight">Messagerie Intégrée</h3>
                        <p className="text-xs text-base-content/50 font-medium mt-1 max-w-xs text-center">{emptyStateText}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BaseMessagerie;