// Small JSON index the search page loads on demand. Swap this for a search
// API (Algolia, Meilisearch, Postgres full-text) later without touching pages:
// the search script only needs this same shape back.
import type { APIRoute } from 'astro';
import { getPosts } from '../lib/content';

export const GET: APIRoute = async () => {
	const posts = await getPosts();
	const rows = posts.map((post) => ({
		u: post.url,
		t: post.title,
		d: post.description,
		c: post.categoryInfo.name,
		k: [...post.tagList.map((tag) => tag.name), ...post.gameList.map((game) => game.name)].join(' '),
		p: post.publishedAt.slice(0, 10),
	}));
	return new Response(JSON.stringify(rows), {
		headers: { 'Content-Type': 'application/json; charset=utf-8' },
	});
};
