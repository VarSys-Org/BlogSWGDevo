import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
	const sitemap = new URL('/sitemap.xml', site).toString();
	const body = `User-agent: *
Allow: /
Disallow: /search/

Sitemap: ${sitemap}
`;
	return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
