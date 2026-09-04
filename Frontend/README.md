# 🎨 MLT Frontend — Application Web React / Vite

![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind%20CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![DaisyUI](https://img.shields.io/badge/DaisyUI-5.5-5A0E2D?style=for-the-badge)

---

## 📌 Aperçu du Frontend

L'application Frontend **MLT** est développée avec **React 19** et **Vite**, stylisée à l'aide de **Tailwind CSS v4** et **DaisyUI**. Elle intègre une navigation fluide via **React Router v7** et offre des interfaces distinctes et adaptées pour 3 profils d'utilisateurs : **Enfant**, **Enseignant** et **Parent**.

---

## 🧱 Architecture des Dossiers

```text
Frontend/mlt_front/
├── src/
│   ├── apiDjango/        # Configuration d'Axios & intercepteurs HTTP
│   ├── assets/           # Images, icônes et ressources statiques
│   ├── composants/       # Composants réutilisables & spécifiques :
│   │   ├── BaseMessagerie.jsx  # Interface de messagerie temps réel & assistant IA
│   │   ├── LecteurVocal.jsx    # Lecteur audio interactif pour la synthèse vocale (TTS)
│   │   ├── ProtectionRoutes.jsx# Garde de navigation selon les rôles JWT
│   │   ├── Layout/             # Modèles de mise en page (Header, Sidebar, Footer)
│   │   ├── Shared/             # Composants partagés inter-espaces
│   │   ├── UI/                 # Éléments graphiques communs
│   │   ├── UIenfant/           # Composants UI adaptés aux enfants (ludiques)
│   │   ├── UIenseignant/       # Composants UI pour enseignants (tableaux de bord, devoirs)
│   │   └── UIparent/           # Composants UI pour parents (suivi des progrès)
│   ├── contexte/         # Contextes React (AuthContext, etc.)
│   ├── hooks/            # Hooks personnalisés
│   ├── pages/            # Vues et pages principales :
│   │   ├── Accueil.jsx   # Page de garde principale
│   │   ├── authentification/ # Vues d'inscription et de connexion
│   │   ├── enfant/       # Espace d'apprentissage élève
│   │   ├── enseignant/   # Espace enseignant
│   │   └── parent/       # Espace parent
│   ├── App.jsx           # Définition des routes principales
│   └── main.jsx          # Point d'entrée React
├── package.json
└── vite.config.js
```

---

## 🔑 Fonctionnalités Clés

- 👶 **Espace Enfant** : Interface ludique permettant de consulter ses cours, répondre à des quiz interactifs et utiliser la synthèse vocale pour s'entraîner à la lecture.
- 👨‍🏫 **Espace Enseignant** : Création de cours, édition et génération automatique de quiz assistés par l'IA, gestion des devoirs.
- 👨‍👩‍👧 **Espace Parent** : Suivi des progrès scolaires, rapports graphiques (via `Recharts`) et consultation des activités.
- 🎧 **Lecteur Vocal Interactif (`LecteurVocal.jsx`)** : Intégration du module TTS pour l'écoute audio textuelle.
- 💬 **Messagerie & Assistant IA (`BaseMessagerie.jsx`)** : Tchat temps réel et assistant virtuel pédagogique alimenté par l'API Groq / Gemini.
- 🛡️ **Sécurité & Protection des Routes (`ProtectionRoutes.jsx`)** : Contrôle des accès selon le rôle présent dans le jeton JWT.

---

## 🛠️ Configuration & Installation

### 1️⃣ Prérequis
- Node.js **v18+**
- npm ou yarn

### 2️⃣ Installation des dépendances
```bash
cd Frontend/mlt_front
npm install
```

### 3️⃣ Fichier d'environnement `.env.local`
Créez le fichier `.env.local` dans `Frontend/mlt_front/` :
```env
VITE_MON_URL_DJANGO="http://localhost:8000"
VITE_GROQ_API_KEY="votre_cle_api_groq"
```

### 4️⃣ Commandes disponibles

- **Lancer le serveur de développement :**
  ```bash
  npm run dev
  ```
- **Linter le code :**
  ```bash
  npm run lint
  ```
- **Builder le projet pour la production :**
  ```bash
  npm run build
  ```
- **Prévisualiser le build de production :**
  ```bash
  npm run preview
  ```
