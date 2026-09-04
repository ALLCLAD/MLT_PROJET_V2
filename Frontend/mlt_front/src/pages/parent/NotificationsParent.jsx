import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NotificationsParent = () => {
    const navigate = useNavigate();
    useEffect(() => {
        navigate('/parent/dashboard', { replace: true });
    }, [navigate]);
    return null;
};

export default NotificationsParent;