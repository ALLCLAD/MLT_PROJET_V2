import React from 'react';
import { BookOpen } from 'lucide-react';
import BaseMessagerie from '../../composants/BaseMessagerie.jsx';

const MessagerieEnfant = () => (
    <BaseMessagerie
        role="enfant"
        title="Espace Discussion"
        subtitle="Échanges scolaires et familiaux"
        icon={BookOpen}
        inputPlaceholder="Écris ton message à la classe ou à tes proches..."
        emptyStateText="Sélectionne un salon pour démarrer tes interactions"
    />
);

export default MessagerieEnfant;