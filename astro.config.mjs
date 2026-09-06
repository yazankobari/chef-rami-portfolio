// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// GitHub Pages serves this site from the ramialmaket.com apex (public/CNAME).
// Override with SITE / BASE env vars for preview deploys on a subpath.
const site = process.env.SITE ?? 'https://ramialmaket.com';
const base = process.env.BASE ?? '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',

  fonts: [
      {
          provider: fontProviders.google(),
          name: 'Cormorant Garamond',
          cssVariable: '--astro-font-display',
          weights: [300, 400, 500, 600],
          styles: ['normal', 'italic'],
          subsets: ['latin'],
          fallbacks: ['Georgia', 'Times New Roman', 'serif'],
      },
      {
          provider: fontProviders.google(),
          name: 'Jost',
          cssVariable: '--astro-font-sans',
          weights: [300, 400, 500],
          styles: ['normal'],
          subsets: ['latin'],
          fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
      },
	],

  vite: { plugins: [tailwindcss()] },
  integrations: [sitemap()],
});