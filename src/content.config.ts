import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

export const collections = {
	work: defineCollection({
		loader: glob({ base: './src/content/work', pattern: '**/*.md' }),
		schema: ({ image }) =>
			z.object({
				title: z.string(),
				venue: z.string().optional(),
				location: z.string(),
				period: z.string().optional(),
				summary: z.string(),
				scope: z.array(z.string()).default([]),
				tags: z.array(z.string()).default([]),
				cover: image(),
				/** object-position for the case-study hero crop, e.g. "50% 80%". */
				coverFocus: z.string().default('50% 50%'),
				/** Optional silent loop behind the hero; the cover stays as its poster. */
				/** Optional silent clips shown at the head of the gallery. */
				clips: z
					.array(z.object({ src: z.string(), poster: image(), alt: z.string() }))
					.default([]),
				gallery: z.array(image()).default([]),
				url: z.string().optional(),
				order: z.number(),
			}),
	}),
};
