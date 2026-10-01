import type { PostInput } from '../../schema';
import { mockCover } from '../cover';

export const post: PostInput = {
	slug: 'minecraft-beginner-guide',
	title: 'Minecraft Beginner Guide: Your First 10 Days in Survival',
	description:
		'A day-by-day Minecraft survival guide for beginners: first night shelter, food, iron tools, a safe base and your first trip to the Nether.',
	kind: 'guide',
	category: 'guides',
	tags: ['Minecraft', 'Beginner', 'Survival'],
	games: ['minecraft'],
	author: 'devo',
	publishedAt: '2026-09-22T10:00:00+05:30',
	cover: mockCover('posts', 'minecraft-beginner-guide', 'Small wooden Minecraft house at sunset next to a crop farm'),
	featured: true,
	level: 'beginner',
	patch: 'Java and Bedrock, Sep 2026',
	keyPoints: [
		'Day 1: wood, a crafting table, stone tools and a shelter before dark.',
		'Days 2 to 3: a wheat farm and a bed so you can skip nights.',
		'Days 4 to 6: mine for iron and make a full set of iron tools and armour.',
		'Days 7 to 10: a proper base, a furnace line and your first Nether portal.',
	],
	faq: [
		{
			question: 'What should I do first in Minecraft survival?',
			answer:
				'Punch a tree for wood, make a crafting table, then wooden and stone tools. Find or dig a small shelter before the first night, because monsters spawn in the dark.',
		},
		{
			question: 'How do I skip the night in Minecraft?',
			answer:
				'Craft a bed from three wool and three planks and sleep in it. Sheep give wool, so they are worth finding on day one.',
		},
	],
	body: {
		format: 'markdown',
		value: `
**Short answer:** survive the first night, then spend each day on one goal: food, then iron, then a real base. Players who try to do everything at once usually die in a cave with a full inventory.

## Day 1: Wood, tools and a shelter

Break logs from the nearest trees until you have about 20. Turn some into planks, craft a **crafting table** and then a wooden pickaxe. Use it to mine a few cobblestone blocks and upgrade straight to **stone tools**: pickaxe, axe and sword.

Before the sun sets, dig into a hillside and close the entrance behind you. A 2x3 room is enough. Place a torch if you found coal; if not, make charcoal later by smelting logs.

## Days 2 and 3: Food and a bed

Food stops you from starving and lets you heal. The fastest safe sources are:

- **Animals:** cows, pigs, sheep and chickens. Cook the meat in a furnace.
- **Wheat:** break tall grass for seeds, then plant them next to water.

Find three sheep for wool and craft a **bed**. Sleeping skips the night and sets your respawn point, which is the single biggest safety upgrade in the early game.

## Days 4 to 6: Iron

Iron ore shows up as stone with beige spots. Look in cave walls and exposed cliffs. You want about 24 ingots for a full set of tools and armour, plus a few spare for a bucket and shield.

### Safe mining rules

1. Never dig straight down.
2. Carry a water bucket once you have one: it saves you from lava and falls.
3. Light up caves behind you so you can find the way out.

## Days 7 to 10: Base and the Nether

Build a base near your farm with a chest room, a few furnaces and a crafting area. Then look for **obsidian** or make it by pouring water on still lava. Ten obsidian blocks and a flint and steel open a **Nether portal**, which unlocks blaze rods, quartz and the rest of the game.

## Common beginner mistakes

- Leaving the shelter at night without armour.
- Mining diamonds with a stone pickaxe, which drops nothing.
- Forgetting where your base is. Write down your coordinates.
`,
	},
};
