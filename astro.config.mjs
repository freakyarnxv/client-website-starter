import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";

export default defineConfig({
  // Replace with the store's actual domain before deployment.
  site: "https://www.example.com",
  integrations: [sitemap()],
  output: "server",
  adapter: node({ mode: "standalone" }),
  vite: {
    plugins: [tailwindcss()],
  },
});
