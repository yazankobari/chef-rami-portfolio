# Chef Rami Al Maket — Portfolio

Portfolio site for **Rami Al Maket**, consultant chef (Dubai, UAE). 26 years across ten
countries; restaurant concepts, menus, kitchens and teams built from scratch.

All content is derived from the chef's own 2026 profile deck, which is kept in the repo as
the source of truth (`RAMI AL MAKET  Profile 2026 .pdf`).

## Stack

- **Astro 7** — static output, content collections for the eight project case studies
- **Tailwind CSS v4** — dark editorial theme (`#0a0908` ground, `#c9ab7c` gold)
- **Motion** + **Lenis** — scroll-linked reveals, pinned hero, weighted smooth scrolling
- **Astro Fonts** — Cormorant Garamond (display) + Jost (UI), self-hosted and subset
- `@astrojs/sitemap`, JSON-LD `Person` schema, per-page OG images

## Commands

```bash
npm install
npm run dev      # dev server on :4321
npm run build    # static build to dist/
npm run preview  # serve the build
```

## Structure

```
src/
  pages/          index, work, work/[...slug], about, 404
  content/work/   one markdown file per project (frontmatter drives the case studies)
  components/     Nav, Footer, ProjectCard, Marquee, SectionHead, ContactBlock
  layouts/Base    head, fonts, JSON-LD, view transitions
  scripts/anim.ts single frame loop driving every scroll effect
  data/site.ts    profile, services, process, awards, career, press, contact
  assets/         project photography, extracted from the profile deck
```

## Motion notes

`src/scripts/anim.ts` owns all animation. Effects measure their own geometry every frame
rather than relying on precomputed scroll ranges, so they survive font loading, image
loading, resizes and client-side navigation. Entrances are one-shot; the word reveal keeps a
high-water mark so scrolling back up never un-reveals text. Everything is disabled under
`prefers-reduced-motion`, and the page stays fully readable with JavaScript disabled.
