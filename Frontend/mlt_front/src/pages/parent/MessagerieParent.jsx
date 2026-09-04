import React from 'react';
import { Heart } from 'lucide-react';
import BaseMessagerie from '../../composants/BaseMessagerie.jsx';

const MessagerieParent = () => (
    <BaseMessagerie
        role="parent"
        title="Liaison Famille"
        subtitle="Supervision et messageries privées"
        icon={Heart}
        inputPlaceholder="Écris ton message ici..."
        emptyStateText="Sélectionnez un foyer ou un enseignant pour échanger en toute sécurité"
    />
);

export default MessagerieParent;