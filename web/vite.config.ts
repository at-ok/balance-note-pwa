import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "mask-icon.svg"],
      manifest: {
        name: "Balance Note",
        short_name: "Balance",
        description: "iPhone 向けの個人用残高メモ",
        theme_color: "#f3f4f7",
        background_color: "#f3f4f7",
        display: "standalone",
        orientation: "portrait",
        scope: "./",
        start_url: "./",
        icons: [
          {
            src: "./favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any"
          }
        ]
      }
    })
  ]
});
