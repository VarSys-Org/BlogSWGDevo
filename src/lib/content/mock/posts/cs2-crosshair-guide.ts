import type { PostInput } from '../../schema';
import { mockCover } from '../cover';

export const post: PostInput = {
	slug: 'cs2-crosshair-guide',
	title: 'CS2 Crosshair Guide: How to Make a Crosshair That Fits Your Aim',
	description:
		'How to build a Counter-Strike 2 crosshair from scratch: style, size, gap, color and outline, plus how to share and import crosshair codes.',
	kind: 'guide',
	category: 'guides',
	tags: ['Counter-Strike 2', 'Crosshair', 'Settings', 'PC'],
	games: ['counter-strike-2'],
	author: 'devo',
	publishedAt: '2026-09-03T15:00:00+05:30',
	cover: mockCover('posts', 'cs2-crosshair-guide', 'Close-up of a green crosshair over a tactical shooter map'),
	level: 'beginner',
	keyPoints: [
		'Use a static (classic static) style so the crosshair never grows mid-fight.',
		'Small gap and short lines keep the target visible.',
		'Pick a color that does not appear on the maps you play most.',
		'Share your crosshair as a code from the in-game crosshair settings.',
	],
	faq: [
		{
			question: 'How do I import a crosshair code in CS2?',
			answer:
				'Open Settings, go to Game, then Crosshair, and use the Share or Import option. Paste the code and apply it. You can also export your own code from the same screen.',
		},
		{
			question: 'Should my crosshair have a dot?',
			answer:
				'It is personal. A center dot helps some players with precise taps, but it can hide small targets at long range. Try both for a few matches.',
		},
	],
	body: {
		format: 'markdown',
		value: `
**Short answer:** pick a static style, keep the lines short and the gap small, use a bright color with an outline, and test it in a few deathmatch games before ranked.

## Pick a style

The **classic static** style stays the same size whether you move or shoot. That makes it predictable, which is what you want for consistent aim. Dynamic styles show spread, but they also cover your target exactly when spread is high.

## Size, gap and thickness

- **Length:** short lines leave more of the target visible. Start around 2 to 3.
- **Gap:** a small negative or zero gap keeps the center tight.
- **Thickness:** 0.5 to 1 is enough on 1080p. Thicker lines hide heads at range.

## Color and outline

Bright cyan, green or yellow stands out on most maps. Turn on a thin **outline** so the crosshair is visible against bright walls and skies.

## Share and import codes

Every crosshair can be exported as a short code from the crosshair settings screen. Save your code somewhere safe so you can restore it after a reinstall, and import codes from friends to try their setups quickly.

## How to test a new crosshair

1. Play three deathmatch games.
2. Watch whether you lose sight of enemies behind the lines.
3. Adjust one value at a time.
`,
	},
};
