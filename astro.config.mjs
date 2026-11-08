import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // Replace this example domain before deploying a client project.
  site: "https://www.example.com",
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
