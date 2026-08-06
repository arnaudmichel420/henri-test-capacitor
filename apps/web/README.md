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