const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/**
 * Prefix a site-absolute path with the deploy base and give it the trailing slash the
 * build emits — without it every internal navigation costs a 301 redirect.
 */
export function link(path: string) {
	if (!path.startsWith('/')) return path;
	const [route, hash] = path.split('#');
	const isFile = /\.[a-z0-9]+$/i.test(route);
	const normalised = route === '/' || route.endsWith('/') || isFile ? route : `${route}/`;
	return `${base}${normalised}${hash ? `#${hash}` : ''}`;
}
