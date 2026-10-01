// Browser side of the admin API. Mirrors the MCP tools one to one.

export class ApiError extends Error {
	status: number;
	issues: string[];
	constructor(message: string, status: number, issues: string[] = []) {
		super(message);
		this.status = status;
		this.issues = issues;
	}
}

async function send<T>(path: string, init: RequestInit): Promise<T> {
	let res: Response;
	try {
		res = await fetch(path, { credentials: 'same-origin', ...init });
	} catch {
		throw new ApiError('Cannot reach the admin server. Check that the site is running with `npm run dev` or the Node server.', 0);
	}
	const body = (await res.json().catch(() => ({}))) as { error?: string; issues?: string[] };
	if (!res.ok) throw new ApiError(body.error ?? `Request failed (${res.status})`, res.status, body.issues ?? []);
	return body as T;
}

const postJson = <T>(path: string, body: unknown) =>
	send<T>(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

export type Session = { setUp: boolean; signedIn: boolean };
export const getSession = () => send<Session>('/api/admin/session/', { method: 'GET' });
export const signIn = (password: string) => postJson<Session>('/api/admin/session/', { password });
export const signOut = () => send<Session>('/api/admin/session/', { method: 'DELETE' });

export type ItemType = 'posts' | 'categories' | 'games' | 'authors' | 'site' | 'media' | 'redirects' | 'summary';

export const readItems = <T = unknown>(args: { type: ItemType; id?: string; q?: string; status?: 'draft' | 'published'; limit?: number }) =>
	postJson<T>('/api/admin/read/', args);

export type WriteResult = { ok: true; action: string; id?: string; item?: unknown; note?: string };
export const writeItem = (args: { type: ItemType; id?: string; data?: Record<string, unknown>; delete?: boolean; order?: string[] }) =>
	postJson<WriteResult>('/api/admin/write/', args);

export type ImageRef = { src: string; alt: string; width: number; height: number; srcset?: string; shareSrc?: string };
export type MediaItem = { id: string; alt: string; image: ImageRef; createdAt: string };

export function uploadImage(file: File, alt: string): Promise<MediaItem> {
	const form = new FormData();
	form.set('file', file);
	form.set('alt', alt);
	return send<MediaItem>('/api/admin/upload/', { method: 'POST', body: form });
}
