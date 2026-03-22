# Mode Opératoire d'Utilisation — Khazane-DZ

> Application de Gestion de Stock Intelligente — Agnostique au secteur d'activité

---

## Table des matières

1. [Connexion](#1-connexion)
2. [Tableau de bord](#2-tableau-de-bord)
3. [Gestion des produits](#3-gestion-des-produits)
4. [Mouvements de stock](#4-mouvements-de-stock)
5. [Alertes](#5-alertes)
6. [Stockage (Sites / Zones / Emplacements)](#6-stockage-sites--zones--emplacements)
7. [Recherche globale](#7-recherche-globale)
8. [Paramètres](#8-paramètres)
9. [Rôles et permissions](#9-rôles-et-permissions)
10. [Raccourcis clavier](#10-raccourcis-clavier)

---

## 1. Connexion

### Accéder à l'application

- **Mode développement** : `http://localhost:5173`
- **Mode production** : `http://localhost:3002`
- **Application desktop** : lancer l'application depuis le menu Démarrer

### Se connecter

1. Saisir l'adresse email dans le champ **Email**
2. Saisir le mot de passe dans le champ **Mot de passe**
3. Cliquer sur **Se connecter**

**Compte administrateur par défaut :**

| Champ         | Valeur               |
|--------------|----------------------|
| Email         | `admin@khazane.dz`   |
| Mot de passe  | `admin123`           |

> ⚠️ Changez ce mot de passe dès la première connexion en production.

Après connexion réussie, vous êtes redirigé vers le **Tableau de bord**.

---

## 2. Tableau de bord

Le tableau de bord est la page d'accueil de l'application. Il affiche une vue synthétique de l'activité.

### Cartes statistiques

Quatre indicateurs en temps réel sont affichés en haut de page :

| Indicateur           | Description                              |
|---------------------|------------------------------------------|
| **Produits actifs**  | Nombre total de produits dans le système |
| **Mouvements récents** | Nombre des derniers mouvements         |
| **Alertes actives**  | Alertes de seuil de stock déclenchées   |
| **Total opérations** | Volume global d'opérations              |

### Actions rapides

Quatre boutons permettent de créer rapidement un mouvement de stock :

- **Entrée** (vert) — Réception de marchandises
- **Sortie** (rouge) — Expédition / consommation
- **Transfert** (bleu) — Déplacement entre emplacements
- **Ajustement** (gris) — Correction d'inventaire

Cliquer sur un bouton ouvre directement le formulaire de mouvement pré-rempli avec le type correspondant.

### Derniers mouvements

Un tableau affiche les 10 derniers mouvements de stock avec :
- Référence du mouvement
- Type (badge coloré : vert/rouge/bleu/jaune)
- Produit concerné
- Quantité
- Date et heure

---

## 3. Gestion des produits

Accessible via le menu latéral **Produits**.

### Consulter les produits

- La liste affiche tous les produits paginés (20 par page)
- Utilisez la **barre de recherche** en haut pour filtrer par nom, SKU ou code-barres
- Naviguez entre les pages avec les boutons de pagination en bas

### Créer un produit

1. Cliquer sur le bouton **+ Nouveau produit**
2. Remplir le formulaire :

| Champ              | Description                        | Obligatoire |
|-------------------|------------------------------------|:-----------:|
| **Nom**            | Nom du produit                    | ✅          |
| **SKU**            | Code unique (Stock Keeping Unit)  | ✅          |
| **Catégorie**      | Catégorie du produit              | ✅          |
| **Unité de mesure** | kg, litre, pièce, etc.          | ✅          |
| **Code-barres**    | Code-barres EAN/UPC              | ❌          |

3. Cliquer sur **Créer**
4. Le produit apparaît dans la liste

### Importer des produits (Excel/CSV)

1. Cliquer sur le bouton **Importer** (icône Upload)
2. Sélectionner un fichier Excel (`.xlsx`) ou CSV (`.csv`)
3. L'import se fait automatiquement
4. Un message de confirmation indique le nombre de produits créés et mis à jour
5. En cas d'erreurs, le nombre de lignes en erreur est affiché

### Exporter les produits (Excel)

1. Cliquer sur le bouton **Exporter** (icône Download)
2. Un fichier `produits-khazane.xlsx` est automatiquement téléchargé
3. Le fichier contient tous les produits avec leurs informations complètes

---

## 4. Mouvements de stock

Accessible via le menu latéral **Mouvements**.

### Types de mouvements

| Type           | Icône | Couleur | Usage                                      |
|---------------|-------|---------|---------------------------------------------|
| **Entrée**     | ↓     | Vert    | Réception, achat, production               |
| **Sortie**     | ↑     | Rouge   | Expédition, consommation, vente            |
| **Transfert**  | ↔     | Bleu    | Déplacement d'un emplacement à un autre    |
| **Ajustement** | ⚙     | Jaune   | Correction d'inventaire, casse, périmé     |

### Créer un mouvement

1. Cliquer sur l'un des boutons **Entrée**, **Sortie** ou **Transfert** en haut de page
2. Remplir le formulaire :

| Champ                  | Description                          | Obligatoire |
|-----------------------|--------------------------------------|:-----------:|
| **Produit**            | Sélectionner le produit concerné    | ✅          |
| **Quantité**           | Nombre d'unités                     | ✅          |
| **Emplacement source** | D'où vient le stock (sortie/transfert) | Selon type |
| **Emplacement dest.**  | Où va le stock (entrée/transfert)   | Selon type  |
| **Référence**          | Numéro de bon, commande, etc.      | ❌          |
| **Notes**              | Commentaire libre                   | ❌          |

3. Cliquer sur **Valider**
4. Le stock est mis à jour automatiquement
5. Le mouvement apparaît dans la liste et sur le tableau de bord

### Consulter l'historique

- La liste affiche tous les mouvements paginés (20 par page)
- Chaque mouvement montre : référence, type (badge coloré), produit, quantité, date

---

## 5. Alertes

Accessible via le menu latéral **Alertes**.

### Fonctionnement

Les alertes sont générées automatiquement lorsque le stock d'un produit passe en dessous d'un seuil configuré (voir [Paramètres > Seuils](#seuils-de-stock)).

### Statuts des alertes

| Statut          | Couleur | Icône | Description                              |
|----------------|---------|-------|------------------------------------------|
| **Déclenchée**  | Rouge   | ⚠️    | Seuil atteint, action requise           |
| **Acquittée**   | Jaune   | 🕐    | Prise en compte, en cours de traitement |
| **Résolue**     | Vert    | ✅    | Stock reconstitué, alerte fermée        |

### Informations affichées

Pour chaque alerte :
- **Produit** concerné
- **Quantité actuelle** en stock
- **Seuil** configuré
- **Statut** avec badge coloré
- **Date** de déclenchement

---

## 6. Stockage (Sites / Zones / Emplacements)

Accessible via le menu latéral **Stockage**.

### Hiérarchie de stockage

L'application utilise une organisation à trois niveaux :

```
Site (Entrepôt / Magasin)
  └── Zone (Allée / Secteur / Quai)
       └── Emplacement (Étagère / Rack / Palette)
```

### Consulter les sites

La page affiche la liste des sites de stockage avec :
- **Nom** du site
- **Code** unique (ex: `ENT-01`)
- **Type** (Warehouse, Store, etc.)
- **Adresse**

### Données pré-configurées (seed)

| Niveau       | Code    | Nom                | Détail                      |
|-------------|---------|--------------------|-----------------------------|
| Site        | ENT-01  | Entrepôt Principal | Zone industrielle, Alger    |
| Zone        | A1      | Allée 1            | Type AISLE                  |
| Emplacements | A1-01 à A1-05 | Étagère 1 à 5 | Capacité max : 100 unités |

---

## 7. Recherche globale

### Accéder à la recherche

- Cliquer sur la **barre de recherche** dans la barre supérieure
- Ou utiliser le raccourci clavier **Ctrl + K**

### Utilisation

1. Taper au moins 2 caractères dans la barre de recherche
2. Les résultats apparaissent instantanément (recherche en temps réel avec délai de 300 ms)
3. Les résultats sont regroupés par catégorie :

| Catégorie       | Icône    | Champs recherchés                         |
|----------------|----------|-------------------------------------------|
| **Produits**    | 📦       | Nom, SKU, code-barres                    |
| **Catégories**  | 🗂️       | Nom + nombre de produits associés        |
| **Mouvements**  | ↔️       | Référence, type, produit associé         |
| **Emplacements**| 📍       | Label, code, zone et site parent         |

### Navigation dans les résultats

- Utilisez les flèches **↑** et **↓** du clavier pour naviguer
- Appuyez sur **Entrée** pour ouvrir l'élément sélectionné
- Appuyez sur **Échap** pour fermer la recherche

---

## 8. Paramètres

Accessible via le menu latéral **Paramètres**. La page contient 5 panneaux.

### Apparence (White-label)

Personnalisez l'apparence de l'application :

| Option                | Description                                          |
|----------------------|------------------------------------------------------|
| **Couleur principale** | 10 couleurs prédéfinies + curseur de teinte libre  |
| **Mode sidebar**      | Clair ou sombre                                     |
| **Nom de l'application** | Remplacer « Khazane-DZ » par votre marque       |
| **URL du logo**       | URL vers votre logo personnalisé                    |

Les modifications sont appliquées immédiatement et sauvegardées dans le navigateur (localStorage).

### Langue

Sélectionnez la langue de l'interface :

| Langue    | Code | Direction |
|----------|------|-----------|
| Français  | FR   | LTR       |
| English   | EN   | LTR       |
| العربية   | AR   | RTL       |

La sélection de l'arabe bascule automatiquement l'interface en mode **droite-à-gauche** (RTL).

### Gestion des utilisateurs

- **Consulter** la liste des utilisateurs avec leur rôle et email
- Chaque utilisateur affiche un badge de couleur selon son rôle :

| Rôle         | Badge    |
|-------------|----------|
| ADMIN        | Rouge    |
| MANAGER      | Bleu     |
| OPERATOR     | Vert     |
| VIEWER       | Gris     |

### Champs personnalisés

Ajoutez des champs supplémentaires aux fiches produit :

1. Cliquer sur **+ Ajouter un champ**
2. Renseigner :
   - **Nom** du champ (ex: « Poids net », « Fournisseur »)
   - **Type** : TEXT (par défaut)
   - **Obligatoire** : oui/non
3. Cliquer sur **Créer**

Pour supprimer un champ, cliquer sur l'icône **Corbeille** à côté du champ.

### Seuils de stock

Configurez des seuils d'alerte pour être prévenu quand le stock est bas :

1. Cliquer sur **+ Ajouter un seuil**
2. Sélectionner le **produit**
3. Définir la **quantité minimale**
4. Cliquer sur **Créer**

Quand le stock d'un produit passe sous le seuil, une alerte est automatiquement déclenchée (visible dans la page **Alertes**).

### Catégories

Gérez l'arborescence des catégories de produits :

1. Cliquer sur **+ Ajouter une catégorie**
2. Saisir le **nom** de la catégorie
3. Sélectionner éventuellement une **catégorie parente**
4. Cliquer sur **Créer**

Les catégories supportent une hiérarchie illimitée (catégories et sous-catégories).

---

## 9. Rôles et permissions

L'application utilise un système de contrôle d'accès basé sur les rôles (RBAC) avec 4 niveaux :

| Rôle         | Description                                      | Accès                                    |
|-------------|--------------------------------------------------|------------------------------------------|
| **ADMIN**    | Administrateur complet                          | Accès total, paramètres, utilisateurs    |
| **MANAGER**  | Responsable de site                             | Gestion produits, mouvements, alertes    |
| **OPERATOR** | Opérateur de stock                              | Création de mouvements, consultation     |
| **VIEWER**   | Consultation seule                              | Lecture seule sur toutes les pages       |

Les utilisateurs sont assignés à un ou plusieurs sites de stockage, limitant leur périmètre d'action.

---

## 10. Raccourcis clavier

| Raccourci     | Action                    |
|--------------|---------------------------|
| **Ctrl + K**  | Ouvrir la recherche globale |
| **↑ / ↓**     | Naviguer dans les résultats de recherche |
| **Entrée**    | Ouvrir le résultat sélectionné |
| **Échap**     | Fermer la recherche / un modal |

---

## Navigation générale

### Barre latérale (Sidebar)

Le menu latéral permet d'accéder à toutes les sections :

| Icône | Section        | Description                          |
|-------|---------------|--------------------------------------|
| 📊    | Tableau de bord | Vue synthétique de l'activité       |
| 📦    | Produits       | Gestion du catalogue produits       |
| ↔️     | Mouvements     | Historique et création de mouvements |
| ⚠️     | Alertes        | Alertes de seuil de stock           |
| 🏢    | Stockage       | Sites, zones, emplacements          |
| ⚙️     | Paramètres     | Configuration de l'application      |

### Barre supérieure

- **Sélecteur de site** : choisir le site de travail actuel
- **Recherche globale** : barre de recherche (ou Ctrl+K)
- **Notifications** : cloche pour les alertes récentes
- **Profil** : accès aux informations du compte connecté

---

### Swagger API

La documentation complète de l'API REST est accessible à l'adresse :

```
http://localhost:3002/api
```

Elle permet de tester tous les endpoints directement depuis le navigateur.

---

*Document généré pour Khazane-DZ v0.1.0*
