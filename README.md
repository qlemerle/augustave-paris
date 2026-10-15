# Augustave Paris : site vitrine et boutique

Site Next.js (App Router, TypeScript) pour la marque de bijoux faits main Augustave Paris.
Il fonctionne tout de suite avec un catalogue de démonstration, et se branche sur Shopify
en changeant deux variables d'environnement.

## Démarrer

```bash
npm install
cp .env.example .env.local
npm run dev        # http://localhost:3000
npm run build      # vérification de production
```

## Pages

| URL | Contenu |
| --- | --- |
| `/` | Accueil : héros en fondu, collections, catégories, nouveautés, sur-mesure, coups de cœur, Instagram, newsletter |
| `/boutique`, `/boutique/<catégorie>` | Tous les bijoux, filtres par catégorie, tri |
| `/collections`, `/collections/<collection>` | Univers Rouge Love, La Nacrée, Bronze, Grey Shades, Texas Stones, Le cœur de l'Océan, Édition Fall |
| `/produit/<handle>` | Fiche produit : galerie, tailles, quantité, ajout au panier, matières, entretien |
| `/sur-mesure` | Édition Votre Histoire, avec formulaire de demande |
| `/atelier` | Atelier interactif : on compose son collier (fil, longueur, perles, pendentif), il se dessine en direct |
| `/maison` | Histoire de la marque |
| `/infos/<page>` | Livraison & retours, entretien, CGV, mentions légales, confidentialité |

Catégories : Colliers, Sautoirs, Ras-de-cou, Bracelets, Boucles d'oreilles.

## Ajouter les photos

Aucune modification de code n'est nécessaire : il suffit de déposer les fichiers (jpg, png, webp ou avif)
dans `public/images/`. Tant qu'une photo manque, une illustration du bijou s'affiche à sa place.

| Où | Nom du fichier |
| --- | --- |
| Produits | `public/images/produits/<handle>-1.jpg`, `<handle>-2.jpg`… (la 2e s'affiche au survol) |
| Catégories | `public/images/categories/<handle>.jpg` (ex. `colliers.jpg`) |
| Collections | `public/images/collections/<handle>.jpg` (ex. `rouge-love.jpg`) |
| Héros de l'accueil | `public/images/accueil/hero-1.jpg`, `hero-2.jpg`, `hero-3.jpg` |
| Bloc sur-mesure de l'accueil | `public/images/accueil/sur-mesure.jpg`, `sur-mesure-2.jpg` |
| Page sur-mesure | `public/images/sur-mesure/atelier.jpg` |
| Page La Maison | `public/images/maison/fondatrice.jpg`, `maison/atelier.jpg` |

Les handles des produits sont dans `lib/commerce/mock/catalog.json` (ex. `collier-rouge-love`).
Format conseillé : portrait 4:5, 1600 px de large minimum. Avec Shopify, les photos produits
viennent directement de Shopify.

### Photos actuelles

- **Photos portées** (accueil, collections, Maison, colliers Rouge Love, La Nacrée, Bronze, Grey Shades,
  Cœur de l'Océan, Texas Stones) : recadrées depuis les captures Instagram, textes et logos incrustés effacés.
  Elles restent en basse définition : les remplacer par les originaux (même nom de fichier).
- **Visuels « à plat »** (bijoux sur lin, lumière de fin de journée) : générés par programme pour les
  bijoux sans photo, la 2e vue de chaque bijou, les catégories, l'Édition Fall et la table de l'atelier.
  Ce sont des illustrations fidèles aux couleurs et aux formes, pas des photos : à remplacer par de vraies
  photos dès qu'elles existent. Générateur : `tools/visuels/` (`cd tools/visuels && node render.cjs out`, nécessite Playwright).

## Histoire et effets immersifs

- Textes de l'histoire de la marque et de la créatrice : `story` dans `lib/site.ts`
  (manifeste, 5 chapitres d'inspiration, portrait, le geste, signatures). Prénom et parcours à compléter.
- Portrait de la créatrice : `public/images/maison/fondatrice.jpg`.
- Effets (écran d'introduction, rideau entre les pages, fil d'or qui s'enfile de perles au défilement,
  texte qui s'illumine, chapitres en défilement horizontal, parallaxe) : `lib/fx.mjs`,
  branchés par `components/Fx.tsx`. Tous sont désactivés si le visiteur a demandé moins d'animations.

## Direction artistique

- **Le fil** : un fil d'or court le long de la marge gauche ; à chaque section, une perle aux couleurs
  d'une collection s'y enfile. C'est l'élément signature ; le reste reste sobre.
- **Couleurs** : encre marine `#0e2340` et or `#c6a15b` (logo), fond nacre `#f4f2ef` (gris perle des coquillages),
  rouge Rouge Love `#b3262e` réservé aux petits détails.
- **Typographies** : Bodoni Moda (didone de maison de couture) pour les titres, Jost (héritière de Futura) pour le texte.
- **Règles** : titres sans mot isolé en italique, pas de petites capitales espacées (sauf le logotype),
  pas de flèches décoratives dans les boutons.

## Brancher Shopify

La boutique Shopify `zv0abg-pj.myshopify.com` est déjà préparée (octobre 2026) :
- les 7 collections (`rouge-love`, `la-nacree`, `bronze`, `grey-shades`, `texas-stones`, `coeur-de-l-ocean`,
  `edition-fall`) avec leur texte, leur image et les métachamps `custom.surtitre` / `custom.couleur` ;
- les 18 bijoux du fichier Excel, **en brouillon**, avec tailles en variantes, photos, badges en tags et
  métachamps `custom.accroche` / `custom.materiaux` ;
- le produit technique `creation-atelier` (actif, publié sur aucun canal) : 42 variantes de 45 € à 250 €
  par pas de 5 € ;
- les définitions des métachamps, lisibles par la Storefront API.

Pour que le site lise la boutique :

1. Dans Shopify : installer le canal de vente **Headless** (Shopify App Store, gratuit), créer une vitrine
   et copier son **jeton d'accès public** (Storefront API).
2. Publier sur ce canal Headless les bijoux prêts à la vente (passer le statut à « Actif ») et le produit
   « Création de l'atelier ». Un produit en brouillon ou non publié sur ce canal reste invisible du site.
3. Renseigner `.env.local` (ou les variables d'environnement de l'hébergeur) :
   ```
   COMMERCE_PROVIDER=shopify
   SHOPIFY_STORE_DOMAIN=zv0abg-pj.myshopify.com
   SHOPIFY_STOREFRONT_ACCESS_TOKEN=...
   ```
4. Le bouton « Passer commande » crée un panier Shopify et redirige vers le paiement Shopify
   (CB, Apple Pay, PayPal… selon ce qui est activé dans Shopify). L'abonnement Shopify d'essai doit être
   remplacé par un forfait payant avant la première vente.

Le branchement Shopify demande un hébergement Next.js (Vercel, Netlify…) : la version GitHub Pages est un
site statique et garde le catalogue de démonstration.

Organisation du catalogue, pour les bijoux ajoutés plus tard :
- **Catégorie** = champ « Type de produit » (Colliers, Sautoirs, Ras-de-cou, Bracelets, Boucles d'oreilles).
- **Collection** = une des collections ci-dessus.
- **Tailles** = variantes (option « Longueur », « Tour de poignet » ou « Taille »).
- **Badges** = tags `nouveau`, `best-seller`, `piece-unique`, `edition-limitee`.
- Métachamps facultatifs : produit `custom.materiaux`, `custom.accroche`, `custom.dimensions` ; collection `custom.surtitre`, `custom.couleur`.

Sans Shopify, le panier fonctionne et « Passer commande » mène à une page de démonstration.

## L'atelier sur-mesure

`lib/atelier.mjs` (JavaScript pur, partagé par le site et l'aperçu) contient tout l'atelier :
le choix des fils, longueurs, perles et pendentifs (`ATELIER`), les points de départ par collection
(`presets`), le calcul de l'estimation (`priceOf` : prix du fil + perles + pendentif, minimum 45 €,
arrondi aux 5 €) et le dessin animé du collier.

- La création est codée dans l'URL (`/atelier?d=chaine.collier.centre.nacre-corail.nacre.A`) :
  le lien se partage et rouvre exactement le même collier.
- « Commander ma création » met le collier au panier, au prix calculé (recalculé côté serveur au paiement).
  Avec Shopify : créer un produit `creation-atelier` (masqué de la boutique) avec une variante par palier
  de prix (45 €, 50 €, 55 €… 250 €) ; la commande reçoit la description, le code et le lien du collier
  en attributs de ligne. Handle modifiable avec `SHOPIFY_ATELIER_HANDLE`.
- « En parler d'abord avec la créatrice » ouvre le formulaire sur-mesure avec la création jointe.
- « Essayer sur moi » : essayage virtuel sur un buste en velours ou sur une photo de la cliente
  (elle reste dans le navigateur). Glisser, pincer, régler taille et inclinaison, enregistrer la photo
  au format 4:5 ou la partager directement (Instagram, WhatsApp) sur mobile.
- Les perles et pendentifs sont aujourd'hui dessinés. Quand les photos des vraies perles arrivent,
  on ajuste couleurs, noms et prix dans `ATELIER.beads` / `ATELIER.pendants` (ou on remplace le
  dessin par la photo détourée).

## Prix et fiches produits depuis Excel

Une ligne par bijou : prix, prix barré, tailles, badges, accroche, description, matières, dimensions.

```bash
python3 tools/catalogue/export_excel.py augustave-bijoux.xlsx   # catalogue -> Excel
python3 tools/catalogue/import_excel.py augustave-bijoux.xlsx --dry-run   # voir les changements
python3 tools/catalogue/import_excel.py augustave-bijoux.xlsx   # Excel -> lib/commerce/mock/catalog.json
```

Une ligne sans référence crée un nouveau bijou ; une ligne supprimée retire le bijou. Nécessite `openpyxl`.
Une fois Shopify branché, ce même fichier sert à créer ou mettre à jour les produits Shopify.

## Vendre sur Instagram

Deux voies, au choix :

1. **Shopify (recommandé)** : installer le canal « Facebook & Instagram » dans Shopify, le relier au compte
   professionnel Instagram @augustave.paris et à une Page Facebook. Le catalogue se synchronise tout seul ;
   une fois la boutique validée par Meta, on identifie les bijoux dans les posts et stories.
2. **Sans Shopify** : déclarer le flux `https://<domaine>/flux-instagram.csv` dans Meta Commerce Manager
   (Catalogue > Sources de données > Flux planifié). Même format accepté par Google Merchant Center.

Les fiches produits portent les balises `og:` et `product:` (prix, disponibilité, marque) et les données
structurées schema.org, lues par Meta et Google.

## Option cadeau

Dans le panier, « C'est pour offrir » ajoute l'écrin cadeau et un petit mot (240 caractères).
Avec Shopify, l'option arrive dans la commande : note et attributs « Cadeau » et « Petit mot ».

## Organisation du code

```
app/                    pages (App Router) + globals.css (toute la charte graphique)
components/             en-tête, pied de page, cartes produit, panier, formulaires
lib/commerce/types.ts   modèle de données neutre utilisé par toutes les pages
lib/commerce/mock/      catalogue de démonstration (catalog.json)
lib/commerce/shopify/   client et requêtes Storefront API
lib/site.ts             textes éditables : bandeau, engagements, pages d'infos, e-mail
lib/jewel-art.mjs       illustrations de remplacement des bijoux
lib/atelier.mjs         atelier sur-mesure interactif
tools/catalogue/        fichier Excel des bijoux (export / import)
public/brand/           logo (rond, doré détouré, monogramme)
preview/                aperçu statique en une page (node --no-warnings preview/build.mjs)
```

## À compléter avant la mise en ligne

- Prix, descriptions et matières des bijoux (les valeurs actuelles sont des exemples) : via le fichier Excel.
- Prix des perles et pendentifs de l'atelier (`lib/atelier.mjs`, valeurs d'exemple).
- Adresse e-mail de contact (`lib/site.ts`), seuil de livraison offerte, tarifs de livraison.
- CGV, mentions légales, politique de confidentialité (`lib/site.ts`, `infoPages`).
- Newsletter : relier `NewsletterForm` (components/Forms.tsx) à Shopify, Klaviyo ou Brevo.
- Formulaire sur-mesure : il ouvre aujourd'hui la messagerie avec la demande préremplie ;
  il peut être relié à un service de formulaires (Formspree, Shopify Forms).

## Hébergement

Recommandé : Vercel (gratuit pour démarrer), avec les variables d'environnement ci-dessus et
`NEXT_PUBLIC_SITE_URL` réglé sur le nom de domaine final.

## Aperçu en ligne (GitHub Pages)

À chaque mise à jour de la branche `main`, `.github/workflows/pages.yml` construit l'aperçu
(`node --no-warnings preview/build.mjs --site _site`) et le publie sur GitHub Pages,
à l'adresse `https://<compte>.github.io/<dépôt>/`. La page n'est pas indexée par les moteurs de recherche.
Le site Next.js complet (panier, Shopify) s'héberge, lui, sur Vercel.
