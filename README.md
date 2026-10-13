texte  : #474747
title : #000000
primary : #BB9F6B

texte font : Jost
Primary font : Cormorant
Secondary font : Birthstone Bounce

## Problèmes connus

### Chemins de fichiers locaux cassés après redéploiement iOS

Les photos/images attachées aux tâches ne s'affichent plus après un redéploiement
(rebuild Xcode, TestFlight, etc.) : la requête vers
`capacitor://localhost/_capacitor_file_/.../Application/<UUID>/Documents/...`
échoue silencieusement (pas de statut, pas de headers de réponse).

**Cause** : `apps/web/app/utils/fileUtil.ts` (`copyFileToFolder`,
`moveFileToPermanentFolder`, `writeBlobToFolder`) persiste en base RxDB l'URI
**absolue** renvoyée par `Filesystem.getUri()` / `Filesystem.copy()`, qui
inclut l'UUID du conteneur sandbox de l'app
(`Application/<UUID>/Documents/...`). iOS régénère cet UUID à chaque
réinstallation de l'app, donc l'ancien chemin stocké ne pointe plus vers rien
pour la nouvelle installation.

**Fix à prévoir** : stocker un chemin **relatif** à `Directory.Documents`
(ex. `todoApp/save/<id>.jpg`) dans RxDB, et ne résoudre l'URI absolue qu'au
moment de l'affichage via `Filesystem.getUri({ path, directory:
Directory.Documents })`.