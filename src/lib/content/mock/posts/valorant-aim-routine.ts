import type { PostInput } from '../../schema';
import { mockCover } from '../cover';

export const post: PostInput = {
	slug: 'valorant-aim-routine',
	title: 'A 20-Minute Valorant Aim Routine That Fits Before Every Session',
	description:
		'A short daily Valorant aim routine using the Range and Deathmatch: crosshair placement, flicks, tracking and counter-strafing, with how to measure progress.',
	kind: 'guide',
	category: 'esports',
	tags: ['Valorant', 'Aim', 'Improvement', 'Ranked'],
	games: ['valorant'],
	author: 'devo',
	publishedAt: '2026-07-22T19:00:00+05:30',
	cover: mockCover('posts', 'valorant-aim-routine', 'Practice range targets with a crosshair lined up at head height'),
	level: 'intermediate',
	patch: 'Live build, Sep 2026',
	keyPoints: [
		'5 minutes of crosshair placement drills at head height.',
		'5 minutes of bots on medium for flicks and first-shot accuracy.',
		'10 minutes of Deathmatch focusing on counter-strafing.',
	],
	faq: [
		{
			question: 'Are aim trainers better than in-game practice?',
			answer:
				'Aim trainers help raw mouse control, but in-game practice teaches the real movement and timing. A short mix of both works best.',
		},
	],
	body: {
		format: 'markdown',
		value: `
**Short answer:** 5 minutes of crosshair placement, 5 minutes of bots, 10 minutes of Deathmatch with one focus. Short and consistent beats long and random.

## Minutes 0 to 5: Crosshair placement

In the Range, walk around corners with your crosshair at head height, where an enemy would appear. Most kills at higher ranks come from good placement, not big flicks.

## Minutes 5 to 10: Bots

Set bots to medium with armour. Aim for the head with your first bullet only, then reset. You are training accuracy before speed.

## Minutes 10 to 20: Deathmatch with one focus

Pick a single focus for the whole game:

- **Counter-strafe:** stop fully before you shoot.
- **Spray control:** first 5 bullets only, then reset.
- **Clearing angles:** check common spots in order.

## Track it

Write down one number per day, such as headshot percentage in Deathmatch. Progress is slow but visible over a few weeks.

## Common mistakes

1. Practising tired at the end of a session.
2. Changing sensitivity every week.
3. Only flicking and never working on placement.
`,
	},
};
