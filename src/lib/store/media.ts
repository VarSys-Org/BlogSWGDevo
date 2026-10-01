// Image uploads. Every image is turned into the same set of files the site
// expects: 640 and 1200 wide WebP for the page, plus a 1200 JPG for social
// cards. The result is a ready ImageRef to drop into a post or game.

import { mkdir, readFile, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import sharp from 'sharp';
import type { ImageRef } from '../content/schema.ts';
import { makeSlug } from '../content/markdown.ts';
import { contentDir, readJson, saveJson, uploadsDir } from './files.ts';
import { StoreError } from './errors.ts';

const MAX_BYTES = 8 * 1024 * 1024;

export type MediaItem = { id: string; alt: string; image: ImageRef; createdAt: string };

export type ImageInput = {
	alt: string;
	fileName?: string;
	base64?: string;
	url?: string;
	// Only honoured when the caller is trusted local code (stdio MCP, admin upload).
	path?: string;
	bytes?: Uint8Array;
};

const mediaFile = () => join(contentDir(), 'media.json');

export async function listMedia(): Promise<MediaItem[]> {
	return readJson<MediaItem[]>(mediaFile(), []);
}

async function getBytes(input: ImageInput, allowPath: boolean): Promise<Uint8Array> {
	if (input.bytes) return input.bytes;
	if (input.base64) {
		const clean = input.base64.replace(/^data:[^;]+;base64,/, '');
		return Buffer.from(clean, 'base64');
	}
	if (input.url) {
		const url = new URL(input.url);
		if (url.protocol !== 'https:') throw new StoreError('url: only public https image links are accepted');
		const res = await fetch(url, { redirect: 'follow' });
		if (!res.ok) throw new StoreError(`url: download failed with ${res.status}`);
		const size = Number(res.headers.get('content-length') ?? 0);
		if (size > MAX_BYTES) throw new StoreError('url: image is larger than 8 MB');
		return new Uint8Array(await res.arrayBuffer());
	}
	if (input.path) {
		if (!allowPath) throw new StoreError('path: local files can only be uploaded from this computer; send base64 or url instead');
		const full = resolve(input.path);
		if ((await stat(full)).size > MAX_BYTES) throw new StoreError('path: image is larger than 8 MB');
		return readFile(full);
	}
	throw new StoreError('Send one of: base64, url or path');
}

export async function saveImage(input: ImageInput, options: { allowPath?: boolean } = {}): Promise<MediaItem> {
	if (!input.alt?.trim()) throw new StoreError('alt: describe the image (used for accessibility and image search)');
	const bytes = await getBytes(input, Boolean(options.allowPath));
	if (bytes.byteLength > MAX_BYTES) throw new StoreError('image is larger than 8 MB');

	const meta = await sharp(bytes).metadata();
	if (!meta.width || !meta.height) throw new StoreError('file is not an image sharp can read (use JPG, PNG, WebP or AVIF)');

	const baseName = makeSlug((input.fileName ?? input.alt).replace(/\.[a-z0-9]+$/i, '')).slice(0, 50) || 'image';
	const id = `${baseName}-${Date.now().toString(36)}`;
	const dir = uploadsDir();
	await mkdir(dir, { recursive: true });
	const big = sharp(bytes).rotate().resize({ width: 1200, withoutEnlargement: true });
	const info = await big.clone().webp({ quality: 78 }).toFile(join(dir, `${id}-1200.webp`));
	await sharp(bytes).rotate().resize({ width: 640, withoutEnlargement: true }).webp({ quality: 74 }).toFile(join(dir, `${id}-640.webp`));
	await big.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(join(dir, `${id}-1200.jpg`));

	const base = `/uploads/${id}`;
	const item: MediaItem = {
		id,
		alt: input.alt.trim(),
		createdAt: new Date().toISOString(),
		image: {
			src: `${base}-1200.webp`,
			srcset: `${base}-640.webp 640w, ${base}-1200.webp ${info.width}w`,
			shareSrc: `${base}-1200.jpg`,
			alt: input.alt.trim(),
			width: info.width,
			height: info.height,
		},
	};
	const all = await listMedia();
	await saveJson(mediaFile(), [item, ...all]);
	return item;
}
