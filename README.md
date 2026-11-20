# Nahki – نحكي

**Le tableau qui parle en derja.**

Nahki est un tableau de communication par pictogrammes pour les enfants non verbaux en Tunisie. L'enfant touche une image, le tableau dit le mot en derja ; il peut enchaîner plusieurs pictos pour faire une phrase. Les parents ajoutent leurs propres photos avec leur propre voix, et une bibliothèque partagée, validée par des orthophonistes, permet aux familles d'échanger leurs pictos.

Projet Web – Groupe 7 – Objectif 4 : finalisation du frontend et optimisation du site. L'interface est en français avec les mots en derja (latin et arabe) ; le code et les commentaires sont en français.

<!-- Capture principale : ajouter docs/captures/tableau.png puis décommenter -->
<!-- [![Le tableau de l'enfant](docs/captures/tableau.png)](docs/captures/tableau.png) -->

## Sommaire

1. [Lancer le projet](#lancer-le-projet)
2. [Fonctionnalités](#fonctionnalités)
3. [Le tableau qui parle](#le-tableau-qui-parle)
4. [Choix techniques](#choix-techniques)
5. [Architecture](#architecture)
6. [Backend Supabase](#backend-supabase)
7. [Modèle de données](#modèle-de-données)
8. [Qualité : tests, accessibilité, performance](#qualité--tests-accessibilité-performance)
9. [Workflow Git](#workflow-git)
10. [Utilisation de l'IA](#utilisation-de-lia)
11. [Prochaines étapes](#prochaines-étapes)
12. [Crédits](#crédits)

---

## Lancer le projet

### Prérequis

| Outil | Version | Pourquoi |
|---|---|---|
| Node.js | 22 LTS ou plus | Angular CLI 22 |
| npm | 11 (fourni avec Node) | `packageManager` du projet |
| Un compte Supabase (gratuit) | – | Uniquement pour la bibliothèque, les comptes et l'espace pro |

### Démarrage

```bash
git clone https://github.com/talelelamriii/nahki.git
cd nahki
npm install
npm start          # = ng serve
```

Ouvrir http://localhost:4200. Le **tableau** et l'**espace parent** marchent tout de suite, sans compte ni backend.

**Tester sur une tablette** du même réseau Wi-Fi : `npx ng serve --host 0.0.0.0`, puis ouvrir `http://<adresse-IP-du-PC>:4200`. Le micro et l'appareil photo ne fonctionnent qu'en `localhost` ou en HTTPS : sur tablette, l'ajout de photo par fichier marche, l'enregistrement de la voix demande HTTPS.

### Configurer le backend (une fois)

1. Créer un projet sur https://supabase.com.
2. **SQL Editor → New query** : coller tout `supabase/schema.sql`, puis **Run**. Le script peut être relancé sans erreur.
3. **Authentication → Sign In / Providers → Email** : désactiver **Confirm email** pendant le développement.
4. **Project Settings → API** : copier l'URL et la clé **publishable / anon** dans `src/app/core/config/supabase.config.ts`. Ne jamais y mettre la clé **service_role**.
5. Créer un compte depuis `/inscription`, puis le passer orthophoniste :
   ```sql
   update public.profils set role = 'pro'
   where id = (select id from auth.users where email = 'ortho@exemple.tn');
   ```

### Commandes utiles

| Commande | Effet |
|---|---|
| `npm start` | Serveur de développement sur le port 4200 |
| `npm run build` | Build de production dans `dist/nahki/` |
| `npm run watch` | Build de développement en continu |
| `npm test` | Tests unitaires (Vitest) |
| `npm run serve:ssr:nahki` | Sert le build avec le serveur Express (toutes les routes sont rendues côté client) |
| `npx prettier --write src` | Formate le code selon `.prettierrc` |
| `ng lint` | Analyse du code avec ESLint (après `ng add angular-eslint`, voir Qualité) |

> Les photos et les voix ajoutées par la famille sont dans IndexedDB : vider les données du site dans le navigateur les efface.

---

## Fonctionnalités

### Pages

| Écran | Route | Contenu |
|---|---|---|
| 01 Accueil | `/` | Présentation, bouton « Ouvrir le tableau », une carte par public (enfant, parent, orthophoniste) |
| 02-03 Tableau | `/tableau` | Plein écran, sans menu : onglets de catégories, grille de pictos, barre de phrase |
| 04 Verrou parent | `/parent/verrou` | Consigne écrite aléatoire (« touchez le triangle ») parmi 4 formes mélangées |
| 14 Mes pictos | `/parent/mes-pictos` | Filtrer, masquer/afficher, supprimer, partager vers la bibliothèque |
| 05 Ajouter un picto | `/parent/ajouter` | Photo, mot, mot arabe, catégorie, voix, aperçu en direct |
| 11-12 Connexion / Inscription | `/connexion`, `/inscription` | Comptes parents ; redirection selon le rôle |
| 06 Bibliothèque | `/bibliotheque` | Pictos publiés, recherche, filtres, écoute, « + À mon tableau » |
| 18 Mes propositions | `/mes-propositions` | Statut de chaque picto envoyé, motif en cas de refus |
| 09 Espace pro | `/pro` | Propositions en attente, valider ou refuser avec un motif |
| 07 Fiche picto | `/bibliotheque/:id` | Grande image, voix, « + À mon tableau », pictos de la même catégorie |
| 15 Réglages | `/parent/reglages` | Taille des cases, mot arabe, voix au toucher, longueur de phrase, aperçu en direct |
| 16 Sauvegarde | `/parent/sauvegarde` | Exporter le tableau de la famille (photos et voix) dans un fichier, le restaurer |
| 17 Imprimer | `/parent/imprimer` | Tableau papier par catégorie, mise en page A4 |
| 10 Aide | `/aide` | Questions fréquentes par profil (enfant, parent, bibliothèque) |
| 21 À propos | `/a-propos` | Présentation du projet et crédits |
| 22 Confidentialité | `/confidentialite` | Ce qui reste sur l'appareil, ce qui va en ligne |
| 23 Contact | `/contact` | Formulaire validé, ouvert dans la messagerie (`mailto`) |

Tous les écrans prévus du sitemap sont développés : il n'y a plus de page « à venir ».

### Vague 1 – le cœur

- [x] **Tableau** : 44 pictos de base répartis en 7 catégories (+ « Mes photos » pour ceux de la famille), une couleur par catégorie.
- [x] **Le mot au toucher** : voix enregistrée si elle existe, synthèse vocale sinon.
- [x] **Barre de phrase** : lire toute la phrase (le mot en cours est surligné), effacer le dernier mot, tout effacer.
- [x] **Verrou parent** : un guard renvoie vers le verrou, puis ramène à la page demandée ; il se referme au retour au tableau.
- [x] **Ajouter un picto** : formulaire réactif (mot obligatoire, 24 caractères max), photo par appareil ou fichier réduite à 512 px en WebP, enregistrement de la voix.
- [x] **Mes pictos** : masquer un picto sans le supprimer, supprimer ses propres photos.

### Vague 2 – la bibliothèque partagée

- [x] **Comptes** : inscription parent (prénom, e-mail, mot de passe de 8 caractères minimum, acceptation des règles), connexion, déconnexion.
- [x] **Partager** : envoie la photo, la voix et le mot avec le statut « en attente ».
- [x] **Validation** : l'orthophoniste publie ou refuse avec un motif ; le parent voit le résultat.
- [x] **« + À mon tableau »** : copie un picto publié (image et voix) dans le tableau de l'appareil.

### Objectif 4 – finition du frontend

- [x] **Toutes les pages du sitemap** : fiche picto, réglages, sauvegarde, impression, aide, à propos, confidentialité, contact.
- [x] **Données dynamiques** : lecture d'un picto par identifiant et des pictos de la même catégorie (Supabase) ; réglages appliqués en direct au tableau ; export et import JSON avec validation de chaque picto.
- [x] **États de chargement** : squelettes (skeletons) à la forme du contenu attendu sur le tableau, la bibliothèque, la fiche picto, Mes propositions, l'espace pro et l'impression ; spinners sur les actions longues ; messages d'erreur et listes vides.
- [x] **Animations légères** : survol et appui des boutons et des cartes, apparition douce du contenu chargé, fondu entre les pages (View Transitions API), menu burger animé.
- [x] **Navigation responsive** : menu burger sur smartphone (`aria-expanded`, liens retirés du parcours clavier quand il est fermé).
- [x] **Mouvement réduit** : `prefers-reduced-motion` coupe toutes les animations.
- [x] **Composants réutilisés** : `picto-card` sert au tableau, à l'aperçu des réglages, à l'impression et aux listes (nouvelles options `arabe` et `differe`) ; l'interrupteur et les squelettes sont des styles globaux.

### Petits plus

Notifications discrètes (« Picto ajouté », « Envoyé ✓ ») ; emoji de secours si l'image ARASAAC ne charge pas ; cache local des images ARASAAC ; chargement de chaque page à la demande ; mots arabes affichés avec `lang="ar"` et une police adaptée ; retour à la page demandée après connexion ou verrou (paramètre `suite`).

### Captures d'écran

<!-- Déposer les captures dans docs/captures/ avec ces noms, puis décommenter le tableau.
| Tableau (tablette) | Ajouter un picto |
|---|---|
| ![](docs/captures/tableau.png) | ![](docs/captures/ajouter.png) |
| **Bibliothèque** | **Espace pro** |
| ![](docs/captures/bibliotheque.png) | ![](docs/captures/pro.png) |
-->

Maquettes et charte graphique : voir le livrable de l'Objectif 2.

---

## Le tableau qui parle

C'est la fonctionnalité centrale : un enfant qui ne parle pas doit être compris, dans la langue de sa maison. Code : `src/app/core/services/audio.service.ts`, `src/app/shared/components/sentence-bar/`.

**Voix humaine d'abord.** Quand le parent a enregistré sa voix pour un picto, c'est elle qui est jouée. Les pictos de base peuvent aussi recevoir un son (`"son": "audio/nekol.mp3"` dans `public/data/pictos.json`).

**Secours.** Sans son enregistré, la synthèse vocale du navigateur lit le mot arabe si une voix arabe est installée, sinon le mot latin. Elle ne parle pas derja : c'est un secours, pas une solution.

**Phrase.** Les pictos touchés s'ajoutent à la barre de phrase. « Lire » les joue l'un après l'autre et surligne le mot en cours, pour que l'enfant associe l'image au son.

**Images.** Les pictos de base viennent de l'API publique d'ARASAAC ; l'identifiant trouvé pour chaque mot est gardé en cache dans `localStorage`. Si l'API ne répond pas, la case affiche un emoji.

**Exemple** : l'enfant touche *Manger → nekol* puis *Personnes → mama*. La barre affiche « nekol mama » ; « Lire » joue la voix enregistrée par le parent pour chaque mot, l'un après l'autre.

---

## Choix techniques

| Couche | Choix | En une ligne |
|---|---|---|
| Framework | Angular 22, composants standalone | Le sitemap devient des routes, chaque écran un composant |
| État | Signals | Phrase, catégorie active et liste de pictos se mettent à jour sans code de synchronisation |
| Routage | Lazy loading + guards (`parentGuard`, `authGuard`, `proGuard`) | Premier affichage rapide, espaces protégés |
| Formulaires | Reactive Forms | Validation et messages d'erreur |
| Rendu | `@angular/ssr`, toutes les routes en `RenderMode.Client` | Micro, caméra, son et IndexedDB n'existent que dans le navigateur |
| Données locales | IndexedDB + localStorage + sessionStorage | Photos et voix sur l'appareil ; réglages ; verrou le temps de la visite |
| Pictos | API REST ARASAAC | Pictogrammes libres conçus pour la communication alternative |
| Backend | Supabase (PostgreSQL, Auth, Storage) | Comptes, bibliothèque et fichiers sans écrire de serveur |
| Sécurité des données | Row Level Security | Les règles d'accès sont dans la base, pas dans le code du site |
| Styles | CSS pur + variables (`src/styles.css`) | La charte graphique définie une seule fois ; aucune couleur en dur |
| Polices | Baloo Bhaijaan 2, Nunito, Noto Sans Arabic | Latin et arabe dans un même style |
| Tests | Vitest + jsdom | Lanceur par défaut d'Angular 22 |
| Outils | TypeScript 6, Prettier, EditorConfig | Même format de code pour toute l'équipe |

**Pourquoi pas de serveur à nous ?** Le tableau doit marcher sans compte et sans réseau une fois chargé. Seule la bibliothèque a besoin d'un backend, et Supabase fournit base, comptes et stockage avec des règles d'accès vérifiées côté base.

---

## Architecture

```
nahki/
├── public/
│   └── data/pictos.json        44 pictos de base (mot, mot arabe, catégorie, clé ARASAAC, emoji)
├── supabase/
│   └── schema.sql              tables, règles d'accès, stockage (relançable)
└── src/
    ├── styles.css              variables de la charte graphique
    ├── server.ts               serveur Express (SSR, rendu client)
    └── app/
        ├── app.routes.ts       routes calquées sur le sitemap (numéro d'écran en commentaire)
        ├── core/               logique sans affichage
        │   ├── models/         Picto, PictoPartage, CategorieId
        │   ├── data/           catégories et couleurs
        │   ├── config/         connexion à Supabase
        │   ├── services/       pictos, famille-db (IndexedDB), audio, arasaac, parent-lock,
        │   │                   toast, supabase, auth, bibliotheque
        │   ├── guards/         parentGuard, authGuard, proGuard
        │   └── utils/          réduction des photos
        ├── shared/components/  picto-card, category-tabs, sentence-bar, voice-recorder, toast
        ├── layouts/            adult-layout (en-tête + pied), parent-layout (menu)
        └── features/           une page par écran : accueil, tableau, espace-parent,
                                compte, bibliotheque, espace-pro, a-venir
```

Les pages ne lisent jamais les données directement : tout passe par `PictosService` (pictos de base + famille) et `BibliothequeService` (Supabase).

---

## Backend Supabase

Il n'y a pas d'API REST écrite à la main : le site appelle Supabase via `@supabase/supabase-js`, et ce sont les règles d'accès de la base qui décident.

| Action | Où | Qui | Règle |
|---|---|---|---|
| Lire les pictos publiés | `pictos_partages` (select) | Tout le monde, même sans compte | `statut = 'publie'` |
| Lire ses propositions | `pictos_partages` (select) | Parent connecté | `auteur = auth.uid()` |
| Lire toutes les propositions | `pictos_partages` (select) | Orthophoniste | `est_pro()` |
| Proposer un picto | `pictos_partages` (insert) | Parent connecté | à son nom et `statut = 'en_attente'` uniquement |
| Publier / refuser | `pictos_partages` (update) | Orthophoniste | `est_pro()` |
| Lire son profil | `profils` (select) | Compte connecté | `id = auth.uid()` |
| Déposer photo et voix | Storage `pictos/<id>/…` | Parent connecté | seulement dans son propre dossier |
| Lire les fichiers | Storage `pictos` (public) | Tout le monde | bucket public |

Un parent ne peut donc ni publier lui-même, ni proposer au nom d'un autre, même en appelant Supabase en dehors du site.

---

## Modèle de données

**`profils`** : un par compte (`id`, `prenom`, `role` ∈ `parent`/`pro`, `cree_le`). Créé automatiquement à l'inscription par un trigger, avec le rôle `parent`.

**`pictos_partages`** : `mot` (1 à 24 caractères), `mot_ar`, `categorie` (8 valeurs autorisées), `image_path`, `son_path`, `statut` ∈ `en_attente`/`publie`/`refuse`, `motif`, `decide_par`, `decide_le`, `auteur`. Index sur `(statut, cree_le desc)` pour la bibliothèque et l'espace pro.

**Sur l'appareil** :

| Donnée | Stockage | Pourquoi |
|---|---|---|
| Pictos de la famille (photo + voix) | IndexedDB | Stocke des fichiers ; ne quitte pas l'appareil |
| Pictos masqués, cache ARASAAC, pictos déjà partagés | localStorage | Petits réglages propres à l'appareil |
| Verrou ouvert | sessionStorage | Le temps de la visite seulement |

---

## Qualité : tests, accessibilité, performance

### Tests

| Suite | Outil | Ce qui est couvert |
|---|---|---|
| Unitaires | Vitest + jsdom | Création de l'application (`app.spec.ts`) ; validation des réglages et des fichiers de sauvegarde abîmés (`reglages.service.spec.ts`) |
| Scénario backend | Manuel | Les 8 étapes ci-dessous |

```bash
npm test
```

**Scénario de test du backend** : (1) bibliothèque vide sans compte ; (2) inscription d'un parent ; (3) partager un picto → une ligne « en_attente » dans `pictos_partages` et les fichiers dans Storage ; (4) « En attente » dans Mes propositions ; (5) un parent qui ouvre `/pro` est renvoyé à l'accueil ; (6) un compte « pro » valide ; (7) déconnecté, le picto apparaît dans la bibliothèque et « + À mon tableau » l'ajoute avec sa voix ; (8) un refus avec motif s'affiche chez le parent.

### Accessibilité

- Contour de focus visible de 3 px sur tous les éléments (`:focus-visible`).
- Bordures des contrôles à 3,6:1 ; texte sombre sur les couleurs claires, texte blanc sur Lieux et Personnes pour garder le contraste ; doré du logo arabe assombri (`#8a5d00`) pour rester lisible sur blanc.
- Cibles tactiles de 48 px pour les adultes et 56 px pour les onglets de l'enfant.
- Textes arabes marqués `lang="ar"` pour la lecture d'écran et la police.
- Chargements annoncés avec `aria-busy`, résultats d'import annoncés avec `aria-live`.
- Questions de l'aide en `<details>`/`<summary>` natifs, utilisables au clavier ; tableau de la page Confidentialité avec en-têtes `scope="col"`.
- Animations désactivées pour les personnes qui ont choisi « réduire les animations » dans leur système.

### Responsive

Grille du tableau en 5 colonnes sur tablette et 3 sur smartphone (point de rupture à 600 px) ; en-tête en menu burger, menu parent en barre du bas et formulaires en une colonne sous 700 px ; fiche picto et réglages en une colonne sur smartphone ; impression adaptée à une page A4.

### Performance

- Chaque page est chargée à la demande (`loadComponent`).
- Photos réduites à 512 px en WebP avant enregistrement (une photo de téléphone fait souvent 3 à 5 Mo).
- Identifiants ARASAAC mis en cache ; données de base chargées une seule fois.
- Budgets de build : 500 kB d'avertissement, 1 MB d'erreur pour le bundle initial.
- Images différées (`loading="lazy"`) partout, sauf à l'impression où toutes doivent être prêtes.
- Retour en haut de page à chaque navigation (`withInMemoryScrolling`).

### Qualité du code

- Code vérifié par le compilateur Angular en mode strict, templates compris ; aucun import ni variable inutilisé (`noUnusedLocals`).
- Prettier (`.prettierrc`) pour un formatage homogène.
- ESLint : à installer une fois avec `ng add angular-eslint`, puis `ng lint`.

### Sécurité

Règles d'accès dans la base (RLS) ; seule la clé publique est dans le code ; dépôt de fichiers limité au dossier de l'utilisateur ; photos et voix de la famille gardées sur l'appareil tant qu'elles ne sont pas partagées ; mot de passe de 8 caractères minimum ; espace pro protégé côté site (guard) et côté base.

### Limites connues

- Les pictos de base n'ont pas encore de voix enregistrée en derja : la synthèse vocale sert de secours.
- Peu de tests automatiques ; le backend est testé à la main.
- Audit Lighthouse et tests multi-navigateurs à finaliser.
- Le formulaire de contact passe par la messagerie de l'utilisateur (pas de serveur d'envoi d'e-mails).
- Les pictos de la famille sont liés à un appareil : la sauvegarde (écran 16) permet de les déplacer à la main.

---

## Workflow Git

`main` reste stable. Une branche par fonctionnalité (`feature/bibliotheque`, `feature/connexion`…), fusionnée dans `main` par une pull request relue par un autre membre. Tâches suivies dans GitHub Projects.

| Branche | Contenu |
|---|---|
| `main` | Version stable, livrée |
| `feature/*` | Une fonctionnalité en cours |

---

## Utilisation de l'IA

**Outil** : Claude (Anthropic).

**Ce que l'équipe a fait** : l'idée, le public, le sitemap, les maquettes et la charte graphique (Objectifs 1 et 2), les choix de fonctionnalités et leur ordre, les tests sur tablette et téléphone.

**Ce que l'IA a fait** : aide à l'écriture du code Angular, du schéma Supabase et de la documentation, à partir de nos maquettes et de nos consignes.

**Comment on a vérifié** : chaque écran lancé et testé dans le navigateur ; scénario backend complet rejoué sur notre projet Supabase ; règles d'accès testées avec un compte parent et un compte pro.

**Limites** : l'IA ne connaît pas la derja parlée par chaque famille ; les mots et les voix restent à valider avec des parents et des orthophonistes.

---

## Prochaines étapes

1. **Voix des pictos de base** enregistrées en derja par l'équipe.
2. **Proposer un picto** directement depuis la bibliothèque (écran 08).
3. **Tests** : tests unitaires des services, audit Lighthouse, test sur plusieurs navigateurs.
4. **Application installable** (PWA) qui fonctionne sans connexion.

---

## Crédits

- Pictogrammes : Sergio Palao, ARASAAC (https://arasaac.org), licence CC BY-NC-SA.
- Backend : Supabase (https://supabase.com).
- Polices : Baloo Bhaijaan 2, Nunito, Noto Sans Arabic (Google Fonts).
