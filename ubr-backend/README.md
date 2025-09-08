# UBR Backend - Union Bénie et Réelle

Backend Laravel pour l'application de rencontre chrétienne UBR.

## Installation

1. Cloner le projet et installer les dépendances :
```bash
composer install
```

2. Copier le fichier d'environnement :
```bash
cp .env.example .env
```

3. Générer la clé d'application :
```bash
php artisan key:generate
```

4. Configurer la base de données dans le fichier `.env` :
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ubr_database
DB_USERNAME=root
DB_PASSWORD=
```

5. Exécuter les migrations et seeders :
```bash
php artisan migrate --seed
```

6. Créer le lien symbolique pour le stockage :
```bash
php artisan storage:link
```

7. Démarrer le serveur de développement :
```bash
php artisan serve
```

## Comptes de test

### Administrateur
- Email: `admin@ubr.ci`
- Mot de passe: `admin123`

### Utilisateurs de test
- Email: `marie@test.com` / Mot de passe: `password123`
- Email: `jean@test.com` / Mot de passe: `password123`
- Email: `grace@test.com` / Mot de passe: `password123`

## API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Profil utilisateur actuel

### Utilisateurs
- `GET /api/users` - Liste des profils compatibles
- `GET /api/users/{id}` - Détails d'un profil
- `PUT /api/users/profile` - Mise à jour du profil
- `POST /api/users/photos` - Upload de photo
- `DELETE /api/users/photos/{id}` - Suppression de photo

### Matches
- `POST /api/matches/like/{userId}` - Liker un profil
- `POST /api/matches/dislike/{userId}` - Disliker un profil
- `GET /api/matches` - Liste des matches mutuels

### Messages
- `GET /api/messages/conversations` - Liste des conversations
- `GET /api/messages/{conversationId}` - Messages d'une conversation
- `POST /api/messages` - Envoyer un message

### Blocage
- `POST /api/users/{userId}/block` - Bloquer un utilisateur
- `DELETE /api/users/{userId}/unblock` - Débloquer un utilisateur
- `GET /api/blocked-users` - Liste des utilisateurs bloqués

### Signalements
- `POST /api/reports` - Créer un signalement
- `GET /api/reports` - Liste des signalements
- `GET /api/reports/{trackingNumber}` - Détails d'un signalement

### Témoignages
- `GET /api/testimonials` - Liste des témoignages publics
- `POST /api/testimonials` - Créer un témoignage

### Notifications
- `GET /api/notifications` - Liste des notifications
- `PUT /api/notifications/{id}/read` - Marquer comme lu
- `PUT /api/notifications/mark-all-read` - Tout marquer comme lu

### Administration
- `POST /api/admin/login` - Connexion admin
- `GET /api/admin/stats` - Statistiques générales
- `GET /api/admin/users` - Gestion des utilisateurs
- `GET /api/admin/reports` - Gestion des signalements
- `GET /api/admin/testimonials` - Gestion des témoignages

## Fonctionnalités

### Système de matching
- Algorithme de compatibilité basé sur :
  - Dénomination chrétienne (30%)
  - Fréquence de pratique (25%)
  - Intérêts communs (20%)
  - Compatibilité d'âge (15%)
  - Engagement dans l'église (10%)

### Sécurité
- Authentification avec Laravel Sanctum
- Vérification des profils
- Système de blocage et signalement
- Modération des contenus

### Notifications
- Notifications en temps réel
- Rappels spirituels quotidiens
- Alertes de nouveaux matches et messages

### Administration
- Tableau de bord complet
- Gestion des utilisateurs
- Modération des signalements
- Approbation des témoignages

## Commandes artisan

```bash
# Envoyer les rappels spirituels
php artisan ubr:spiritual-reminders

# Nettoyer les abonnements expirés
php artisan ubr:cleanup-subscriptions

# Nettoyer les tokens expirés
php artisan sanctum:prune-expired --hours=24
```

## Configuration CORS

Le backend est configuré pour accepter les requêtes depuis le frontend. Assurez-vous que l'URL de votre frontend est dans la configuration CORS.

## Stockage des fichiers

Les photos de profil sont stockées dans `storage/app/public/photos/` et accessibles via le lien symbolique.

## Tâches programmées

Les tâches suivantes sont programmées :
- Rappels spirituels quotidiens à 8h
- Nettoyage des abonnements expirés à minuit
- Nettoyage des tokens expirés quotidiennement

Pour activer les tâches programmées en production :
```bash
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```