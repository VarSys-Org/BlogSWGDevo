// Smaller admin screens: dashboard, media library, redirects.
import { useEffect, useRef, useState } from 'react';
import { readItems, uploadImage, writeItem, type MediaItem } from './api';
import { Notice, ScoreBar } from './parts';

type Summary = {
	posts: number;
	published: number;
	drafts: number;
	categories: number;
	games: number;
	authors: number;
	media: number;
	averageSeoScore: number;
	needsWork: { id: string; title: string; draft: boolean; score: number }[];
};

export function HomeView({ go }: { go: (hash: string) => void }) {
	const [data, setData] = useState<Summary | null>(null);
	const [error, setError] = useState('');
	useEffect(() => {
		readItems<Summary>({ type: 'summary' }).then(setData).catch((e) => setError((e as Error).message));
	}, []);
	if (error) return <div className="adm-scroll"><Notice tone="error">{error}</Notice></div>;
	if (!data) return <div className="adm-scroll"><p className="adm-empty">Loading...</p></div>;
	const stats = [
		['Live posts', data.published],
		['Drafts', data.drafts],
		['Games', data.games],
		['Categories', data.categories],
		['Authors', data.authors],
		['Images', data.media],
	] as const;
	return (
		<div className="adm-scroll">
			<div className="adm-bento">
				<section className="adm-panel adm-panel-wide">
					<p className="adm-kicker">Average ranking score (live posts)</p>
					<div className="adm-big-score">
						<ScoreBar score={data.averageSeoScore} />
					</div>
					<p className="adm-hint">Scores check on-page factors: titles, descriptions, depth, headings, answer boxes, FAQ, internal links and freshness.</p>
					<div className="adm-row">
						<button type="button" className="adm-btn" onClick={() => go('#/posts/new')}>
							Write a new post
						</button>
						<a className="adm-btn adm-btn-quiet" href="/" target="_blank" rel="noopener">
							Open the site
						</a>
					</div>
				</section>
				{stats.map(([label, value]) => (
					<section key={label} className="adm-panel adm-stat">
						<p className="adm-kicker">{label}</p>
						<p className="adm-stat-num">{value}</p>
					</section>
				))}
				<section className="adm-panel adm-panel-wide">
					<p className="adm-kicker">Posts to improve first</p>
					{data.needsWork.length === 0 ? (
						<p className="adm-hint">Every post scores 70 or more. Keep adding depth and updating tested-on dates.</p>
					) : (
						<ul className="adm-list">
							{data.needsWork.map((p) => (
								<li key={p.id}>
									<button type="button" className="adm-list-item" onClick={() => go(`#/posts/${p.id}`)}>
										<span className="adm-list-title">{p.title}</span>
										<span className="adm-list-meta">
											{p.draft && <span className="adm-badge adm-badge-draft">Draft</span>}
											<ScoreBar score={p.score} />
										</span>
									</button>
								</li>
							))}
						</ul>
					)}
				</section>
				<section className="adm-panel adm-panel-wide">
					<p className="adm-kicker">How publishing works</p>
					<p className="adm-hint">
						Saving writes to the files in <code>content/</code>. The dev server shows changes at once. The public site is static for speed and SEO, so it updates
						when you build and deploy: commit and push the <code>content/</code> folder (and <code>public/uploads/</code>).
					</p>
				</section>
			</div>
		</div>
	);
}

export function MediaView() {
	const [items, setItems] = useState<MediaItem[]>([]);
	const [alt, setAlt] = useState('');
	const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
	const [busy, setBusy] = useState(false);
	const fileRef = useRef<HTMLInputElement>(null);

	const load = () => readItems<{ rows: MediaItem[] }>({ type: 'media', limit: 500 }).then((d) => setItems(d.rows)).catch((e) => setNotice({ tone: 'error', text: (e as Error).message }));
	useEffect(() => {
		load();
	}, []);

	const upload = async () => {
		const file = fileRef.current?.files?.[0];
		if (!file) return setNotice({ tone: 'error', text: 'Choose an image file first.' });
		if (!alt.trim()) return setNotice({ tone: 'error', text: 'Describe the image in the alt text first.' });
		setBusy(true);
		try {
			const item = await uploadImage(file, alt);
			setItems([item, ...items]);
			setAlt('');
			if (fileRef.current) fileRef.current.value = '';
			setNotice({ tone: 'ok', text: `Uploaded "${item.alt}" (${item.image.width}x${item.image.height}).` });
		} catch (e) {
			setNotice({ tone: 'error', text: (e as Error).message });
		} finally {
			setBusy(false);
		}
	};

	return (
		<div className="adm-scroll">
			<div className="adm-savebar">
				<span className="adm-savebar-state">Media library</span>
			</div>
			<div className="adm-form adm-form-narrow">
				<div className="adm-upload">
					<input ref={fileRef} type="file" accept="image/*" className="adm-input" aria-label="Image file" />
					<input className="adm-input" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Alt text: what the image shows" aria-label="Alt text" />
					<button type="button" className="adm-btn" disabled={busy} onClick={upload}>
						{busy ? 'Uploading...' : 'Upload'}
					</button>
				</div>
				<p className="adm-hint">Images are resized to 640 and 1200 px WebP, plus a JPG for share cards. Max 8 MB.</p>
				{notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
			</div>
			<ul className="adm-media-grid">
				{items.length === 0 && <li className="adm-empty">No uploads yet. Mock covers live in public/images.</li>}
				{items.map((m) => (
					<li key={m.id} className="adm-panel adm-media-card">
						<img src={m.image.src} alt={m.alt} loading="lazy" width={m.image.width} height={m.image.height} />
						<p className="adm-media-alt">{m.alt}</p>
						<button type="button" className="adm-btn adm-btn-quiet" onClick={() => navigator.clipboard.writeText(m.image.src).then(() => setNotice({ tone: 'ok', text: `Copied ${m.image.src}` }))}>
							Copy link
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}

export function RedirectsView() {
	const [map, setMap] = useState<Record<string, string>>({});
	const [from, setFrom] = useState('');
	const [to, setTo] = useState('');
	const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

	const load = () => readItems<Record<string, string>>({ type: 'redirects' }).then(setMap).catch((e) => setNotice({ tone: 'error', text: (e as Error).message }));
	useEffect(() => {
		load();
	}, []);

	const change = async (data: Record<string, string | null>, text: string) => {
		try {
			const result = await writeItem({ type: 'redirects', data: data as Record<string, unknown> });
			setMap(result.item as Record<string, string>);
			setNotice({ tone: 'ok', text });
		} catch (e) {
			setNotice({ tone: 'error', text: (e as Error).message });
		}
	};

	return (
		<div className="adm-scroll">
			<div className="adm-savebar">
				<span className="adm-savebar-state">Redirects</span>
			</div>
			<div className="adm-form adm-form-narrow">
				<p className="adm-hint">Old links keep working and keep their ranking. Post slug changes add a redirect automatically. Redirects apply on the next build.</p>
				<div className="adm-upload">
					<input className="adm-input" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="/old-path/" aria-label="Old path" />
					<input className="adm-input" value={to} onChange={(e) => setTo(e.target.value)} placeholder="/blog/new-post/" aria-label="New path" />
					<button
						type="button"
						className="adm-btn"
						onClick={() => {
							if (!from.startsWith('/') || !to.startsWith('/')) return setNotice({ tone: 'error', text: 'Both paths must start with /.' });
							change({ [from]: to }, `Added ${from} -> ${to}`).then(() => {
								setFrom('');
								setTo('');
							});
						}}
					>
						Add redirect
					</button>
				</div>
				{notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
				<ul className="adm-list">
					{Object.keys(map).length === 0 && <li className="adm-empty">No redirects yet.</li>}
					{Object.entries(map).map(([a, b]) => (
						<li key={a} className="adm-list-row adm-redirect">
							<code>{a}</code>
							<span aria-hidden="true">-&gt;</span>
							<code>{b}</code>
							<button type="button" className="adm-btn adm-btn-quiet" onClick={() => change({ [a]: null }, `Removed ${a}`)}>
								Remove
							</button>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
