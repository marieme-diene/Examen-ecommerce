# Documentation de l'API E-Commerce

## Introduction

Bienvenue dans la documentation de l'API E-Commerce. Cette API permet de gérer les produits, catégories, commandes et paiements pour une boutique en ligne.

## Configuration requise

- PHP 8.1 ou supérieur
- Composer 2.0 ou supérieur
- MySQL 5.7+ ou MariaDB 10.3+
- Node.js 16+ et NPM (pour les assets frontend)
- Compte Stripe (pour les paiements)

## Installation

1. Cloner le dépôt
   ```bash
   git clone [URL_DU_REPO]
   cd ecommerce-api
   ```

2. Installer les dépendances PHP
   ```bash
   composer install
   ```

3. Copier le fichier d'environnement
   ```bash
   cp .env.example .env
   ```

4. Générer une clé d'application
   ```bash
   php artisan key:generate
   ```

5. Configurer la base de données dans `.env`
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=nom_de_votre_base
   DB_USERNAME=votre_utilisateur
   DB_PASSWORD=votre_mot_de_passe
   ```

6. Configurer Stripe dans `.env`
   ```env
   STRIPE_KEY=votre_clé_publique_stripe
   STRIPE_SECRET=votre_clé_secrète_stripe
   STRIPE_WEBHOOK_SECRET=votre_secret_webhook_stripe
   STRIPE_CURRENCY=eur
   ```

7. Configurer l'email dans `.env`
   ```env
   MAIL_MAILER=smtp
   MAIL_HOST=votre_serveur_smtp
   MAIL_PORT=587
   MAIL_USERNAME=votre_email
   MAIL_PASSWORD=votre_mot_de_passe
   MAIL_ENCRYPTION=tls
   MAIL_FROM_ADDRESS=contact@votresite.com
   MAIL_FROM_NAME="${APP_NAME}"
   ```

8. Exécuter les migrations et les seeders
   ```bash
   php artisan migrate --seed
   ```

9. Démarrer le serveur de développement
   ```bash
   php artisan serve
   ```

## Authentification

L'API utilise Laravel Sanctum pour l'authentification. Les utilisateurs doivent s'authentifier pour accéder aux routes protégées.

### Inscription

```http
POST /api/register
```

**Corps de la requête :**
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "motdepasse",
    "password_confirmation": "motdepasse"
}
```

### Connexion

```http
POST /api/login
```

**Corps de la requête :**
```json
{
    "email": "john@example.com",
    "password": "motdepasse"
}
```

**Réponse réussie :**
```json
{
    "token": "1|abcdefghijklmnopqrstuvwxyz",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "email_verified_at": null,
        "created_at": "2023-01-01T00:00:00.000000Z",
        "updated_at": "2023-01-01T00:00:00.000000Z"
    }
}
```

### Déconnexion

```http
POST /api/logout
```

**En-têtes requis :**
```
Authorization: Bearer votre_token
Accept: application/json
```

## Points de terminaison de l'API

### Produits

- `GET /api/products` - Lister tous les produits (paginated)
- `GET /api/products/{product}` - Afficher un produit spécifique
- `POST /api/products` - Créer un nouveau produit (admin)
- `PUT /api/products/{product}` - Mettre à jour un produit (admin)
- `DELETE /api/products/{product}` - Supprimer un produit (admin)

### Catégories

- `GET /api/categories` - Lister toutes les catégories
- `GET /api/categories/{category}` - Afficher une catégorie spécifique avec ses produits
- `POST /api/categories` - Créer une nouvelle catégorie (admin)
- `PUT /api/categories/{category}` - Mettre à jour une catégorie (admin)
- `DELETE /api/categories/{category}` - Supprimer une catégorie (admin)

### Commandes

- `GET /api/orders` - Lister les commandes de l'utilisateur connecté
- `GET /api/orders/{order}` - Afficher une commande spécifique
- `POST /api/orders` - Créer une nouvelle commande
- `POST /api/orders/{order}/cancel` - Annuler une commande

### Paiements

- `POST /api/payments/create-payment-intent` - Créer une intention de paiement
- `POST /api/payments/confirm` - Confirmer un paiement
- `POST /api/payments/{payment}/refund` - Rembourser un paiement (admin)

## Webhooks Stripe

L'API écoute les événements Stripe via le point de terminaison :

```
POST /api/stripe/webhook
```

Événements gérés :
- `payment_intent.succeeded` - Paiement réussi
- `payment_intent.payment_failed` - Échec du paiement
- `charge.refunded` - Remboursement effectué

## Sécurité

- Toutes les routes (sauf les routes publiques) nécessitent une authentification via un jeton Bearer.
- Les mots de passe sont hachés avec Bcrypt.
- Les données sensibles comme les clés API sont stockées dans des variables d'environnement.
- Les paiements sont traités via Stripe avec une connexion sécurisée.

## Déploiement

Pour déployer l'application en production :

1. Configurer le fichier `.env` avec les paramètres de production
2. Exécuter `composer install --optimize-autoloader --no-dev`
3. Exécuter `php artisan config:cache`
4. Exécuter `php artisan route:cache`
5. Configurer un serveur web (Nginx/Apache) pour pointer vers le dossier `public`
6. Configurer une tâche cron pour la file d'attente : `* * * * * cd /chemin/vers/votre/projet && php artisan schedule:run >> /dev/null 2>&1`

## Support

Pour toute question ou problème, veuillez ouvrir un ticket dans la section des problèmes du dépôt ou contacter l'équipe de support à support@votredomaine.com.

## Licence

Ce projet est sous licence [MIT](LICENSE).
