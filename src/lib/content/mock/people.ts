// MOCK DATA. Replace with your backend; see ../source.ts.
import type { AuthorInput, CategoryInput } from '../schema';

export const authors: AuthorInput[] = [
	{
		slug: 'devo',
		name: 'Devo',
		role: 'Founder and lead creator, SWG Devo',
		bio: 'Devo runs the SWG Devo YouTube channel and has been streaming competitive shooters and open-world games since 2018. Every settings guide on this site is tested on his own PC and phone before it goes live.',
		expertise: ['Competitive FPS', 'PC performance', 'Mobile shooters'],
		links: [
			{ label: 'YouTube', url: 'https://www.youtube.com/@swgdevo' },
			{ label: 'Instagram', url: 'https://www.instagram.com/swgdevo' },
		],
	},
	{
		slug: 'kavin-r',
		name: 'Kavin R.',
		role: 'Hardware and reviews editor',
		bio: 'Kavin builds and benchmarks the test rigs used for SWG Devo reviews. He writes the hardware guides and checks every performance claim against real frame-time captures.',
		expertise: ['PC building', 'Monitors and peripherals', 'Game reviews'],
		links: [{ label: 'X', url: 'https://x.com/swgdevo' }],
	},
];

export const categories: CategoryInput[] = [
	{
		slug: 'guides',
		seoTitle: 'Gaming Guides, Best Settings and Walkthroughs',
		name: 'Guides',
		description: 'Step-by-step gaming guides, best settings and beginner walkthroughs, tested on real hardware.',
		intro: 'Our guides answer one question each, start with the short answer, and then show the reasoning. Every settings guide lists the game patch it was tested on, so you always know whether it still applies.',
	},
	{
		slug: 'reviews',
		seoTitle: 'Game Reviews with Scores, Pros and Cons',
		name: 'Reviews',
		description: 'Honest game reviews with clear scores, pros and cons, and the platform we played on.',
		intro: 'We play every game we review to the credits or for at least 30 hours. Scores are out of 10 and come with the exact platform and patch, plus what would change our mind.',
	},
	{
		slug: 'hardware',
		seoTitle: 'Gaming PC, Monitor and Hardware Guides',
		name: 'Hardware',
		description: 'Gaming PC builds, monitors, mice and performance tuning explained without the jargon.',
		intro: 'Hardware advice that starts from what you play and what you can spend. We explain the trade-offs in plain words and skip the spec-sheet noise.',
	},
	{
		slug: 'mobile-gaming',
		seoTitle: 'BGMI and Mobile Gaming Guides',
		name: 'Mobile Gaming',
		description: 'BGMI and mobile shooter guides: sensitivity, controls, device settings and ranked tips.',
		intro: 'Mobile is where most of our audience plays. These guides cover sensitivity, layouts and device settings for BGMI and other mobile shooters, tested on mid-range phones, not just flagships.',
	},
	{
		slug: 'esports',
		seoTitle: 'Esports and Ranked Tips',
		name: 'Esports',
		description: 'How competitive gaming works, how to climb ranked and how to start playing tournaments.',
		intro: 'From your first ranked match to your first local tournament: practical steps for players who want to compete, plus explainers on how the esports scene works.',
	},
	{
		slug: 'lists',
		seoTitle: 'Best Games Lists and Top Picks',
		name: 'Top Lists',
		description: 'Curated lists of the best games, free-to-play picks and hidden gems worth your time.',
		intro: 'Short, opinionated lists. Every pick says who it is for, so you can skip the ones that are not for you.',
	},
	{
		slug: 'news',
		seoTitle: 'Gaming News and Channel Updates',
		name: 'News',
		description: 'Channel updates and gaming news that actually affects how you play.',
		intro: 'Updates from the SWG Devo channel and news that changes how you play: patches, events and launches.',
	},
];
