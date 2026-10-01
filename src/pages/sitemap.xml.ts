// Sitemap built from the same content layer as the pages, so it can never
// list a URL the site does not have. Posts carry real `lastmod` dates and
// their cover image; thin or `noindex` pages are left out on purpose.
import type { APIRoute } from 'astro';
import { SITE } from '../config/site';
import { getCategories, getGames, getAuthors, getPosts, getTags, splitPages } from '../lib/content';

type Entry = { path: string; lastmod?: string; image?: { src: string; title: string } };

const escape = (text: string) =>
	text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const newest = (dates: string[]) => dates.sort().at(-1);

export const GET: APIRoute = async ({ site }) => {
	if (!site) throw new Error('Set `site` in astro.config.mjs (SITE_URL) to build the sitemap.');
	const posts = await getPosts();
	const entries: Entry[] = [];
	const latest = newest(posts.map((post) => post.lastChanged));

	entries.push({ path: '/', lastmod: latest });
	for (const [index] of splitPages(posts, SITE.postsPerPage).entries()) {
		entries.push({ path: index === 0 ? '/blog/' : `/blog/page/${index + 1}/`, lastmod: latest });
	}

	for (const category of await getCategories()) {
		const inside = posts.filter((post) => post.category === category.slug);
		if (!inside.length) continue;
		splitPages(inside, SITE.postsPerPage).forEach((_, index) => {
			const base = `/category/${category.slug}/`;
			entries.push({ path: index === 0 ? base : `${base}page/${index + 1}/`, lastmod: newest(inside.map((p) => p.lastChanged)) });
		});
	}

	const games = (await getGames()).filter((game) => game.count > 0);
	entries.push({ path: '/games/' });
	for (const game of games) {
		const inside = posts.filter((post) => post.games.includes(game.slug));
		entries.push({ path: `/games/${game.slug}/`, lastmod: newest(inside.map((p) => p.lastChanged)) });
	}

	for (const tag of await getTags()) {
		if (tag.count < SITE.minPostsToIndexTag) continue;
		entries.push({ path: `/tag/${tag.slug}/` });
	}

	for (const author of await getAuthors()) entries.push({ path: `/author/${author.slug}/` });

	for (const post of posts) {
		if (post.noindex) continue;
		entries.push({
			path: post.url,
			lastmod: post.lastChanged,
			image: { src: post.cover.shareSrc ?? post.cover.src, title: post.cover.alt },
		});
	}

	for (const path of ['/about/', '/editorial-policy/', '/contact/', '/privacy/', '/terms/']) entries.push({ path });

	const body = entries
		.map((entry) => {
			const loc = new URL(entry.path, site).toString();
			const lastmod = entry.lastmod ? `<lastmod>${new Date(entry.lastmod).toISOString()}</lastmod>` : '';
			const image = entry.image
				? `<image:image><image:loc>${escape(new URL(entry.image.src, site).toString())}</image:loc></image:image>`
				: '';
			return `<url><loc>${escape(loc)}</loc>${lastmod}${image}</url>`;
		})
		.join('\n');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${body}
</urlset>`;

	return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
