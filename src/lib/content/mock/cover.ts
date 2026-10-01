import type { ImageRef } from '../schema';

// Mock covers are made by `npm run mock:covers` (scripts/make-mock-covers.mjs)
// into public/images/<folder>/<slug>-{640,1200}.webp and <slug>-1200.jpg.
export function mockCover(folder: 'posts' | 'games', slug: string, alt: string): ImageRef {
	const base = `/images/${folder}/${slug}`;
	return {
		src: `${base}-1200.webp`,
		srcset: `${base}-640.webp 640w, ${base}-1200.webp 1200w`,
		shareSrc: `${base}-1200.jpg`,
		alt,
		width: 1200,
		height: 675,
	};
}
