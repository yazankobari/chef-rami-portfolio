// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://cheframi.com',

  fonts: [
      {
          provider: fontProviders.google(),
          name: 'Cormorant Garamond',
          cssVariable: '--font-display',
          weights: [300, 400, 500, 600],
          styles: ['normal', 'italic'],
          subsets: ['latin'],
      },
      {
          provider: fontProviders.google(),
          name: 'Jost',
          cssVariable: '--font-sans',
          weights: [300, 400, 500],
          styles: ['normal'],
          subsets: ['latin'],
      },
	],

  vite: { plugins: [tailwindcss()] },
  integrations: [sitemap()],
});