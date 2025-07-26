# 🧪 Checklist de Tests - AfriMarket

## 📋 **Tests des Parcours Utilisateur**

### **1. Parcours Client** 👤

#### **Navigation générale**
- [ ] **Accueil** : Page d'accueil se charge correctement
- [ ] **Header** : Logo, recherche, menus fonctionnent
- [ ] **Footer** : Liens et newsletter fonctionnent
- [ ] **Menu latéral** : Navigation responsive

#### **Catalogue et produits**
- [ ] **Liste des produits** : Affichage correct
- [ ] **Filtres** : Recherche, prix, marques fonctionnent
- [ ] **Pagination** : Navigation entre pages
- [ ] **Favoris** : Ajout/retrait des favoris
- [ ] **Détail produit** : Images, description, prix
- [ ] **Galerie d'images** : Navigation carousel
- [ ] **Ajout au panier** : Fonctionne depuis le détail

#### **Panier et commande**
- [ ] **Panier** : Affichage des produits ajoutés
- [ ] **Modification quantité** : + et - fonctionnent
- [ ] **Suppression** : Retirer du panier
- [ ] **Calcul total** : Prix correct
- [ ] **Checkout** : Formulaire de commande
- [ ] **Adresses** : Sélection d'adresse sauvegardée
- [ ] **Validation commande** : Création de commande

#### **Compte utilisateur**
- [ ] **Inscription** : Création de compte
- [ ] **Connexion** : Authentification
- [ ] **Profil** : Modification des informations
- [ ] **Adresses** : Ajout/modification/suppression
- [ ] **Commandes** : Historique des commandes
- [ ] **Détail commande** : Affichage complet
- [ ] **Facture PDF** : Téléchargement fonctionne

#### **Aide et support**
- [ ] **Menu Aide** : Tous les liens fonctionnent
- [ ] **Pages d'aide** : Contenu affiché
- [ ] **Chat en direct** : Interface visible

---

### **2. Parcours Admin** 🔧

#### **Authentification**
- [ ] **Connexion admin** : admin/admin123
- [ ] **Protection routes** : Redirection si non connecté
- [ ] **Déconnexion** : Fonctionne correctement

#### **Gestion des produits**
- [ ] **Liste produits** : Affichage complet
- [ ] **Ajout produit** : Formulaire avec validation
- [ ] **Modification** : Édition des données
- [ ] **Suppression** : Confirmation et suppression
- [ ] **Validation** : Messages d'erreur corrects

#### **Gestion des catégories**
- [ ] **Liste catégories** : Affichage
- [ ] **Ajout catégorie** : Création
- [ ] **Modification** : Édition
- [ ] **Suppression** : Avec avertissement produits

#### **Gestion des utilisateurs**
- [ ] **Liste utilisateurs** : Affichage
- [ ] **Ajout utilisateur** : Création
- [ ] **Modification** : Édition
- [ ] **Suppression** : Confirmation

#### **Statistiques**
- [ ] **Données dynamiques** : Chiffres réels
- [ ] **Graphiques** : Affichage correct
- [ ] **Top produits** : Liste mise à jour
- [ ] **Évolution** : Commandes par mois

---

## 📱 **Tests Responsive**

### **Mobile (320px-768px)**
- [ ] **Header** : Menu hamburger fonctionne
- [ ] **Catalogue** : Grille adaptée
- [ ] **Formulaires** : Champs empilés
- [ ] **Admin** : Tableaux scrollables
- [ ] **Navigation** : Touch-friendly

### **Tablette (768px-1024px)**
- [ ] **Layout** : Adaptation intermédiaire
- [ ] **Grilles** : Colonnes adaptées
- [ ] **Menus** : Affichage correct

### **Desktop (1024px+)**
- [ ] **Layout** : Utilisation optimale de l'espace
- [ ] **Sidebar** : Navigation latérale
- [ ] **Tableaux** : Affichage complet

---

## 🔍 **Vérification des Données**

### **Cohérence des produits**
- [ ] **Images** : Toutes les URLs sont valides
- [ ] **Descriptions** : Contenu cohérent
- [ ] **Prix** : Format FCFA correct
- [ ] **Stock** : Nombres positifs
- [ ] **Catégories** : Correspondance avec la liste
- [ ] **Marques** : Cohérence des noms

### **Données utilisateurs**
- [ ] **Emails** : Format valide
- [ ] **Dates** : Format cohérent
- [ ] **Adresses** : Informations complètes

### **Commandes**
- [ ] **Calculs** : Totaux corrects
- [ ] **Statuts** : États cohérents
- [ ] **Dates** : Format ISO

---

## 🐛 **Bugs à Vérifier**

### **Fonctionnels**
- [ ] **Double-clic** : Pas de soumission multiple
- [ ] **Navigation** : Pas de perte de données
- [ ] **Validation** : Messages d'erreur clairs
- [ ] **Chargement** : Pas de freeze

### **Visuels**
- [ ] **Alignement** : Éléments bien alignés
- [ ] **Couleurs** : Contrastes suffisants
- [ ] **Typographie** : Lisibilité
- [ ] **Animations** : Fluides et appropriées

### **Performance**
- [ ] **Temps de chargement** : Acceptable
- [ ] **Images** : Optimisées
- [ ] **Mémoire** : Pas de fuites
- [ ] **Réseau** : Requêtes optimisées

---

## ✅ **Critères de Validation**

### **Parcours Client** ✅
- [ ] Inscription → Catalogue → Ajout panier → Checkout → Commande ✅
- [ ] Connexion → Profil → Modification données ✅
- [ ] Recherche → Filtres → Détail produit → Favoris ✅

### **Parcours Admin** ✅
- [ ] Connexion → Dashboard → Gestion produits → Statistiques ✅
- [ ] CRUD complet pour produits, catégories, utilisateurs ✅
- [ ] Protection des routes et authentification ✅

### **Responsive** ✅
- [ ] Mobile : Navigation et formulaires fonctionnels ✅
- [ ] Tablette : Layout adapté ✅
- [ ] Desktop : Utilisation optimale de l'espace ✅

---

## 🎯 **Résultat Attendu**

**Application 100% fonctionnelle** avec :
- ✅ Tous les parcours utilisateur opérationnels
- ✅ Interface responsive sur tous les écrans
- ✅ Données cohérentes et valides
- ✅ Performance optimale
- ✅ UX fluide et intuitive

---

*Dernière mise à jour : [Date]*
*Testé par : [Nom]* 