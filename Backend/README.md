# ⚙️ MLT Backend — API & Services Django

![Django](https://img.shields.io/badge/Django-5.2-092E20?style=for-the-badge&logo=django)
![DRF](https://img.shields.io/badge/Django%20REST%20Framework-3.16-red?style=for-the-badge)
![WebSockets](https://img.shields.io/badge/WebSockets-Channels%20%2F%20Daphne-blue?style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql)

---

## 📌 Aperçu du Backend

Le backend **MLT** est construit avec **Django 5.2** et **Django REST Framework (DRF)**. Il fournit des API REST sécurisées par JWT et gère la communication en temps réel grâce à **Django Channels** et **Daphne** via **WebSockets**.

---

## 🧱 Architecture des Applications Django

```text
Backend/mlt/
├── Uauth/         # Authentification, gestion des utilisateurs (Enfant, Enseignant, Parent) & profil
├── communication/ # Messagerie temps réel et notifications via WebSockets (Daphne/Channels)
├── enseignant/    # Espaces enseignants : gestion des cours, devoirs, ressources pédagogiques
├── mlt_quiz/      # Moteur de Quiz : création, soumission, génération assistée par IA & parsing document (PDF/Docx)
├── tts/           # Module de synthèse vocale (Text-To-Speech)
└── mlt/           # Paramètres globaux (settings.py, urls.py, asgi.py, wsgi.py)
```

### 🔍 DÉTAILS DES MODULES :

1. 🔐 **`Uauth` (User Authentication & Management)**
   - Inscription / Connexion avec jetons **JWT (SimpleJWT)**.
   - Gestion des profils utilisateurs par rôles (Élève/Enfant, Enseignant, Parent).
   - Sécurisation et intercepteurs de permissions.

2. 💬 **`communication` (Messagerie & Temps Réel)**
   - Serveur WebSocket configuré via `ASGI` et `Daphne`.
   - Échange de messages instantanés entre enseignants, élèves et parents.
   - Notifications push en temps réel.

3. 📚 **`enseignant` (Gestion Pédagogique)**
   - Publication de supports de cours.
   - Assignation de devoirs et travaux aux classes ou élèves.
   - Suivi des soumissions et notations.

4. 🧪 **`mlt_quiz` (Moteur de Quiz & IA)**
   - Création et gestion de QCM / Quiz interactifs.
   - Extraction de contenu à partir de documents (`pypdf`, `python-docx`).
   - Génération intelligente de questions via **Google GenAI / Gemini API**.
   - Exportation et compte-rendu PDF (`reportlab`).

5. 🎙️ **`tts` (Text-To-Speech)**
   - Service de synthèse vocale basé sur **Piper TTS**.
   - Permet aux élèves la lecture audio des cours et des contenus pédagogiques.

---

## 🛠️ Configuration & Installation

### 1️⃣ Prérequis
- Python **3.10+**
- PostgreSQL instancié et configuré
- Virtualenv (`python -m venv venv`)

### 2️⃣ Installation des dépendances
```bash
cd Backend/mlt
python -m venv venv
# Activer l'environnement virtuel :
# Windows : .\venv\Scripts\activate
# Linux/macOS : source venv/bin/activate

pip install -r requirements.txt
```

### 3️⃣ Fichier d'environnement `.env`
Créez le fichier `.env` dans `Backend/mlt/` :
```env
DEBUG=True
SECRET_KEY=django-insecure-votre-cle-secrete
DB_NAME=mlt_db
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe
DB_HOST=localhost
DB_PORT=5432
```

### 4️⃣ Migration de la Base de Données
```bash
python manage.py makemigrations
python manage.py migrate
```

### 5️⃣ Lancement du Serveur de Développement
Pour lancer le serveur avec support **WebSockets (Daphne)** :
```bash
python manage.py runserver
```
Ou directement avec daphne :
```bash
daphne -b 0.0.0.0 -p 8000 mlt.asgi:application
```

---

## 📡 Principaux Endpoints API (Résumé)

| Module | Méthode | Route | Description |
|---|---|---|---|
| **Uauth** | `POST` | `/api/token/` | Obtention des tokens JWT (Access & Refresh) |
| **Uauth** | `POST` | `/api/token/refresh/` | Rafraîchissement du token JWT |
| **Enseignant** | `GET/POST` | `/api/enseignant/cours/` | Consultation et création de cours |
| **Quiz** | `GET/POST` | `/api/quiz/` | Gestion et génération de quiz |
| **TTS** | `POST` | `/api/tts/generate/` | Synthèse vocale à partir de texte |
| **WebSockets**| `WS` | `/ws/chat/` | Connexion temps réel pour la messagerie |
