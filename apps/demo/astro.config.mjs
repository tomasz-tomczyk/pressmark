import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";

const isProd = process.env.NODE_ENV === "production";

export default defineConfig({
  site: "https://tomasz-tomczyk.github.io",
  base: isProd ? "/pressmark" : "/",
  trailingSlash: "ignore",
  integrations: [mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
});
