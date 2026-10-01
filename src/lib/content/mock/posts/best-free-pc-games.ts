import type { PostInput } from '../../schema';
import { mockCover } from '../cover';

export const post: PostInput = {
	slug: 'best-free-pc-games',
	title: 'Best Free PC Games to Play Right Now',
	description:
		'Our picks for the best free-to-play PC games across shooters, battle royales, strategy and RPGs, with who each one is for and what it costs to keep playing.',
	kind: 'list',
	category: 'lists',
	tags: ['Free to play', 'PC', 'Top list'],
	games: ['valorant', 'counter-strike-2', 'fortnite'],
	author: 'kavin-r',
	publishedAt: '2026-08-20T10:00:00+05:30',
	updatedAt: '2026-09-29T10:00:00+05:30',
	cover: mockCover('posts', 'best-free-pc-games', 'Grid of game tiles on a dark launcher screen'),
	keyPoints: [
		'Best tactical shooter: Valorant or Counter-Strike 2.',
		'Best battle royale with building: Fortnite.',
		'Best strategy: Dota 2.',
		'All picks are free to start; we note where spending gets pushy.',
	],
	faq: [
		{
			question: 'Are free-to-play games really free?',
			answer:
				'Yes, you can play all of these without paying. Most earn money from cosmetics or battle passes. We mention it when a game pushes purchases hard.',
		},
	],
	body: {
		format: 'markdown',
		value: `
Free games are not a compromise any more. Several of the most played games on PC cost nothing to start. Here are our picks and who each one suits.

## Valorant

**Best for:** players who like precise aim plus team abilities. Rounds are short, roles are clear and the ranked ladder gives you a reason to improve. Purchases are cosmetic only.

## Counter-Strike 2

**Best for:** pure gunplay. No abilities, just economy, utility and aim. The learning curve is steep, but no shooter rewards practice more directly.

## Fortnite

**Best for:** anyone who wants variety. Battle royale with or without building, creative maps and constant events. Cosmetics are the main cost.

## Apex Legends

**Best for:** fast movement and squad play. Each legend has abilities that change how a squad fights.

## Dota 2

**Best for:** strategy fans with patience. Every hero is free, so you never pay for gameplay, but expect a long learning phase.

## Warframe

**Best for:** co-op action and long-term grinding. Fast movement, lots of weapons and a generous free path to most content.

## Rocket League

**Best for:** short sessions. Football with rocket cars: easy to pick up, very hard to master.

## How we chose

We picked games that are free to start, still actively updated, and fun without spending. We played each for at least 10 hours and checked how hard the store is pushed during normal play.
`,
	},
};
