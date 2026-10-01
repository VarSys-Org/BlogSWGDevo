// The content contract. Any backend (REST API, headless CMS, database,
// Markdown files) only has to return data in these shapes. Every record is
// checked against these schemas at build time, so a backend that drifts
// fails the build with a clear message instead of shipping broken pages.

import { z } from 'astro/zod';

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be lowercase-with-dashes');
const isoDate = z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'must be an ISO date');

export const imageSchema = z.object({
	src: z.string().min(1),
	alt: z.string(),
	width: z.number().int().positive(),
	height: z.number().int().positive(),
	// Optional responsive sources, e.g. "/a-640.webp 640w, /a-1200.webp 1200w".
	srcset: z.string().optional(),
	// Optional JPG/PNG copy for social cards (most networks reject WebP/SVG).
	shareSrc: z.string().optional(),
});

export const authorSchema = z.object({
	slug,
	name: z.string().min(1),
	role: z.string(),
	bio: z.string(),
	avatar: imageSchema.optional(),
	expertise: z.array(z.string()).default([]),
	links: z.array(z.object({ label: z.string(), url: z.string().url() })).default([]),
});

export const categorySchema = z.object({
	slug,
	name: z.string().min(1),
	// Optional search-result title for the category hub page.
	seoTitle: z.string().optional(),
	// Short line for cards and meta descriptions (keep under ~155 chars).
	description: z.string(),
	// Longer hub-page intro. Real text on category pages helps them rank.
	intro: z.string().default(''),
});

export const gameSchema = z.object({
	slug,
	name: z.string().min(1),
	description: z.string(),
	genres: z.array(z.string()).default([]),
	platforms: z.array(z.string()).default([]),
	developer: z.string().optional(),
	publisher: z.string().optional(),
	releaseYear: z.number().int().optional(),
	cover: imageSchema.optional(),
});

export const faqSchema = z.object({ question: z.string(), answer: z.string() });

export const reviewSchema = z.object({
	score: z.number().min(0).max(10),
	verdict: z.string(),
	pros: z.array(z.string()).default([]),
	cons: z.array(z.string()).default([]),
	testedOn: z.string(),
});

export const videoSchema = z.object({
	youtubeId: z.string().min(5),
	title: z.string(),
	description: z.string(),
	uploadDate: isoDate,
	// ISO 8601 duration, e.g. "PT12M30S".
	duration: z.string().regex(/^PT(\d+H)?(\d+M)?(\d+S)?$/),
});

export const postSchema = z.object({
	slug,
	title: z.string().min(1),
	// Optional search-result title when the on-page headline is too long.
	seoTitle: z.string().optional(),
	description: z.string().min(1),
	kind: z.enum(['article', 'guide', 'review', 'news', 'list']).default('article'),
	category: slug,
	tags: z.array(z.string()).default([]),
	games: z.array(slug).default([]),
	author: slug,
	publishedAt: isoDate,
	updatedAt: isoDate.optional(),
	cover: imageSchema,
	body: z.object({ format: z.enum(['markdown', 'html']), value: z.string() }),
	keyPoints: z.array(z.string()).default([]),
	faq: z.array(faqSchema).default([]),
	review: reviewSchema.optional(),
	video: videoSchema.optional(),
	featured: z.boolean().default(false),
	level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
	// Game patch / version the guide was checked against. Shown on the page
	// as a freshness signal for readers.
	patch: z.string().optional(),
	draft: z.boolean().default(false),
	noindex: z.boolean().default(false),
});

const linkSchema = z.object({ label: z.string().min(1), href: z.string().min(1) });

export const siteSchema = z.object({
	name: z.string().min(1),
	shortName: z.string().min(1),
	tagline: z.string(),
	description: z.string().max(200),
	locale: z.string().default('en_IN'),
	lang: z.string().default('en'),
	themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
	defaultImage: z.string(),
	logo: z.string(),
	youtubeChannel: z.string().url(),
	xHandle: z.string(),
	social: z.array(
		z.object({
			label: z.string(),
			url: z.string().url(),
			icon: z.enum(['youtube', 'instagram', 'discord', 'x', 'reddit', 'whatsapp']),
		}),
	),
	nav: z.array(linkSchema).max(8),
	home: z.object({
		eyebrow: z.string(),
		title: z.string().min(1),
		introTitle: z.string(),
		introText: z.string(),
		// Category slugs shown as rows on the home page, in order.
		shelves: z.array(slug).max(6),
	}),
	cta: z.object({ title: z.string(), text: z.string() }),
	postsPerPage: z.number().int().min(3).max(48),
	minPostsToIndexTag: z.number().int().min(1).max(10),
	// Search Console / Bing Webmaster HTML-tag verification codes (content value only).
	verification: z.object({ google: z.string().default(''), bing: z.string().default('') }),
});

// Old URL path -> new URL path, filled in automatically when a post slug changes.
export const redirectsSchema = z.record(z.string(), z.string());

export type Site = z.infer<typeof siteSchema>;
export type ImageRef = z.infer<typeof imageSchema>;
export type Author = z.infer<typeof authorSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Game = z.infer<typeof gameSchema>;
export type Faq = z.infer<typeof faqSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type Video = z.infer<typeof videoSchema>;
export type Post = z.infer<typeof postSchema>;

// What a backend may hand back before defaults are filled in.
export type PostInput = z.input<typeof postSchema>;
export type AuthorInput = z.input<typeof authorSchema>;
export type CategoryInput = z.input<typeof categorySchema>;
export type GameInput = z.input<typeof gameSchema>;
