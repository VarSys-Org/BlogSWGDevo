// Turns a post body (Markdown or HTML from any backend) into page-ready HTML,
// plus the heading list for the table of contents and a word count.
//
// Bodies come from the site's own editors, so they are trusted. If you ever
// accept bodies from readers, sanitise the HTML before it reaches this file.

import { Marked, type Tokens } from 'marked';

export type Heading = { depth: 2 | 3; text: string; id: string };

export type RenderedBody = {
	html: string;
	headings: Heading[];
	words: number;
};

export function makeSlug(text: string): string {
	return text
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/<[^>]+>/g, '')
		.replace(/&[a-z]+;/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

function stripTags(html: string): string {
	return html.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ');
}

function countWords(text: string): number {
	return text.split(/\s+/).filter(Boolean).length;
}

function makeUniqueId(base: string, used: Set<string>): string {
	let id = base || 'section';
	let n = 2;
	while (used.has(id)) id = `${base}-${n++}`;
	used.add(id);
	return id;
}

function renderMarkdown(source: string): RenderedBody {
	const headings: Heading[] = [];
	const used = new Set<string>();
	const marked = new Marked({ gfm: true });

	marked.use({
		renderer: {
			heading(this: { parser: { parseInline(tokens: Tokens.Generic[]): string } }, token: Tokens.Heading) {
				const inner = this.parser.parseInline(token.tokens);
				// Keep one h1 per page: the post title. Body h1s become h2s.
				const depth = Math.min(Math.max(token.depth, 2), 6);
				const id = makeUniqueId(makeSlug(stripTags(inner)), used);
				if (depth === 2 || depth === 3) {
					headings.push({ depth, text: stripTags(inner).trim(), id });
				}
				return `<h${depth} id="${id}"><a class="heading-anchor" href="#${id}" aria-hidden="true" tabindex="-1">#</a>${inner}</h${depth}>\n`;
			},
			link(this: { parser: { parseInline(tokens: Tokens.Generic[]): string } }, token: Tokens.Link) {
				const inner = this.parser.parseInline(token.tokens);
				const href = token.href;
				const outside = /^https?:\/\//.test(href);
				const title = token.title ? ` title="${token.title}"` : '';
				const rel = outside ? ' rel="noopener" target="_blank"' : '';
				return `<a href="${href}"${title}${rel}>${inner}</a>`;
			},
			image(token: Tokens.Image) {
				const title = token.title ? ` title="${token.title}"` : '';
				return `<img src="${token.href}" alt="${token.text}"${title} loading="lazy" decoding="async" />`;
			},
		},
	});

	const html = (marked.parse(source, { async: false }) as string)
		// Wrap tables so wide ones scroll inside the article on phones.
		.replace(/<table>/g, '<div class="table-wrap"><table>')
		.replace(/<\/table>/g, '</table></div>');
	return { html, headings, words: countWords(stripTags(html)) };
}

function renderHtml(source: string): RenderedBody {
	const headings: Heading[] = [];
	const used = new Set<string>();
	const html = source.replace(/<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/gi, (_match, level: string, attrs: string, inner: string) => {
		const depth = Math.max(Number(level), 2);
		const existing = /\sid="([^"]+)"/.exec(attrs)?.[1];
		const id = existing ?? makeUniqueId(makeSlug(stripTags(inner)), used);
		if (depth === 2 || depth === 3) headings.push({ depth, text: stripTags(inner).trim(), id });
		const rest = attrs.replace(/\sid="[^"]*"/, '');
		return `<h${depth} id="${id}"${rest}>${inner}</h${depth}>`;
	});
	return { html, headings, words: countWords(stripTags(html)) };
}

export function renderBody(body: { format: 'markdown' | 'html'; value: string }): RenderedBody {
	return body.format === 'html' ? renderHtml(body.value) : renderMarkdown(body.value);
}
