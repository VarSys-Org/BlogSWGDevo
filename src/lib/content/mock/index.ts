// Mock backend used until the real one is chosen. Each post lives in its own
// file under ./posts so new mock posts are a single drop-in file.
import type { ContentSource } from '../source';
import type { PostInput } from '../schema';
import { authors, categories } from './people';
import { games } from './games';

const postFiles = import.meta.glob<{ post: PostInput }>('./posts/*.ts', { eager: true });
const posts = Object.values(postFiles).map((file) => file.post);

export const mockSource: ContentSource = {
	name: 'mock',
	listPosts: async () => posts,
	listAuthors: async () => authors,
	listCategories: async () => categories,
	listGames: async () => games,
};
