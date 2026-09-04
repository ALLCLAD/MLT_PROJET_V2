import React from 'react';
import { GraduationCap } from 'lucide-react';
import BaseMessagerie from '../../composants/BaseMessagerie.jsx';

const MessagerieEnseignant = () => (
    <BaseMessagerie
        role="enseignant"
        title="Suivi Pédagogique"
        subtitle="Gestion globale de la classe"
        icon={GraduationCap}
        inputPlaceholder="Rédiger une consigne ou répondre à un parent..."
        emptyStateText="Sélectionnez une entité ou le salon général de classe pour échanger"
    />
);

export default MessagerieEnseignant;