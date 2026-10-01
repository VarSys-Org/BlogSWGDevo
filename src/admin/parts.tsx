// Small form pieces shared by every admin screen.
import { useId, useRef, useState, type ReactNode } from 'react';
import { readItems, uploadImage, type ImageRef, type MediaItem } from './api';

type Base = { label: string; hint?: string; error?: string };

function FieldShell({ label, hint, error, id, counter, children }: Base & { id: string; counter?: ReactNode; children: ReactNode }) {
	return (
		<div className="adm-field">
			<div className="adm-field-top">
				<label className="adm-label" htmlFor={id}>
					{label}
				</label>
				{counter}
			</div>
			{children}
			{error ? <p className="adm-field-error">{error}</p> : hint ? <p className="adm-hint">{hint}</p> : null}
		</div>
	);
}

function Counter({ length, low, high }: { length: number; low: number; high: number }) {
	const band = length === 0 ? 'adm-count' : length < low ? 'adm-count adm-count-low' : length > high ? 'adm-count adm-count-high' : 'adm-count adm-count-ok';
	return (
		<span className={band}>
			{length} / {low}-{high}
		</span>
	);
}

export function TextField(props: Base & { value: string; onChange: (v: string) => void; range?: [number, number]; placeholder?: string; type?: string }) {
	const id = useId();
	return (
		<FieldShell {...props} id={id} counter={props.range && <Counter length={props.value.length} low={props.range[0]} high={props.range[1]} />}>
			<input
				id={id}
				className="adm-input"
				type={props.type ?? 'text'}
				value={props.value}
				placeholder={props.placeholder}
				onChange={(e) => props.onChange(e.target.value)}
			/>
		</FieldShell>
	);
}

export function AreaField(props: Base & { value: string; onChange: (v: string) => void; range?: [number, number]; rows?: number; code?: boolean }) {
	const id = useId();
	return (
		<FieldShell {...props} id={id} counter={props.range && <Counter length={props.value.length} low={props.range[0]} high={props.range[1]} />}>
			<textarea
				id={id}
				className={props.code ? 'adm-input adm-textarea adm-code' : 'adm-input adm-textarea'}
				rows={props.rows ?? 3}
				value={props.value}
				onChange={(e) => props.onChange(e.target.value)}
			/>
		</FieldShell>
	);
}

export function SelectField(props: Base & { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
	const id = useId();
	return (
		<FieldShell {...props} id={id}>
			<select id={id} className="adm-input" value={props.value} onChange={(e) => props.onChange(e.target.value)}>
				{props.options.map((o) => (
					<option key={o.value} value={o.value}>
						{o.label}
					</option>
				))}
			</select>
		</FieldShell>
	);
}

export function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
	return (
		<label className="adm-toggle">
			<input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
			<span className="adm-toggle-track" aria-hidden="true" />
			<span>
				<span className="adm-toggle-label">{label}</span>
				{hint && <span className="adm-hint">{hint}</span>}
			</span>
		</label>
	);
}

// Editable list of short strings (key points, genres, platforms...).
export function ListField(props: Base & { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
	const id = useId();
	const update = (index: number, text: string) => props.onChange(props.value.map((v, i) => (i === index ? text : v)));
	return (
		<FieldShell {...props} id={id}>
			<ol className="adm-rows">
				{props.value.map((item, index) => (
					<li key={index} className="adm-row">
						<input
							id={index === 0 ? id : undefined}
							className="adm-input"
							value={item}
							placeholder={props.placeholder}
							aria-label={`${props.label} ${index + 1}`}
							onChange={(e) => update(index, e.target.value)}
						/>
						<button type="button" className="adm-icon-btn" aria-label={`Remove ${props.label} ${index + 1}`} onClick={() => props.onChange(props.value.filter((_, i) => i !== index))}>
							x
						</button>
					</li>
				))}
			</ol>
			<button type="button" className="adm-btn adm-btn-quiet" onClick={() => props.onChange([...props.value, ''])}>
				+ Add
			</button>
		</FieldShell>
	);
}

// Tags typed as text, split on commas.
export function TagField(props: Base & { value: string[]; onChange: (v: string[]) => void }) {
	const [draft, setDraft] = useState('');
	const id = useId();
	const add = () => {
		const parts = draft.split(',').map((t) => t.trim()).filter(Boolean);
		if (parts.length) props.onChange([...new Set([...props.value, ...parts])]);
		setDraft('');
	};
	return (
		<FieldShell {...props} id={id}>
			<ul className="adm-chips">
				{props.value.map((tag) => (
					<li key={tag} className="adm-chip">
						{tag}
						<button type="button" aria-label={`Remove tag ${tag}`} onClick={() => props.onChange(props.value.filter((t) => t !== tag))}>
							x
						</button>
					</li>
				))}
			</ul>
			<input
				id={id}
				className="adm-input"
				value={draft}
				placeholder="Type a tag and press Enter"
				onChange={(e) => setDraft(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ',') {
						e.preventDefault();
						add();
					}
				}}
				onBlur={add}
			/>
		</FieldShell>
	);
}

export function CheckList(props: Base & { value: string[]; onChange: (v: string[]) => void; options: { value: string; label: string }[] }) {
	const toggle = (slug: string) => props.onChange(props.value.includes(slug) ? props.value.filter((s) => s !== slug) : [...props.value, slug]);
	return (
		<fieldset className="adm-field adm-fieldset-plain">
			<legend className="adm-label">{props.label}</legend>
			<div className="adm-checks">
				{props.options.map((o) => (
					<label key={o.value} className="adm-check">
						<input type="checkbox" checked={props.value.includes(o.value)} onChange={() => toggle(o.value)} />
						{o.label}
					</label>
				))}
			</div>
			{props.hint && <p className="adm-hint">{props.hint}</p>}
		</fieldset>
	);
}

// Pick an uploaded image or upload a new one.
export function ImageField(props: Base & { value?: ImageRef; onChange: (v: ImageRef | undefined) => void; allowEmpty?: boolean }) {
	const [open, setOpen] = useState(false);
	const [media, setMedia] = useState<MediaItem[] | null>(null);
	const [alt, setAlt] = useState('');
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState('');
	const fileRef = useRef<HTMLInputElement>(null);

	const showLibrary = async () => {
		setOpen(!open);
		if (!media) {
			try {
				setMedia(((await readItems<{ rows: MediaItem[] }>({ type: 'media', limit: 60 })).rows));
			} catch (e) {
				setError((e as Error).message);
			}
		}
	};

	const upload = async () => {
		const file = fileRef.current?.files?.[0];
		if (!file) return setError('Choose an image first.');
		if (!alt.trim()) return setError('Describe the image in the alt text first.');
		setBusy(true);
		setError('');
		try {
			const item = await uploadImage(file, alt);
			props.onChange(item.image);
			setMedia((m) => (m ? [item, ...m] : m));
			setAlt('');
			if (fileRef.current) fileRef.current.value = '';
		} catch (e) {
			setError((e as Error).message);
		} finally {
			setBusy(false);
		}
	};

	return (
		<fieldset className="adm-field adm-fieldset-plain">
			<legend className="adm-label">{props.label}</legend>
			{props.value ? (
				<div className="adm-image-now">
					<img src={props.value.src} alt="" width={props.value.width} height={props.value.height} />
					<div className="adm-image-meta">
						<TextField label="Alt text" value={props.value.alt} onChange={(v) => props.onChange({ ...props.value!, alt: v })} hint="Say what the image shows. Used by screen readers and image search." />
						{props.allowEmpty && (
							<button type="button" className="adm-btn adm-btn-quiet" onClick={() => props.onChange(undefined)}>
								Remove image
							</button>
						)}
					</div>
				</div>
			) : (
				<p className="adm-hint">No image yet.</p>
			)}
			<div className="adm-upload">
				<input ref={fileRef} type="file" accept="image/*" className="adm-input" aria-label="Image file" />
				<input className="adm-input" value={alt} placeholder="Alt text for the new image" aria-label="Alt text for the new image" onChange={(e) => setAlt(e.target.value)} />
				<button type="button" className="adm-btn" disabled={busy} onClick={upload}>
					{busy ? 'Uploading...' : 'Upload'}
				</button>
				<button type="button" className="adm-btn adm-btn-quiet" onClick={showLibrary} aria-expanded={open}>
					{open ? 'Hide library' : 'Choose from library'}
				</button>
			</div>
			{error && <p className="adm-field-error">{error}</p>}
			{open && media && (
				<ul className="adm-media-pick">
					{media.length === 0 && <li className="adm-hint">No uploads yet.</li>}
					{media.map((m) => (
						<li key={m.id}>
							<button type="button" className="adm-media-pick-btn" onClick={() => { props.onChange(m.image); setOpen(false); }}>
								<img src={m.image.src} alt="" loading="lazy" />
								<span>{m.alt}</span>
							</button>
						</li>
					))}
				</ul>
			)}
			{props.hint && <p className="adm-hint">{props.hint}</p>}
		</fieldset>
	);
}

export function Section({ title, children, open = true }: { title: string; children: ReactNode; open?: boolean }) {
	return (
		<details className="adm-section" open={open}>
			<summary>{title}</summary>
			<div className="adm-section-body">{children}</div>
		</details>
	);
}

export function Notice({ tone, children }: { tone: 'ok' | 'error' | 'info'; children: ReactNode }) {
	return (
		<div className={`adm-notice adm-notice-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
			{children}
		</div>
	);
}

export function ScoreBar({ score }: { score: number }) {
	const band = score >= 80 ? 'good' : score >= 60 ? 'mid' : 'low';
	return (
		<span className={`adm-score adm-score-${band}`} aria-label={`SEO score ${score} out of 100`}>
			<span className="adm-score-cells" aria-hidden="true">
				{Array.from({ length: 10 }, (_, i) => (
					<span key={i} className={i < Math.round(score / 10) ? 'adm-score-cell adm-score-on' : 'adm-score-cell'} />
				))}
			</span>
			<span className="adm-score-num">{score}</span>
		</span>
	);
}

export function toLocalInput(iso?: string): string {
	if (!iso) return '';
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return '';
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromLocalInput(value: string): string | undefined {
	if (!value) return undefined;
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}
