# Classyn — Portail Étudiant
### Documentation Technique — BTS SIO SLAM | Lucas Ovinet

---

## Sommaire

1. [Présentation du projet](#1-présentation-du-projet)
2. [Contexte et objectifs](#2-contexte-et-objectifs)
3. [Architecture technique](#3-architecture-technique)
4. [Base de données](#4-base-de-données)
5. [Fonctionnalités](#5-fonctionnalités)
6. [API REST](#6-api-rest)
7. [Sécurité](#7-sécurité)
8. [Bilan et perspectives](#8-bilan-et-perspectives)

---

## 1. Présentation du projet

**Classyn** est une application web de gestion des absences scolaires destinée aux étudiants. Elle leur permet de consulter en temps réel leurs absences, leur emploi du temps, leur profil, et leurs statistiques de ponctualité via une interface moderne et responsive.

| Champ | Détail |
|---|---|
| Nom du projet | Classyn — Portail Étudiant |
| Type | Application web full-stack |
| Rôle | Développeur full-stack |
| Durée | Stage / Projet personnel |
| Année | 2025-2026 |

---

## 2. Contexte et objectifs

### Problématique

Les établissements scolaires disposent rarement d'un outil simple permettant aux étudiants de **suivre eux-mêmes** leurs absences et leur ponctualité. Les informations sont souvent dispersées (papier, email, logiciel administratif inaccessible).

### Objectifs du projet

- Offrir aux étudiants un **tableau de bord clair** de leur assiduité
- Permettre la **consultation de l'emploi du temps** semaine par semaine
- Afficher le **détail de chaque absence** (justifiée, injustifiée, retard)
- Fournir un **score de ponctualité** et un classement au sein de l'établissement
- Gérer les **notifications** personnalisées

### Compétences BTS SIO mobilisées

| Bloc | Compétence |
|---|---|
| B1 | Concevoir une solution applicative |
| B1 | Développer une application |
| B1 | Gérer les données |
| B2 | Travailler en mode projet |
| B2 | Mettre en œuvre les bonnes pratiques de sécurité |

---

## 3. Architecture technique

### Stack technologique

**Frontend**

| Technologie | Version | Rôle |
|---|---|---|
| Vue.js 3 | 3.x | Framework JavaScript (Composition API) |
| Vite | 7.3.1 | Build tool et serveur de développement |
| CSS3 | — | Mise en page (Grid, Flexbox, variables CSS) |
| Google Fonts | — | Police Montserrat |

**Backend**

| Technologie | Version | Rôle |
|---|---|---|
| Node.js | 20+ | Environnement d'exécution JavaScript |
| Express | 4.22.1 | Framework web HTTP |
| mysql2 | 3.9.7 | Connecteur MySQL avec pool de connexions |
| express-session | 1.18.0 | Gestion des sessions utilisateurs |
| dotenv | 16.4.5 | Gestion des variables d'environnement |
| cors | 2.8.5 | Gestion des origines cross-domain |

**Base de données**

| Technologie | Détail |
|---|---|
| MySQL 8.x | SGBD relationnel |
| Hébergement | AlwaysData (distant) |

---

### Architecture globale

```
┌─────────────────────────────────────────────────────────┐
│                     NAVIGATEUR                          │
│                                                         │
│   Vue 3 SPA (Single Page Application)                   │
│   ┌──────────┐  ┌───────────┐  ┌───────────────────┐   │
│   │ LoginView│  │Dashboard  │  │ Sections (Absences │   │
│   │          │  │View       │  │ Profil, Emploi du  │   │
│   └──────────┘  └───────────┘  │ temps)             │   │
│                                └───────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP / Fetch API (/api/*)
                     │ (proxy Vite en développement)
┌────────────────────▼────────────────────────────────────┐
│                SERVEUR NODE.JS / EXPRESS                │
│                                                         │
│   Routes REST   │   Sessions HTTP-only   │   CORS       │
│                                                         │
└────────────────────┬────────────────────────────────────┘
                     │ mysql2 (pool)
┌────────────────────▼────────────────────────────────────┐
│                  BASE DE DONNÉES MYSQL                  │
│   (hébergée sur AlwaysData)                             │
└─────────────────────────────────────────────────────────┘
```

---

### Structure des fichiers

```
Website_VUE/
├── index.html                  # Point d'entrée HTML
├── vite.config.js              # Configuration Vite + proxy API
├── jsconfig.json               # Alias @ → ./src
├── package.json                # Dépendances frontend
├── .env                        # Variables d'environnement (non versionné)
│
├── src/
│   ├── main.js                 # Initialisation Vue
│   ├── App.vue                 # Composant racine (gestion auth)
│   ├── assets/
│   │   └── logo-app.svg
│   ├── views/
│   │   ├── LoginView.vue       # Page de connexion
│   │   └── DashboardView.vue   # Interface principale + sidebar
│   └── sections/
│       ├── AbsencesSection.vue # Historique des absences
│       ├── ProfileSection.vue  # Profil étudiant
│       └── ScheduleSection.vue # Emploi du temps hebdomadaire
│
└── server/
    ├── index.js                # Serveur Express + toutes les routes
    └── package.json            # Dépendances backend
```

---

## 4. Base de données

### Modèle relationnel (tables principales)

```
┌──────────────┐       ┌─────────────┐       ┌──────────────────┐
│     user     │       │   student   │       │      class       │
├──────────────┤       ├─────────────┤       ├──────────────────┤
│ id           │◄──────│ user_id     │       │ id               │
│ login        │       │ id          │──────►│ name             │
│ password     │       │ first_name  │       │ level            │
│ created_at   │       │ last_name   │       │ school_year      │
│ status       │       │ birth_date  │       │ establishment_id │
└──────────────┘       │ email       │       └──────────────────┘
                       │ class_id    │
                       └─────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
      ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐
      │   absence    │ │   course     │ │  student_score   │
      ├──────────────┤ ├──────────────┤ ├──────────────────┤
      │ id           │ │ id           │ │ student_id       │
      │ student_id   │ │ subject_id   │ │ penalty_points   │
      │ course_id    │ │ teacher_id   │ │ class_rank       │
      │ type         │ │ room_id      │ │ estab_rank       │
      │ justified    │ │ class_id     │ └──────────────────┘
      │ reason       │ │ start_time   │
      │ penalty_pts  │ │ end_time     │
      └──────────────┘ │ day_of_week  │
                       │ cancelled    │
                       └──────────────┘
```

### Tables annexes

| Table | Description |
|---|---|
| `subject` | Matières (nom, code) |
| `teacher` | Enseignants (nom, prénom) |
| `room` | Salles de cours |
| `establishment` | Établissements scolaires |
| `notification` | Notifications étudiants |

---

## 5. Fonctionnalités

### 5.1 Authentification

- Formulaire de connexion (identifiant + mot de passe)
- Session persistante via cookie HTTP-only
- Vérification automatique de session au chargement de l'app
- Déconnexion avec destruction de session côté serveur
- Affichage d'erreurs claires en cas d'échec

**Flux d'authentification :**

```
Utilisateur → POST /api/login → Vérification BDD → Session créée → Dashboard
                                      │
                                  Échec → Message d'erreur → Formulaire
```

---

### 5.2 Tableau de bord

- Bannière avec nom de l'étudiant, classe et établissement
- **4 cartes de résumé :**
  - Total des absences
  - Absences justifiées
  - Absences injustifiées
  - Retards
- **Score de ponctualité :**
  - Points de pénalité accumulés
  - Rang dans la classe
  - Rang dans l'établissement

---

### 5.3 Absences

- Tableau complet de l'historique des absences
- **Filtres rapides :** Toutes / Injustifiées / Justifiées / Retards
- Colonnes affichées :
  - Date et heure
  - Matière
  - Enseignant
  - Type (Absence / Retard)
  - Statut de justification (badge coloré)
  - Motif
  - Points de pénalité

---

### 5.4 Profil étudiant

Trois blocs d'informations :

| Bloc | Champs |
|---|---|
| Informations personnelles | Nom, prénom, date de naissance, email |
| Informations scolaires | Établissement, classe, niveau, année scolaire |
| Informations de compte | Identifiant, date de création, statut |

- Avatar généré automatiquement avec les initiales de l'étudiant

---

### 5.5 Emploi du temps

- Vue hebdomadaire (lundi → vendredi)
- Navigation entre les semaines (précédente / suivante / aujourd'hui)
- Carte par cours affichant :
  - Heure de début et de fin
  - Matière
  - Enseignant
  - Salle
  - Badge "Cours annulé" si applicable
- Jour courant mis en évidence

---

### 5.6 Notifications

- Compteur de notifications non lues dans la barre latérale
- Marquage lecture (PATCH /api/student/notifications/:id/read)
- Récupération via API sécurisée

---

## 6. API REST

### Tableau des endpoints

| Méthode | Endpoint | Authentification | Description |
|---|---|---|---|
| `POST` | `/api/login` | Non | Connexion avec identifiant et mot de passe |
| `GET` | `/api/me` | Non | Récupère l'utilisateur de la session active |
| `POST` | `/api/logout` | Oui | Déconnexion et destruction de session |
| `GET` | `/api/student/profile` | Oui | Profil complet de l'étudiant connecté |
| `GET` | `/api/student/stats` | Oui | Statistiques pour le tableau de bord |
| `GET` | `/api/student/absences` | Oui | Historique de toutes les absences |
| `GET` | `/api/student/schedule` | Oui | Emploi du temps (param: `?week=0`) |
| `GET` | `/api/student/notifications` | Oui | Notifications de l'étudiant |
| `PATCH` | `/api/student/notifications/:id/read` | Oui | Marquer une notification comme lue |

### Exemple de réponse — `/api/student/stats`

```json
{
  "absences": {
    "total": 12,
    "justified": 7,
    "unjustified": 3,
    "lates": 2
  },
  "score": {
    "penalty_points": 8,
    "class_rank": 3,
    "estab_rank": 15
  },
  "notifications": {
    "unread_count": 2
  }
}
```

### Middleware de protection de session

```js
function requireSession(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  next();
}
```

Toutes les routes `/api/student/*` passent par ce middleware.

---

## 7. Sécurité

### Mesures en place

| Mesure | Détail |
|---|---|
| Sessions HTTP-only | Les cookies de session ne sont pas accessibles en JavaScript (protection XSS) |
| Variables d'environnement | Aucune information sensible dans le code source (`.env` hors git) |
| Pool de connexions MySQL | Évite les fuites de connexion et les surcharges |
| CORS configuré | Origines autorisées définies explicitement |

### Points d'amélioration identifiés

| Vulnérabilité | Solution recommandée |
|---|---|
| Mots de passe stockés en clair | Hachage avec **bcrypt** ou **argon2** |
| `SESSION_SECRET` faible | Utiliser une clé aléatoire forte (32+ caractères) |
| Pas de validation des entrées | Ajouter une validation côté serveur (ex: **Joi**, **Zod**) |
| HTTPS non forcé | Activer `cookie.secure: true` en production |
| Endpoint de debug `/api/schema` | Supprimer en production |

---

## 8. Bilan et perspectives

### Ce qui a été réalisé

- Application web full-stack fonctionnelle de bout en bout
- Interface utilisateur moderne et responsive
- API REST sécurisée par sessions
- Connexion à une base de données MySQL distante
- Gestion de l'état d'authentification globale en Vue 3

### Difficultés rencontrées

- Gestion du proxy Vite pour éviter les erreurs CORS en développement
- Navigation entre semaines dans l'emploi du temps (calcul d'offset)
- Cohérence de l'état d'authentification entre les composants Vue

### Perspectives d'évolution

- [ ] Espace administrateur (saisie des absences, gestion des étudiants)
- [ ] Notifications en temps réel (WebSocket)
- [ ] Export PDF des relevés d'absences
- [ ] Application mobile (Vue Native ou capacitor)
- [ ] Authentification renforcée (2FA, JWT)
- [ ] Tests automatisés (Vitest, Cypress)

---

## Lancement du projet

### Prérequis

- Node.js 20+ et npm 10+
- MySQL 5.7+ / 8.x

### Installation

```bash
# Cloner le projet
git clone https://github.com/l-sauvinet/Website_VUE.git
cd Website_VUE

# Installer les dépendances frontend
npm install

# Installer les dépendances backend
cd server && npm install && cd ..
```

### Configuration `.env`

```env
PORT=3000
SESSION_SECRET=une_cle_secrete_forte

DB_HOST=localhost
DB_PORT=3306
DB_NAME=nom_de_la_base
DB_USER=utilisateur
DB_PASSWORD=mot_de_passe
```

### Démarrage en développement

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
npm run dev
```

- Backend : `http://localhost:3000`
- Frontend : `http://localhost:5173`

---

*Documentation rédigée dans le cadre du BTS SIO option SLAM — Lucas Ovinet — 2025-2026*
