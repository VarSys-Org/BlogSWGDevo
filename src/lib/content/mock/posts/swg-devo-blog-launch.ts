import type { PostInput } from '../../schema';
import { mockCover } from '../cover';

export const post: PostInput = {
	slug: 'swg-devo-blog-launch',
	title: 'The SWG Devo Blog Is Live: What You Will Find Here',
	description:
		'The SWG Devo channel now has a blog. Here is what we will publish, how we test settings and reviews, and how to suggest the next guide.',
	kind: 'news',
	category: 'news',
	tags: ['Channel update'],
	games: [],
	author: 'devo',
	publishedAt: '2026-09-30T20:00:00+05:30',
	cover: mockCover('posts', 'swg-devo-blog-launch', 'SWG Devo logo glowing on a dark streaming setup'),
	keyPoints: [
		'Written guides for every major video, with settings you can copy.',
		'Reviews with clear scores and the platform we tested on.',
		'Suggest topics through Discord or the contact page.',
	],
	body: {
		format: 'markdown',
		value: `
The channel has grown, and so have the questions in the comments. Many of them need an answer you can scroll back to, copy and share. That is what this blog is for.

## What we will publish

- **Guides:** the written version of our settings and tips videos, with every value listed.
- **Reviews:** honest scores, pros and cons, and the exact platform and patch we tested.
- **Hardware:** builds and buying advice from the setups we actually use.
- **Esports:** ranked tips and how the competitive scene works.

## How we test

Every settings guide is tried on at least two devices before it goes live, and each guide shows the patch it was checked on. When a patch changes something, we update the guide and the "Updated" date at the top.

## Tell us what to cover next

Join the Discord or use the contact page. The most-asked questions become the next guides.
`,
	},
};
