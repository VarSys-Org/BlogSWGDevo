import type { PostInput } from '../../schema';
import { mockCover } from '../cover';

export const post: PostInput = {
	slug: 'elden-ring-review',
	title: 'Elden Ring Review: Still the Open World to Beat?',
	description:
		'Our Elden Ring review, replayed in 2026: exploration, combat, difficulty and performance on PC, with a clear score, pros and cons and who it is for.',
	kind: 'review',
	category: 'reviews',
	tags: ['Elden Ring', 'RPG', 'Review', 'Open world'],
	games: ['elden-ring'],
	author: 'kavin-r',
	publishedAt: '2026-09-12T12:00:00+05:30',
	updatedAt: '2026-09-20T12:00:00+05:30',
	cover: mockCover('posts', 'elden-ring-review', 'A lone knight on horseback looking over a misty open world'),
	featured: true,
	review: {
		score: 9.5,
		verdict:
			'A huge, strange and generous open world that trusts you to find your own way. Hard, but fair, and more flexible than its reputation suggests.',
		pros: [
			'Exploration that rewards curiosity at every turn',
			'Many builds and spirit summons let you set your own difficulty',
			'Boss design that stays memorable long after the credits',
		],
		cons: [
			'Very little guidance on quests and where to go',
			'Some late-game bosses feel tuned for co-op',
			'PC version still has occasional traversal stutter',
		],
		testedOn: 'PC, 80 hours, current patch',
	},
	keyPoints: [
		'Score: 9.5 out of 10.',
		'Best for players who enjoy finding things on their own.',
		'If it feels too hard, change your build or use summons before giving up.',
	],
	faq: [
		{
			question: 'Is Elden Ring good for beginners?',
			answer:
				'It can be. The open world lets you leave a hard boss and come back stronger, and summons make fights easier. Expect to die a lot early on; that is part of how the game teaches you.',
		},
		{
			question: 'How long does it take to beat Elden Ring?',
			answer:
				'A focused run takes around 50 to 60 hours. Players who explore most of the map often spend 100 hours or more.',
		},
	],
	body: {
		format: 'markdown',
		value: `
**Verdict in one line:** Elden Ring is still the open world that best rewards curiosity, and its difficulty is more flexible than its reputation.

## Exploration

The map does not hand you a checklist. You see a castle on the horizon and ride to it. You find a cave behind a waterfall because you wondered what was there. That sense of discovery is the main reason to play, and it holds up years later.

## Combat and difficulty

Combat is about reading patterns and picking your moment. It is demanding, but you have more control over the difficulty than it first seems:

- **Leave and come back.** Most areas can wait while you level up elsewhere.
- **Spirit summons** take some of the pressure off in boss fights.
- **Builds matter.** Magic and ranged builds play very differently from heavy melee.

### Where it stumbles

A few late bosses hit hard and fast enough that solo players may feel stuck. And quest steps are easy to miss without a guide.

## Performance on PC

On our mid-range test PC the game held its frame cap in most areas. We still saw brief stutter when riding into new zones. It is not game-breaking, but worth knowing.

## Who should play it

Play it if you enjoy exploring without a map full of icons and do not mind learning through failure. Skip it if you want a story told through cutscenes and clear quest markers.
`,
	},
};
