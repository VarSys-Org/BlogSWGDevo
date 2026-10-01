import type { PostInput } from '../../schema';
import { mockCover } from '../cover';

export const post: PostInput = {
	slug: 'fortnite-building-tips',
	title: 'Fortnite Building Tips for Beginners: 7 Habits to Learn First',
	description:
		'Seven Fortnite building habits that make the biggest difference for new players: binds, ramps, walls, edits and practice routines that build muscle memory.',
	kind: 'guide',
	category: 'guides',
	tags: ['Fortnite', 'Beginner', 'Building'],
	games: ['fortnite'],
	author: 'devo',
	publishedAt: '2026-08-28T13:00:00+05:30',
	cover: mockCover('posts', 'fortnite-building-tips', 'Ramps and walls rising quickly in a building fight'),
	level: 'beginner',
	keyPoints: [
		'Move build pieces to keys you can press without leaving movement keys.',
		'Learn the 90s only after a wall plus ramp is automatic.',
		'Practise edits in creative for 10 minutes before every session.',
	],
	faq: [
		{
			question: 'Should I play Zero Build to learn Fortnite?',
			answer:
				'Zero Build is great for learning gunfights and rotations. If you want to compete in build modes later, add a short building practice in creative alongside it.',
		},
	],
	body: {
		format: 'markdown',
		value: `
**Short answer:** fix your keybinds first, then make "wall then ramp" automatic, then learn edits. Fancy techniques only work once the basics need no thought.

## 1. Rebind your build keys

Put wall, floor, stairs and roof on keys next to your movement keys, or on mouse side buttons. If you have to move your hand to build, you will build too late.

## 2. Wall first, then ramp

When you are shot, place a wall in front of you, then a ramp behind it. This one habit wins more fights for beginners than anything else.

## 3. Take high ground carefully

Height helps, but a tall ramp with no walls is easy to shoot out from under you. Add walls on the sides as you climb.

## 4. Use edits to peek

Edit a window or a door into your wall to shoot, then reset the edit. Peeking from cover is safer than jumping out.

## 5. Practise in short daily sessions

Ten focused minutes in a creative map every day builds muscle memory faster than one long session a week.

## 6. Watch your materials

Do not spend all your wood in one fight. Farm between fights so you always have enough to protect yourself.

## 7. Review your deaths

After every loss, ask one question: did I build too late, too little, or in the wrong place? Fix that one thing next match.
`,
	},
};
