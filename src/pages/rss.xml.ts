// Full-text RSS. Feeds get picked up by aggregators and readers, and every
// item links back to the post, which helps new posts get found quickly.
import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { SITE } from '../config/site';
import { getPosts } from '../lib/content';

export const GET: APIRoute = async (context) => {
	const posts = (await getPosts()).slice(0, 30);
	return rss({
		title: SITE.name,
		description: SITE.description,
		site: context.site ?? context.url.origin,
		items: posts.map((post) => ({
			title: post.title,
			description: post.description,
			link: post.url,
			pubDate: new Date(post.publishedAt),
			categories: [post.categoryInfo.name, ...post.tagList.map((tag) => tag.name)],
			author: post.authorInfo.name,
			content: post.html,
		})),
		customData: `<language>${SITE.lang}</language>`,
		trailingSlash: true,
	});
};
