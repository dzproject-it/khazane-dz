# Khazane-DZ — Application Desktop Standalone

## Prérequis de build

- **Node.js** 18+ et npm
- **Windows 10/11** (x64)
- Connexion internet (pour le premier téléchargement PostgreSQL)

## Build de l'installateur

```powershell
# Depuis la racine du projet
.\scripts\build-desktop.ps1
```

Le script effectue automatiquement :

1. **Télécharge PostgreSQL 16 portable** (~200 Mo, mis en cache dans %TEMP%)
2. **Compile le frontend React** → `backend/frontend-dist/`
3. **Compile le backend NestJS** → `backend/dist/`
4. **Installe les dépendances Electron**
5. **Package l'application** avec electron-builder

L'installateur `.exe` est généré dans `dist-desktop/`.

### Options

```powershell
# Build sans empaquetage (pour tester rapidement)
.\scripts\build-desktop.ps1 -DirOnly

# Sauter le téléchargement PostgreSQL (si déjà présent)
.\scripts\build-desktop.ps1 -SkipPgDownload
```

## Mode développement

```powershell
# 1. Télécharger PostgreSQL (une seule fois)
.\scripts\build-desktop.ps1 -DirOnly

# 2. Lancer en mode dev
cd desktop
npm start
```

## Architecture

```
desktop/
  main.js          # Processus principal Electron
  pgManager.js     # Gestionnaire PostgreSQL embarqué
  preload.js       # Bridge Electron sécurisé
  splash.html      # Écran de chargement
  package.json     # Configuration Electron + electron-builder
```

### Cycle de vie au démarrage

1. Affichage du splash screen
2. Recherche de ports libres (PostgreSQL + Backend)
3. Démarrage de PostgreSQL embarqué (initdb si premier lancement)
4. Exécution des migrations Prisma
5. Seed des données initiales (premier lancement uniquement)
6. Démarrage du serveur NestJS
7. Ouverture de la fenêtre principale

### Données utilisateur

Les données sont stockées dans :
```
%APPDATA%/khazane-desktop/
  data/
    pgdata/        # Base de données PostgreSQL
    pg.log         # Logs PostgreSQL
    .seeded        # Marqueur de seed initial
```

Pour réinitialiser l'application, supprimez ce dossier.

## Identifiants par défaut

- **Email** : admin@khazane.dz
- **Mot de passe** : admin123
