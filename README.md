# 🏠 CDA - Plateforme Immobilière avec Assistant IA

## 📋 Présentation

**CDA** est une plateforme immobilière moderne intégrant l'intelligence artificielle pour révolutionner l'estimation de prix et la création de descriptions de biens. Le projet combine un backend robuste en **.NET 8** avec un frontend dynamique en **Angular 18**.

### 🎯 Fonctionnalités Principales
- 🤖 **Assistant IA** pour estimation de prix automatique
- ✨ **Amélioration de descriptions** immobilières 
- 🏠 **Gestion complète** des propriétés et utilisateurs
- 🔐 **Authentification sécurisée** avec JWT
- 📱 **Interface responsive** et moderne

## 🚀 Installation & Démarrage Rapide

### 📋 Prérequis
- **.NET 8 SDK** - [Télécharger ici](https://dotnet.microsoft.com/download)
- **Node.js 18+** - [Télécharger ici](https://nodejs.org/)
- **SQL Server** ou **SQL Server Express**
- **Clé API OpenAI** - [Créer un compte](https://platform.openai.com)

### 🎨 Frontend (Angular 18)

```powershell
# 1. Aller dans le dossier frontend
cd Front-end

# 2. Installer les dépendances
npm install

# 3. Démarrer l'application
ng serve
```
➡️ **Application disponible sur** : `http://localhost:4200`

### ⚙️ Backend (.NET 8)

```powershell
# 1. Aller dans le dossier backend
cd Back-end

# 2. Restaurer les packages NuGet
dotnet restore

# 3. Configurer la base de données
dotnet ef database update

# 4. Démarrer l'API
dotnet run
```
➡️ **API disponible sur** : `https://localhost:7036`

### 🔑 Configuration OpenAI

1. **Créer un compte** sur [platform.openai.com](https://platform.openai.com)
2. **Générer une clé API** dans les paramètres
3. **Ajouter la clé** dans `appsettings.json` :

```json
{
  "OpenAI": {
    "ApiKey": "votre-clé-openai-ici"
  }
}
```

⚠️ **Important** : Gardez votre clé API secrète et ne la commitez jamais !

---

## 📖 Description Détaillée du Projet

### 🏗️ Architecture Technique

#### Backend (.NET 8)
- **API RESTful** avec Entity Framework Core
- **Base de données SQL Server** pour la persistance
- **Intégration OpenAI GPT-3.5** pour l'IA
- **Authentification JWT** et gestion des rôles
- **Architecture Clean** avec séparation des responsabilités

#### Frontend (Angular 18)
- **Application SPA** avec Angular 18
- **Interface responsive** et moderne
- **Système d'onglets** pour les fonctionnalités IA
- **Gestion d'état réactive** avec RxJS
- **Design Material** inspiré

### ✨ Fonctionnalités Complètes

#### 🤖 Assistant IA Immobilier

**💰 Estimation de Prix Intelligente**
- Calcul automatique basé sur les données DVF 2025
- Prix de vente et location avec fourchettes min/max
- Analyse par localisation (Paris par arrondissement, grandes villes)
- Ajustements intelligents selon l'état, équipements, proximité transports
- Explications détaillées du calcul

**✨ Amélioration de Descriptions**
- Transformation automatique de descriptions basiques
- Vocabulaire immobilier professionnel
- Textes attractifs et vendeurs
- Conservation des informations factuelles
- Fonction copier pour utilisation directe

#### 🏢 Gestion Immobilière
- Gestion des utilisateurs avec authentification JWT
- CRUD des propriétés avec validation avancée
- Upload d'images pour les biens immobiliers
- Système d'adresses géolocalisées
- Gestion des statuts (disponible, vendu, loué)
- Dashboard administrateur pour la supervision

#### 🔐 Sécurité & Performance
- Authentification JWT sécurisée
- Autorisation par rôles (Admin, Agent, User)
- Validation des données côté serveur
- CORS configuré pour les appels cross-origin
- Gestion d'erreurs centralisée
- Logging détaillé des opérations

### 🛠️ Stack Technique

**Backend**
- **.NET 8** - Framework backend moderne
- **Entity Framework Core** - ORM pour la base de données
- **SQL Server** - Base de données relationnelle
- **OpenAI API** - Intelligence artificielle GPT-3.5
- **BCrypt.Net** - Hachage sécurisé des mots de passe
- **Swashbuckle** - Documentation API automatique

**Frontend**
- **Angular 18** - Framework frontend moderne
- **TypeScript** - Typage statique JavaScript
- **RxJS** - Programmation réactive
- **Angular Material** - Composants UI
- **SCSS** - Préprocesseur CSS avancé

**Base de Données**
```sql
-- Tables principales
Users (utilisateurs)
Properties (propriétés) 
Images (photos des biens)
Addresses (adresses géolocalisées)
```

### 📁 Structure du Projet

```
CDA/
├── Back-end/                    # API .NET 8
│   ├── Controllers/            # Contrôleurs API
│   │   ├── UsersController.cs
│   │   ├── PropertiesController.cs
│   │   └── IAController.cs
│   ├── Models/                 # Entités métier
│   │   ├── User.cs
│   │   ├── Property.cs
│   │   ├── Image.cs
│   │   └── Address.cs
│   ├── Data/                   # Contexte EF Core
│   │   └── ApplicationDbContext.cs
│   ├── Persistence/            # Repositories
│   │   ├── UserRepository.cs
│   │   └── PropertyRepository.cs
│   ├── Enums/                  # Énumérations
│   │   ├── UserRole.cs
│   │   ├── UserStatus.cs
│   │   └── PropertyStatus.cs
│   └── Migrations/             # Migrations EF
│
├── Front-end/                   # Application Angular 18
│   ├── src/app/
│   │   ├── components/         # Composants partagés
│   │   │   └── header/
│   │   ├── pages/              # Pages principales
│   │   │   ├── homepage/
│   │   │   ├── account/
│   │   │   ├── dashboard/
│   │   │   └── ia/
│   │   ├── services/           # Services Angular
│   │   │   └── ia.service.ts
│   │   ├── models/             # Types TypeScript
│   │   └── guards/             # Guards de route
│   └── public/                 # Assets statiques
│
└── README.md                   # Documentation projet
```

### 🎯 Utilisation

**🏠 Interface Utilisateur**
- Navigation intuitive vers toutes les fonctionnalités
- Design responsive adapté mobile/desktop
- Authentification rapide

**🤖 Assistant IA** (Interface Unifiée)
- **Onglet Estimation** : Estimation de prix automatique
- **Onglet Description** : Amélioration de textes immobiliers
- Interface à onglets moderne et fluide

### 📡 API Endpoints Principaux

#### 🤖 Intelligence Artificielle
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/IA/estimate` | Estimation de prix IA |
| POST | `/api/IA/enhance-description` | Amélioration de description |

#### 👥 Gestion Utilisateurs
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/Users/register` | Inscription |
| POST | `/api/Users/login` | Connexion |
| GET | `/api/Users` | Liste utilisateurs |

#### 🏠 Gestion Propriétés
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/Properties` | Liste propriétés |
| POST | `/api/Properties` | Créer propriété |
| PUT | `/api/Properties/{id}` | Modifier propriété |

### 💡 Exemples d'Utilisation

**Estimation de Prix :**
```http
POST /api/IA/estimate
Content-Type: application/json

{
  "description": "Appartement 3 pièces, 75m², balcon, proche métro, Lyon 6ème",
  "isForSale": true
}
```

**Amélioration de Description :**
```http
POST /api/IA/enhance-description
Content-Type: application/json

{
  "description": "appartement sympa 3 pieces lyon",
  "isForSale": true
}
```

### 📊 Base de Données

```sql
-- Table des utilisateurs
CREATE TABLE Users (
    Id int IDENTITY(1,1) PRIMARY KEY,
    FirstName nvarchar(100) NOT NULL,
    LastName nvarchar(100) NOT NULL,
    Email nvarchar(100) UNIQUE NOT NULL,
    PasswordHash nvarchar(255) NOT NULL,
    Role int NOT NULL, -- 0=User, 1=Agent, 2=Admin
    Status int NOT NULL, -- 0=Active, 1=Inactive
    CreatedAt datetime2 NOT NULL
);

-- Table des propriétés
CREATE TABLE Properties (
    Id int IDENTITY(1,1) PRIMARY KEY,
    Title nvarchar(200) NOT NULL,
    Description nvarchar(max),
    Price decimal(18,2) NOT NULL,
    Surface float NOT NULL,
    Rooms int NOT NULL,
    IsForSale bit NOT NULL,
    Status int NOT NULL, -- 0=Available, 1=Sold, 2=Rented
    UserId int FOREIGN KEY REFERENCES Users(Id),
    AddressId int FOREIGN KEY REFERENCES Addresses(Id)
);
```

### 🔧 Configuration Avancée

**appsettings.json :**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\MSSQLLocalDB;Database=CDA_RealEstate;Trusted_Connection=true;TrustServerCertificate=true"
  },
  "OpenAI": {
    "ApiKey": "votre-clé-openai-ici"
  },
  "Jwt": {
    "Key": "votre-clé-jwt-sécurisée-ici",
    "Issuer": "CDA-Backend",
    "Audience": "CDA-Frontend"
  }
}
```

**Environment Angular :**
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7036/api'
};
```

### 🚀 Déploiement

**Backend :**
```powershell
dotnet publish -c Release -o ./publish
```

**Frontend :**
```powershell
npm run build --prod
```

### 🔒 Sécurité

- **🛡️ JWT Tokens** : Authentification sécurisée
- **🔐 BCrypt** : Hachage des mots de passe
- **🚫 CORS** : Protection cross-origin
- **✅ Validation** : Données strictement validées
- **🔑 Variables d'environnement** : Secrets protégés

### 👥 Équipe

Développé dans le cadre du projet **CDA** (Concepteur Développeur d'Applications) 2025.

### 📄 Licence

Projet éducatif - CDA 2025

---

**🎉 CDA Real Estate Platform - Votre solution immobilière intelligente !**
