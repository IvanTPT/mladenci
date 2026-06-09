// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import ViteYaml from '@modyfi/vite-plugin-yaml'; 
// https://astro.build/config
export default defineConfig({
  // ДОДАЈ ОВУ ЛИНИЈУ И УНЕСИ СВОЈ ПРАВИ ЛИНК:
  site: 'https://mladenci.emedia-rs.workers.dev/',
  vite: {
    plugins: [tailwindcss()],
    plugins: [ViteYaml()],
  },
});
