
import react from "react"
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom"

import Login from "./pages/authentification/Login"
import Inscription from "./pages/authentification/Inscription"
import Accueil from "./pages/Accueil"
import NotFound from "./pages/NotFound";
import ProtectionRoutes from "./composants/ProtectionRoutes"

// Pages pour le parent
import DashPar from './pages/parent/DashPar';
import LayoutParent from "./composants/Layout/LayoutParent";
import EnfantsPage from './pages/parent/EnfantsPage';
import AjouterEnfant from './pages/parent/AjouterEnfant';
import MonProfil from './pages/parent/MonProfil';
import EnfantStatsDetail from './pages/parent/EnfantStatsDetail';

// Pages pour l'enfant
import LayoutEnfant from "./composants/Layout/LayoutEnfant";
import ExercicesEnf from "./pages/enfant/ExercicesEnf";
import ProfileEnfant from "./pages/enfant/ProfileEnfant.jsx";
import DashEnf from './pages/enfant/DashEnf';
import LeconsEnfant from './pages/enfant/LeconsEnfant';
import DetailLeconEnfant from './pages/enfant/DetailLeconEnfant';
import FaireExercice from './pages/enfant/FaireExercice';


// Pages pour l'enseigant
import LayoutEnseignant from "./composants/Layout/LayoutEnseignant";
import DashEns from './pages/enseignant/DashEns';
import MesEleves from './pages/enseignant/MesEleves';
import AjouterEleve from './pages/enseignant/AjouterEleve';
import MesLecons from './pages/enseignant/MesLecons';
import DetailLecon from './pages/enseignant/DetailLecons';
import MesExercices from './pages/enseignant/MesExercices';
import MonProfilEns from './pages/enseignant/MonProfilEns';
import CreerLecon from './pages/enseignant/CreerLecon';
import Calendrier from './pages/enseignant/Calendrier';
import AjouterExercice from './pages/enseignant/AjouterExercice';
import ScoresEleve from './pages/enseignant/ScoresEleve';

// Pages de Communication
import MessagerieEnfant from "./pages/enfant/MessagerieEnfant";
import MessagerieParent from "./pages/parent/MessagerieParent";
import MessagerieEnseignant from "./pages/enseignant/MessagerieEnseignant";
import NotificationsEnfant from "./pages/enfant/NotificationsEnfant";
import NotificationsParent from "./pages/parent/NotificationsParent";
import NotificationsEnseignant from "./pages/enseignant/NotificationsEnseignant";

import { CommunicationProvider } from "./contexte/CommunicationContext.jsx";

function App() {
  return (
    <CommunicationProvider>
        <BrowserRouter>
        <Routes>

          {/* Route vers la page d'accueil */}
          <Route path="/" element={<Accueil />}/>

          {/* Route vers la page d'inscription */}
          <Route path="/inscription" element={<Inscription />}/>

          {/* Route vers la page de login */}
          <Route path="/login" element={<Login />} />

          {/* 
              GROUPE PARENT
          */}
          <Route
              path="/parent"
              element={
                <ProtectionRoutes roleAttendu="PARENT">
                  <LayoutParent />
                </ProtectionRoutes>
              }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashPar />} />
            <Route path="enfants" element={<EnfantsPage />} />
            <Route path="enfants/:enfantId" element={<EnfantStatsDetail />} />
            <Route path="ajouter-enfant" element={<AjouterEnfant />} />
            <Route path="profil" element={<MonProfil />} />
            <Route path="messagerie" element={<MessagerieParent />} />
            <Route path="notifications" element={<NotificationsParent />} />
          </Route>

          {/* 
              GROUPE ENSEIGNANT
          */}
          <Route
              path="/enseignant"
              element={
                <ProtectionRoutes roleAttendu="ENSEIGNANT">
                  <LayoutEnseignant />
                </ProtectionRoutes>
              }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashEns />} />
            <Route path="eleves" element={<MesEleves />} />
            <Route path="ajouter-eleve" element={<AjouterEleve />} />
            <Route path="lecons" element={<MesLecons />} />
            <Route path="creer-lecon" element={<CreerLecon />} />
            <Route path="lecons/:id" element={<DetailLecon />} />
            <Route path="lecons/:id/exercices" element={<MesExercices />} />
            <Route path="lecons/:id/ajouter-exercice" element={<AjouterExercice />} />
            <Route path="calendrier" element={<Calendrier />} />
            <Route path="profil" element={<MonProfilEns />} />
            <Route path="eleves/:id/scores" element={<ScoresEleve />} />
            <Route path="messagerie" element={<MessagerieEnseignant />} />
            <Route path="notifications" element={<NotificationsEnseignant />} />
          </Route>

          {/* 
              GROUPE ENFANT
          */}
          <Route
              path="/enfant"
              element={
                <ProtectionRoutes roleAttendu="ENFANT">
                  <LayoutEnfant />
                </ProtectionRoutes>
              }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashEnf />} />
            <Route path="exercices" element={<ExercicesEnf />} />
            <Route path="profil" element={<ProfileEnfant />} />
            <Route path="lecons" element={<LeconsEnfant />} />
            <Route path="lecons/:id" element={<DetailLeconEnfant />} />
            <Route path="lecons/:id/exercices" element={<FaireExercice />} />
            <Route path="messagerie" element={<MessagerieEnfant />} />
            <Route path="notifications" element={<NotificationsEnfant />} />

          </Route>

          {/* Route 404 */}
          <Route path="*" element={<NotFound />}/>

        </Routes>
    </BrowserRouter>
    </CommunicationProvider>
  )
}

export default App

