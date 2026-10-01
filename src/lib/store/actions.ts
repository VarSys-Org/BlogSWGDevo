// Every change to the site goes through these two functions: `readItems` and
// `writeItem`. The admin API and the MCP server both call them, so a change
// made by a person in /admin and a change made by an agent follow exactly the
// same checks: schema validation, links between records, safe deletes and
// automatic redirects when a post URL changes.
//
// Plain TypeScript with `.ts` imports so Node can run it without a bundler.

import { join } from 'node:path';
import {
	authorSchema,
	categorySchema,
	gameSchema,
	postSchema,
	redirectsSchema,
	siteSchema,
	type Author,
	type Category,
	type Game,
	type Post,
	type Site,
} from '../content/schema.ts';
import { makeSlug } from '../content/markdown.ts';
import { checkPost } from '../seo/checkPost.ts';
import { contentDir, listPostFiles, postsDir, putInTrash, readJson, removeFile, saveJson } from './files.ts';
import { listMedia } from './media.ts';
import { StoreError } from './errors.ts';

export const TYPES = ['posts', 'categories', 'games', 'authors', 'site', 'media', 'redirects', 'summary'] as const;
export type ItemType = (typeof TYPES)[number];
type ListType = 'categories' | 'games' | 'authors';

export { StoreError };

type Issue = { path: (string | number)[]; message: string };
function checkWith<T>(schema: { safeParse(v: unknown): { success: true; data: T } | { success: false; error: { issues: Issue[] } } }, value: unknown, label: string): T {
	const result = schema.safeParse(value);
	if (result.success) return result.data;
	const issues = result.error.issues.map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`);
	throw new StoreError(`${label} is not valid`, issues);
}

// ---------- File access ----------

const listFile = (type: ListType) => join(contentDir(), `${type}.json`);
const siteFile = () => join(contentDir(), 'site.json');
const redirectsFile = () => join(contentDir(), 'redirects.json');
const postFile = (slug: string) => join(postsDir(), `${slug}.json`);

const LIST_SCHEMAS = { categories: categorySchema, games: gameSchema, authors: authorSchema } as const;

async function getList<T>(type: ListType): Promise<T[]> {
	return readJson<T[]>(listFile(type), []);
}

export async function getAllPosts(): Promise<Post[]> {
	const names = await listPostFiles();
	const posts = await Promise.all(names.map((name) => readJson<Post | null>(join(postsDir(), name), null)));
	return posts.filter((post): post is Post => Boolean(post));
}

async function getPostRaw(slug: string): Promise<Post | null> {
	return readJson<Post | null>(postFile(slug), null);
}

export async function getSite(): Promise<Site> {
	return readJson<Site>(siteFile(), {} as Site);
}

export async function getRedirects(): Promise<Record<string, string>> {
	return readJson<Record<string, string>>(redirectsFile(), {});
}

// ---------- Field help (what `write` accepts) ----------

const FIELDS: Record<string, Record<string, string>> = {
	posts: {
		'title*': 'Headline shown on the page (h1).',
		slug: 'URL part, lowercase-with-dashes. Made from the title when left out. Changing it adds a redirect from the old URL.',
		seoTitle: 'Search result title when the headline is longer than ~60 characters.',
		'description*': '120-158 characters. Shown in search results and share cards.',
		kind: 'article | guide | review | news | list (default article).',
		'category*': 'Category slug (read type=categories).',
		'author*': 'Author slug (read type=authors).',
		tags: 'List of tag names, 2-6 works best.',
		games: 'List of game slugs (read type=games). Puts the post on each game hub.',
		body: 'Markdown string, or { format: "markdown" | "html", value }. Use ## for sections, - for lists, [text](/blog/slug/) for links.',
		keyPoints: 'List of 3-5 short answers shown in the "In short" box.',
		faq: 'List of { question, answer }.',
		review: 'For kind=review: { score 0-10, verdict, pros[], cons[], testedOn }. Send null to remove.',
		video: '{ youtubeId, title, description, uploadDate ISO, duration "PT12M30S" }. Send null to remove.',
		cover: 'ImageRef from blog_upload (image field). A default image is used when left out.',
		level: 'beginner | intermediate | advanced.',
		patch: 'Game patch or date the guide was tested on, e.g. "Live build, Oct 2026".',
		publishedAt: 'ISO date. Defaults to now on create.',
		updatedAt: 'ISO date of the last meaningful update. Set it when you re-test or rewrite.',
		featured: 'true to show on the home page hero.',
		draft: 'New posts start as drafts (true). Set false to publish.',
		noindex: 'true hides the post from search engines.',
	},
	categories: {
		'name*': 'Display name.',
		slug: 'URL part. Made from the name when left out. Renaming updates every post.',
		seoTitle: 'Search title for the category page.',
		'description*': 'One line, under ~155 characters.',
		intro: 'Longer intro paragraph shown on the category page (helps it rank).',
	},
	games: {
		'name*': 'Game name.',
		slug: 'URL part. Made from the name when left out. Renaming updates every post.',
		'description*': 'One or two sentences about the game.',
		genres: 'List of genres.',
		platforms: 'List of platforms.',
		developer: 'Studio name.',
		publisher: 'Publisher name.',
		releaseYear: 'Number, e.g. 2024.',
		cover: 'ImageRef from blog_upload.',
	},
	authors: {
		'name*': 'Full name.',
		slug: 'URL part. Made from the name when left out.',
		'role*': 'Job title shown on posts.',
		'bio*': 'Two or three sentences on why they know the topic (trust signal).',
		expertise: 'List of topics.',
		links: 'List of { label, url } profiles.',
		avatar: 'ImageRef from blog_upload.',
	},
	site: {
		name: 'Brand name.',
		tagline: 'Short line used in the home page title.',
		description: 'Default meta description (under 160 characters).',
		social: 'List of { label, url, icon: youtube|instagram|discord|x|reddit|whatsapp }.',
		nav: 'Header links: list of { label, href }, max 8.',
		home: '{ eyebrow, title, introTitle, introText, shelves: [category slugs] }.',
		cta: '{ title, text } for the subscribe box.',
		youtubeChannel: 'Channel URL.',
		xHandle: '@handle for share cards.',
		postsPerPage: 'Number, 3-48.',
		minPostsToIndexTag: 'Tag pages with fewer posts are hidden from search.',
		verification: '{ google, bing } HTML-tag verification codes.',
		themeColor: 'Hex colour for the browser bar.',
	},
};

// ---------- Read ----------

export type ReadArgs = {
	type: ItemType;
	id?: string;
	q?: string;
	status?: 'draft' | 'published';
	limit?: number;
	fields?: boolean;
};

function matches(text: string, q?: string): boolean {
	if (!q) return true;
	const hay = text.toLowerCase();
	return q
		.toLowerCase()
		.split(/\s+/)
		.filter(Boolean)
		.every((word) => hay.includes(word));
}

async function getGameNames(slugs: string[]): Promise<string[]> {
	const games = await getList<Game>('games');
	return slugs.map((slug) => games.find((g) => g.slug === slug)?.name ?? slug);
}

export async function readItems(args: ReadArgs): Promise<unknown> {
	const { type, id, q, status } = args;
	const limit = Math.min(Math.max(args.limit ?? 50, 1), 500);

	if (args.fields) {
		if (!FIELDS[type]) throw new StoreError(`${type} has no editable fields`);
		return { type, fields: FIELDS[type], note: 'Fields marked * are required on create.' };
	}

	switch (type) {
		case 'posts': {
			if (id) {
				const post = await getPostRaw(id);
				if (!post) throw new StoreError(`No post with id "${id}"`);
				return { ...post, seo: checkPost(post, await getGameNames(post.games ?? [])) };
			}
			const games = await getList<Game>('games');
			const rows = (await getAllPosts())
				.filter((post) => (status ? (status === 'draft' ? post.draft : !post.draft) : true))
				.filter((post) => matches(`${post.title} ${post.description} ${post.tags.join(' ')} ${post.games.join(' ')} ${post.category}`, q))
				.sort((a, b) => Date.parse(b.updatedAt ?? b.publishedAt) - Date.parse(a.updatedAt ?? a.publishedAt));
			return {
				total: rows.length,
				rows: rows.slice(0, limit).map((post) => ({
					id: post.slug,
					title: post.title,
					kind: post.kind,
					category: post.category,
					games: post.games,
					draft: post.draft,
					featured: post.featured,
					publishedAt: post.publishedAt,
					updatedAt: post.updatedAt,
					cover: post.cover.src,
					seoScore: checkPost(post, post.games.map((slug) => games.find((g) => g.slug === slug)?.name ?? slug)).score,
				})),
			};
		}
		case 'categories':
		case 'games':
		case 'authors': {
			const list = await getList<{ slug: string; name: string }>(type);
			const posts = await getAllPosts();
			const usedBy = (slug: string) =>
				posts.filter((post) => (type === 'categories' ? post.category === slug : type === 'authors' ? post.author === slug : post.games.includes(slug))).length;
			if (id) {
				const item = list.find((row) => row.slug === id);
				if (!item) throw new StoreError(`No ${type} item with id "${id}"`);
				return { ...item, posts: usedBy(id) };
			}
			const rows = list.filter((row) => matches(JSON.stringify(row), q));
			return { total: rows.length, rows: rows.slice(0, limit).map((row) => ({ ...row, id: row.slug, posts: usedBy(row.slug) })) };
		}
		case 'site':
			return getSite();
		case 'redirects':
			return getRedirects();
		case 'media': {
			const rows = (await listMedia()).filter((item) => matches(`${item.id} ${item.alt}`, q));
			return { total: rows.length, rows: rows.slice(0, limit) };
		}
		case 'summary': {
			const posts = await getAllPosts();
			const games = await getList<Game>('games');
			const scored = posts.map((post) => ({
				id: post.slug,
				title: post.title,
				draft: post.draft,
				score: checkPost(post, post.games.map((slug) => games.find((g) => g.slug === slug)?.name ?? slug)).score,
			}));
			const live = scored.filter((p) => !p.draft);
			return {
				posts: posts.length,
				published: live.length,
				drafts: posts.length - live.length,
				categories: (await getList('categories')).length,
				games: games.length,
				authors: (await getList('authors')).length,
				media: (await listMedia()).length,
				averageSeoScore: live.length ? Math.round(live.reduce((s, p) => s + p.score, 0) / live.length) : 0,
				needsWork: scored.filter((p) => p.score < 70).sort((a, b) => a.score - b.score).slice(0, 10),
			};
		}
		default:
			throw new StoreError(`Unknown type "${type}". Use one of: ${TYPES.join(', ')}`);
	}
}

// ---------- Write ----------

export type WriteArgs = {
	type: ItemType;
	id?: string;
	data?: Record<string, unknown>;
	delete?: boolean;
	order?: string[];
};

export type WriteResult = { ok: true; action: 'created' | 'updated' | 'deleted' | 'reordered'; type: ItemType; id?: string; item?: unknown; note?: string };

const DEFAULT_COVER = { src: '/images/og-default.jpg', width: 1200, height: 630, alt: '' };

// Allow `body: "markdown text"` as a shortcut, and `null` to clear an optional field.
function tidyPostData(data: Record<string, unknown>): Record<string, unknown> {
	const out: Record<string, unknown> = { ...data };
	if (typeof out.body === 'string') out.body = { format: 'markdown', value: out.body };
	return out;
}

function mergeData<T extends Record<string, unknown>>(base: T, data: Record<string, unknown>): T {
	const out: Record<string, unknown> = { ...base };
	for (const [key, value] of Object.entries(data)) {
		if (value === null) delete out[key];
		else out[key] = value;
	}
	return out as T;
}

async function checkPostLinks(post: Post): Promise<void> {
	const [categories, authors, games] = await Promise.all([
		getList<Category>('categories'),
		getList<Author>('authors'),
		getList<Game>('games'),
	]);
	const issues: string[] = [];
	if (!categories.some((c) => c.slug === post.category)) issues.push(`category: "${post.category}" does not exist (read type=categories)`);
	if (!authors.some((a) => a.slug === post.author)) issues.push(`author: "${post.author}" does not exist (read type=authors)`);
	for (const slug of post.games) if (!games.some((g) => g.slug === slug)) issues.push(`games: "${slug}" does not exist (read type=games)`);
	if (issues.length) throw new StoreError('Post points to missing records', issues);
}

async function addRedirect(fromPath: string, toPath: string): Promise<void> {
	const redirects = await getRedirects();
	for (const [from, to] of Object.entries(redirects)) if (to === fromPath) redirects[from] = toPath;
	redirects[fromPath] = toPath;
	delete redirects[toPath];
	await saveJson(redirectsFile(), checkWith(redirectsSchema, redirects, 'redirects'));
}

async function writePost(args: WriteArgs): Promise<WriteResult> {
	const { id } = args;
	const data = tidyPostData(args.data ?? {});

	if (args.delete) {
		if (!id) throw new StoreError('id is required to delete');
		const post = await getPostRaw(id);
		if (!post) throw new StoreError(`No post with id "${id}"`);
		const trash = await putInTrash('post', id, post);
		await removeFile(postFile(id));
		return { ok: true, action: 'deleted', type: 'posts', id, note: `Moved to ${trash}. Restore it by moving the file back to content/posts/${id}.json.` };
	}

	if (!id) {
		const slug = String(data.slug ?? makeSlug(String(data.title ?? '')));
		if (!slug) throw new StoreError('title is required to create a post');
		if (await getPostRaw(slug)) throw new StoreError(`A post with slug "${slug}" already exists; update it with id="${slug}" or pick another slug`);
		const draftPost = {
			draft: true,
			publishedAt: new Date().toISOString(),
			cover: { ...DEFAULT_COVER, alt: String(data.title ?? '') },
			...data,
			slug,
		};
		const post = checkWith(postSchema, draftPost, 'Post');
		await checkPostLinks(post);
		await saveJson(postFile(slug), post);
		return { ok: true, action: 'created', type: 'posts', id: slug, item: post, note: post.draft ? 'Saved as a draft. Set draft=false to publish.' : 'Published.' };
	}

	const current = await getPostRaw(id);
	if (!current) throw new StoreError(`No post with id "${id}"`);
	const next = checkWith(postSchema, mergeData(current, data), 'Post');
	await checkPostLinks(next);

	if (next.slug !== id) {
		if (await getPostRaw(next.slug)) throw new StoreError(`slug: "${next.slug}" is already used by another post`);
		await saveJson(postFile(next.slug), next);
		await removeFile(postFile(id));
		await addRedirect(`/blog/${id}/`, `/blog/${next.slug}/`);
		return { ok: true, action: 'updated', type: 'posts', id: next.slug, item: next, note: `URL changed; /blog/${id}/ now redirects to /blog/${next.slug}/.` };
	}
	await saveJson(postFile(id), next);
	return { ok: true, action: 'updated', type: 'posts', id, item: next };
}

async function renameLinks(type: ListType, from: string, to: string): Promise<number> {
	let changed = 0;
	for (const post of await getAllPosts()) {
		let touched = false;
		if (type === 'categories' && post.category === from) {
			post.category = to;
			touched = true;
		}
		if (type === 'authors' && post.author === from) {
			post.author = to;
			touched = true;
		}
		if (type === 'games' && post.games.includes(from)) {
			post.games = post.games.map((slug) => (slug === from ? to : slug));
			touched = true;
		}
		if (touched) {
			await saveJson(postFile(post.slug), post);
			changed += 1;
		}
	}
	if (type === 'categories') {
		const site = await getSite();
		if (site.home?.shelves?.includes(from)) {
			site.home.shelves = site.home.shelves.map((slug) => (slug === from ? to : slug));
			await saveJson(siteFile(), site);
		}
	}
	return changed;
}

async function writeListItem(type: ListType, args: WriteArgs): Promise<WriteResult> {
	// One of three schemas; all produce a record with slug and name.
	const schema = LIST_SCHEMAS[type] as unknown as Parameters<typeof checkWith<Record<string, unknown>>>[0];
	const list = await getList<{ slug: string; name: string }>(type);
	const { id } = args;
	const data = args.data ?? {};

	if (args.order) {
		const bySlug = new Map(list.map((row) => [row.slug, row]));
		const missing = args.order.filter((slug) => !bySlug.has(slug));
		if (missing.length) throw new StoreError('order lists unknown ids', missing);
		const ordered = [...args.order.map((slug) => bySlug.get(slug)!), ...list.filter((row) => !args.order!.includes(row.slug))];
		await saveJson(listFile(type), ordered);
		return { ok: true, action: 'reordered', type };
	}

	if (args.delete) {
		if (!id) throw new StoreError('id is required to delete');
		const item = list.find((row) => row.slug === id);
		if (!item) throw new StoreError(`No ${type} item with id "${id}"`);
		const posts = await getAllPosts();
		const users = posts
			.filter((post) => (type === 'categories' ? post.category === id : type === 'authors' ? post.author === id : post.games.includes(id)))
			.map((post) => post.slug);
		if (users.length) throw new StoreError(`"${id}" is still used by ${users.length} post(s); move them first`, users);
		await putInTrash(type, id, item);
		await saveJson(listFile(type), list.filter((row) => row.slug !== id));
		return { ok: true, action: 'deleted', type, id };
	}

	if (!id) {
		const slug = String(data.slug ?? makeSlug(String(data.name ?? '')));
		if (!slug) throw new StoreError('name is required');
		if (list.some((row) => row.slug === slug)) throw new StoreError(`"${slug}" already exists`);
		const item = checkWith(schema, { ...data, slug }, type);
		await saveJson(listFile(type), [...list, item]);
		return { ok: true, action: 'created', type, id: slug, item };
	}

	const index = list.findIndex((row) => row.slug === id);
	if (index < 0) throw new StoreError(`No ${type} item with id "${id}"`);
	const next = checkWith(schema, mergeData(list[index] as Record<string, unknown>, data), type) as { slug: string; name: string };
	if (next.slug !== id && list.some((row) => row.slug === next.slug)) throw new StoreError(`slug: "${next.slug}" is already used`);
	const copy = [...list];
	copy[index] = next;
	await saveJson(listFile(type), copy);
	let note: string | undefined;
	if (next.slug !== id) {
		const changed = await renameLinks(type, id, next.slug);
		note = `Slug changed; updated ${changed} post(s) to the new slug.`;
	}
	return { ok: true, action: 'updated', type, id: next.slug, item: next, note };
}

async function writeSite(data: Record<string, unknown>): Promise<WriteResult> {
	const current = (await getSite()) as unknown as Record<string, unknown>;
	const merged: Record<string, unknown> = { ...current };
	for (const [key, value] of Object.entries(data)) {
		const old = current[key];
		// Objects (home, cta, verification) merge one level; lists and values replace.
		merged[key] = value && typeof value === 'object' && !Array.isArray(value) && old && typeof old === 'object' ? { ...old, ...value } : value;
	}
	const site = checkWith(siteSchema, merged, 'Site settings');
	const categories = await getList<Category>('categories');
	const badShelves = site.home.shelves.filter((slug) => !categories.some((c) => c.slug === slug));
	if (badShelves.length) throw new StoreError('home.shelves lists unknown categories', badShelves);
	await saveJson(siteFile(), site);
	return { ok: true, action: 'updated', type: 'site', item: site };
}

export async function writeItem(args: WriteArgs): Promise<WriteResult> {
	switch (args.type) {
		case 'posts':
			return writePost(args);
		case 'categories':
		case 'games':
		case 'authors':
			return writeListItem(args.type, args);
		case 'site':
			if (args.delete) throw new StoreError('Site settings cannot be deleted');
			return writeSite(args.data ?? {});
		case 'redirects': {
			if (!args.data) throw new StoreError('data is required: { "/old/": "/new/" }; send null as a value to remove one');
			const redirects = await getRedirects();
			for (const [from, to] of Object.entries(args.data)) {
				if (to === null) delete redirects[from];
				else redirects[from] = String(to);
			}
			await saveJson(redirectsFile(), checkWith(redirectsSchema, redirects, 'redirects'));
			return { ok: true, action: 'updated', type: 'redirects', item: redirects, note: 'Redirects apply on the next build.' };
		}
		default:
			throw new StoreError(`${args.type} cannot be written. Use blog_upload for media.`);
	}
}
