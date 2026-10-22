# Facturation TrailDex — processus

Mis en place le 22 octobre 2026. Base Airtable TrailDex (`appFtEAvDkYtjLleM`).

> ⚠️ Tant que la micro-entreprise n'est pas immatriculée (pas de SIRET), on ne peut ni encaisser ni facturer pour de vrai. L'outil produit des **spécimens** tant que `COMPANY` n'est pas complété dans `src/lib/config.ts` (SIRET, adresse, e-mail).

## Le parcours d'une commande

| Étape | Où | Qui |
|---|---|---|
| 1. Précommande reçue (statut « Nouvelle ») | Site → table **Commandes** | automatique |
| 2. Confirmation au client, demande de paiement | Gmail (brouillon) | Thibault envoie |
| 3. Paiement reçu → statut **« Payée »** | table Commandes | Thibault |
| 4. Facture créée (numéro, client, désignation, prix copiés) | table **Factures** | automatisation Airtable |
| 5. Compléter « Mode de paiement » (et la date si ce n'est pas aujourd'hui) | table Factures | Thibault |
| 6. Générer les PDF + livre des recettes | `/print.html` → section **Factures** (CSV de la table Factures) | Thibault |
| 7. Joindre le PDF dans la colonne « PDF », l'envoyer au client, cocher « Envoyée au client » | Airtable + Gmail | Thibault |
| 8. Impression, expédition (statuts « À imprimer » → « Expédiée ») | Commandes | Thibault |
| 9. Achats (Exaprint, enveloppes, timbres…) : une ligne + le justificatif | table **Achats** | Thibault |

## Les tables

- **Factures** : une ligne par facture ou avoir. Numéro `F-AAAA-0001` (facture) ou `AV-AAAA-0001` (avoir), tiré du champ « Séquence » : unique et chronologique.
  - **Ne jamais supprimer une facture** (trou dans la numérotation). Pour annuler ou rembourser : nouvelle ligne Type = **Avoir**, prix unitaire négatif, « Facture d'origine » renseignée, statut « Remboursée ».
  - Les infos client sont **copiées** au moment de la facture : modifier la commande ensuite ne change pas la facture (c'est voulu).
- **Achats** : registre des achats (obligatoire en micro-entreprise pour la vente de marchandises). Garder les justificatifs 10 ans.
- **Livre des recettes** : généré par l'outil (`livre-des-recettes.csv` dans le .zip), trié par date d'encaissement, avec le total par mois = chiffre d'affaires à déclarer.

## À faire une fois dans Airtable (≈ 5 min)

### 1. Créer l'automatisation « Commande payée → facture »

Automations → Create automation :

- **Déclencheur** : *When a record matches conditions* — table **Commandes**, conditions :
  - `Statut` **is** `Payée`
  - **and** `Facture` **is empty** (évite une double facture si le statut change deux fois)
- **Action** : *Create record* — table **Factures** :

| Champ Factures | Valeur |
|---|---|
| Type | Facture |
| Commande | (déclencheur) Record ID |
| Date de facture | (déclencheur) *Time of trigger* / date du jour |
| Date de vente | (déclencheur) Reçue le |
| Client | Nom |
| E-mail client | E-mail |
| Adresse client | Adresse, retour à la ligne, Code postal Ville |
| Désignation | `Carte de collection TrailDex — finition {Finition} ({Rareté})` puis à la ligne `{Course} · {Prénom sur la carte} · carte n° {N° de carte} · réf. {Référence}` |
| Quantité | Quantité |
| Prix unitaire | Prix unitaire |
| Statut paiement | Payée |
| Date de paiement | date du jour |

- Tester avec la commande « TD-EXEMPLE », vérifier la ligne créée dans Factures, puis **activer** (bouton *On*). Supprimer ensuite la facture de test **avant** la première vraie facture (c'est le seul cas où supprimer est acceptable).

### 2. Formats d'affichage

- Commandes → champ **Total** : *Formatting* → Currency, 2 décimales (aujourd'hui il affiche 15 au lieu de 14,90).
- Factures → champ **Total** : idem.

### 3. Vues utiles (facultatif)

- Factures → vue « À envoyer » : filtre `Envoyée au client` décoché.
- Factures → vue « Livre des recettes » : filtre `Date de paiement` non vide, tri par `Date de paiement`.
- Commandes → vue « À imprimer » : filtre `Statut = À imprimer` (utilisée par l'export Exaprint).

## Mentions sur les factures

Générées par `src/lib/invoice.ts` : vendeur (nom, « Entrepreneur individuel (EI) », adresse, SIRET), numéro, date d'émission, date de la vente, client et adresse, désignation, quantité, prix unitaire, total HT, TVA 0, total TTC, « TVA non applicable, art. 293 B du CGI », date et mode de paiement. Pour un avoir : référence de la facture d'origine.

Choix du logiciel de facturation pour la réforme : voir `docs/finance/logiciels-facturation.md` (Abby recommandé). **Dès la première vraie vente, une seule numérotation** : si Abby est adopté, c'est lui qui numérote et l'outil maison ne sert plus que de secours.

À faire vérifier par l'expert-comptable (agent `juridique-fiscal` pour la veille) :
- la mention TVA pourrait évoluer au 1er janvier 2027 (référence au CIBS, non confirmé) ;
- facturation électronique : réception obligatoire dès le 1er septembre 2026, émission et e-reporting des ventes aux particuliers au plus tard le 1er septembre 2027 via une plateforme agréée → prévoir le passage à un outil compatible avant cette date.
