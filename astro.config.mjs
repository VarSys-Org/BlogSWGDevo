// @ts-check
import { readFileSync } from 'node:fs';
import node from '@astrojs/node';
import react from '@astrojs/react';
import { defineConfig, envField } from 'astro/config';
import { loadEnv } from 'vite';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');

// The real public origin. Canonical URLs, Open Graph, the sitemap, RSS and
// robots.txt are all built from it, so set SITE_URL before deploying.
const siteUrl = env.SITE_URL || 'http://localhost:4321';
if (!env.SITE_URL && process.argv.includes('build')) {
	console.warn('[seo] SITE_URL is not set: canonical and sitemap URLs will point at localhost.');
}

// Old post URLs -> new ones. Filled in automatically when a slug changes in
// the admin or through MCP, so renamed posts keep their search ranking.
function getRedirects() {
	try {
		return JSON.parse(readFileSync(new URL('./content/redirects.json', import.meta.url), 'utf8'));
	} catch {
		return {};
	}
}

// https://astro.build/config
export default defineConfig({
	site: siteUrl,
	trailingSlash: 'always',
	// Public pages stay prerendered static HTML (best for SEO and speed).
	// Only /admin and /api/* opt out with `prerender = false` and run on Node.
	adapter: node({ mode: 'standalone' }),
	integrations: [react()],
	redirects: getRedirects(),
	// Load the next page when a link is hovered or focused: instant navigation, zero cost up front.
	prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
	build: { format: 'directory', inlineStylesheets: 'auto' },
	security: { checkOrigin: true },
	env: {
		schema: {
			// Password for /admin. Admin stays locked until it is set.
			ADMIN_PASSWORD: envField.string({ context: 'server', access: 'secret', optional: true }),
			// Signs admin session cookies. Falls back to a value derived from the password.
			ADMIN_SESSION_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
			// Bearer key for the HTTP MCP endpoint at /api/mcp/. Endpoint is off until set.
			BLOG_MCP_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
		},
	},
	image: {
		// Allow remote images from your future CMS/CDN, e.g. { protocol: 'https', hostname: 'cdn.example.com' }.
		remotePatterns: [],
	},
});
