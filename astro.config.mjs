// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');

// The real public origin. Canonical URLs, Open Graph, the sitemap, RSS and
// robots.txt are all built from it, so set SITE_URL before deploying.
const siteUrl = env.SITE_URL || 'http://localhost:4321';
if (!env.SITE_URL && process.argv.includes('build')) {
	console.warn('[seo] SITE_URL is not set: canonical and sitemap URLs will point at localhost.');
}

// https://astro.build/config
export default defineConfig({
	site: siteUrl,
	trailingSlash: 'always',
	// Load the next page when a link is hovered or focused: instant navigation, zero cost up front.
	prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
	build: { format: 'directory', inlineStylesheets: 'auto' },
	image: {
		// Allow remote images from your future CMS/CDN, e.g. { protocol: 'https', hostname: 'cdn.example.com' }.
		remotePatterns: [],
	},
});
