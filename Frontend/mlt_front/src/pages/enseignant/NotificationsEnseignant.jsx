import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NotificationsEnseignant = () => {
    const navigate = useNavigate();
    useEffect(() => {
        navigate('/enseignant/dashboard', { replace: true });
    }, [navigate]);
    return null;
};

export default NotificationsEnseignant;