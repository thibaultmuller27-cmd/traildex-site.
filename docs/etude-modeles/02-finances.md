# Étude des modèles TrailDex — 02. Rentabilité et finances

*Agent 2 « Rentabilité et finances », 22 octobre 2026. Recherche documentaire uniquement : aucun imprimeur contacté, aucun devis demandé, aucun compte créé.*

**Légende**
- ✅ **Vérifié** : chiffre lu le 22/10/2026 sur la page de l'imprimeur, du transporteur ou de l'éditeur (URL donnée).
- 🔎 **Estimation** : déduction ou calcul à partir de données vérifiées, ou ordre de grandeur pris sur un site tiers.
- ⚠️ **Hypothèse** : valeur posée par nous pour faire tourner les calculs. À remplacer par un devis ou par une mesure réelle.

Les modèles comparés :
- **A — B2C** : une carte personnalisée par coureur, vendue à l'unité (Holo 14,90 €, Or 24,90 €, livraison offerte), envoyée en lettre suivie.
- **B — B2B** : une même carte par course, éditée en 100 à 1 000 exemplaires, vendue à l'organisateur et livrée en un seul colis.
- **Hybride** : série B2B vendue moins cher à l'organisateur, avec un QR code qui renvoie les finishers vers la version personnalisée B2C.

---

## 0. En bref

1. **Pour des cartes identiques (B), l'impression ne coûte presque rien.** ✅ Chez Exaprint, carte de visite avec dorure à chaud, 350 g, quadri recto verso, livraison incluse : **36,30 € TTC les 100**, **55,60 € les 500** et **74,40 € les 1 000**, soit 0,36 € puis 0,11 € puis 0,07 € la carte. Même en majorant ce prix de 50 % pour le format, l'holographique et le pelliculage (⚠️), une édition de 300 cartes coûte environ **128 € tout compris** (impression, épreuve, colis, déplacement). À 2,50–3,50 € la carte, **la marge dépasse 600 à 900 € par événement**.
2. **Pour des cartes uniques (A), tout dépend du coût d'une carte seule, qui reste inconnu.** ✅ La grille Exaprint (dorure) **commence à 50 exemplaires** (32,60 € TTC). Si la quantité minimale vaut aussi pour chaque variante d'un Set, **une carte unique coûte au moins 32,60 €** et le modèle A est impossible chez Exaprint. ✅ MakePlayingCards imprime des « decks » de 18 cartes toutes différentes pour 10,25 $ (0,57 $ la carte, sans holographique ni port).
3. **Le modèle A dégage environ 4 à 7 € par carte Holo**, une fois payés l'envoi (3,60 € : avec un toploader et une enveloppe rigide, la lettre dépasse 20 g), l'emballage, Stripe, la casse et un coût d'acquisition. Une carte Or rapporte 12 à 16 €. Pour **500 € nets par mois**, il faut environ **80 à 115 commandes par mois** sans cotisations, et **110 à 190** avec des cotisations de 12 % du CA.
4. **Le modèle B atteint 500 € par mois avec environ 1 événement par mois** (300 cartes à 3 €, ou 500 cartes à 2,50 €). Le risque n'est pas financier. Il est commercial : il faut **signer** ces organisateurs, et les courses se concentrent de mars à novembre.
5. **Effet de seuil des cotisations luxembourgeoises.** 🔎 Tant que le revenu annuel reste sous ≈ 11 085 € (≈ 924 €/mois), une **dispense CCSS** est possible et les cotisations peuvent être nulles. Au-dessus, la cotisation minimale serait d'environ **700 € par mois** (calcul à partir de `docs/juridique/etude-statut-frontalier.md`, à confirmer par l'expert-comptable). Viser 1 000 € nets par mois revient alors à devoir dégager environ 1 700 € avant cotisations. **Les objectifs de 300 et 500 € par mois restent sous le seuil. Ceux de 1 000 et 2 000 € le franchissent.**
6. **Trésorerie** : A et B demandent peu de fonds (moins de 300 € pour démarrer). En A, le client paie d'avance. En B, il faut avancer l'impression (55 à 115 €) et attendre jusqu'à 30 jours le paiement : **exiger un acompte de 30 à 50 %** à la commande. Le seul risque de stock possible serait d'imprimer « pour voir » des cartes hybrides en surplus.

---

## 1. Coûts de fabrication

### 1.1 Exaprint — carte de visite à finition spéciale (dorure à chaud) ✅

Source : [exaprint.fr — Carte de visite avec finitions spéciales](https://www.exaprint.fr/impression/carte-de-visite-finition-speciale), grille de prix lue le 22/10/2026 dans le code de la page. Configuration par défaut : **8,5 × 5,5 cm, dorure à chaud or brillant, sans pelliculage, 350 g couché demi-mat, quadri recto verso, 1 visuel**. Prix **TTC**, « livraison, impression et contrôle des fichiers inclus ». Les quatre colonnes correspondent aux délais de livraison (codes de colonne 168-144 h, 120-96 h, 72-48 h et 48-24 h).

| Quantité (identiques) | Délai le plus long | 120-96 h | 72-48 h | 48-24 h | **Prix / carte (délai long)** |
|---|---|---|---|---|---|
| 50 | 32,60 € | 39,20 € | 58,70 € | 65,30 € | 0,65 € |
| 100 | 36,30 € | 43,50 € | 65,30 € | 72,50 € | **0,36 €** |
| 200 | 42,10 € | 50,50 € | 75,80 € | 84,20 € | **0,21 €** |
| 250 | 44,70 € | 53,60 € | 80,50 € | 89,40 € | 0,18 € |
| 300 | 47,30 € | 56,70 € | 85,10 € | 94,60 € | **0,16 €** |
| 400 | 50,00 € | 60,00 € | 89,90 € | 99,90 € | 0,13 € |
| 500 | 55,60 € | 66,70 € | 100,00 € | 111,10 € | **0,11 €** |
| 1 000 | 74,40 € | 89,20 € | 133,90 € | 148,70 € | **0,07 €** |
| 2 000 | 142,50 € | 171,00 € | 256,40 € | 284,90 € | 0,07 € |

Ce que la page montre aussi ✅ :
- couleurs de dorure proposées : or, cuivre, argent brillant ou mat, bleu, rouge et **holographique** ;
- pelliculage au choix : sans, mat, soft touch recto, soft touch recto verso ;
- « Multi-visuels » : **20 visuels au maximum**, « chacun sa quantité », jusqu'à 10 % de remise ;
- la grille de prix **commence à 50 exemplaires**.

Ce que la page ne dit pas ⚠️ :
- le prix du **format personnalisé** (63 × 88 mm impossible en dorure ; 55 × 85 ou 55 × 77 mm) ;
- le surcoût de l'**holographique**, du **pelliculage** et des **coins arrondis** ;
- la **quantité minimale par visuel** dans une commande multi-visuels, c'est-à-dire le coût d'une carte unique.

Écart à signaler 🔎 : `docs/finance/prix-de-revient.md` citait « à partir de 48,57 € HT les 100 ». La grille relevée aujourd'hui donne 36,30 € TTC (≈ 30,25 € HT) pour la configuration par défaut. L'écart vient sans doute d'une autre configuration ou d'une promotion.

**Hypothèse de calcul retenue pour B** ⚠️ : prix Exaprint × **1,5** pour couvrir le format personnalisé, la dorure holographique, le pelliculage soft touch et les coins arrondis. Cela donne 54 € les 100, 63 € les 200, 71 € les 300, 83 € les 500 et 112 € les 1 000.

### 1.2 MakePlayingCards (MPC, Hong Kong) — cartes 63 × 88 mm ✅

Source : [makeplayingcards.com — Custom Trading Game Cards](https://www.makeplayingcards.com/design/custom-trading-game-cards.html), grille lue le 22/10/2026 dans le code de la page. Configuration par défaut : **carton S30 (FSC, cœur bleu), impression quadri, film rétractable**. Prix **en dollars par deck**, sans port ; « applies to duplicate decks », « no set-up charge ». **Chaque carte d'un deck peut avoir un recto et un verso différents** : c'est ce qui rend possibles les cartes uniques.

| Taille du deck | 1–5 decks | 6–29 decks | 50–99 decks | 100–249 decks | 1 000–2 499 decks |
|---|---|---|---|---|---|
| 18 cartes | 10,25 $ (0,57 $/carte) | 7,20 $ (0,40) | 5,05 $ (0,28) | 4,05 $ (0,23) | 1,80 $ (0,10) |
| 36 cartes | 13,85 $ (0,38) | 10,00 $ (0,28) | 6,90 $ (0,19) | 5,50 $ (0,15) | 2,40 $ (0,07) |
| 55 cartes | 16,95 $ (0,31) | 12,45 $ (0,23) | 8,55 $ (0,16) | 6,85 $ (0,12) | 2,95 $ (0,05) |
| 108 cartes | 29,70 $ (0,28) | 22,00 $ (0,20) | 14,65 $ (0,14) | 11,75 $ (0,11) | 5,15 $ (0,05) |
| 216 cartes | 57,55 $ (0,27) | 39,45 $ (0,18) | 26,10 $ (0,12) | 20,65 $ (0,10) | 9,10 $ (0,04) |
| 504 cartes | 116,85 $ (0,23) | 85,80 $ (0,17) | 56,70 $ (0,11) | 44,85 $ (0,09) | 19,65 $ (0,04) |

- ✅ Options listées : holographique (recto, ou recto et verso), or, argent, tranches dorées, dorure à froid holographique en réserve (« spot »), et dorure à chaud sur demande. **Aucun surcoût n'est affiché** (il apparaît dans le configurateur).
- ✅ Page livraison ([shipping](https://www.makeplayingcards.com/shipping.aspx)) : en envoi standard, « no import tax and customs duty issues » vers l'UE. **Tarifs de port non affichés.**
- ⚠️ Hypothèses : 1 $ = 0,90 € (taux non vérifié aujourd'hui) ; holographique recto ≈ +50 à +100 % ; port vers la France ≈ 15 à 25 $ par commande.

### 1.3 Autres imprimeurs

| Imprimeur | Ce qu'on a pu vérifier | Statut |
|---|---|---|
| **QPMN** (même groupe que MPC) | Aucun minimum (« starting from just 1 unit »). Prototype de booster ≈ 14,69 $ (≈ 1,46 $/carte), 100–249 boosters : 4,29 $ (≈ 0,42 $/carte), 1 000–2 499 : 2,32 $ (≈ 0,23 $/carte). Holographique, or et argent proposés, sans prix affiché. [Coût d'impression](https://www.qpmarketnetwork.com/trading-card-game/cost-to-print-trading-cards/) · [TCG 63 × 88](https://www.qpmarketnetwork.com/app/products/custom-tcg-card-deck/) | ✅ chiffres de l'éditeur (article de blog, sans finition) |
| **MOO** | Cartes de visite format MOO : 50 ex. à 0,52 €/carte (31,20 €), 100 ex. à 0,37 €/carte (44,40 €), sans finition spéciale. Dorure or ou argent possible, sans prix affiché. Aux États-Unis, « special finishes » à partir de 51 $ les 50. [moo.com/fr](https://www.moo.com/fr/business-cards/moo-size) · [finitions](https://www.moo.com/fr-us/business-cards/finishes) | ✅ (non foil) ; 🔎 MOO permet en principe un visuel différent par carte (« Printfinity ») : **piste à vérifier pour A** |
| **Vistaprint** | Cartes « métallisées » en 360 g ; quantités à partir de 100. **Prix non affichés sans JavaScript.** [vistaprint.fr](https://www.vistaprint.fr/cartes-de-visite/metallisees) | ⚠️ non chiffré |
| **Pixartprinting** | Devis en ligne seulement ; -25 % sur la première commande (code BIENVENUE). [pixartprinting.fr](https://www.pixartprinting.fr/cartes-de-visite/) | ⚠️ non chiffré |
| **Printoclock, Helloprint** | Pages inaccessibles (403/404) ou prix chargés en JavaScript. | ⚠️ non chiffré |
| **Printer Studio** | Même groupe que MPC ; prix non lisibles. | ⚠️ |
| **Cartamundi** | Fabricant industriel (jeux de cartes, cartes à collectionner). **Aucun tarif ni minimum publié**, sur devis seulement. Pertinent au-delà de plusieurs milliers de cartes. | ⚠️ |

### 1.4 Coût unitaire selon le volume — synthèse

| Volume | Cartes **toutes différentes** (A) | Cartes **identiques** (B) |
|---|---|---|
| 1 ex. | MPC : deck mini 18 cartes = 10,25 $ ≈ **9,20 €** + port ✅🔎 · QPMN : ≈ 1,5–3 $ + port 🔎 · Exaprint : grille à partir de 50 ex. = **32,60 €** ✅ | — |
| 10 ex. | MPC deck 18 : ≈ **0,92 €/carte** + port (≈ 1,35 à 2,25 €/carte) 🔎 | — |
| 20 ex. | MPC deck 36 : ≈ **0,62 €/carte** + port (≈ 0,7 à 1,1 €/carte) 🔎 · Exaprint Set de 20 × 1 : **inconnu** ⚠️ | — |
| 100 | — | Exaprint **0,36 €** ✅ (0,54 € retenu ⚠️) · MPC ≈ 0,27 € ✅🔎 |
| 200 | — | Exaprint **0,21 €** ✅ (0,32 €) · MPC ≈ 0,26 € |
| 300 | — | Exaprint **0,16 €** ✅ (0,24 €) · MPC ≈ 0,28 € |
| 500 | — | Exaprint **0,11 €** ✅ (0,17 €) · MPC ≈ 0,21 € |
| 1 000 | — | Exaprint **0,07 €** ✅ (0,11 €) · MPC ≈ 0,21 € |

Les prix MPC sont sans holographique ni port. Ceux d'Exaprint incluent la livraison, en format 85 × 55.

**Coût d'impression retenu pour une carte unique holographique, port inclus (A)** ⚠️ :
- **ambitieux 1,20 €** : Sets Exaprint à 1 ex. par visuel, ou lots MPC/QPMN pleins ;
- **intermédiaire 2,00 €** ;
- **prudent 3,00 €** : lots MPC à moitié remplis, holographique et port.

Pour l'Or, on ajoute 0,50 €. **Si le minimum Exaprint est de 50 par visuel, A doit passer par MPC, QPMN ou MOO.**

---

## 2. Coûts B2C par commande (modèle A)

### 2.1 Postes unitaires

| Poste | Montant | Statut / source |
|---|---|---|
| Lettre verte ≤ 20 g | 1,52 € | ✅ [toutsurmesfinances — tarifs 2026](https://www.toutsurmesfinances.com/argent/a/prix-du-timbre) · [La Poste](https://www.laposte.fr/tarifs-postaux-courrier-lettres-timbres) |
| Lettre verte **suivie ≤ 20 g** | 2,02 € (1,52 + 0,50) | ✅ idem |
| Lettre verte ≤ 100 g | 3,10 € (2,97 € en timbre en ligne) | ✅ idem |
| Lettre verte **suivie ≤ 100 g** | **3,60 €** (3,47 € en ligne) | ✅ idem |
| Poids d'une carte 63 × 88 mm en 350 g/m² | ≈ 1,9 g | 🔎 calcul (0,00554 m² × 350 g) |
| Carte + toploader 35 pt (≈ 6 g) + enveloppe carton rigide (≈ 15–25 g) | ≈ 25–35 g → **tranche 100 g** | 🔎 poids des emballages non mesurés |
| → **Affranchissement retenu** | **3,60 €** (3,47 € ambitieux) ; 2,02 € seulement avec un emballage léger ≤ 20 g | ⚠️ à peser sur un vrai colis |
| Toploader 35 pt | ≈ 0,10–0,17 € (lot de 200 à 34,90 € avec 200 pochettes) | 🔎 [Cardshunter](https://www.cardshunter.fr/?p=47352) (en rupture) |
| Enveloppe carton rigide + pochette + petit insert | ≈ 0,45–0,55 € | ⚠️ aucun prix C6 rigide trouvé |
| → **Emballage retenu** | Holo 0,60–0,70 € ; Or (étui rigide) 1,30–1,50 € | ⚠️ |
| Stripe, carte de l'EEE standard | **1,5 % + 0,25 €** → 0,47 € (Holo) / 0,62 € (Or) | ✅ [stripe.com/fr/pricing](https://stripe.com/fr/pricing) |
| Stripe, carte EEE premium | 2,8 % + 0,25 € → 0,67 € / 0,95 € | ✅ idem (non retenu, part minoritaire) |
| Casse, perte postale, réimpression | 3 à 6 % du coût d'impression, d'emballage et d'envoi → 0,16–0,44 €/commande | ⚠️ |
| Acquisition (publicité Instagram, codes promo, échantillons) | 2 à 3 € par commande | ⚠️ à mesurer dès les premières ventes |
| Génération du PDF et contrôle du fichier | 0 € de dépense (outil `/print.html`) ; du temps (voir § 8) | 🔎 |

### 2.2 Marge par commande (une carte par commande)

| | Prudent | Intermédiaire | Ambitieux |
|---|---|---|---|
| Impression Holo / Or (port inclus) | 3,00 / 3,50 € | 2,00 / 2,50 € | 1,20 / 1,70 € |
| Emballage Holo / Or | 0,70 / 1,50 € | 0,70 / 1,50 € | 0,60 / 1,30 € |
| Envoi | 3,60 € | 3,60 € | 3,47 € |
| Casse | 6 % | 4 % | 3 % |
| Acquisition | 3,00 € | 2,00 € | 2,00 € |
| **Coût total Holo** | 11,21 € | 9,03 € | 7,90 € |
| **Marge Holo (14,90 €)** | **3,69 €** (25 %) | **5,87 €** (39 %) | **7,00 €** (47 %) |
| **Coût total Or** | 12,74 € | 10,53 € | 9,29 € |
| **Marge Or (24,90 €)** | **12,16 €** (49 %) | **14,37 €** (58 %) | **15,61 €** (63 %) |
| Part de l'Or dans les ventes ⚠️ | 15 % | 20 % | 25 % |
| **Panier moyen / marge moyenne** | 16,40 € / **4,96 €** | 16,90 € / **7,57 €** | 17,40 € / **9,15 €** |

Ces marges sont **avant frais fixes et cotisations**.

### 2.3 Sensibilité au coût d'impression de la carte Holo

Hypothèses : emballage 0,70 €, casse 4 %, Stripe 0,47 €.

| Coût impression d'une carte unique | Marge Holo (envoi 3,60 €, acquisition 2 €) | Marge Holo (envoi 2,02 €, sans acquisition payante) |
|---|---|---|
| 0,50 € | 7,43 € | 11,08 € |
| 1 € | 6,91 € | 10,56 € |
| 2 € | 5,87 € | 9,52 € |
| 3 € | 4,83 € | 8,48 € |
| 4 € | 3,79 € | 7,44 € |
| 6 € | 1,71 € | 5,36 € |
| 10 € | **-2,45 €** | 1,20 € |
| 32,60 € (minimum Exaprint de 50 ex.) | **-26,37 €** | -22,72 € |

→ **Au-delà d'environ 5 € par carte, l'Holo à 14,90 € avec livraison offerte n'est plus rentable.** Passer sous 20 g (2,02 € au lieu de 3,60 €) rapporte 1,58 € par commande : c'est **le levier le plus simple**.

---

## 3. Coûts B2B par commande (modèle B)

| Poste | Hypothèse par édition | Statut |
|---|---|---|
| Impression | Exaprint × 1,5 : 54 € (100), 63 € (200), 71 € (300), 83 € (500), 112 € (1 000) | ✅ grille + ⚠️ majoration |
| Épreuve / échantillon (BAT papier) par nouvelle course | 20 € | ⚠️ (Exaprint 50 ex. = 32,60 € ; MPC 1 deck = 10,25 $) |
| Poids de l'envoi (≈ 2 g/carte + boîtes et calage) | 100 → ≈ 0,4 kg · 200 → ≈ 0,6 kg · 300 → ≈ 0,9 kg · 500 → ≈ 1,3 kg · 1 000 → ≈ 2,5–3 kg | 🔎 |
| Colissimo domicile, France métropolitaine 2026 | 500 g 7,59 € · 750 g 9,29 € · 1 kg 9,59 € · 2 kg 11,19 € · 5 kg 17,39 € (point retrait : -0,70 €) | ✅ [laposte.fr/tarif-colissimo](https://www.laposte.fr/tarif-colissimo) |
| Carton, calage, boîtes ou bandes de 50 | 2 à 4 € | ⚠️ |
| Déplacement ou rendez-vous (moyenne par édition) | 25 € | ⚠️ |
| Design par course (tracé, logo, textes) | 0 € de dépense, du temps (≈ 3 h, voir § 8) | ⚠️ à estimer par l'Agent 4 |
| Paiement | Virement : 0 € de frais | 🔎 |
| Délai de paiement | 30 jours par défaut entre professionnels (Code de commerce, art. L441-10) ; les associations organisatrices paient souvent après la course | 🔎 règle connue, non relue aujourd'hui |

Remarque 🔎 : Exaprint livre directement, donc l'envoi peut se faire **sans Colissimo** (envoi direct à l'organisateur). Nous gardons pourtant le Colissimo dans les calculs, pour pouvoir contrôler la qualité avant expédition.

**Coût total d'une édition** (impression + épreuve + emballage + Colissimo + déplacement) :

| Quantité | Coût total | Coût par carte |
|---|---|---|
| 100 | 109 € | 1,09 € |
| 200 | 119 € | 0,60 € |
| 300 | 128 € | 0,43 € |
| 500 | 143 € | 0,29 € |
| 1 000 | 178 € | 0,18 € |

### 3.1 Marge par événement selon le prix de vente unitaire

Format de chaque cellule : **CA → marge avant cotisations** (après 12 % / après 20 % du CA).

| Quantité | 1,50 €/carte | 2,50 €/carte | 3,50 €/carte | 5,00 €/carte |
|---|---|---|---|---|
| 100 | 150 € → **41 €** (23 / 11) | 250 € → **141 €** (111 / 91) | 350 € → **241 €** (199 / 171) | 500 € → **391 €** (331 / 291) |
| 200 | 300 € → **181 €** (145 / 121) | 500 € → **381 €** (321 / 281) | 700 € → **581 €** (497 / 441) | 1 000 € → **881 €** (761 / 681) |
| 300 | 450 € → **322 €** (268 / 232) | 750 € → **622 €** (532 / 472) | 1 050 € → **922 €** (796 / 712) | 1 500 € → **1 372 €** (1 192 / 1 072) |
| 500 | 750 € → **607 €** (517 / 457) | 1 250 € → **1 107 €** (957 / 857) | 1 750 € → **1 607 €** (1 397 / 1 257) | 2 500 € → **2 357 €** (2 057 / 1 857) |
| 1 000 | 1 500 € → **1 322 €** (1 142 / 1 022) | 2 500 € → **2 322 €** (2 022 / 1 822) | 3 500 € → **3 322 €** (2 902 / 2 622) | 5 000 € → **4 822 €** (4 222 / 3 822) |

→ Dès 200 cartes, **la marge brute dépasse 75 % à tous les prix**. Ce qui décide, c'est le **prix qu'un organisateur accepte** (étude de marché, Agent 1 ou 3), pas le coût. Exception : une édition de 100 cartes à 1,50 € ne couvre presque pas les frais (épreuve, déplacement) : **prévoir un forfait minimum** (par exemple 150 à 250 € par édition).

Variantes premium (Or numéroté, édition limitée de 10 à 50 cartes) 🔎 : en cartes identiques, le surcoût d'impression reste de quelques euros, puisque la dorure fait déjà partie du produit Exaprint. Vendues 5 à 10 € pièce au-dessus de la série, elles ajoutent **50 à 500 € de marge** par événement, presque sans frais en plus.

---

## 4. Frais fixes

| Poste | Coût | Statut / source |
|---|---|---|
| Hébergement Cloudflare Pages | 0 € (offre gratuite) | 🔎 offre connue, non relue aujourd'hui |
| Nom de domaine (.fr ou .com) | ≈ 10–15 €/an → ≈ 1 €/mois | 🔎 |
| Airtable | Gratuit : ≈ 1 000 enregistrements par base, ≈ 100 automatisations par mois → suffit jusqu'à ≈ 80–100 commandes par mois. Au-delà, Team **20 $ par utilisateur et par mois** (annuel) | ✅ prix ([airtable.com/pricing](https://www.airtable.com/pricing)) ; 🔎 limites ([jetadmin, juillet 2026](https://www.jetadmin.io/blog/airtable-pricing-in-2026-plans-real-costs-and-when-to-upgrade/)) |
| Facturation (Abby) | 0 € (Basique) ; Start 9 € HT ou Pro 15 € HT par mois si l'API ou Make est nécessaire | ✅ selon `docs/finance/logiciels-facturation.md` |
| Banque | 0 à 10 €/mois (compte dédié conseillé) | ⚠️ non vérifié |
| Assurance RC pro | ≈ 100–200 €/an → 8–17 €/mois | 🔎 [Portail Auto-entrepreneur](https://www.portail-autoentrepreneur.fr/academie/creation-auto-entreprise/cout-auto-entrepreneur) · [Coover](https://www.coover.fr/responsabilite-civile-pro/auto-entrepreneur) |
| Expert-comptable frontalier | Consultation ponctuelle ≈ 150–400 € la première année → ≈ 15–30 €/mois | ⚠️ |
| Impressions de test et échantillons de démonstration | 10–30 €/mois | ⚠️ |
| Marketing de base (hors coût par commande) | 0 / 50 / 150 €/mois | ⚠️ |
| CFE | Exonérée l'année de création, puis si CA ≤ 5 000 € | 🔎 voir étude juridique |

**Frais fixes mensuels retenus** ⚠️ :

| Modèle | Prudent | Intermédiaire | Ambitieux |
|---|---|---|---|
| A | 60 € | 120 € | 300 € (Airtable Team, Abby Pro, marketing) |
| B | 60 € | 120 € | 250 € |
| Hybride | 60 € | 150 € | 300 € |

---

## 5. Cotisations sociales : hypothèses et effet de seuil

Sources : `docs/juridique/etude-statut-frontalier.md` (CCSS, chiffres de 2026), à confirmer par l'expert-comptable.

| Hypothèse | Règle | Usage dans l'étude |
|---|---|---|
| **H0 — dispense CCSS** | Revenu annuel ≤ 1/3 du salaire social minimum, soit ≈ 11 085 €/an (≈ 924 €/mois) → 0 € de cotisation | Probable pour les objectifs de 300 et 500 €/mois |
| **H1 — 12 % du CA** | Ordre de grandeur des cotisations micro-sociales de vente en France | Hypothèse prudente demandée |
| **H2 — 20 % du CA** | Marge de sécurité | Test de sensibilité |
| **Seuil CCSS** | Au-dessus de ≈ 11 085 €/an : assiette minimale = 1 SSM (2 771,33 €/mois) × ≈ 25 % (pension 17 + maladie 6,1 + dépendance 1,4 + accident 0,65) ≈ **697 €/mois** | 🔎 calcul ; ⚠️ application au pluriactif non confirmée |

⚠️ Nous ne savons pas quel « revenu » la CCSS retient : le CA après l'abattement de 71 % (le seuil serait alors atteint vers ≈ 38 000 € de CA par an) ou le bénéfice réel. **L'impôt sur le revenu français (taux effectif incluant le salaire luxembourgeois) n'est pas déduit dans cette étude.**

---

## 6. Scénarios chiffrés

### 6.1 Modèle A — B2C (résultat mensuel, une carte par commande)

Format de chaque cellule : CA / marge brute / **résultat avant cotisations** / après 12 % / après 20 %.

| Commandes/mois | Prudent (frais fixes 60 €) | Intermédiaire (120 €) | Ambitieux (300 €) |
|---|---|---|---|
| 10 | 164 / 50 / **-10** / -30 / -43 | 169 / 76 / **-44** / -65 / -78 | 174 / 92 / **-208** / -229 / -243 |
| 30 | 492 / 149 / **89** / 30 / -10 | 507 / 227 / **107** / 46 / 6 | 522 / 275 / **-25** / -88 / -130 |
| 100 | 1 640 / 496 / **436** / 239 / 108 | 1 690 / 757 / **637** / 435 / 299 | 1 740 / 915 / **615** / 406 / 267 |
| 300 | 4 920 / 1 488 / **1 428** / 837 / 444 | 5 070 / 2 272 / **2 152** / 1 544 / 1 138 | 5 220 / 2 746 / **2 446** / 1 819 / 1 402 |

À l'année (× 12, sans saisonnalité) avec 100 commandes par mois en intermédiaire : CA ≈ 20 300 €, résultat ≈ 7 650 € avant cotisations, ≈ 5 200 € après 12 %. Avec 300 commandes par mois : CA ≈ 60 800 € (sous la franchise de TVA de 85 000 €), résultat ≈ 25 800 € avant cotisations. **Dans ce cas, le seuil CCSS est franchi** : il faut retirer ≈ 8 400 €/an de cotisations minimales.

🔎 Saisonnalité : les ventes B2C suivront le calendrier des courses (pic d'avril à octobre) et les cadeaux de fin d'année. Une moyenne de 12 mois pleins surestime l'hiver.

### 6.2 Modèle B — B2B (par an, saison de mars à novembre)

| | Prudent | Intermédiaire | Ambitieux |
|---|---|---|---|
| Édition type | 200 cartes à 2,50 € | 300 cartes à 3,00 € | 500 cartes à 3,50 € |
| Événements par an ⚠️ | 6 | 12 | 25 |
| CA par événement | 500 € | 900 € | 1 750 € |
| Coût par événement | 119 € | 128 € | 143 € |
| **Marge par événement** | **381 €** (1,90 €/carte) | **772 €** (2,57 €/carte) | **1 607 €** (3,21 €/carte) |
| CA annuel | 3 000 € | 10 800 € | 43 750 € |
| Frais fixes annuels | 720 € | 1 440 € | 3 000 € |
| **Résultat annuel avant cotisations** | **1 563 €** | **7 824 €** | **37 185 €** |
| Après 12 % / 20 % du CA | 1 203 / 963 € | 6 528 / 5 664 € | 31 935 / 28 435 € |
| Moyenne par mois (avant cotisations / 12 % / 20 %) | 130 / 100 / 80 € | 652 / 544 / 472 € | 3 099 / 2 661 / 2 370 € |
| Seuil CCSS franchi ? | non | non (7 800 €) | **oui** → ≈ -8 400 €/an |

### 6.3 Hybride — série B2B à prix réduit + QR code vers le B2C

Hypothèses ⚠️ :
- l'organisateur achète la série moins cher (le QR code est sa contrepartie) ;
- une partie des finishers commande ensuite sa carte personnalisée, au même panier et aux mêmes coûts que le modèle A du même scénario, **sans coût d'acquisition** (le QR code en tient lieu) ;
- un taux de conversion de 3 / 7 / 12 % des cartes distribuées.

| | Prudent | Intermédiaire | Ambitieux |
|---|---|---|---|
| Série B2B | 200 × 1,50 € = 300 € | 300 × 2,00 € = 600 € | 500 × 2,50 € = 1 250 € |
| Marge B2B par événement | 181 € | 472 € | 1 107 € |
| Commandes B2C issues du QR (conversion) | 6 (3 %) | 21 (7 %) | 60 (12 %) |
| CA / marge B2C par événement | 98 / 48 € | 355 / 201 € | 1 044 / 669 € |
| **Marge totale par événement** | **228 €** | **673 €** | **1 777 €** |
| Événements par an | 6 | 12 | 25 |
| CA annuel | 2 390 € | 11 459 € | 57 350 € |
| **Résultat annuel avant cotisations** | **650 €** | **6 276 €** | **40 813 €** |
| Après 12 % / 20 % du CA | 363 / 172 € | 4 901 / 3 984 € | 33 931 / 29 343 € |
| Moyenne par mois (avant / 12 % / 20 %) | 54 / 30 / 14 € | 523 / 408 / 332 € | 3 401 / 2 828 / 2 445 € |

→ L'hybride n'est meilleur que le B pur **que si la conversion B2C dépasse environ 5 à 7 %**. À 3 %, la remise consentie sur la série (1,50 € au lieu de 2,50 €) coûte plus que ce que rapporte le B2C. Le **taux de conversion par QR code** est la donnée à mesurer en priorité, sur une course pilote.

---

## 7. Volumes nécessaires pour un bénéfice net mensuel

Format de chaque cellule : sans cotisations (dispense) / avec 12 % du CA / avec 20 % du CA. Les frais fixes sont ceux du scénario.

### Modèle A (commandes par mois)

| Objectif net | Prudent | Intermédiaire | Ambitieux |
|---|---|---|---|
| 300 € | 73 / 121 / 215 | 56 / 76 / 101 | 66 / 85 / 106 |
| **500 €** | **113 / 188 / 334** | **82 / 112 / 148** | **88 / 114 / 142** |
| 1 000 € | 214 / 355 / 632 | 148 / 202 / 268 | 143 / 185 / 230 |
| 2 000 € | 416 / 689 / 1 227 | 280 / 383 / 506 | 252 / 326 / 406 |
| 1 000 € **avec cotisation CCSS minimale (697 €)** | 355 | 240 | 219 |
| 2 000 € avec cotisation CCSS minimale | 556 | 372 | 328 |

### Modèle B (événements par mois, en moyenne sur l'année)

| Objectif net | Prudent (200 × 2,50 €) | Intermédiaire (300 × 3 €) | Ambitieux (500 × 3,50 €) |
|---|---|---|---|
| 300 € | 0,95 / 1,12 / 1,28 | 0,54 / 0,63 / 0,71 | 0,34 / 0,39 / 0,44 |
| **500 €** | **1,5 / 1,8 / 2,0** | **0,8 / 0,9 / 1,05** | **0,5 / 0,5 / 0,6** |
| 1 000 € | 2,8 / 3,3 / 3,8 | 1,45 / 1,7 / 1,9 | 0,8 / 0,9 / 1,0 |
| 2 000 € | 5,4 / 6,4 / 7,3 | 2,75 / 3,2 / 3,6 | 1,4 / 1,6 / 1,8 |
| 1 000 € avec CCSS minimale | 4,6 | 2,35 | 1,2 |
| 2 000 € avec CCSS minimale | 7,2 | 3,65 | 1,8 |

Exemple de lecture : 500 €/mois en intermédiaire revient à **≈ 10 éditions de 300 cartes par an**.

### Hybride (événements par mois)

| Objectif net | Prudent | Intermédiaire | Ambitieux |
|---|---|---|---|
| 300 € | 1,6 / 2,0 / 2,4 | 0,7 / 0,8 / 0,9 | 0,3 / 0,4 / 0,5 |
| **500 €** | **2,5 / 3,1 / 3,8** | **1,0 / 1,2 / 1,35** | **0,45 / 0,5 / 0,6** |
| 1 000 € | 4,6 / 5,9 / 7,1 | 1,7 / 2,1 / 2,4 | 0,7 / 0,9 / 1,0 |
| 2 000 € | 9,0 / 11,4 / 13,9 | 3,2 / 3,85 / 4,5 | 1,3 / 1,5 / 1,75 |

---

## 8. Bénéfice horaire indicatif

Les temps sont des hypothèses de l'Agent 2 ⚠️, à remplacer par l'estimation de l'Agent 4.

| Modèle | Temps supposé | Marge | € par heure |
|---|---|---|---|
| A — par commande Holo | 15–20 min (contrôle du fichier, emballage, dépôt à la Poste, SAV) | 3,69 à 7,00 € | **≈ 11 à 28 €/h** |
| B — par édition | 4–6 h (échanges avec l'organisateur, design, BAT, commande, livraison, facture), **hors prospection** | 381 à 1 607 € | **≈ 63 à 400 €/h** |
| Hybride — par événement | 7–17 h (B + commandes B2C) | 228 à 1 777 € | ≈ 33 à 105 €/h |

🔎 En B, le vrai coût en temps est la **prospection** : si un organisateur sur cinq signe et que chaque contact demande 1 à 2 h, ajoutez 5 à 10 h par édition signée. Le B reste alors à ≈ 30 à 100 €/h.

---

## 9. Besoin de trésorerie et risques financiers

| | A — B2C | B — B2B | Hybride |
|---|---|---|---|
| **Mise de départ** | Emballages (100 toploaders et enveloppes ≈ 60–80 €) + échantillons (≈ 50 €) + 1 lot test (≈ 20–40 €) → **≈ 150–200 €** | Échantillons de démonstration pour la prospection (≈ 50–100 €) + déplacements → **≈ 100–200 €** | Cumul des deux → **≈ 200–300 €** |
| **Avance d'impression** | Aucune : le client paie à la commande. Stripe verse les fonds sous quelques jours 🔎 | 55 à 115 € par édition, payés à Exaprint avant d'être payé soi-même | Comme B |
| **Délai d'encaissement** | Immédiat | 30 jours ou plus (associations : souvent après la course) | Mixte |
| **Impayés** | Quasi nuls (paiement d'avance) ; litiges ou rétrofacturations rares | **Risque réel** mais plafonné (≈ 100 à 180 € de coût engagé par édition) → **acompte de 30 à 50 %** + bon de commande signé | Comme B pour la partie série |
| **Invendus / stock** | Aucun (impression à la demande) ; risque d'un lot d'impression à moitié rempli | Aucun si la série est commandée ferme ; **risque si l'organisateur réduit la quantité** après l'impression | **Risque si l'on préimprime des cartes personnalisées** en pariant sur la conversion → ne jamais préimprimer |
| **Risque principal** | **Coût d'une carte unique inconnu** (de 0,6 à 33 €) ; coût d'acquisition | Volume commercial et saisonnalité (aucune course l'hiver) | Taux de conversion du QR inconnu |
| **Perte maximale typique** | Le lot raté ou perdu (≈ 20–50 €) | Une édition impayée (≈ 180 €) | Une édition impayée et un lot B2C |

---

## 10. Ce qui manque pour fiabiliser ces chiffres (à faire par Thibault)

1. **Coût d'une carte unique** : réponse d'Exaprint sur la quantité minimale par visuel (brouillon déjà prêt dans `docs/finance/prix-de-revient.md`). En parallèle, ouvrir les configurateurs de MPC, QPMN et MOO (Printfinity) en mode holographique et noter le prix et le port **sans commander**.
2. **Prix Exaprint** en format personnalisé 55 × 85 mm, holographique et soft touch, coins arrondis, pour 100, 300 et 1 000 exemplaires (configurateur).
3. **Peser** un envoi réel (carte, toploader et enveloppe) : 20 g ou 100 g change la marge de 1,58 €.
4. **Cotisations** : faire confirmer par l'expert-comptable le revenu retenu par la CCSS et la cotisation minimale au-dessus du seuil.
5. **Prix acceptable pour un organisateur** (Agents marché et commercial) : c'est la variable qui décide du modèle B.

---

## Sources (consultées le 22/10/2026)

- Exaprint, carte de visite à finitions spéciales (grille de prix TTC) : https://www.exaprint.fr/impression/carte-de-visite-finition-speciale
- MakePlayingCards, Custom Trading Game Cards (grille par deck) : https://www.makeplayingcards.com/design/custom-trading-game-cards.html
- MakePlayingCards, livraison : https://www.makeplayingcards.com/shipping.aspx
- QPMN, coût d'impression des cartes : https://www.qpmarketnetwork.com/trading-card-game/cost-to-print-trading-cards/
- QPMN, deck TCG 63 × 88 : https://www.qpmarketnetwork.com/app/products/custom-tcg-card-deck/
- MOO, cartes format MOO : https://www.moo.com/fr/business-cards/moo-size · finitions : https://www.moo.com/fr-us/business-cards/finishes
- Vistaprint, cartes métallisées : https://www.vistaprint.fr/cartes-de-visite/metallisees
- Pixartprinting, cartes de visite : https://www.pixartprinting.fr/cartes-de-visite/
- La Poste, tarifs courrier 2026 : https://www.laposte.fr/tarifs-postaux-courrier-lettres-timbres · Toutsurmesfinances : https://www.toutsurmesfinances.com/argent/a/prix-du-timbre
- La Poste, tarifs Colissimo 2026 : https://www.laposte.fr/tarif-colissimo
- Stripe France, tarifs : https://stripe.com/fr/pricing
- Airtable, tarifs : https://www.airtable.com/pricing · limites de l'offre gratuite (tiers) : https://www.jetadmin.io/blog/airtable-pricing-in-2026-plans-real-costs-and-when-to-upgrade/
- RC pro micro-entrepreneur (ordres de grandeur) : https://www.portail-autoentrepreneur.fr/academie/creation-auto-entreprise/cout-auto-entrepreneur · https://www.coover.fr/responsabilite-civile-pro/auto-entrepreneur
- Toploaders (prix de détail) : https://www.cardshunter.fr/?p=47352
- Études internes : `docs/finance/prix-de-revient.md`, `docs/finance/logiciels-facturation.md`, `docs/juridique/etude-statut-frontalier.md`

**Chiffres non vérifiés** (⚠️ ou 🔎 dans le texte) : surcoûts holographique, format, pelliculage et coins arrondis ; port MPC ; taux de change $/€ ; poids et prix des emballages ; coût d'acquisition ; taux de conversion par QR ; nombre d'événements par an ; limites de l'offre gratuite Airtable ; RC pro ; banque ; expert-comptable ; cotisation CCSS minimale pour un pluriactif.
