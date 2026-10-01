// Reads and writes the JSON files in /content. Every write goes to a temp
// file first and is then renamed over the old one, so a crash or a second
// writer can never leave a half-written file behind.
//
// Shared by the site build, the admin API and the MCP server, so this file
// must stay plain TypeScript that Node can run directly (no Vite features).

import { mkdir, readdir, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export function getRoot(): string {
	return process.env.BLOG_ROOT ?? process.cwd();
}

export const contentDir = () => join(getRoot(), 'content');
export const postsDir = () => join(contentDir(), 'posts');
export const trashDir = () => join(contentDir(), '.trash');
export const uploadsDir = () => join(getRoot(), 'public', 'uploads');

export async function readJson<T>(path: string, fallback: T): Promise<T> {
	try {
		return JSON.parse(await readFile(path, 'utf8')) as T;
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') return fallback;
		throw new Error(`Could not read ${path}: ${(error as Error).message}`);
	}
}

export async function saveJson(path: string, value: unknown): Promise<void> {
	const dir = path.slice(0, Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\')));
	await mkdir(dir, { recursive: true });
	const temp = `${path}.${process.pid}.${Date.now()}.tmp`;
	await writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
	await rename(temp, path);
}

export async function listPostFiles(): Promise<string[]> {
	try {
		return (await readdir(postsDir())).filter((name) => name.endsWith('.json')).sort();
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
		throw error;
	}
}

// Deleted items are moved here instead of being erased, so any delete can be undone.
export async function putInTrash(kind: string, slug: string, value: unknown): Promise<string> {
	const stamp = new Date().toISOString().replace(/[:.]/g, '-');
	const path = join(trashDir(), `${kind}-${slug}-${stamp}.json`);
	await saveJson(path, value);
	return path;
}

export async function removeFile(path: string): Promise<void> {
	try {
		await unlink(path);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
	}
}

// A cheap fingerprint of the content folder. When it changes, cached content
// is rebuilt, so edits from the admin or the MCP server show up straight away.
export async function getContentVersion(): Promise<string> {
	const names = ['site.json', 'authors.json', 'categories.json', 'games.json', 'redirects.json'];
	const parts: string[] = [];
	for (const name of names) {
		try {
			parts.push(String((await stat(join(contentDir(), name))).mtimeMs));
		} catch {
			parts.push('0');
		}
	}
	const posts = await listPostFiles();
	parts.push(String(posts.length));
	for (const name of posts) {
		parts.push(String((await stat(join(postsDir(), name))).mtimeMs));
	}
	return parts.join(':');
}
