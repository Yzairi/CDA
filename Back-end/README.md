# 🏠 CDA - Assistant IA Immobilier (Backend)

## 📋 Description

API backend développée en **.NET 8** pour une plateforme immobilière intégrant l'intelligence artificielle. Cette API fournit des services d'estimation de prix immobiliers et d'amélioration de descriptions de biens grâce à l'intégration OpenAI GPT-3.5.

## ✨ Fonctionnalités

### 🤖 Intelligence Artificielle
- **Estimation de prix** : Calcul automatique des prix de vente et location basé sur des données de marché 2025
- **Amélioration de descriptions** : Transformation de descriptions basiques en textes attractifs et professionnels
- **Intégration OpenAI** : Utilisation de GPT-3.5-turbo pour les analyses et générations de contenu

### 🏢 Gestion Immobilière
- **Gestion des utilisateurs** : Système d'authentification et autorisation
- **Gestion des propriétés** : CRUD complet pour les biens immobiliers
- **Gestion des images** : Upload et gestion des photos de propriétés
- **Système d'adresses** : Localisation géographique des biens

### 🔐 Sécurité
- **Authentification JWT** : Système de tokens sécurisé
- **Autorisation par rôles** : Admin, Agent, Utilisateur
- **Validation des données** : Contrôles d'intégrité stricte
- **CORS configuré** : Sécurisation des appels cross-origin

## 🛠️ Technologies

- **.NET 8** - Framework backend moderne
- **Entity Framework Core** - ORM pour la base de données
- **SQL Server** - Base de données relationnelle
- **JWT Authentication** - Authentification sécurisée
- **BCrypt** - Hachage des mots de passe
- **OpenAI API** - Intelligence artificielle
- **AutoMapper** - Mapping d'objets
- **Swagger/OpenAPI** - Documentation API

## 📁 Structure du Projet

```
Back-end/
├── Controllers/           # Contrôleurs API
│   ├── PriceEstimationController.cs  # IA Estimation & Description
│   ├── UsersController.cs            # Gestion utilisateurs
│   └── PropertiesController.cs       # Gestion propriétés
├── Data/                 # Contexte base de données
│   └── ApplicationDbContext.cs
├── Models/               # Modèles de données
│   ├── User.cs          # Modèle utilisateur
│   ├── Property.cs      # Modèle propriété
│   ├── Address.cs       # Modèle adresse
│   └── Image.cs         # Modèle image
├── Enums/               # Énumérations
│   ├── UserRole.cs      # Rôles utilisateur
│   ├── UserStatus.cs    # Statuts utilisateur
│   └── PropertyStatus.cs # Statuts propriété
├── Persistence/         # Repositories
│   ├── UserRepository.cs
│   └── PropertyRepository.cs
├── Migrations/          # Migrations EF Core
└── Properties/          # Configuration
```

## 🚀 Installation et Démarrage

### Prérequis
- .NET 8 SDK
- SQL Server (LocalDB ou instance complète)
- Clé API OpenAI

### 1. Configuration de la base de données
```bash
# Mettre à jour la base de données
dotnet ef database update
```

### 2. Configuration OpenAI
Ajoutez votre clé OpenAI dans le contrôleur `PriceEstimationController.cs` :
```csharp
var openAiApiKey = "VOTRE_CLE_OPENAI";
```

### 3. Démarrage du serveur
```bash
# Restaurer les packages
dotnet restore

# Démarrer en mode développement
dotnet run

# Ou avec hot-reload
dotnet watch run
```

Le serveur démarre sur `https://localhost:5172`

## 🔌 API Endpoints

### 🤖 Estimation IA
```http
POST /api/priceestimation/estimate
Content-Type: application/json

{
  "description": "Appartement 3 pièces 75m² à Paris 15ème",
  "isForSale": true
}
```

### ✨ Amélioration Description
```http
POST /api/priceestimation/enhance-description
Content-Type: application/json

{
  "description": "Appartement 3 pièces 75m² Paris"
}
```

### 👥 Utilisateurs
```http
GET    /api/users          # Liste des utilisateurs
POST   /api/users          # Créer un utilisateur
PUT    /api/users/{id}     # Modifier un utilisateur
DELETE /api/users/{id}     # Supprimer un utilisateur
```

### 🏠 Propriétés
```http
GET    /api/properties     # Liste des propriétés
POST   /api/properties     # Créer une propriété
PUT    /api/properties/{id} # Modifier une propriété
DELETE /api/properties/{id} # Supprimer une propriété
```

## 📊 Base de Données

### Modèle de données principal :

**Users**
- Id, FirstName, LastName, Email, Phone
- PasswordHash, Role, Status, CreatedAt

**Properties** 
- Id, Title, Description, Price, Surface, Rooms
- PropertyType, PropertyStatus, AddressId, CreatedAt

**Addresses**
- Id, Street, City, PostalCode, Country

**Images**
- Id, FileName, FilePath, PropertyId

## 🔧 Configuration

### appsettings.json
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=CDA;Trusted_Connection=true"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}
```

## 🤖 Intégration IA - Détails Techniques

### Estimation de Prix
- **Données de référence** : Prix au m² par ville/arrondissement (2025)
- **Calculs automatiques** : Prix de base × Surface × Ajustements
- **Ajustements intelligents** : État (+8%), Balcon (+5%), Métro (+5%)
- **Modes** : Vente (prix total) / Location (loyer mensuel)

### Amélioration de Description
- **Transformation automatique** : Description basique → Texte professionnel
- **Conservation des faits** : Toutes les données factuelles préservées
- **Vocabulaire immobilier** : Termes attractifs et professionnels
- **Limite** : 150 mots maximum

## 📈 Performances

- **Temps de réponse IA** : ~2-5 secondes
- **Cache des résultats** : Non implémenté (amélioration possible)
- **Rate limiting** : Non implémenté (recommandé pour la production)

## 🚨 Sécurité

⚠️ **Important** : La clé OpenAI est actuellement en dur dans le code. Pour la production :
- Utiliser les **User Secrets** en développement
- Utiliser les **Variables d'environnement** en production
- Implémenter un **système de rotation des clés**

## 📝 Logs

Les logs sont configurés dans `appsettings.json` et affichent :
- Requêtes IA (description + paramètres)
- Erreurs OpenAI (codes + messages)
- Exceptions système

## 🔄 Migrations

Pour créer une nouvelle migration :
```bash
dotnet ef migrations add NomDeLaMigration
dotnet ef database update
```

## 🧪 Tests

```bash
# Exécuter les tests (si implémentés)
dotnet test
```

## 👥 Équipe de Développement

Développé dans le cadre du projet CDA (Concepteur Développeur d'Applications).

## 📄 Licence

Projet éducatif - CDA 2025
