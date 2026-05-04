// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import ViteYaml from '@modyfi/vite-plugin-yaml'; 
// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    plugins: [ViteYaml()],
  },
});
