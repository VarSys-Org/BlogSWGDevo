// The only module pages import for content. It picks the backend, checks
// every record against the schema, links posts to their authors, categories
// and games, renders bodies once, and answers every query the pages need.

import type { ContentSource } from './source';
import {
	authorSchema,
	categorySchema,
	gameSchema,
	postSchema,
	type Author,
	type Category,
	type Game,
	type Post,
} from './schema';
import { makeSlug, renderBody, type Heading } from './markdown';
import { mockSource } from './mock';
import { httpSource } from './http';

export type { Author, Category, Game, Post, Heading };
export type { ImageRef, Faq, Review, Video } from './schema';

const SOURCES: Record<string, ContentSource> = {
	mock: mockSource,
	http: httpSource,
};

export type Tag = { slug: string; name: string; count: number };

export type FullPost = Post & {
	url: string;
	categoryInfo: Category;
	authorInfo: Author;
	gameList: Game[];
	tagList: { slug: string; name: string }[];
	html: string;
	headings: Heading[];
	words: number;
	readMinutes: number;
	lastChanged: string;
};

type Library = {
	posts: FullPost[];
	authors: Author[];
	categories: Category[];
	games: Game[];
	tags: Tag[];
};

const WORDS_PER_MINUTE = 220;

function pickSource(): ContentSource {
	const name = String(import.meta.env.CONTENT_SOURCE || 'mock');
	const source = SOURCES[name];
	if (!source) {
		throw new Error(`Unknown CONTENT_SOURCE "${name}". Known: ${Object.keys(SOURCES).join(', ')}`);
	}
	return source;
}

function checkAll<T>(label: string, rows: unknown[], parse: (row: unknown) => T): T[] {
	return rows.map((row, index) => {
		try {
			return parse(row);
		} catch (error) {
			const id = (row as { slug?: string })?.slug ?? `#${index}`;
			throw new Error(`Content check failed for ${label} "${id}": ${(error as Error).message}`);
		}
	});
}

function findOrFail<T extends { slug: string }>(list: Map<string, T>, slug: string, what: string, owner: string): T {
	const found = list.get(slug);
	if (!found) throw new Error(`Post "${owner}" points to missing ${what} "${slug}"`);
	return found;
}

async function buildLibrary(): Promise<Library> {
	const source = pickSource();
	const [rawPosts, rawAuthors, rawCategories, rawGames] = await Promise.all([
		source.listPosts(),
		source.listAuthors(),
		source.listCategories(),
		source.listGames(),
	]);

	const authors = checkAll('author', rawAuthors, (row) => authorSchema.parse(row));
	const categories = checkAll('category', rawCategories, (row) => categorySchema.parse(row));
	const games = checkAll('game', rawGames, (row) => gameSchema.parse(row));
	const posts = checkAll('post', rawPosts, (row) => postSchema.parse(row));

	const authorMap = new Map(authors.map((a) => [a.slug, a]));
	const categoryMap = new Map(categories.map((c) => [c.slug, c]));
	const gameMap = new Map(games.map((g) => [g.slug, g]));

	const seen = new Set<string>();
	const fullPosts: FullPost[] = posts
		.filter((post) => !post.draft)
		.map((post) => {
			if (seen.has(post.slug)) throw new Error(`Two posts share the slug "${post.slug}"`);
			seen.add(post.slug);
			const rendered = renderBody(post.body);
			const extraWords = [...post.keyPoints, ...post.faq.flatMap((item) => [item.question, item.answer])]
				.join(' ')
				.split(/\s+/)
				.filter(Boolean).length;
			return {
				...post,
				url: `/blog/${post.slug}/`,
				categoryInfo: findOrFail(categoryMap, post.category, 'category', post.slug),
				authorInfo: findOrFail(authorMap, post.author, 'author', post.slug),
				gameList: post.games.map((slug) => findOrFail(gameMap, slug, 'game', post.slug)),
				tagList: post.tags.map((name) => ({ name, slug: makeSlug(name) })),
				html: rendered.html,
				headings: rendered.headings,
				words: rendered.words,
				readMinutes: Math.max(1, Math.ceil((rendered.words + extraWords) / WORDS_PER_MINUTE)),
				lastChanged: post.updatedAt ?? post.publishedAt,
			};
		})
		.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

	const tagCounts = new Map<string, Tag>();
	for (const post of fullPosts) {
		for (const tag of post.tagList) {
			const current = tagCounts.get(tag.slug);
			if (current) current.count += 1;
			else tagCounts.set(tag.slug, { ...tag, count: 1 });
		}
	}
	const tags = [...tagCounts.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

	return { posts: fullPosts, authors, categories, games, tags };
}

// Build once per process; every page in a static build shares the result.
let library: Promise<Library> | undefined;
function getLibrary(): Promise<Library> {
	library ??= buildLibrary();
	return library;
}

export async function getPosts(): Promise<FullPost[]> {
	return (await getLibrary()).posts;
}

export async function getPost(slug: string): Promise<FullPost | undefined> {
	return (await getPosts()).find((post) => post.slug === slug);
}

export async function getFeaturedPosts(limit = 4): Promise<FullPost[]> {
	const posts = await getPosts();
	const featured = posts.filter((post) => post.featured);
	return (featured.length ? featured : posts).slice(0, limit);
}

export async function getCategories(): Promise<(Category & { count: number })[]> {
	const { categories, posts } = await getLibrary();
	return categories.map((category) => ({
		...category,
		count: posts.filter((post) => post.category === category.slug).length,
	}));
}

export async function getCategory(slug: string): Promise<Category | undefined> {
	return (await getLibrary()).categories.find((category) => category.slug === slug);
}

export async function getPostsInCategory(slug: string): Promise<FullPost[]> {
	return (await getPosts()).filter((post) => post.category === slug);
}

export async function getTags(): Promise<Tag[]> {
	return (await getLibrary()).tags;
}

export async function getPostsWithTag(slug: string): Promise<FullPost[]> {
	return (await getPosts()).filter((post) => post.tagList.some((tag) => tag.slug === slug));
}

export async function getGames(): Promise<(Game & { count: number })[]> {
	const { games, posts } = await getLibrary();
	return games.map((game) => ({
		...game,
		count: posts.filter((post) => post.games.includes(game.slug)).length,
	}));
}

export async function getPostsForGame(slug: string): Promise<FullPost[]> {
	return (await getPosts()).filter((post) => post.games.includes(slug));
}

export async function getAuthors(): Promise<Author[]> {
	return (await getLibrary()).authors;
}

export async function getPostsByAuthor(slug: string): Promise<FullPost[]> {
	return (await getPosts()).filter((post) => post.author === slug);
}

// Related posts drive internal linking, which spreads ranking strength
// across the site. Score: same game > shared tag > same category.
export async function getRelatedPosts(post: FullPost, limit = 3): Promise<FullPost[]> {
	const others = (await getPosts()).filter((other) => other.slug !== post.slug);
	const tagSet = new Set(post.tagList.map((tag) => tag.slug));
	const scored = others.map((other) => {
		let score = 0;
		score += other.games.filter((game) => post.games.includes(game)).length * 4;
		score += other.tagList.filter((tag) => tagSet.has(tag.slug)).length * 2;
		if (other.category === post.category) score += 1;
		return { other, score };
	});
	return scored
		.filter((item) => item.score > 0)
		.sort((a, b) => b.score - a.score || Date.parse(b.other.publishedAt) - Date.parse(a.other.publishedAt))
		.slice(0, limit)
		.map((item) => item.other);
}

export function splitPages<T>(items: T[], size: number): T[][] {
	const pages: T[][] = [];
	for (let i = 0; i < items.length; i += size) pages.push(items.slice(i, i + size));
	return pages.length ? pages : [[]];
}
