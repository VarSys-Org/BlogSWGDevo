// One screen for categories, games and authors. Each type lists its fields
// below; the store does the checking (and renames links when a slug changes).
import { useEffect, useMemo, useState } from 'react';
import { ApiError, readItems, writeItem, type ImageRef } from './api';
import { AreaField, ImageField, ListField, Notice, TextField } from './parts';

type FieldKind = 'text' | 'area' | 'list' | 'number' | 'image' | 'links';
type FieldSpec = { key: string; label: string; kind: FieldKind; hint?: string; range?: [number, number] };
type Item = Record<string, unknown> & { slug: string; name: string; posts?: number };

export type ListType = 'categories' | 'games' | 'authors';

const SPECS: Record<ListType, { title: string; one: string; fields: FieldSpec[]; viewUrl: (slug: string) => string }> = {
	categories: {
		title: 'Categories',
		one: 'category',
		viewUrl: (slug) => `/category/${slug}/`,
		fields: [
			{ key: 'name', label: 'Name', kind: 'text' },
			{ key: 'slug', label: 'URL slug', kind: 'text', hint: 'Changing it updates every post in this category.' },
			{ key: 'seoTitle', label: 'SEO title', kind: 'text', range: [30, 60] },
			{ key: 'description', label: 'Short description', kind: 'area', range: [100, 155], hint: 'Used on cards and as the meta description.' },
			{ key: 'intro', label: 'Page intro', kind: 'area', hint: 'A real paragraph on the category page helps it rank for the topic.' },
		],
	},
	games: {
		title: 'Games',
		one: 'game',
		viewUrl: (slug) => `/games/${slug}/`,
		fields: [
			{ key: 'name', label: 'Name', kind: 'text' },
			{ key: 'slug', label: 'URL slug', kind: 'text', hint: 'Changing it updates every post linked to this game.' },
			{ key: 'description', label: 'Description', kind: 'area' },
			{ key: 'genres', label: 'Genres', kind: 'list' },
			{ key: 'platforms', label: 'Platforms', kind: 'list' },
			{ key: 'developer', label: 'Developer', kind: 'text' },
			{ key: 'publisher', label: 'Publisher', kind: 'text' },
			{ key: 'releaseYear', label: 'Release year', kind: 'number' },
			{ key: 'cover', label: 'Hub image', kind: 'image' },
		],
	},
	authors: {
		title: 'Authors',
		one: 'author',
		viewUrl: (slug) => `/author/${slug}/`,
		fields: [
			{ key: 'name', label: 'Name', kind: 'text' },
			{ key: 'slug', label: 'URL slug', kind: 'text' },
			{ key: 'role', label: 'Role', kind: 'text' },
			{ key: 'bio', label: 'Bio', kind: 'area', hint: 'Why this person knows the topic. A strong trust signal for Google.' },
			{ key: 'expertise', label: 'Expertise', kind: 'list' },
			{ key: 'links', label: 'Profile links', kind: 'links' },
			{ key: 'avatar', label: 'Photo', kind: 'image' },
		],
	},
};

export default function ListView({ type, onChanged }: { type: ListType; onChanged: () => void }) {
	const spec = SPECS[type];
	const [rows, setRows] = useState<Item[]>([]);
	const [form, setForm] = useState<Item | null>(null);
	const [savedId, setSavedId] = useState<string | null>(null);
	const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string; issues?: string[] } | null>(null);
	const [tab, setTab] = useState<'list' | 'edit'>('list');
	const [busy, setBusy] = useState(false);

	const load = async () => {
		try {
			setRows((await readItems<{ rows: Item[] }>({ type, limit: 500 })).rows);
		} catch (e) {
			setNotice({ tone: 'error', text: (e as Error).message });
		}
	};

	useEffect(() => {
		setForm(null);
		setSavedId(null);
		setNotice(null);
		load();
	}, [type]);

	const original = useMemo(() => rows.find((r) => r.slug === savedId) ?? null, [rows, savedId]);

	const open = (item: Item | null) => {
		setNotice(null);
		if (item) {
			const { posts: _posts, id: _id, ...rest } = item;
			setForm(rest as Item);
			setSavedId(item.slug);
		} else {
			setForm({ slug: '', name: '' });
			setSavedId(null);
		}
		setTab('edit');
	};

	const set = (key: string, value: unknown) => setForm((f) => (f ? { ...f, [key]: value } : f));

	const save = async () => {
		if (!form) return;
		setBusy(true);
		setNotice(null);
		try {
			const data: Record<string, unknown> = {};
			for (const [k, v] of Object.entries(form)) {
				if (v === '' || v === undefined) {
					if (original && original[k] !== undefined && k !== 'slug') data[k] = null;
				} else data[k] = v;
			}
			const result = await writeItem(savedId ? { type, id: savedId, data } : { type, data });
			setNotice({ tone: 'ok', text: `Saved ${spec.one} "${form.name}". ${result.note ?? ''}` });
			setSavedId(result.id ?? null);
			setForm(result.item as Item);
			await load();
			onChanged();
		} catch (e) {
			setNotice({ tone: 'error', text: (e as Error).message, issues: e instanceof ApiError ? e.issues : [] });
		} finally {
			setBusy(false);
		}
	};

	const remove = async () => {
		if (!savedId || !window.confirm(`Delete ${spec.one} "${form?.name}"? It moves to content/.trash.`)) return;
		setBusy(true);
		try {
			await writeItem({ type, id: savedId, delete: true });
			setNotice({ tone: 'ok', text: `Deleted ${spec.one} "${form?.name}".` });
			setForm(null);
			setSavedId(null);
			setTab('list');
			await load();
			onChanged();
		} catch (e) {
			setNotice({ tone: 'error', text: (e as Error).message, issues: e instanceof ApiError ? e.issues : [] });
		} finally {
			setBusy(false);
		}
	};

	const move = async (slug: string, step: -1 | 1) => {
		const order = rows.map((r) => r.slug);
		const i = order.indexOf(slug);
		const j = i + step;
		if (j < 0 || j >= order.length) return;
		[order[i], order[j]] = [order[j], order[i]];
		try {
			await writeItem({ type, order });
			await load();
			onChanged();
		} catch (e) {
			setNotice({ tone: 'error', text: (e as Error).message });
		}
	};

	return (
		<div className="adm-work">
			<div className="adm-tabs" role="tablist" aria-label={`${spec.title} panes`}>
				<button role="tab" type="button" className="adm-tab" aria-selected={tab === 'list'} onClick={() => setTab('list')}>
					{spec.title}
				</button>
				<button role="tab" type="button" className="adm-tab" aria-selected={tab === 'edit'} onClick={() => setTab('edit')}>
					Edit
				</button>
			</div>
			<div className="adm-panes adm-panes-two" data-tab={tab}>
				<section className="adm-pane adm-pane-list" aria-label={`${spec.title} list`}>
					<div className="adm-pane-head">
						<button type="button" className="adm-btn" onClick={() => open(null)}>
							New {spec.one}
						</button>
					</div>
					<ul className="adm-list">
						{rows.map((row, index) => (
							<li key={row.slug} className="adm-list-row">
								<button type="button" className="adm-list-item" aria-current={savedId === row.slug ? 'true' : undefined} onClick={() => open(row)}>
									<span className="adm-list-title">{row.name}</span>
									<span className="adm-list-meta">
										<span>/{row.slug}</span>
										<span>{row.posts ?? 0} posts</span>
									</span>
								</button>
								<span className="adm-order">
									<button type="button" className="adm-icon-btn" aria-label={`Move ${row.name} up`} disabled={index === 0} onClick={() => move(row.slug, -1)}>
										^
									</button>
									<button type="button" className="adm-icon-btn" aria-label={`Move ${row.name} down`} disabled={index === rows.length - 1} onClick={() => move(row.slug, 1)}>
										v
									</button>
								</span>
							</li>
						))}
					</ul>
				</section>
				<section className="adm-pane adm-pane-main" aria-label={`Edit ${spec.one}`}>
					{!form ? (
						<p className="adm-empty adm-empty-big">Pick one from the list to edit, or add a new {spec.one}.</p>
					) : (
						<>
							<div className="adm-savebar">
								<span className="adm-savebar-state">{savedId ? `Editing ${spec.one}` : `New ${spec.one}`}</span>
								<div className="adm-row">
									{savedId && (
										<a className="adm-btn adm-btn-quiet" href={spec.viewUrl(savedId)} target="_blank" rel="noopener">
											View page
										</a>
									)}
									<button type="button" className="adm-btn" disabled={busy} onClick={save}>
										Save
									</button>
								</div>
							</div>
							{notice && (
								<Notice tone={notice.tone}>
									{notice.text}
									{notice.issues && notice.issues.length > 0 && <ul>{notice.issues.map((i) => <li key={i}>{i}</li>)}</ul>}
								</Notice>
							)}
							<div className="adm-form adm-form-pad">
								{spec.fields.map((f) => {
									const value = form[f.key];
									if (f.kind === 'area') return <AreaField key={f.key} label={f.label} hint={f.hint} range={f.range} value={String(value ?? '')} onChange={(v) => set(f.key, v)} rows={f.key === 'intro' || f.key === 'bio' ? 5 : 3} />;
									if (f.kind === 'list') return <ListField key={f.key} label={f.label} hint={f.hint} value={(value as string[]) ?? []} onChange={(v) => set(f.key, v)} />;
									if (f.kind === 'number') return <TextField key={f.key} label={f.label} type="number" value={value === undefined ? '' : String(value)} onChange={(v) => set(f.key, v === '' ? undefined : Number(v))} />;
									if (f.kind === 'image') return <ImageField key={f.key} label={f.label} allowEmpty value={value as ImageRef | undefined} onChange={(v) => set(f.key, v)} />;
									if (f.kind === 'links') {
										const links = (value as { label: string; url: string }[]) ?? [];
										return (
											<fieldset key={f.key} className="adm-field adm-fieldset-plain">
												<legend className="adm-label">{f.label}</legend>
												{links.map((link, i) => (
													<div key={i} className="adm-grid-2">
														<TextField label="Label" value={link.label} onChange={(v) => set(f.key, links.map((l, j) => (j === i ? { ...l, label: v } : l)))} />
														<TextField label="URL" value={link.url} onChange={(v) => set(f.key, links.map((l, j) => (j === i ? { ...l, url: v } : l)))} />
													</div>
												))}
												<button type="button" className="adm-btn adm-btn-quiet" onClick={() => set(f.key, [...links, { label: '', url: 'https://' }])}>
													+ Add link
												</button>
											</fieldset>
										);
									}
									return <TextField key={f.key} label={f.label} hint={f.hint} range={f.range} value={String(value ?? '')} onChange={(v) => set(f.key, f.key === 'slug' ? v.toLowerCase().replace(/[^a-z0-9-]+/g, '-') : v)} />;
								})}
								{savedId && (
									<button type="button" className="adm-btn adm-btn-danger" disabled={busy} onClick={remove}>
										Delete {spec.one}
									</button>
								)}
							</div>
						</>
					)}
				</section>
			</div>
		</div>
	);
}
