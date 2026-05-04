import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';
import ViteYaml from '@modyfi/vite-plugin-yaml';

export default defineConfig({
  output: 'server', // Потребно за Cloudflare SSR
  adapter: cloudflare(),
  integrations: [tailwind()],
  vite: {
    plugins: [ViteYaml()],
  },
});
