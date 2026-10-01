// Ready-to-use REST adapter. Point CONTENT_API_URL at any backend that serves
// these four routes as JSON arrays:
//
//   GET {CONTENT_API_URL}/posts        -> PostInput[]       (published only)
//   GET {CONTENT_API_URL}/authors      -> AuthorInput[]
//   GET {CONTENT_API_URL}/categories   -> CategoryInput[]
//   GET {CONTENT_API_URL}/games        -> GameInput[]
//
// If your API uses other field names or wraps results (e.g. `{ data: [...] }`),
// change only the `fromApi*` functions below. Pages never see the raw API.

import type { ContentSource } from '../source';
import type { AuthorInput, CategoryInput, GameInput, PostInput } from '../schema';

type ApiRecord = Record<string, unknown>;

function getBaseUrl(): string {
	const base = import.meta.env.CONTENT_API_URL;
	if (!base) {
		throw new Error('CONTENT_SOURCE=http needs CONTENT_API_URL (see .env.example).');
	}
	return String(base).replace(/\/+$/, '');
}

async function getJson(path: string): Promise<ApiRecord[]> {
	const headers: Record<string, string> = { Accept: 'application/json' };
	const token = import.meta.env.CONTENT_API_TOKEN;
	if (token) headers.Authorization = `Bearer ${token}`;

	const res = await fetch(`${getBaseUrl()}${path}`, { headers });
	if (!res.ok) {
		throw new Error(`Content API ${path} answered ${res.status} ${res.statusText}`);
	}
	const json = (await res.json()) as unknown;
	// Accept a bare array or the common `{ data: [...] }` / `{ items: [...] }` wrappers.
	if (Array.isArray(json)) return json as ApiRecord[];
	const wrapped = (json as ApiRecord)?.data ?? (json as ApiRecord)?.items;
	if (Array.isArray(wrapped)) return wrapped as ApiRecord[];
	throw new Error(`Content API ${path} did not return a list`);
}

// Map your API's field names here. By default the API is expected to use
// the same names as `schema.ts`, so these are pass-through.
const fromApiPost = (row: ApiRecord) => row as unknown as PostInput;
const fromApiAuthor = (row: ApiRecord) => row as unknown as AuthorInput;
const fromApiCategory = (row: ApiRecord) => row as unknown as CategoryInput;
const fromApiGame = (row: ApiRecord) => row as unknown as GameInput;

export const httpSource: ContentSource = {
	name: 'http',
	listPosts: async () => (await getJson('/posts')).map(fromApiPost),
	listAuthors: async () => (await getJson('/authors')).map(fromApiAuthor),
	listCategories: async () => (await getJson('/categories')).map(fromApiCategory),
	listGames: async () => (await getJson('/games')).map(fromApiGame),
};
