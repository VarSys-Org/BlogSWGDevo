// Default backend: the JSON files in /content, edited through /admin or the
// MCP server. Swap CONTENT_SOURCE to "http" (or your own adapter) later.
import { join } from 'node:path';
import type { ContentSource } from '../source';
import type { AuthorInput, CategoryInput, GameInput } from '../schema';
import { getAllPosts } from '../../store/actions.ts';
import { contentDir, getContentVersion, readJson } from '../../store/files.ts';

export const fileSource: ContentSource = {
	name: 'file',
	listPosts: () => getAllPosts(),
	listAuthors: () => readJson<AuthorInput[]>(join(contentDir(), 'authors.json'), []),
	listCategories: () => readJson<CategoryInput[]>(join(contentDir(), 'categories.json'), []),
	listGames: () => readJson<GameInput[]>(join(contentDir(), 'games.json'), []),
	getVersion: () => getContentVersion(),
};
