import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.png",
        "apple-touch-icon.png",
        "icon-192.png",
        "icon-512.png",
        "icon-512-maskable.png"
      ],
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
            src: "./icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "./icon-512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "./icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      }
    })
  ]
});
