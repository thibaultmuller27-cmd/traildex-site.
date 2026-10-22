# Prix de revient et marges — étude du 22 octobre 2026

> **Mise à jour du 22/10 :** la Standard a été retirée de l'offre (seulement Holo et Or). Les lignes Standard ci-dessous sont gardées pour mémoire.

But : préparer la décision « Fixer les prix définitifs ». Les prix actuels (9,90 / 14,90 / 24,90 €, livraison offerte) sont dans `src/lib/config.ts`.

## Ce qui est connu

| Poste | Montant | Source |
|---|---|---|
| Lettre verte suivie ≤ 20 g (France) | 2,02 € (1,52 € + suivi 0,50 €) | Tarifs La Poste 2026 ([toutsurmesfinances](https://www.toutsurmesfinances.com/argent/a/lettres-et-colis-de-la-poste-tarifs-poids-et-delais), [french-property](https://www.french-property.com/guides/france/la-poste-mail/postal-tariffs-services/)) |
| Paiement par carte (Stripe, cartes européennes) | 1,5 % + 0,25 € | Grille Stripe France standard |
| Exaprint, cartes de visite dorure à chaud | « à partir de » 48,57 € HT les 100 **identiques** | [exaprint.fr](https://www.exaprint.fr/impression/carte-de-visite-finition-speciale) (prix exact visible seulement dans le configurateur) |

TVA : en franchise en base (micro-entreprise), pas de TVA collectée, mais la TVA payée à Exaprint n'est pas récupérable → compter les prix fournisseurs **TTC**.

## Le point qui décide de tout : le coût d'UNE carte unique

Chaque client a une carte différente. Avec l'option **Sets** d'Exaprint (≤ 20 variantes, même quantité par variante), le coût par carte dépend de la **quantité minimale par variante**, que le site n'affiche pas :

- si on peut commander **1 exemplaire par variante** → coût probable de l'ordre de 0,50 à 3 € la carte ;
- si le minimum est de **25, 50 ou 100 exemplaires par variante** → une carte unique coûte le prix d'un lot entier (dizaines d'euros) et le modèle ne tient pas. Il faudrait alors offrir plusieurs exemplaires par client, ou passer par un imprimeur à l'unité (MakePlayingCards, QPMN…).

→ **C'est la première question à poser à Exaprint** (voir le brouillon plus bas).

## Marge par carte selon le coût d'impression

Hypothèses, à confirmer : emballage Standard/Holo = enveloppe + carton rigide ≈ 0,40 € ; Or = étui rigide ≈ 1,20 € et lettre > 20 g ≈ 3,00 € (estimations, pas des devis).

| | Standard 9,90 € | Holo 14,90 € | Or 24,90 € |
|---|---|---|---|
| Frais de paiement | 0,40 € | 0,47 € | 0,62 € |
| Envoi | 2,02 € | 2,02 € | ≈ 3,00 € |
| Emballage | ≈ 0,40 € | ≈ 0,40 € | ≈ 1,20 € |
| **Reste avant impression** | **7,08 €** | **12,01 €** | **≈ 20,08 €** |
| Marge si impression = 1 € | 6,08 € (61 %) | 11,01 € (74 %) | 19,08 € (77 %) |
| Marge si impression = 3 € | 4,08 € (41 %) | 9,01 € (60 %) | 17,08 € (69 %) |
| Marge si impression = 6 € | 1,08 € (11 %) | 6,01 € (40 %) | 14,08 € (57 %) |

À retirer ensuite : cotisations sociales (taux à confirmer par l'expert-comptable, la situation frontalière change tout), ≈ 12 % du CA par prudence. Plus la carte Standard est chère à imprimer, moins elle a de sens à 9,90 € avec livraison offerte.

## Recommandation provisoire

1. Ne pas figer les prix avant la réponse d'Exaprint sur la quantité minimale par variante et le prix d'un Set de 20 × 1.
2. Si l'impression unitaire reste sous 3 € : garder Holo 14,90 € et Or 24,90 €, passer **Standard à 11,90 €** ou faire payer l'envoi (≈ 2 €) sur le Standard seul.
3. Si le minimum par variante est élevé : comparer avec MakePlayingCards (cartes à l'unité, option holographique) avant de lancer quoi que ce soit.

## Brouillon de questions pour Exaprint (à envoyer par Thibault, rien n'a été envoyé)

> Bonjour,
>
> Je prépare des cartes personnalisées (une carte différente par client) au format carte de visite avec dorure à chaud, et j'aurais quatre questions :
>
> 1. Avec l'option Sets, quelle est la quantité minimale par variante ? Est-il possible de commander 20 variantes à 1 exemplaire chacune, et à quel prix ?
> 2. La dorure est-elle possible en format personnalisé 63 × 88 mm ? Sinon, quel est le format le plus proche accepté (55 × 85 mm ?).
> 3. Pouvez-vous m'envoyer le gabarit (fond perdu exact, nom des couleurs de dorure à utiliser dans le calque, épaisseur de trait minimale) ?
> 4. La dorure holographique est-elle disponible sur le même produit, et au même prix que l'or ?
>
> Merci d'avance,
> Thibault Muller
