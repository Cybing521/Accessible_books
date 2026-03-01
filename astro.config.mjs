// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import vercel from '@astrojs/vercel';

import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';

// https://astro.build/config
export default defineConfig({
  site: 'https://accessible-books.vercel.app',
  vite: {
    plugins: [tailwindcss()]
  },

  adapter: vercel(),
  integrations: [sitemap(), pagefind()]
});