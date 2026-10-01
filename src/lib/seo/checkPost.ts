// Ranking checklist for one post. Used live in the admin editor and by the
// MCP `blog_seo_check` tool, so writers and agents get the same advice.
// Each check is a real on-page factor; the score is a guide, not a promise.

import { renderBody } from '../content/markdown.ts';

export type CheckLevel = 'good' | 'warn' | 'bad';
export type Check = { id: string; level: CheckLevel; text: string };
export type CheckResult = { score: number; words: number; checks: Check[] };

type PostLike = {
	slug?: string;
	title?: string;
	seoTitle?: string;
	description?: string;
	kind?: string;
	tags?: string[];
	games?: string[];
	cover?: { alt?: string };
	body?: { format: 'markdown' | 'html'; value: string };
	keyPoints?: string[];
	faq?: unknown[];
	review?: unknown;
	patch?: string;
	publishedAt?: string;
	updatedAt?: string;
};

const WEIGHT: Record<CheckLevel, number> = { good: 1, warn: 0.5, bad: 0 };

function has(text: string | undefined, word: string): boolean {
	return Boolean(text && word && text.toLowerCase().includes(word.toLowerCase()));
}

export function checkPost(post: PostLike, gameNames: string[] = []): CheckResult {
	const checks: Check[] = [];
	const add = (id: string, level: CheckLevel, text: string) => checks.push({ id, level, text });

	const title = post.seoTitle || post.title || '';
	const description = post.description ?? '';
	const rendered = post.body ? renderBody(post.body) : { html: '', headings: [], words: 0 };
	const firstPara = /<p>([\s\S]*?)<\/p>/.exec(rendered.html)?.[1] ?? '';
	const h2Count = rendered.headings.filter((h) => h.depth === 2).length;
	const internalLinks = (rendered.html.match(/href="\/(?!\/)/g) ?? []).length;
	const kind = post.kind ?? 'article';
	const isGuide = kind === 'guide' || kind === 'list';

	// The main search phrase: the first game, else the first tag.
	const focus = gameNames[0] || post.tags?.[0] || '';

	if (title.length >= 30 && title.length <= 60) add('title-length', 'good', `Search title is ${title.length} characters (30-60 is ideal).`);
	else if (title.length > 60) add('title-length', 'warn', `Search title is ${title.length} characters; Google cuts it near 60. Add a shorter SEO title.`);
	else add('title-length', 'bad', `Search title is only ${title.length} characters. Aim for 30-60 with the main search phrase.`);

	if (description.length >= 120 && description.length <= 158) add('description-length', 'good', `Description is ${description.length} characters (120-158 is ideal).`);
	else if (description.length > 158) add('description-length', 'warn', `Description is ${description.length} characters; it will be cut. Keep it under 158.`);
	else add('description-length', 'bad', `Description is ${description.length} characters. Write 120-158 that answer the search.`);

	if (focus) {
		add('focus-title', has(title, focus) ? 'good' : 'bad', has(title, focus) ? `Title includes "${focus}".` : `Put "${focus}" in the title.`);
		add('focus-description', has(description, focus) ? 'good' : 'warn', has(description, focus) ? `Description includes "${focus}".` : `Mention "${focus}" in the description.`);
		add('focus-intro', has(firstPara, focus) ? 'good' : 'warn', has(firstPara, focus) ? 'First paragraph mentions the main topic.' : `Mention "${focus}" in the first paragraph.`);
	} else {
		add('focus', 'bad', 'Add a game or tags so the post has a clear main topic.');
	}

	const wordGoal = kind === 'news' ? 300 : 900;
	if (rendered.words >= wordGoal) add('words', 'good', `${rendered.words} words: enough depth for this kind of post.`);
	else if (rendered.words >= wordGoal / 2) add('words', 'warn', `${rendered.words} words. Posts that rank for "${kind}" searches usually have ${wordGoal}+ useful words.`);
	else add('words', 'bad', `Only ${rendered.words} words. Add steps, examples and reasons (aim for ${wordGoal}+).`);

	add('headings', h2Count >= 3 ? 'good' : h2Count >= 1 ? 'warn' : 'bad', `${h2Count} section headings (## ...). Use 3+ so readers and Google can jump to answers.`);

	const points = post.keyPoints?.length ?? 0;
	add('key-points', points >= 3 ? 'good' : points ? 'warn' : 'bad', points >= 3 ? `${points} key points: good for featured snippets.` : 'Add 3-5 key points: the short answer at the top.');

	const faqs = post.faq?.length ?? 0;
	if (kind !== 'news') add('faq', faqs >= 2 ? 'good' : faqs ? 'warn' : 'warn', faqs >= 2 ? `${faqs} FAQ answers (FAQ rich data).` : 'Add 2-4 FAQ items taken from real player questions.');

	add('internal-links', internalLinks >= 2 ? 'good' : internalLinks ? 'warn' : 'bad', internalLinks ? `${internalLinks} links to other pages on the site.` : 'Link to at least 2 related posts or game hubs inside the body.');

	add('cover-alt', post.cover?.alt?.trim() ? 'good' : 'bad', post.cover?.alt?.trim() ? 'Cover image has alt text.' : 'Describe the cover image in its alt text.');

	if (kind === 'guide' || kind === 'review') {
		add('game-link', post.games?.length ? 'good' : 'warn', post.games?.length ? 'Linked to a game hub.' : 'Link the post to its game so it appears on the game hub.');
	}
	if (isGuide) add('patch', post.patch ? 'good' : 'warn', post.patch ? `Tested-on note: ${post.patch}.` : 'Add the game patch or date you tested on (freshness signal).');
	if (kind === 'review') add('review', post.review ? 'good' : 'bad', post.review ? 'Review score, pros and cons are filled in.' : 'Fill in the review score, verdict, pros and cons.');

	const tagCount = post.tags?.length ?? 0;
	add('tags', tagCount >= 2 && tagCount <= 6 ? 'good' : 'warn', `${tagCount} tags (2-6 works best).`);

	if (post.slug) add('slug', post.slug.length <= 60 ? 'good' : 'warn', post.slug.length <= 60 ? 'Short, readable URL.' : 'Shorten the URL slug (under 60 characters).');

	const last = Date.parse(post.updatedAt || post.publishedAt || '');
	if (!Number.isNaN(last) && isGuide) {
		const days = Math.round((Date.now() - last) / 86_400_000);
		add('fresh', days <= 180 ? 'good' : 'warn', days <= 180 ? `Checked ${days} days ago.` : `Last checked ${days} days ago. Re-test and update the date.`);
	}

	const score = Math.round((checks.reduce((sum, check) => sum + WEIGHT[check.level], 0) / checks.length) * 100);
	return { score, words: rendered.words, checks };
}
