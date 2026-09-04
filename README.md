# 🎓 MLT — Monorepo (Plateforme d'Apprentissage & Suivi Éducatif)

![Django](https://img.shields.io/badge/Backend-Django%205.2-092E20?style=for-the-badge&logo=django)
![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Build-Vite-646CFF?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Style-Tailwind%20v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql)

---

## 📌 Présentation du Projet MLT

**MLT** est une plateforme éducative globale et interactive conçue pour connecter les **Élèves/Enfants**, les **Enseignants** et les **Parents** dans un écosystème d'apprentissage dynamique assisté par l'Intelligence Artificielle.

La plateforme propose des fonctionnalités avancées telles que :
- 🎧 **Synthèse Vocale (Text-To-Speech / Piper TTS)** pour faciliter la lecture et l'accessibilité.
- 📝 **Génération et gestion de Quiz interactifs** guidés par l'IA.
- 💬 **Messagerie en temps réel (WebSockets)** & intégration de l'IA (Groq / Gemini) pour le soutien pédagogique.
- 📊 **Tableaux de bord dédiés** pour chaque profil (Enfant, Enseignant, Parent).

Ce dépôt est un **monorepo** regroupant à la fois le code **Backend (Django REST Framework & Channels)** et **Frontend (React 19 & Vite)**.

---

## 🏗️ Architecture du Monorepo

```text
MLT-PROJECT/
├── Backend/              # Service Web API Django & WebSockets
│   └── mlt/
│       ├── Uauth/        # Authentification JWT & Gestion des utilisateurs/rôles
│       ├── communication/# Messagerie instantanée & WebSockets (Daphne)
│       ├── enseignant/   # Gestion des cours, classes & devoirs
│       ├── mlt_quiz/     # Système de quiz interactifs & génération IA
│       ├── tts/          # Service de synthèse vocale (Piper TTS)
│       ├── mlt/          # Configuration globale Django (settings, asgi, urls)
│       ├── manage.py
│       └── requirements.txt
│
└── Frontend/             # Application Web React / Vite
    └── mlt_front/
        ├── src/
        │   ├── apiDjango/# Client HTTP Axios & intercepteurs API
        │   ├── composants/# Composants UI réutilisables & spécifiques aux rôles
        │   ├── contexte/ # Gestion centralisée des états (Auth, etc.)
        │   └── pages/    # Vues (Accueil, Auth, Enfant, Enseignant, Parent)
        ├── package.json
        └── vite.config.js
```

---

## 🚀 Guide de Configuration et Lancement Rapide

### 📋 Prérequis matériels & logiciels
Assurez-vous d'avoir installé sur votre machine :
- **Python** (v3.10 ou supérieur)
- **Node.js** (v18 ou supérieur) et **npm**
- **PostgreSQL** (v14 ou supérieur)
- **Git**

---

### 1️⃣ Cloner le Dépôt
```bash
git clone <URL_DE_VOTRE_REPOSITORY>
cd MLT-PROJECT
```

---

### 2️⃣ Configuration du Backend (Django)

1. **Accéder au dossier backend :**
   ```bash
   cd Backend/mlt
   ```

2. **Créer et activer un environnement virtuel Python :**
   - **Sur Windows (PowerShell/CMD) :**
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **Sur Linux/macOS :**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Installer les dépendances :**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configurer les variables d'environnement (`.env`) :**
   Créez un fichier `.env` dans le dossier `Backend/mlt/` à partir de l'exemple `.env.exemple` :
   ```env
   DEBUG=True
   SECRET_KEY=votre_secret_key_django
   DB_NAME=mlt_db
   DB_USER=postgres
   DB_PASSWORD=votre_mot_de_passe
   DB_HOST=localhost
   DB_PORT=5432
   ```

5. **Créer la base de données PostgreSQL :**
   Assurez-vous que PostgreSQL est en cours d'exécution et créez la base de données nommée `mlt_db`.

6. **Appliquer les migrations et lancer le serveur :**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   python manage.py runserver
   ```
   *Le serveur Backend sera accessible sur `http://localhost:8000`.*

---

### 3️⃣ Configuration du Frontend (React / Vite)

1. **Ouvrir un nouveau terminal et accéder au dossier frontend :**
   ```bash
   cd Frontend/mlt_front
   ```

2. **Installer les packages Node :**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement (`.env.local`) :**
   Créez un fichier `.env.local` dans `Frontend/mlt_front/` :
   ```env
   VITE_MON_URL_DJANGO="http://localhost:8000"
   VITE_GROQ_API_KEY="votre_cle_api_groq"
   ```

4. **Lancer le serveur de développement Frontend :**
   ```bash
   npm run dev
   ```
   *L'application Frontend sera accessible sur `http://localhost:5173` (ou le port indiqué par Vite).*

---

## 🛠️ Stack Technique Globale

| Partie | Technologies principales |
|---|---|
| **Backend** | Python 3.10+, Django 5.2, Django REST Framework, Django Channels / Daphne (WebSockets), PostgreSQL, SimpleJWT, Cloudinary, Google GenAI |
| **Frontend** | React 19, Vite, Tailwind CSS v4, DaisyUI, React Router v7, Axios, Recharts, Lucide Icons, Groq SDK |

---

## 📄 Documentation détaillée par module

- 📂 **[Documentation Backend](./Backend/README.md)** : Architecture des apps Django, modèles, API REST & WebSockets.
- 📂 **[Documentation Frontend](./Frontend/README.md)** : Structure des composants React, gestion des rôles & intégration API.
