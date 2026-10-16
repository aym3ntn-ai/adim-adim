# Adım Adım — le turc A1.1, en français

Application Android pour apprendre le turc niveau A1.1, avec toutes les explications en français. Elle suit le programme A1.1 du CECRL : 12 leçons, des cartes de vocabulaire, des exercices corrigés et des pop-ups de révision qui apparaissent quelques secondes quand le téléphone est allumé.

**Télécharger la dernière version :** https://github.com/aym3ntn-ai/adim-adim/releases/latest/download/adim-adim.apk

## Ce que contient le dépôt

| Dossier | Rôle |
|---|---|
| `app/` | L'application (Expo, React Native, TypeScript), interface en français |
| `app/src/content/lecons.json` | Les 12 leçons : vocabulaire, grammaire, dialogues, exercices, liens vidéo |
| `app/src/content/popups.json` | Le contenu des pop-ups de révision (mots, règles, rappels, beaux mots) |
| `app/modules/revision-overlay/` | Module Android natif (Kotlin) qui planifie et affiche les pop-ups |
| `.github/workflows/android.yml` | Construit l'APK et publie la release GitHub |
| `docs/ANDROID_SIGNING.md` | Mise en place de la clé de signature (une seule fois) |

Tout le contenu pédagogique est rédigé pour l'application. Les vidéos officielles de l'Institut Yunus Emre peuvent être liées leçon par leçon dans le champ `videos` de `lecons.json` (titre, URL, durée) ; elles s'ouvrent alors dans YouTube.

## Les pop-ups de révision

Toutes les 1, 2 ou 8 heures (au choix), si l'écran est allumé et déverrouillé et hors des heures calmes, une carte s'affiche en haut de l'écran pendant 5 secondes, par-dessus l'appli ouverte, puis disparaît seule. La toucher ouvre Adım Adım ; la croix la ferme.

- Android exige l'autorisation **« Afficher par-dessus les autres applis »** ; l'app guide l'utilisateur vers ce réglage.
- L'alarme est inexacte et ne réveille pas le téléphone : Android peut décaler un pop-up de quelques minutes pour économiser la batterie.
- Avec « Seulement les leçons déjà vues », seuls les mots et règles des leçons ouvertes apparaissent ; les beaux mots et rappels généraux restent toujours inclus.
- Ce fonctionnement n'existe pas sur iPhone, où Apple interdit l'affichage par-dessus les autres applis.

## Ajouter ou corriger du contenu

1. Modifier `app/src/content/lecons.json` ou `popups.json`.
2. Augmenter `"version"` dans `app/package.json` (par exemple `1.0.0` → `1.0.1`).
3. Pousser sur `main` : le workflow construit l'APK signé et publie la release.

Un pop-up a la forme `{ "id", "type", "lecon", "titre", "texte", "audio" }`, où `type` vaut `nouveau_mot`, `regle`, `rappel` ou `beau_mot`, et `lecon` vaut l'identifiant d'une leçon (`"L03"`) ou `null`.

## Développer

```bash
npm install
cd app
npx expo prebuild --platform android
npx expo run:android
```

Les pop-ups demandent l'application compilée : ils ne fonctionnent pas dans Expo Go. Vérifications avant de pousser :

```bash
npm run typecheck --workspace app
npm run lint --workspace app
npm test --workspace app
```

## Publier l'APK

La première fois, suivre `docs/ANDROID_SIGNING.md` (ou lancer `bash scripts/setup-signing.sh`). Sans les secrets de signature, chaque build produit un APK de test, disponible 30 jours dans les artefacts du workflow, sans release.
