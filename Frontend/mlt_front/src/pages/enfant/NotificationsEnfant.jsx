import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NotificationsEnfant = () => {
    const navigate = useNavigate();
    useEffect(() => {
        navigate('/enfant/dashboard', { replace: true });
    }, [navigate]);
    return null;
};

export default NotificationsEnfant;