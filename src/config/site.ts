// One place for every site-wide fact. Change the brand, links or page sizes
// here and every page, feed, sitemap and JSON-LD block picks it up.

export const SITE = {
	name: 'SWG Devo',
	shortName: 'SWG Devo',
	tagline: 'Gaming guides, settings and honest reviews',
	description:
		'Gaming guides, best settings, honest reviews and esports tips from the SWG Devo channel. Clear answers for PC, console and mobile players.',
	locale: 'en_IN',
	lang: 'en',
	// Default share image (1200x630) used when a page has none of its own.
	defaultImage: '/images/og-default.jpg',
	logo: '/images/logo-512.png',
	themeColor: '#0d1017',
	// Public profiles. These feed the footer, the author pages and the
	// Organization `sameAs` list, which helps search engines tie the site to the channel.
	social: [
		{ label: 'YouTube', url: 'https://www.youtube.com/@swgdevo', icon: 'youtube' },
		{ label: 'Instagram', url: 'https://www.instagram.com/swgdevo', icon: 'instagram' },
		{ label: 'Discord', url: 'https://discord.gg/swgdevo', icon: 'discord' },
		{ label: 'X', url: 'https://x.com/swgdevo', icon: 'x' },
	],
	youtubeChannel: 'https://www.youtube.com/@swgdevo',
	xHandle: '@swgdevo',
	postsPerPage: 9,
	// Tag pages with fewer posts than this are `noindex, follow` so thin
	// pages do not dilute the site's quality signals.
	minPostsToIndexTag: 2,
} as const;

export const NAV = [
	{ label: 'Guides', href: '/category/guides/' },
	{ label: 'Reviews', href: '/category/reviews/' },
	{ label: 'Hardware', href: '/category/hardware/' },
	{ label: 'Mobile', href: '/category/mobile-gaming/' },
	{ label: 'Esports', href: '/category/esports/' },
	{ label: 'Games', href: '/games/' },
] as const;

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
