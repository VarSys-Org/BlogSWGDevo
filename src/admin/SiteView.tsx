// Site settings: brand, home page copy, nav, social links, search verification.
import { useEffect, useState } from 'react';
import { ApiError, readItems, writeItem } from './api';
import { AreaField, CheckList, Notice, Section, SelectField, TextField } from './parts';
import type { Lookups } from './AdminApp';

type Site = {
	name: string;
	shortName: string;
	tagline: string;
	description: string;
	themeColor: string;
	youtubeChannel: string;
	xHandle: string;
	social: { label: string; url: string; icon: string }[];
	nav: { label: string; href: string }[];
	home: { eyebrow: string; title: string; introTitle: string; introText: string; shelves: string[] };
	cta: { title: string; text: string };
	postsPerPage: number;
	minPostsToIndexTag: number;
	verification: { google: string; bing: string };
	[key: string]: unknown;
};

const ICONS = ['youtube', 'instagram', 'discord', 'x', 'reddit', 'whatsapp'].map((v) => ({ value: v, label: v }));

export default function SiteView({ lookups, onChanged }: { lookups: Lookups; onChanged: () => void }) {
	const [site, setSite] = useState<Site | null>(null);
	const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string; issues?: string[] } | null>(null);
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		readItems<Site>({ type: 'site' })
			.then(setSite)
			.catch((e) => setNotice({ tone: 'error', text: (e as Error).message }));
	}, []);

	if (!site) return <div className="adm-scroll">{notice ? <Notice tone="error">{notice.text}</Notice> : <p className="adm-empty">Loading settings...</p>}</div>;

	const set = <K extends keyof Site>(key: K, value: Site[K]) => setSite({ ...site, [key]: value });

	const save = async () => {
		setBusy(true);
		setNotice(null);
		try {
			const result = await writeItem({ type: 'site', data: site });
			setSite(result.item as Site);
			setNotice({ tone: 'ok', text: 'Site settings saved. The dev server shows them now; the live site updates on the next build.' });
			onChanged();
		} catch (e) {
			setNotice({ tone: 'error', text: (e as Error).message, issues: e instanceof ApiError ? e.issues : [] });
		} finally {
			setBusy(false);
		}
	};

	return (
		<div className="adm-scroll">
			<div className="adm-savebar">
				<span className="adm-savebar-state">Site settings</span>
				<button type="button" className="adm-btn" disabled={busy} onClick={save}>
					Save settings
				</button>
			</div>
			{notice && (
				<Notice tone={notice.tone}>
					{notice.text}
					{notice.issues && notice.issues.length > 0 && <ul>{notice.issues.map((i) => <li key={i}>{i}</li>)}</ul>}
				</Notice>
			)}
			<div className="adm-form adm-form-narrow">
				<Section title="Brand">
					<div className="adm-grid-2">
						<TextField label="Site name" value={site.name} onChange={(v) => set('name', v)} />
						<TextField label="Short name" value={site.shortName} onChange={(v) => set('shortName', v)} hint="Used for the installed-app name." />
					</div>
					<TextField label="Tagline" value={site.tagline} onChange={(v) => set('tagline', v)} hint="Home page title: Site name | Tagline." />
					<AreaField label="Default description" value={site.description} onChange={(v) => set('description', v)} range={[120, 158]} hint="Meta description for pages without their own." />
					<div className="adm-grid-2">
						<TextField label="YouTube channel URL" value={site.youtubeChannel} onChange={(v) => set('youtubeChannel', v)} />
						<TextField label="X handle" value={site.xHandle} onChange={(v) => set('xHandle', v)} />
						<TextField label="Browser bar colour" value={site.themeColor} onChange={(v) => set('themeColor', v)} hint="Hex, e.g. #0d1017" />
					</div>
				</Section>

				<Section title="Home page">
					<TextField label="Small label above the title" value={site.home.eyebrow} onChange={(v) => set('home', { ...site.home, eyebrow: v })} />
					<TextField label="Home page heading (h1)" value={site.home.title} onChange={(v) => set('home', { ...site.home, title: v })} hint="Say what the site helps with, using words people search." />
					<TextField label="Trust band title" value={site.home.introTitle} onChange={(v) => set('home', { ...site.home, introTitle: v })} />
					<AreaField label="Trust band text" value={site.home.introText} onChange={(v) => set('home', { ...site.home, introText: v })} />
					<CheckList
						label="Category rows on the home page"
						value={site.home.shelves}
						onChange={(v) => set('home', { ...site.home, shelves: v })}
						options={lookups.categories.map((c) => ({ value: c.slug, label: c.name }))}
						hint="Rows show in the order you tick them."
					/>
					<TextField label="Subscribe box title" value={site.cta.title} onChange={(v) => set('cta', { ...site.cta, title: v })} />
					<AreaField label="Subscribe box text" value={site.cta.text} onChange={(v) => set('cta', { ...site.cta, text: v })} />
				</Section>

				<Section title="Header links">
					{site.nav.map((link, i) => (
						<div key={i} className="adm-grid-3">
							<TextField label="Label" value={link.label} onChange={(v) => set('nav', site.nav.map((l, j) => (j === i ? { ...l, label: v } : l)))} />
							<TextField label="Link" value={link.href} onChange={(v) => set('nav', site.nav.map((l, j) => (j === i ? { ...l, href: v } : l)))} />
							<button type="button" className="adm-btn adm-btn-quiet adm-align-end" onClick={() => set('nav', site.nav.filter((_, j) => j !== i))}>
								Remove
							</button>
						</div>
					))}
					<button type="button" className="adm-btn adm-btn-quiet" disabled={site.nav.length >= 8} onClick={() => set('nav', [...site.nav, { label: '', href: '/' }])}>
						+ Add link
					</button>
				</Section>

				<Section title="Social profiles">
					{site.social.map((s, i) => (
						<div key={i} className="adm-grid-3">
							<TextField label="Label" value={s.label} onChange={(v) => set('social', site.social.map((x, j) => (j === i ? { ...x, label: v } : x)))} />
							<TextField label="URL" value={s.url} onChange={(v) => set('social', site.social.map((x, j) => (j === i ? { ...x, url: v } : x)))} />
							<SelectField label="Icon" value={s.icon} options={ICONS} onChange={(v) => set('social', site.social.map((x, j) => (j === i ? { ...x, icon: v } : x)))} />
						</div>
					))}
					<button type="button" className="adm-btn adm-btn-quiet" onClick={() => set('social', [...site.social, { label: '', url: 'https://', icon: 'youtube' }])}>
						+ Add profile
					</button>
					<p className="adm-hint">These also tell Google which profiles belong to the site (Organization sameAs).</p>
				</Section>

				<Section title="Search engines">
					<TextField label="Google Search Console code" value={site.verification.google} onChange={(v) => set('verification', { ...site.verification, google: v.replace(/.*content="([^"]+)".*/, '$1') })} hint='Paste the HTML tag or just its content value.' />
					<TextField label="Bing Webmaster code" value={site.verification.bing} onChange={(v) => set('verification', { ...site.verification, bing: v.replace(/.*content="([^"]+)".*/, '$1') })} />
					<div className="adm-grid-2">
						<TextField label="Posts per page" type="number" value={String(site.postsPerPage)} onChange={(v) => set('postsPerPage', Number(v))} />
						<TextField label="Index tag pages from (posts)" type="number" value={String(site.minPostsToIndexTag)} onChange={(v) => set('minPostsToIndexTag', Number(v))} hint="Thinner tag pages are hidden from search." />
					</div>
				</Section>
			</div>
		</div>
	);
}
