import type { PostInput } from '../../schema';
import { mockCover } from '../cover';

export const post: PostInput = {
	slug: 'minecraft-redstone-basics',
	title: 'Minecraft Redstone Basics: Power, Repeaters and Your First Door',
	description:
		'Learn Minecraft redstone from zero: power sources, dust, repeaters and comparators, then build a hidden piston door step by step.',
	kind: 'guide',
	category: 'guides',
	tags: ['Minecraft', 'Redstone', 'Building'],
	games: ['minecraft'],
	author: 'devo',
	publishedAt: '2026-07-30T10:00:00+05:30',
	cover: mockCover('posts', 'minecraft-redstone-basics', 'Redstone dust lines and pistons glowing red underground'),
	level: 'intermediate',
	patch: 'Java Edition, Sep 2026',
	keyPoints: [
		'Redstone dust carries a signal up to 15 blocks.',
		'Repeaters refresh the signal and can add a delay.',
		'Comparators read containers and compare signals.',
		'A 2x2 piston door needs only sticky pistons, dust and a lever.',
	],
	faq: [
		{
			question: 'Why does my redstone signal stop?',
			answer:
				'Redstone dust loses one power level per block and stops after 15. Place a repeater to boost the signal back to full strength.',
		},
	],
	body: {
		format: 'markdown',
		value: `
**Short answer:** redstone is wiring. A power source sends a signal through dust, repeaters keep it strong, and devices like pistons and lamps react to it.

## Power sources

- **Lever:** stays on or off.
- **Button:** sends a short pulse.
- **Pressure plate:** on while something stands on it.
- **Redstone torch:** always on, unless the block it sits on is powered.

## Redstone dust

Dust carries the signal. Power drops by one level each block, so the signal fades after 15 blocks.

## Repeaters and comparators

### Repeaters

A repeater boosts the signal back to full strength and adds a delay you can set by right-clicking it. Signals only go one way through a repeater.

### Comparators

A comparator can read how full a chest or furnace is, and compare two signals. It is the starting point for sorting systems.

## Build your first piston door

1. Dig a 2-wide, 2-high doorway in a wall.
2. Place two sticky pistons on each side, facing the doorway.
3. Put the door blocks on the piston faces.
4. Run dust from a lever to all four pistons, using repeaters if needed.
5. Flip the lever: the door opens.

## Next steps

Try a hidden staircase or an automatic farm with an observer. Each new build teaches one new part.
`,
	},
};
