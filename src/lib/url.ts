const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Prefix a site-absolute path with the deploy base (GitHub Pages serves from a subpath). */
export function link(path: string) {
	return path.startsWith('/') ? `${base}${path}` : path;
}
