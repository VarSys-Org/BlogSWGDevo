import type { APIRoute } from 'astro';
import { SITE } from '../config/site';

export const GET: APIRoute = () =>
	new Response(
		JSON.stringify({
			name: SITE.name,
			short_name: SITE.shortName,
			description: SITE.description,
			start_url: '/',
			display: 'standalone',
			background_color: SITE.themeColor,
			theme_color: SITE.themeColor,
			icons: [
				{ src: '/images/icon-192.png', sizes: '192x192', type: 'image/png' },
				{ src: '/images/logo-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
			],
		}),
		{ headers: { 'Content-Type': 'application/manifest+json' } },
	);
