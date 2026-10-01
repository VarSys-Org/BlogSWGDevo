// Admin JSON API. Same actions as the MCP tools: read, write, upload, seo-check.
import type { APIRoute } from 'astro';
import { hasSession, sendJson } from '../../../lib/admin/auth';
import { readItems, StoreError, writeItem, type ReadArgs, type WriteArgs } from '../../../lib/store/actions.ts';
import { saveImage } from '../../../lib/store/media.ts';
import { checkPost } from '../../../lib/seo/checkPost.ts';

export const prerender = false;

function sendError(error: unknown): Response {
	if (error instanceof StoreError) return sendJson({ error: error.message, issues: error.issues }, 400);
	console.error('[admin api]', error);
	return sendJson({ error: (error as Error).message ?? 'Something went wrong on the server.' }, 500);
}

export const POST: APIRoute = async ({ params, request, cookies }) => {
	if (!hasSession(cookies)) return sendJson({ error: 'Sign in again: your session ended.' }, 401);
	try {
		switch (params.action) {
			case 'read':
				return sendJson(await readItems((await request.json()) as ReadArgs));
			case 'write':
				return sendJson(await writeItem((await request.json()) as WriteArgs));
			case 'seo-check': {
				const { post, gameNames } = (await request.json()) as { post: Record<string, unknown>; gameNames?: string[] };
				return sendJson(checkPost(post, gameNames ?? []));
			}
			case 'upload': {
				const form = await request.formData();
				const file = form.get('file');
				const alt = String(form.get('alt') ?? '');
				if (!(file instanceof File)) return sendJson({ error: 'Choose an image file.' }, 400);
				const item = await saveImage({ alt, fileName: file.name, bytes: new Uint8Array(await file.arrayBuffer()) });
				return sendJson(item);
			}
			default:
				return sendJson({ error: `Unknown action "${params.action}"` }, 404);
		}
	} catch (error) {
		return sendError(error);
	}
};
