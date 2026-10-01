import { SITE } from '../../config/site';

const TITLE_LIMIT = 60;
const DESCRIPTION_LIMIT = 158;

// "Page title | Brand", dropping the brand if it would push the title past
// what search results show, so the useful words are never cut off.
export function makeTitle(title?: string): string {
	if (!title) return `${SITE.name} | ${SITE.tagline}`;
	const full = `${title} | ${SITE.name}`;
	return full.length <= TITLE_LIMIT ? full : title;
}

export function clipText(text: string, limit = DESCRIPTION_LIMIT): string {
	const clean = text.replace(/\s+/g, ' ').trim();
	if (clean.length <= limit) return clean;
	const cut = clean.slice(0, limit - 1);
	return `${cut.slice(0, cut.lastIndexOf(' '))}...`;
}

export function showDate(iso: string): string {
	return new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}
