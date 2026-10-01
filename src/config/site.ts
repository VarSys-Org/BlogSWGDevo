// Site-wide settings. The editable part (brand, home page copy, nav, social
// links, verification codes) lives in content/site.json and is changed from
// /admin > Site or the MCP `blog_write type=site` tool. Every page, feed,
// sitemap and JSON-LD block reads it from here.

import siteData from '../../content/site.json';
import { siteSchema } from '../lib/content/schema';

export const SITE = siteSchema.parse(siteData);

export const NAV = SITE.nav;

export const FOOTER_LINKS = [
	{
		title: 'Explore',
		links: [
			{ label: 'All posts', href: '/blog/' },
			{ label: 'Games', href: '/games/' },
			{ label: 'Top lists', href: '/category/lists/' },
			{ label: 'News', href: '/category/news/' },
			{ label: 'Search', href: '/search/' },
		],
	},
	{
		title: 'About',
		links: [
			{ label: 'About us', href: '/about/' },
			{ label: 'Editorial policy', href: '/editorial-policy/' },
			{ label: 'Contact', href: '/contact/' },
			{ label: 'RSS feed', href: '/rss.xml' },
		],
	},
	{
		title: 'Legal',
		links: [
			{ label: 'Privacy policy', href: '/privacy/' },
			{ label: 'Terms of use', href: '/terms/' },
		],
	},
] as const;
