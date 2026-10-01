// The SWG Devo blog MCP server. One definition, two ways to run it:
//   - stdio:  `npm run mcp` (local agents: Claude Code, OpenCode, Codex)
//   - HTTP:   POST /api/mcp/ with `Authorization: Bearer $BLOG_MCP_KEY`
// Both call the same store actions as /admin, so agents get the same checks.

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { readItems, StoreError, TYPES, writeItem, type ItemType } from '../store/actions.ts';
import { saveImage } from '../store/media.ts';
import { checkPost } from '../seo/checkPost.ts';

const GUIDE = `Manage the SWG Devo gaming blog: posts, categories, games, authors, site settings, media and redirects.

Rules:
- Before writing a type for the first time, call blog_read with fields=true. Do not guess field names.
- Find, then act: use blog_read with q to find rows, and read by id before editing text you have not seen.
- Updates are partial: send only the fields that change. Send null to clear an optional field.
- New posts are saved as drafts. Publish (draft=false) only when the user asks.
- Run blog_seo_check on every post you create or rewrite and fix "bad" items before publishing.
- Ranking basics: one search question per post, the answer in the first paragraph and keyPoints, 900+ useful words for guides, 3+ ## sections, 2-4 FAQ items, 2+ links to other posts or /games/<slug>/ hubs, real patch/tested-on info.
- Never invent facts (prices, patch numbers, release dates, scores). Use what the user gives you.
- Deletes move items to content/.trash and can be undone; still delete only what was asked.
- Changes are saved to the content files at once and show in the dev server immediately. The public static site updates on the next build/deploy (commit and push the content/ folder).`;

const typeEnum = z.enum(TYPES as unknown as [ItemType, ...ItemType[]]);

function reply(value: unknown) {
	return { content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }] };
}

function replyError(error: unknown) {
	const message = error instanceof StoreError ? error.message : error instanceof Error ? error.message : String(error);
	return { isError: true, content: [{ type: 'text' as const, text: message }] };
}

export function makeBlogMcp(options: { allowLocalFiles: boolean }): McpServer {
	const server = new McpServer({ name: 'swg-devo-blog', version: '1.0.0' }, { instructions: GUIDE });

	server.registerTool(
		'blog_read',
		{
			title: 'Read blog content',
			description:
				'Read posts, categories, games, authors, site, media, redirects or summary. Without id: compact list { total, rows }. With id: the full item (posts include an seo report). fields=true: what blog_write accepts for that type.',
			inputSchema: {
				type: typeEnum,
				id: z.string().optional().describe('Slug of one item'),
				q: z.string().optional().describe('Text search'),
				status: z.enum(['draft', 'published']).optional().describe('Posts only'),
				limit: z.number().int().min(1).max(500).optional(),
				fields: z.boolean().optional().describe('Return the writable fields for this type'),
			},
			annotations: { readOnlyHint: true },
		},
		async (args) => {
			try {
				return reply(await readItems(args));
			} catch (error) {
				return replyError(error);
			}
		},
	);

	server.registerTool(
		'blog_write',
		{
			title: 'Change blog content',
			description:
				'Create (no id + data), update (id + only changed fields), delete (id + delete=true, moves to trash) or reorder (order: [ids]). Types: posts, categories, games, authors, site (update only), redirects. Post body can be a Markdown string.',
			inputSchema: {
				type: typeEnum,
				id: z.string().optional(),
				data: z.record(z.string(), z.unknown()).optional(),
				delete: z.boolean().optional(),
				order: z.array(z.string()).optional(),
			},
			annotations: { destructiveHint: true },
		},
		async (args) => {
			try {
				return reply(await writeItem(args));
			} catch (error) {
				return replyError(error);
			}
		},
	);

	server.registerTool(
		'blog_upload',
		{
			title: 'Upload images',
			description: `Upload 1-10 images (8 MB max each). Each needs alt text and one of url (public https), base64${options.allowLocalFiles ? ' or path (local file)' : ''}. Returns an ImageRef per image: put it in a post "cover", game "cover" or author "avatar".`,
			inputSchema: {
				images: z
					.array(
						z.object({
							alt: z.string().min(1).describe('What the image shows'),
							fileName: z.string().optional(),
							url: z.string().optional(),
							base64: z.string().optional(),
							path: z.string().optional(),
						}),
					)
					.min(1)
					.max(10),
			},
		},
		async ({ images }) => {
			const results = [];
			for (const image of images) {
				try {
					const item = await saveImage(image, { allowPath: options.allowLocalFiles });
					results.push({ ok: true, mediaId: item.id, image: item.image });
				} catch (error) {
					results.push({ ok: false, alt: image.alt, error: (error as Error).message });
				}
			}
			return reply(results);
		},
	);

	server.registerTool(
		'blog_seo_check',
		{
			title: 'Check a post for ranking',
			description:
				'Score a post (0-100) against on-page ranking factors and list what to fix. Pass id for a saved post, or post with draft fields to check before saving.',
			inputSchema: {
				id: z.string().optional(),
				post: z.record(z.string(), z.unknown()).optional(),
			},
			annotations: { readOnlyHint: true },
		},
		async ({ id, post }) => {
			try {
				if (id) {
					const saved = (await readItems({ type: 'posts', id })) as { seo: unknown };
					return reply(saved.seo);
				}
				if (!post) throw new StoreError('Send id or post');
				const draft = { ...post } as Record<string, unknown>;
				if (typeof draft.body === 'string') draft.body = { format: 'markdown', value: draft.body };
				return reply(checkPost(draft));
			} catch (error) {
				return replyError(error);
			}
		},
	);

	return server;
}
