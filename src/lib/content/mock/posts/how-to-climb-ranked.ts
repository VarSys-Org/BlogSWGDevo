import type { PostInput } from '../../schema';
import { mockCover } from '../cover';

export const post: PostInput = {
	slug: 'how-to-climb-ranked',
	title: 'How to Climb Ranked in Any Competitive Game',
	description:
		'A practical plan to climb ranked in shooters and battle royales: warm-ups, session limits, VOD review, comms and the habits that stop losing streaks.',
	kind: 'guide',
	category: 'esports',
	tags: ['Ranked', 'Esports', 'Improvement'],
	games: ['valorant', 'counter-strike-2', 'bgmi'],
	author: 'devo',
	publishedAt: '2026-08-06T18:00:00+05:30',
	cover: mockCover('posts', 'how-to-climb-ranked', 'Rank emblems rising on a competitive ladder'),
	level: 'intermediate',
	keyPoints: [
		'Warm up for 10 to 15 minutes before your first ranked game.',
		'Stop after two losses in a row; tilt costs more rank than skill does.',
		'Review one death per game and fix its cause.',
		'Short, useful callouts help more than playing silent.',
	],
	faq: [
		{
			question: 'How many ranked games should I play per day?',
			answer:
				'Quality beats volume. Three to five focused games with a warm-up usually climb faster than a long session played tired.',
		},
	],
	body: {
		format: 'markdown',
		value: `
**Short answer:** play fewer, better games. Warm up, set a stop rule, review your mistakes and talk to your team. Rank follows habits.

## Warm up before ranked

Your first game of the day is often your worst. Spend 10 to 15 minutes in an aim trainer, deathmatch or training ground first.

## Set a stop rule

Decide before you start: two losses in a row means a break. Tilted players take worse fights and lose more games, and that costs more rank than any single skill gap.

## Review one death per game

You do not need to watch full matches. Pick one death and ask:

1. Did I have information about the enemy?
2. Was I in a position my team could support?
3. Did I take the fight on my terms?

## Talk to your team

Short, clear callouts help everyone: how many enemies, where, how hurt. Skip blame; it never wins rounds.

## Play a small pool

Stick to two or three characters, agents or roles. Knowing them deeply beats knowing many a little.

## Track progress, not just rank

Rank moves up and down. Track things you control: your warm-up streak, deaths reviewed, average damage. Those climb steadily, and rank follows.
`,
	},
};
