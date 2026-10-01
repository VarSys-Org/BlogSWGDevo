// JSON-LD builders. Each one describes exactly what is on the page; nothing
// here claims ratings, prices or facts the page does not show. `@id`s are
// stable URLs so search engines can join the blocks into one graph.

import { SITE } from '../../config/site';
import type { Author, Category, FullPost, Game } from '../content';

type Thing = Record<string, unknown>;

export const toUrl = (path: string, site: URL) => new URL(path, site).toString();

const orgId = (site: URL) => toUrl('/#organization', site);
const siteId = (site: URL) => toUrl('/#website', site);
const authorUrl = (author: Author) => `/author/${author.slug}/`;

export function makeOrganization(site: URL): Thing {
	return {
		'@type': 'Organization',
		'@id': orgId(site),
		name: SITE.name,
		url: toUrl('/', site),
		logo: { '@type': 'ImageObject', url: toUrl(SITE.logo, site), width: 512, height: 512 },
		sameAs: SITE.social.map((item) => item.url),
	};
}

export function makeWebsite(site: URL): Thing {
	return {
		'@type': 'WebSite',
		'@id': siteId(site),
		name: SITE.name,
		description: SITE.description,
		url: toUrl('/', site),
		inLanguage: SITE.lang,
		publisher: { '@id': orgId(site) },
		// Lets Google show a search box for the site in results.
		potentialAction: {
			'@type': 'SearchAction',
			target: { '@type': 'EntryPoint', urlTemplate: toUrl('/search/?q={search_term_string}', site) },
			'query-input': 'required name=search_term_string',
		},
	};
}

export function makePerson(author: Author, site: URL): Thing {
	return {
		'@type': 'Person',
		'@id': toUrl(`${authorUrl(author)}#person`, site),
		name: author.name,
		url: toUrl(authorUrl(author), site),
		jobTitle: author.role,
		description: author.bio,
		knowsAbout: author.expertise,
		sameAs: author.links.map((link) => link.url),
		worksFor: { '@id': orgId(site) },
	};
}

export function makeBreadcrumbs(items: { name: string; path: string }[], site: URL): Thing {
	return {
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: toUrl(item.path, site),
		})),
	};
}

function makeVideoGame(game: Game, site: URL): Thing {
	return {
		'@type': 'VideoGame',
		name: game.name,
		url: toUrl(`/games/${game.slug}/`, site),
		description: game.description,
		genre: game.genres,
		gamePlatform: game.platforms,
		...(game.developer ? { author: { '@type': 'Organization', name: game.developer } } : {}),
		...(game.publisher ? { publisher: { '@type': 'Organization', name: game.publisher } } : {}),
		...(game.releaseYear ? { datePublished: String(game.releaseYear) } : {}),
	};
}

export function makeGameHub(game: Game, posts: FullPost[], site: URL): Thing[] {
	return [
		makeVideoGame(game, site),
		makeItemList(`${game.name} guides and reviews`, posts, site),
	];
}

export function makeItemList(name: string, posts: FullPost[], site: URL): Thing {
	return {
		'@type': 'ItemList',
		name,
		itemListElement: posts.map((post, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			url: toUrl(post.url, site),
			name: post.title,
		})),
	};
}

export function makeCollectionPage(category: Category, posts: FullPost[], path: string, site: URL): Thing {
	return {
		'@type': 'CollectionPage',
		'@id': toUrl(path, site),
		name: category.name,
		description: category.description,
		url: toUrl(path, site),
		isPartOf: { '@id': siteId(site) },
		mainEntity: makeItemList(category.name, posts, site),
	};
}

function makeVideo(post: FullPost, site: URL): Thing | undefined {
	if (!post.video) return undefined;
	const v = post.video;
	return {
		'@type': 'VideoObject',
		name: v.title,
		description: v.description,
		thumbnailUrl: [`https://i.ytimg.com/vi/${v.youtubeId}/maxresdefault.jpg`, toUrl(post.cover.shareSrc ?? post.cover.src, site)],
		uploadDate: v.uploadDate,
		duration: v.duration,
		embedUrl: `https://www.youtube-nocookie.com/embed/${v.youtubeId}`,
		contentUrl: `https://www.youtube.com/watch?v=${v.youtubeId}`,
		publisher: { '@id': orgId(site) },
	};
}

export function makeArticle(post: FullPost, site: URL): Thing[] {
	const url = toUrl(post.url, site);
	const image = toUrl(post.cover.shareSrc ?? post.cover.src, site);
	const author = makePerson(post.authorInfo, site);
	const base: Thing = {
		'@id': `${url}#article`,
		headline: post.title.slice(0, 110),
		description: post.description,
		image: [image],
		datePublished: post.publishedAt,
		dateModified: post.lastChanged,
		author: { '@id': author['@id'], name: post.authorInfo.name, url: author.url },
		publisher: { '@id': orgId(site) },
		mainEntityOfPage: { '@type': 'WebPage', '@id': url },
		articleSection: post.categoryInfo.name,
		keywords: post.tagList.map((tag) => tag.name).join(', '),
		wordCount: post.words,
		inLanguage: SITE.lang,
		...(post.gameList.length ? { about: post.gameList.map((game) => ({ '@type': 'VideoGame', name: game.name })) } : {}),
	};

	const blocks: Thing[] = [author];

	if (post.kind === 'review' && post.review && post.gameList[0]) {
		// The site's own critic review of a game: allowed and eligible for
		// review snippets. Never add an aggregateRating you did not collect.
		blocks.push({
			...base,
			'@type': 'Review',
			name: post.title,
			itemReviewed: makeVideoGame(post.gameList[0], site),
			reviewRating: { '@type': 'Rating', ratingValue: post.review.score, bestRating: 10, worstRating: 0 },
			reviewBody: post.review.verdict,
			positiveNotes: {
				'@type': 'ItemList',
				itemListElement: post.review.pros.map((name, i) => ({ '@type': 'ListItem', position: i + 1, name })),
			},
			negativeNotes: {
				'@type': 'ItemList',
				itemListElement: post.review.cons.map((name, i) => ({ '@type': 'ListItem', position: i + 1, name })),
			},
		});
	} else {
		blocks.push({ ...base, '@type': post.kind === 'news' ? 'NewsArticle' : 'BlogPosting' });
	}

	const video = makeVideo(post, site);
	if (video) blocks.push(video);

	if (post.faq.length) {
		blocks.push({
			'@type': 'FAQPage',
			mainEntity: post.faq.map((item) => ({
				'@type': 'Question',
				name: item.question,
				acceptedAnswer: { '@type': 'Answer', text: item.answer },
			})),
		});
	}

	return blocks;
}

export function makeGraph(blocks: (Thing | undefined)[]): string {
	const graph = { '@context': 'https://schema.org', '@graph': blocks.filter(Boolean) };
	// Escape "<" so post text can never close the script tag early.
	return JSON.stringify(graph).replace(/</g, '\\u003c');
}
