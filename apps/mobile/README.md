### Running this example

To run the provided example, you can use `npm dev` command.

```bash
npm dev
```

### Building and running on mobile

```bash
npm run build       # build web app -> dist/
npx cap sync         # copy web build + native plugins into ios/ and android/
npx cap run ios      # build & run on iOS simulator/device
npx cap run android  # build & run on Android emulator/device
```

Open the native IDEs directly (for debugging, permissions, signing, etc.):

```bash
npx cap open ios      # opens Xcode
npx cap open android  # opens Android Studio
```

pnpm dev -- --host --port 8100

### Todo

suppression : supprimer upload, le fichier dans le s3 et repercuter les modifs dans les clients

update : delete l'ancien upload, creer le nouveau / delete l'ancien s3, cree le nouveau s3 / delete l'ancien fichier

reactivité sur les changements d'images