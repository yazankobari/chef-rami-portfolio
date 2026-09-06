// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// GitHub Pages serves this project site from /chef-rami-portfolio.
// Override with SITE / BASE env vars when deploying to a root domain.
const site = process.env.SITE ?? 'https://yazankobari.github.io';
const base = process.env.BASE ?? '/chef-rami-portfolio';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',

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