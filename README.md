# Classification de Données

Application web full-stack de gestion et de classification automatique de documents par intelligence artificielle.

## Présentation

Cette application permet de téléverser des documents (PDF, DOCX, TXT), d'en extraire automatiquement les paragraphes, puis de les classifier dans des catégories définies par l'utilisateur via l'API OpenAI (GPT-4o-mini). Elle offre également une recherche avancée multi-critères sur l'ensemble du corpus documentaire.

## Architecture

```
Classification_de_donnees/
├── Classification_Data_Back/   # API REST Flask (Python)
├── Classification_Data_Front/  # Interface React (Vite)
└── docker-compose.yml          # Orchestration des services
```

### Stack technique

| Couche          | Technologie                                            |
|-----------------|--------------------------------------------------------|
| Backend         | Python 3.11, Flask 2.3, Flask-JWT-Extended, SQLAlchemy |
| Base de données | PostgreSQL 15                                          |
| IA              | OpenAI GPT-4o-mini                                     |
| Frontend        | React 18, Vite, Material UI, Tailwind CSS, Chart.js    |
| Déploiement     | Docker, Docker Compose, GitLab CI/CD                   |

## Fonctionnalités

### Gestion des documents
- Téléversement de fichiers (PDF, DOCX, TXT — max 16 Mo)
- Extraction automatique des paragraphes avec filtrage des titres et en-têtes
- Fusion des paragraphes courts et découpe des paragraphes trop longs (> 4 000 caractères)
- Visualisation des fichiers dans le navigateur
- CRUD complet (ajout, consultation, modification, suppression)

### Classification par IA
- Création de catégories avec label et description
- Classification automatique des paragraphes d'un document via GPT-4o-mini
- Attribution d'une catégorie à chaque paragraphe selon la description
- Statistiques par catégorie (nombre de paragraphes classifiés)

### Recherche avancée
- Recherche globale (titre, auteur, contenu)
- Filtres combinables : titre, auteur, contenu, catégorie, plage de dates

### Authentification
- Inscription et connexion avec hachage des mots de passe (Werkzeug)
- Authentification JWT (access token + refresh token)
- Déconnexion avec blacklist des tokens

## Modèle de données

```
User ──< Document ──< Paragraph >── Categorie
 └──────────────────────────────────────────┘
           (l'utilisateur crée aussi des catégories)
```

| Modèle    | Champs principaux                                          |
|-----------|------------------------------------------------------------|
| User      | nom, email, motdepasse (hashé), etablissement, status      |
| Document  | titre, auteur, date_ajout, file_path, user_id              |
| Paragraph | contenu, documentId, categorie_id (nullable)               |
| Categorie | label, description, user_id                                |

## API REST — Endpoints principaux

### Authentification
| Méthode | Route         | Description               | Auth |
|---------|---------------|---------------------------|------|
| POST    | /createUser/  | Créer un compte           | Non  |
| POST    | /login/       | Connexion (retourne JWT)  | Non  |
| POST    | /refresh/     | Renouveler l'access token | Oui  |
| POST    | /logout/      | Déconnexion               | Oui  |

### Documents
| Méthode | Route                           | Description                            | Auth |
|---------|---------------------------------|----------------------------------------|------|
| POST    | /addDocument/                   | Téléverser un document                 | Oui  |
| GET     | /listDocuments/                 | Lister tous les documents              | Oui  |
| GET     | /document/`<id>`                | Détail d'un document                   | Oui  |
| PUT     | /document/`<id>`                | Modifier un document                   | Oui  |
| DELETE  | /SupprimerDoc/`<id>`            | Supprimer un document                  | Oui  |
| GET     | /documents/uncategorized/       | Documents avec paragraphes non classifiés | Oui |
| POST    | /search_advanced/               | Recherche avancée multi-critères       | Oui  |
| GET     | /Document/search?query=         | Recherche par titre                    | Oui  |
| GET     | /documents/uploads/`<filename>` | Visualiser un fichier                  | Non  |

### Catégories
| Méthode | Route                             | Description                         | Auth |
|---------|-----------------------------------|-------------------------------------|------|
| POST    | /addCategorie/                    | Créer une catégorie                 | Oui  |
| GET     | /listCategories/                  | Lister les catégories               | Oui  |
| PUT     | /categorie/`<id>`                 | Modifier une catégorie              | Oui  |
| DELETE  | /SupprimerCategorie/`<id>`        | Supprimer une catégorie             | Oui  |
| POST    | /Classification/`<documentId>`   | Classifier les paragraphes d'un doc | Oui  |
| GET     | /Categorie/search?query=          | Rechercher une catégorie            | Oui  |
| GET     | /Categorie/statistique            | Statistiques par catégorie          | Oui  |

### Paragraphes
| Méthode | Route                                    | Description                  | Auth |
|---------|------------------------------------------|------------------------------|------|
| GET     | /Paragraphs/                             | Lister tous les paragraphes  | Non  |
| GET     | /paragraphs/by_category/`<categorie_id>` | Paragraphes par catégorie    | Non  |

## Installation et démarrage

### Prérequis
- [Docker](https://docs.docker.com/get-docker/) et Docker Compose installés
- Clé API OpenAI (pour la classification automatique)

### Démarrage rapide avec Docker

```bash
# Cloner le dépôt
git clone <url-du-depot>
cd Classification_de_donnees

# Créer le fichier d'environnement pour le backend
echo "OPENAI_API_KEY=sk-votre-cle-openai" > Classification_Data_Back/.env

# Lancer tous les services
docker-compose up -d
```

Les services sont accessibles sur :
- **Frontend** : http://localhost:3030
- **Backend API** : http://localhost:5005
- **PostgreSQL** : interne au réseau Docker (non exposé)

### Développement local

#### Backend (Flask)

```bash
cd Classification_Data_Back

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate       # Linux/Mac
# ou : venv\Scripts\activate   # Windows

pip install -r requirements.txt

# Configurer la base de données (modifier l'URI dans hello.py si besoin)
# Par défaut : postgresql://postgres:postgres@localhost:5432/postgres

# Appliquer les migrations
flask db upgrade

# Démarrer le serveur de développement
python hello.py
```

#### Frontend (React)

```bash
cd Classification_Data_Front

npm install
npm run dev
```

## Variables d'environnement

### Backend
| Variable         | Description                              | Valeur par défaut                                     |
|------------------|------------------------------------------|-------------------------------------------------------|
| `OPENAI_API_KEY` | Clé API OpenAI pour la classification    | *(obligatoire)*                                       |
| `DATABASE_URL`   | URI de connexion PostgreSQL              | `postgresql://postgres:postgres@db:5432/postgres`     |

> **Note de sécurité** : La `JWT_SECRET_KEY` est actuellement codée en dur dans [Classification_Data_Back/hello.py](Classification_Data_Back/hello.py). En production, la déplacer dans une variable d'environnement.

## Déploiement CI/CD

Le pipeline GitLab CI ([.gitlab-ci.yml](.gitlab-ci.yml)) déploie automatiquement sur push vers la branche `main` :

1. Copie des fichiers vers le serveur cible via `rsync` (SSH)
2. Rebuild et redémarrage des conteneurs avec `docker-compose`

### Variables GitLab CI requises
| Variable          | Description                 |
|-------------------|-----------------------------|
| `SSH_PRIVATE_KEY` | Clé privée SSH (ed25519)    |
| `IP_DU_SERVEUR`   | Adresse IP du serveur cible |

## Structure du frontend

```
src/
├── Pages/          # Vues principales (Document, Categorie, Classification, Recherche)
├── Component/      # Composants réutilisables (Navigation, TableDocument, CategorieTable...)
├── FormComponent/  # Formulaires (Login, Inscription, Classification)
├── Api/            # Couche d'appel API (DocumentApi, CategorieApi, UserApi...)
├── Axios/          # Configuration Axios avec intercepteurs JWT
├── Routes/         # Gestion des routes protégées (PrivateRoute)
├── Context/        # Contextes React (Notifications)
└── Utils/          # Utilitaires (validation de formulaires)
```

### Pages de l'application
| Route                       | Page           | Description                                  |
|-----------------------------|----------------|----------------------------------------------|
| `/`                         | Home           | Page d'accueil publique                      |
| `/login`                    | Login          | Connexion                                    |
| `/signup`                   | Signup         | Inscription                                  |
| `/Dashboard/document`       | Document       | Gestion des documents                        |
| `/Dashboard/categorie`      | Categorie      | Gestion des catégories et statistiques       |
| `/Dashboard/classification` | Classification | Lancement de la classification par IA        |
| `/Dashboard/Recherche`      | Recherche      | Recherche avancée multi-critères             |

## Formats de fichiers supportés

| Format | Extension | Méthode d'extraction                      |
|--------|-----------|-------------------------------------------|
| PDF    | `.pdf`    | PyPDF2 — extraction ligne par ligne       |
| Word   | `.docx`   | python-docx — respect des styles Heading  |
| Texte  | `.txt`    | Découpe sur double saut de ligne          |

La taille maximale d'un fichier téléversé est de **16 Mo**.
