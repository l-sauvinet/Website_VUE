# Classyn — Portail Étudiant

Application web de gestion des absences scolaires, permettant aux étudiants de consulter leurs absences, leur emploi du temps, leur profil et leurs statistiques.

---

## Aperçu

| Fonctionnalité | Description |
|---|---|
| Authentification | Connexion sécurisée par session HTTP-only |
| Tableau de bord | Statistiques d'absences, score de ponctualité, cours du jour |
| Absences | Historique filtrable (justifiées, injustifiées, retards) |
| Profil | Informations personnelles et scolaires |
| Notifications | Notifications non lues avec marquage lu/non-lu |

---

## Prérequis

| Outil | Version minimale |
|---|---|
| [Node.js](https://nodejs.org/) | 20.19.0 ou ≥ 22.12.0 |
| npm | 10+ |
| MySQL | 5.7+ / 8.x |

---

## Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/l-sauvinet/Website_VUE.git
cd Website_VUE
```

### 2. Installer les dépendances frontend

```bash
npm install
```

### 3. Installer les dépendances backend

```bash
cd server
npm install
cd ..
```

---

## Configuration

Créer un fichier `.env` à la racine du projet en s'appuyant sur l'exemple ci-dessous :

```env
PORT=3000
SESSION_SECRET=changeme_en_production

DB_HOST=localhost
DB_PORT=3306
DB_NAME=nom_de_la_base
DB_USER=utilisateur
DB_PASSWORD=mot_de_passe
```

> **Important :** Ne jamais commiter le fichier `.env`. Il est déjà listé dans `.gitignore`.

---

## Lancement

### Développement (frontend + backend séparément)

**Terminal 1 — Backend :**
```bash
cd server
npm run dev
```
> Le serveur Express démarre sur `http://localhost:3000`

**Terminal 2 — Frontend :**
```bash
npm run dev
```
> L'application Vue démarre sur `http://localhost:5173`

Le proxy Vite redirige automatiquement les appels `/api/*` vers le backend, pas besoin de CORS en développement.

### Production

```bash
# Build du frontend
npm run build

# Lancer le backend
cd server
npm start
```

---

## Structure du projet

```
Website_VUE/
├── index.html              # Point d'entrée HTML
├── vite.config.js          # Configuration Vite (proxy, alias)
├── jsconfig.json           # Alias de chemin @ → ./src
├── package.json            # Dépendances frontend
├── .env                    # Variables d'environnement (non versionné)
│
├── public/
│   └── favicon.ico
│
├── src/
│   ├── main.js             # Initialisation de l'application Vue
│   ├── App.vue             # Composant racine (gestion auth globale)
│   ├── assets/
│   │   └── logo-app.svg
│   ├── views/
│   │   ├── LoginView.vue       # Page de connexion
│   │   └── DashboardView.vue   # Interface principale (sidebar + contenu)
│   └── sections/
│       ├── AbsencesSection.vue # Liste et filtres des absences
│       ├── ProfileSection.vue  # Informations étudiant
│       └── ScheduleSection.vue # Emploi du temps
│
└── server/
    ├── index.js            # Serveur Express (routes + DB)
    └── package.json        # Dépendances backend
```

---

## API Backend

Toutes les routes (sauf `/api/login`) requièrent une session active.

| Méthode | Endpoint | Description |
|---|---|---|
| `POST` | `/api/login` | Connexion (identifiant + mot de passe) |
| `GET` | `/api/me` | Utilisateur de la session courante |
| `POST` | `/api/logout` | Déconnexion |
| `GET` | `/api/student/profile` | Profil complet de l'étudiant |
| `GET` | `/api/student/stats` | Statistiques du tableau de bord |
| `GET` | `/api/student/absences` | Liste de toutes les absences |
| `GET` | `/api/student/schedule` | Emploi du temps hebdomadaire |
| `GET` | `/api/student/notifications` | Notifications de l'utilisateur |
| `PATCH` | `/api/student/notifications/:id/read` | Marquer une notification comme lue |

---

## Technologies

**Frontend**
- [Vue 3](https://vuejs.org/) — Composition API
- [Vite](https://vitejs.dev/) — Build tool et dev server

**Backend**
- [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- [mysql2](https://github.com/sidorares/node-mysql2) — Connexion MySQL avec pool
- [express-session](https://github.com/expressjs/session) — Gestion des sessions
- [dotenv](https://github.com/motdotla/dotenv) — Variables d'environnement

---

## Notes de sécurité pour la mise en production

- [ ] Remplacer `SESSION_SECRET` par une valeur aléatoire forte
- [ ] Hacher les mots de passe avec bcrypt ou argon2 (actuellement stockés en clair)
- [ ] Supprimer l'endpoint de debug `/api/schema`
- [ ] Activer HTTPS et configurer `cookie.secure: true` dans la session
- [ ] Mettre en place une validation des entrées côté serveur
