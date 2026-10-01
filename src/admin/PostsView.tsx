// Posts workspace: list | editor | ranking checks, side by side on desktop,
// as tabs on phones. The SEO pane updates as you type.
import { useEffect, useMemo, useState } from 'react';
import { ApiError, readItems, writeItem, type ImageRef } from './api';
import { checkPost } from '../lib/seo/checkPost.ts';
import { renderBody } from '../lib/content/markdown.ts';
import {
	AreaField,
	CheckList,
	ImageField,
	ListField,
	Notice,
	ScoreBar,
	Section,
	SelectField,
	TagField,
	TextField,
	Toggle,
	fromLocalInput,
	toLocalInput,
} from './parts';
import type { Lookups } from './AdminApp';

type Faq = { question: string; answer: string };
type Review = { score: number; verdict: string; pros: string[]; cons: string[]; testedOn: string };
type Video = { youtubeId: string; title: string; description: string; uploadDate: string; duration: string };
export type PostForm = {
	slug: string;
	title: string;
	seoTitle?: string;
	description: string;
	kind: string;
	category: string;
	author: string;
	tags: string[];
	games: string[];
	body: { format: 'markdown' | 'html'; value: string };
	keyPoints: string[];
	faq: Faq[];
	review?: Review;
	video?: Video;
	cover?: ImageRef;
	level?: string;
	patch?: string;
	publishedAt?: string;
	updatedAt?: string;
	featured: boolean;
	draft: boolean;
	noindex: boolean;
};

type Row = { id: string; title: string; kind: string; category: string; draft: boolean; featured: boolean; updatedAt?: string; publishedAt: string; seoScore: number };

const KINDS = ['guide', 'review', 'list', 'news', 'article'].map((k) => ({ value: k, label: k[0].toUpperCase() + k.slice(1) }));
const LEVELS = [
	{ value: '', label: 'Not set' },
	{ value: 'beginner', label: 'Beginner' },
	{ value: 'intermediate', label: 'Intermediate' },
	{ value: 'advanced', label: 'Advanced' },
];

const STARTER_BODY = `**Short answer:** answer the search question here in one or two sentences.

## Why it matters

Explain the reason behind the answer.

## Step by step

1. First step.
2. Second step.

## How we tested

Say what you tested on and what changed.
`;

function makeBlank(lookups: Lookups): PostForm {
	return {
		slug: '',
		title: '',
		description: '',
		kind: 'guide',
		category: lookups.categories[0]?.slug ?? '',
		author: lookups.authors[0]?.slug ?? '',
		tags: [],
		games: [],
		body: { format: 'markdown', value: STARTER_BODY },
		keyPoints: [],
		faq: [],
		featured: false,
		draft: true,
		noindex: false,
	};
}

// Turn the form into what the store expects: removed optional fields become null.
function makePayload(form: PostForm, saved: PostForm | null): Record<string, unknown> {
	const out: Record<string, unknown> = { ...form };
	for (const key of ['seoTitle', 'level', 'patch', 'updatedAt'] as const) if (!form[key]) out[key] = saved?.[key] ? null : undefined;
	if (form.kind !== 'review') out.review = saved?.review ? null : undefined;
	if (!form.video) out.video = saved?.video ? null : undefined;
	if (!form.slug) delete out.slug;
	for (const [k, v] of Object.entries(out)) if (v === undefined) delete out[k];
	return out;
}

export default function PostsView({ lookups, siteName, startId, onChanged }: { lookups: Lookups; siteName: string; startId?: string; onChanged: () => void }) {
	const [rows, setRows] = useState<Row[]>([]);
	const [q, setQ] = useState('');
	const [status, setStatus] = useState<'' | 'draft' | 'published'>('');
	const [selected, setSelected] = useState<string | null>(startId ?? null);
	const [form, setForm] = useState<PostForm | null>(null);
	const [saved, setSaved] = useState<PostForm | null>(null);
	const [tab, setTab] = useState<'list' | 'edit' | 'seo'>(startId ? 'edit' : 'list');
	const [preview, setPreview] = useState(false);
	const [notice, setNotice] = useState<{ tone: 'ok' | 'error' | 'info'; text: string; issues?: string[] } | null>(null);
	const [busy, setBusy] = useState(false);

	const loadRows = async () => {
		try {
			const data = await readItems<{ rows: Row[] }>({ type: 'posts', q: q || undefined, status: status || undefined, limit: 500 });
			setRows(data.rows);
		} catch (e) {
			setNotice({ tone: 'error', text: (e as Error).message });
		}
	};

	useEffect(() => {
		const timer = setTimeout(loadRows, 200);
		return () => clearTimeout(timer);
	}, [q, status]);

	useEffect(() => {
		if (!selected) return;
		if (selected === 'new') {
			const blank = makeBlank(lookups);
			setForm(blank);
			setSaved(null);
			return;
		}
		readItems<PostForm & { seo: unknown }>({ type: 'posts', id: selected })
			.then(({ seo: _seo, ...post }) => {
				setForm(post);
				setSaved(post);
			})
			.catch((e) => setNotice({ tone: 'error', text: (e as Error).message }));
		window.location.hash = `#/posts/${selected}`;
	}, [selected]);

	const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved]);
	const gameNames = useMemo(() => (form?.games ?? []).map((slug) => lookups.games.find((g) => g.slug === slug)?.name ?? slug), [form?.games, lookups.games]);
	const seo = useMemo(() => (form ? checkPost(form, gameNames) : null), [form, gameNames]);
	const previewHtml = useMemo(() => (preview && form ? renderBody(form.body).html : ''), [preview, form?.body]);

	const pick = (id: string) => {
		if (dirty && !window.confirm('You have unsaved changes. Leave this post without saving?')) return;
		setNotice(null);
		setSelected(id);
		setTab('edit');
	};

	const set = <K extends keyof PostForm>(key: K, value: PostForm[K]) => setForm((f) => (f ? { ...f, [key]: value } : f));

	const save = async (publish?: boolean) => {
		if (!form) return;
		setBusy(true);
		setNotice(null);
		try {
			const data = makePayload(publish === undefined ? form : { ...form, draft: !publish }, saved);
			const result = await writeItem(saved ? { type: 'posts', id: saved.slug, data } : { type: 'posts', data });
			const post = result.item as PostForm;
			setForm(post);
			setSaved(post);
			setSelected(post.slug);
			setNotice({ tone: 'ok', text: `${result.action === 'created' ? 'Created' : 'Saved'} "${post.title}".${post.draft ? ' It is a draft.' : ' It is live.'} ${result.note ?? ''}` });
			loadRows();
			onChanged();
		} catch (e) {
			setNotice({ tone: 'error', text: (e as Error).message, issues: e instanceof ApiError ? e.issues : [] });
		} finally {
			setBusy(false);
		}
	};

	const remove = async () => {
		if (!saved || !window.confirm(`Delete "${saved.title}"? It moves to content/.trash and can be restored from there.`)) return;
		setBusy(true);
		try {
			await writeItem({ type: 'posts', id: saved.slug, delete: true });
			setNotice({ tone: 'ok', text: `Deleted "${saved.title}" (moved to trash).` });
			setForm(null);
			setSaved(null);
			setSelected(null);
			setTab('list');
			loadRows();
			onChanged();
		} catch (e) {
			setNotice({ tone: 'error', text: (e as Error).message });
		} finally {
			setBusy(false);
		}
	};

	const searchTitle = form ? (form.seoTitle || form.title || 'Post title') : '';
	const fullTitle = `${searchTitle} | ${siteName}`.length <= 60 ? `${searchTitle} | ${siteName}` : searchTitle;

	return (
		<div className="adm-work">
			<div className="adm-tabs" role="tablist" aria-label="Posts panes">
				{(['list', 'edit', 'seo'] as const).map((t) => (
					<button key={t} role="tab" type="button" aria-selected={tab === t} className="adm-tab" onClick={() => setTab(t)}>
						{t === 'list' ? 'Posts' : t === 'edit' ? 'Edit' : `SEO ${seo ? seo.score : ''}`}
					</button>
				))}
			</div>

			<div className="adm-panes" data-tab={tab}>
				<section className="adm-pane adm-pane-list" aria-label="Post list">
					<div className="adm-pane-head">
						<input className="adm-input" type="search" placeholder="Search posts" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search posts" />
						<div className="adm-row">
							<select className="adm-input" value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Filter by status">
								<option value="">All</option>
								<option value="published">Live</option>
								<option value="draft">Drafts</option>
							</select>
							<button type="button" className="adm-btn" onClick={() => pick('new')}>
								New post
							</button>
						</div>
					</div>
					<ul className="adm-list">
						{rows.length === 0 && <li className="adm-empty">No posts match. Clear the search or create a new post.</li>}
						{rows.map((row) => (
							<li key={row.id}>
								<button type="button" className="adm-list-item" aria-current={selected === row.id ? 'true' : undefined} onClick={() => pick(row.id)}>
									<span className="adm-list-title">{row.title}</span>
									<span className="adm-list-meta">
										{row.draft ? <span className="adm-badge adm-badge-draft">Draft</span> : <span className="adm-badge adm-badge-live">Live</span>}
										{row.featured && <span className="adm-badge">Featured</span>}
										<span>{row.kind}</span>
										<ScoreBar score={row.seoScore} />
									</span>
								</button>
							</li>
						))}
					</ul>
				</section>

				<section className="adm-pane adm-pane-main" aria-label="Post editor">
					{!form ? (
						<div className="adm-empty adm-empty-big">
							<p>Pick a post to edit, or start a new one.</p>
							<button type="button" className="adm-btn" onClick={() => pick('new')}>
								New post
							</button>
						</div>
					) : (
						<>
							<div className="adm-savebar">
								<span className="adm-savebar-state">{saved ? (dirty ? 'Unsaved changes' : 'All changes saved') : 'New post (not saved yet)'}</span>
								<div className="adm-row">
									{saved && !saved.draft && (
										<a className="adm-btn adm-btn-quiet" href={`/blog/${saved.slug}/`} target="_blank" rel="noopener">
											View live
										</a>
									)}
									<button type="button" className="adm-btn adm-btn-quiet" onClick={() => setPreview(!preview)} aria-pressed={preview}>
										{preview ? 'Edit body' : 'Preview body'}
									</button>
									<button type="button" className="adm-btn adm-btn-quiet" disabled={busy || (!dirty && !!saved)} onClick={() => save()}>
										Save
									</button>
									<button type="button" className="adm-btn" disabled={busy} onClick={() => save(form.draft)}>
										{form.draft ? 'Publish' : 'Unpublish'}
									</button>
								</div>
							</div>
							{notice && (
								<Notice tone={notice.tone}>
									{notice.text}
									{notice.issues && notice.issues.length > 0 && (
										<ul>
											{notice.issues.map((i) => (
												<li key={i}>{i}</li>
											))}
										</ul>
									)}
								</Notice>
							)}

							<div className="adm-form">
								<Section title="Basics">
									<TextField label="Headline" value={form.title} onChange={(v) => set('title', v)} hint="The h1 on the page. Put the main search phrase near the start." />
									<TextField
										label="URL slug"
										value={form.slug}
										onChange={(v) => set('slug', v.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))}
										placeholder="made from the headline when empty"
										hint={saved ? 'Changing it adds a redirect from the old URL automatically.' : 'Short and readable, e.g. best-valorant-settings.'}
									/>
									<div className="adm-grid-2">
										<SelectField label="Type" value={form.kind} onChange={(v) => set('kind', v)} options={KINDS} />
										<SelectField label="Category" value={form.category} onChange={(v) => set('category', v)} options={lookups.categories.map((c) => ({ value: c.slug, label: c.name }))} />
										<SelectField label="Author" value={form.author} onChange={(v) => set('author', v)} options={lookups.authors.map((a) => ({ value: a.slug, label: a.name }))} />
										<SelectField label="Level" value={form.level ?? ''} onChange={(v) => set('level', v || undefined)} options={LEVELS} />
									</div>
								</Section>

								<Section title="Search and sharing">
									<TextField label="SEO title" value={form.seoTitle ?? ''} onChange={(v) => set('seoTitle', v || undefined)} range={[30, 60]} hint="Only needed when the headline is longer than 60 characters." />
									<AreaField label="Meta description" value={form.description} onChange={(v) => set('description', v)} range={[120, 158]} hint="Answer the search in one or two sentences. Shown under the title in Google." />
								</Section>

								<Section title="Body">
									{preview ? (
										<div className="adm-preview prose" dangerouslySetInnerHTML={{ __html: previewHtml }} />
									) : (
										<AreaField
											label={`Body (${form.body.format === 'html' ? 'HTML' : 'Markdown'})`}
											value={form.body.value}
											onChange={(v) => set('body', { ...form.body, value: v })}
											rows={22}
											code
											hint="## Section, ### Sub-section, - list, 1. steps, **bold**, [link text](/blog/other-post/). Link to 2+ related posts."
										/>
									)}
								</Section>

								<Section title="Answer boxes">
									<ListField label="Key points (In short box)" value={form.keyPoints} onChange={(v) => set('keyPoints', v)} placeholder="One short answer" hint="3-5 one-line answers. These often become Google featured snippets." />
									<fieldset className="adm-field adm-fieldset-plain">
										<legend className="adm-label">FAQ</legend>
										{form.faq.map((item, index) => (
											<div key={index} className="adm-faq">
												<TextField label={`Question ${index + 1}`} value={item.question} onChange={(v) => set('faq', form.faq.map((f, i) => (i === index ? { ...f, question: v } : f)))} />
												<AreaField label="Answer" value={item.answer} onChange={(v) => set('faq', form.faq.map((f, i) => (i === index ? { ...f, answer: v } : f)))} />
												<button type="button" className="adm-btn adm-btn-quiet" onClick={() => set('faq', form.faq.filter((_, i) => i !== index))}>
													Remove question
												</button>
											</div>
										))}
										<button type="button" className="adm-btn adm-btn-quiet" onClick={() => set('faq', [...form.faq, { question: '', answer: '' }])}>
											+ Add question
										</button>
										<p className="adm-hint">Use real questions players ask (comments, Google "People also ask").</p>
									</fieldset>
								</Section>

								<Section title="Games and tags">
									<CheckList label="Games" value={form.games} onChange={(v) => set('games', v)} options={lookups.games.map((g) => ({ value: g.slug, label: g.name }))} hint="Puts the post on each game hub page." />
									<TagField label="Tags" value={form.tags} onChange={(v) => set('tags', v)} hint="2-6 tags. Reuse existing tags so topic pages grow." />
								</Section>

								<Section title="Cover and video">
									<ImageField label="Cover image" value={form.cover} onChange={(v) => set('cover', v)} hint="1200px wide or more. Used on the page, in cards and as the share image." />
									<Toggle
										label="This post has a YouTube video"
										checked={Boolean(form.video)}
										onChange={(on) => set('video', on ? { youtubeId: '', title: form.title, description: form.description, uploadDate: new Date().toISOString(), duration: 'PT10M0S' } : undefined)}
									/>
									{form.video && (
										<div className="adm-grid-2">
											<TextField label="YouTube video id" value={form.video.youtubeId} onChange={(v) => set('video', { ...form.video!, youtubeId: v.replace(/.*(?:v=|youtu\.be\/)/, '').slice(0, 20) })} hint="The part after watch?v= (a full link also works)." />
											<TextField label="Duration" value={form.video.duration} onChange={(v) => set('video', { ...form.video!, duration: v })} hint="Format PT12M30S" />
											<TextField label="Video title" value={form.video.title} onChange={(v) => set('video', { ...form.video!, title: v })} />
											<TextField label="Upload date" type="datetime-local" value={toLocalInput(form.video.uploadDate)} onChange={(v) => set('video', { ...form.video!, uploadDate: fromLocalInput(v) ?? form.video!.uploadDate })} />
											<AreaField label="Video description" value={form.video.description} onChange={(v) => set('video', { ...form.video!, description: v })} />
										</div>
									)}
								</Section>

								{form.kind === 'review' && (
									<Section title="Review">
										<div className="adm-grid-2">
											<TextField label="Score (0-10)" type="number" value={String(form.review?.score ?? '')} onChange={(v) => set('review', { verdict: '', pros: [], cons: [], testedOn: '', ...form.review, score: Number(v) })} />
											<TextField label="Played on" value={form.review?.testedOn ?? ''} onChange={(v) => set('review', { score: 0, verdict: '', pros: [], cons: [], ...form.review, testedOn: v })} hint="Platform, hours, patch" />
										</div>
										<AreaField label="Verdict" value={form.review?.verdict ?? ''} onChange={(v) => set('review', { score: 0, pros: [], cons: [], testedOn: '', ...form.review, verdict: v })} />
										<div className="adm-grid-2">
											<ListField label="Good" value={form.review?.pros ?? []} onChange={(v) => set('review', { score: 0, verdict: '', cons: [], testedOn: '', ...form.review, pros: v })} />
											<ListField label="Not so good" value={form.review?.cons ?? []} onChange={(v) => set('review', { score: 0, verdict: '', pros: [], testedOn: '', ...form.review, cons: v })} />
										</div>
									</Section>
								)}

								<Section title="Publishing">
									<div className="adm-grid-2">
										<TextField label="Published" type="datetime-local" value={toLocalInput(form.publishedAt)} onChange={(v) => set('publishedAt', fromLocalInput(v))} />
										<div className="adm-field">
											<TextField label="Last updated" type="datetime-local" value={toLocalInput(form.updatedAt)} onChange={(v) => set('updatedAt', fromLocalInput(v))} hint="Change it only for real updates (re-tested, rewritten)." />
											<button type="button" className="adm-btn adm-btn-quiet" onClick={() => set('updatedAt', new Date().toISOString())}>
												Set to now
											</button>
										</div>
									</div>
									<TextField label="Tested on (patch / date)" value={form.patch ?? ''} onChange={(v) => set('patch', v || undefined)} placeholder="Live build, Oct 2026" hint="Shown on the page as a freshness signal." />
									<Toggle label="Featured on the home page" checked={form.featured} onChange={(v) => set('featured', v)} />
									<Toggle label="Hide from search engines (noindex)" checked={form.noindex} onChange={(v) => set('noindex', v)} hint="Rarely needed. Thin or duplicate posts only." />
									{saved && (
										<button type="button" className="adm-btn adm-btn-danger" disabled={busy} onClick={remove}>
											Delete post
										</button>
									)}
								</Section>
							</div>
						</>
					)}
				</section>

				<aside className="adm-pane adm-pane-side" aria-label="Ranking checks">
					{form && seo ? (
						<>
							<div className="adm-side-block">
								<p className="adm-kicker">Ranking score</p>
								<div className="adm-big-score">
									<ScoreBar score={seo.score} />
									<span className="adm-hint">{seo.words} words</span>
								</div>
							</div>
							<div className="adm-side-block">
								<p className="adm-kicker">Google preview</p>
								<div className="adm-serp">
									<span className="adm-serp-url">swgdevo &rsaquo; blog &rsaquo; {form.slug || 'new-post'}</span>
									<span className="adm-serp-title">{fullTitle.length > 62 ? `${fullTitle.slice(0, 60)}...` : fullTitle}</span>
									<span className="adm-serp-text">{form.description.length > 160 ? `${form.description.slice(0, 157)}...` : form.description || 'Write a meta description to see it here.'}</span>
								</div>
							</div>
							<div className="adm-side-block">
								<p className="adm-kicker">What to fix</p>
								<ul className="adm-checks-list">
									{[...seo.checks]
										.sort((a, b) => ['bad', 'warn', 'good'].indexOf(a.level) - ['bad', 'warn', 'good'].indexOf(b.level))
										.map((c) => (
											<li key={c.id} className={`adm-check-item adm-check-${c.level}`}>
												<span className="adm-check-mark" aria-hidden="true">{c.level === 'good' ? '+' : c.level === 'warn' ? '!' : 'x'}</span>
												<span>
													<span className="sr-only">{c.level === 'good' ? 'Good: ' : c.level === 'warn' ? 'Improve: ' : 'Fix: '}</span>
													{c.text}
												</span>
											</li>
										))}
								</ul>
							</div>
						</>
					) : (
						<p className="adm-empty">Ranking checks show here while you edit a post.</p>
					)}
				</aside>
			</div>
		</div>
	);
}
