import { reactRouter } from "@react-router/dev/vite"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import mkcert from "vite-plugin-mkcert"

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    tailwindcss(),
    reactRouter(),
    mkcert({
      savePath: "/Users/arnaud/Library/Application Support/mkcert",
    }),
  ],
  server: {
    https: true, // ou {} — Vite génère un cert auto-signé
    host: "0.0.0.0", // pour rester accessible depuis le téléphone en LAN
  },
})
