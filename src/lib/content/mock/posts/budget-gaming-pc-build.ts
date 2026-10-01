import type { PostInput } from '../../schema';
import { mockCover } from '../cover';

export const post: PostInput = {
	slug: 'budget-gaming-pc-build',
	title: 'Budget Gaming PC Build Guide: Where to Spend and Where to Save',
	description:
		'How to plan a budget gaming PC part by part: which parts to spend on, where you can save safely, and the mistakes that cost the most performance.',
	kind: 'guide',
	category: 'hardware',
	tags: ['PC', 'PC build', 'Budget', 'Hardware'],
	games: [],
	author: 'kavin-r',
	publishedAt: '2026-09-08T10:00:00+05:30',
	cover: mockCover('posts', 'budget-gaming-pc-build', 'Open PC case with a graphics card and blue lighting'),
	level: 'beginner',
	keyPoints: [
		'Put the largest share of the budget into the graphics card.',
		'A 6-core CPU is the sweet spot for most current games.',
		'Never save on the power supply; buy a known brand with a proper rating.',
		'16 GB of dual-channel RAM is the minimum, 32 GB if you also stream.',
	],
	faq: [
		{
			question: 'How much of my budget should go on the graphics card?',
			answer:
				'For a gaming-only PC, roughly 35 to 45 percent. The GPU decides your frame rate in most games far more than any other part.',
		},
		{
			question: 'Can I upgrade a budget PC later?',
			answer:
				'Yes, if you plan for it. Choose a motherboard platform with an upgrade path and a power supply with headroom, so a better GPU or CPU drops in later.',
		},
	],
	body: {
		format: 'markdown',
		value: `
**Short answer:** spend on the graphics card, choose a 6-core CPU, get 16 GB of dual-channel RAM and a fast NVMe SSD, and never cut corners on the power supply. Prices change every week, so use this as a plan, then check current prices before you buy.

## How to split the budget

| Part | Share of budget | Notes |
| --- | --- | --- |
| Graphics card | 35 to 45% | Biggest effect on FPS |
| CPU | 15 to 20% | 6 cores is the sweet spot |
| Motherboard | 10 to 12% | Pick one with an upgrade path |
| RAM | 6 to 8% | 16 GB, two sticks |
| SSD | 6 to 8% | 1 TB NVMe |
| Power supply | 6 to 8% | Known brand, 80 Plus rated |
| Case and cooling | 6 to 8% | Good airflow beats looks |

## Where to spend

### Graphics card

The GPU sets your frame rate in almost every modern game. Check benchmarks for the games you actually play at the resolution you actually use.

### Power supply

A cheap, unrated power supply can fail and take other parts with it. Buy from a brand with good reviews and leave about 30 percent headroom over your system's needs.

## Where you can save

- **Case:** a plain case with mesh front panel cools better than many expensive glass ones.
- **CPU cooler:** the boxed cooler is fine for most mid-range CPUs at stock speeds.
- **RGB:** skip it entirely until everything else is sorted.

## Mistakes that cost performance

1. Running RAM in single-channel with one stick.
2. Forgetting to turn on the RAM XMP or EXPO profile in BIOS.
3. Plugging the monitor into the motherboard instead of the graphics card.
4. Pairing a very strong GPU with a weak 4-core CPU.
`,
	},
};
