# API Exaprint (ExaConnect) — vérification du 22/10/2026

Sources : [exaprint.fr/exaconnect](https://www.exaprint.fr/exaconnect/), [documentation développeur](https://connect.exaprint.com/documentation/), [demande d'accès](https://exaconnect.zendesk.com/hc/fr/requests/new).

## Vérifié ✅
- L'API existe : **ExaConnect**, **gratuite** (« aucun frais d'abonnement ni de mise en place »), accès sur demande via le formulaire.
- Authentification par jeton (Bearer) généré depuis un clientId et un secret.
- Création de commande : adresse de livraison, plusieurs lignes (`items[]`), `productConfiguration` (identifiant de produit configuré), quantité, `fileUrls` (URL des PDF d'impression), notre référence (`merchantOrderId`).
- Adresse de retour obligatoire (`returnAddress.company`) et nom de société imprimé sur l'étiquette → envoi possible directement chez l'organisateur ou le client, sous le nom TrailDex 🔎 (marque blanche à confirmer).
- Champ `fakeOrder` → commandes de test possibles 🔎.
- Suivi des commandes (liste, filtres par statut, date, numéro) et annulation.
- API Catalogue pour lister les produits disponibles.

## Non confirmé ⚠️
- **Catalogue partiel** : « une sélection des principaux produits ». Rien n'indique que la **carte de visite avec dorure à chaud** (ni la dorure holographique, ni l'option Sets, ni le format personnalisé 55 × 85) soit disponible par l'API. À demander à l'équipe ExaConnect.
- Prix et délais par l'API (pas d'endpoint de devis vu), webhooks, environnement de test, BAT.

## Intérêt pour TrailDex
- **B2B (cartes finisher, priorité actuelle)** : quelques commandes par saison → commander à la main sur le site prend ≈ 10 min. L'API n'est **pas nécessaire** pour démarrer.
- **B2C personnalisé (plus tard)** : très utile. Le site pourrait envoyer automatiquement chaque lot (PDF générés par `/print.html`, hébergés sur une URL sécurisée) et faire livrer directement le client. C'est l'automatisation qui ferait passer le temps par commande d'environ 12 min à quelques minutes (voir `docs/etude-modeles/04-operations.md`).
- Prérequis : SIREN et compte professionnel Exaprint ; vérifier que la dorure est dans le catalogue de l'API.
