// Admin shell: sign-in, sidebar, and one screen per content type.
// Routes live in the URL hash (#/posts/<slug>) so links can be shared and
// the browser back button works without a server router.
import { useCallback, useEffect, useState } from 'react';
import { ApiError, getSession, readItems, signIn, signOut, type Session } from './api';
import PostsView from './PostsView';
import ListView from './ListView';
import SiteView from './SiteView';
import { HomeView, MediaView, RedirectsView } from './MiscViews';
import { Notice } from './parts';

export type Lookups = {
	categories: { slug: string; name: string }[];
	games: { slug: string; name: string }[];
	authors: { slug: string; name: string }[];
	siteName: string;
};

const SCREENS = [
	{ key: 'home', label: 'Dashboard' },
	{ key: 'posts', label: 'Posts' },
	{ key: 'categories', label: 'Categories' },
	{ key: 'games', label: 'Games' },
	{ key: 'authors', label: 'Authors' },
	{ key: 'media', label: 'Media' },
	{ key: 'site', label: 'Site settings' },
	{ key: 'redirects', label: 'Redirects' },
] as const;
type ScreenKey = (typeof SCREENS)[number]['key'];

function readHash(): { screen: ScreenKey; id?: string } {
	const [, screen, id] = window.location.hash.replace(/^#/, '').split('/');
	const known = SCREENS.some((s) => s.key === screen);
	return { screen: known ? (screen as ScreenKey) : 'home', id: id ? decodeURIComponent(id) : undefined };
}

function SignIn({ session, onDone }: { session: Session; onDone: () => void }) {
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [busy, setBusy] = useState(false);
	const submit = async (event: { preventDefault(): void }) => {
		event.preventDefault();
		setBusy(true);
		setError('');
		try {
			await signIn(password);
			onDone();
		} catch (e) {
			setError((e as Error).message);
		} finally {
			setBusy(false);
		}
	};
	return (
		<main className="adm-signin">
			<form className="adm-panel adm-signin-card" onSubmit={submit}>
				<p className="adm-kicker">Swagamerz</p>
				<h1 className="adm-signin-title">Admin sign in</h1>
				{!session.setUp ? (
					<Notice tone="info">
						Admin is locked. Add <code>ADMIN_PASSWORD=...</code> to the <code>.env</code> file in the project folder, then restart the server.
					</Notice>
				) : (
					<>
						<label className="adm-label" htmlFor="adm-password">
							Password
						</label>
						<input id="adm-password" className="adm-input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus />
						{error && <p className="adm-field-error">{error}</p>}
						<button className="adm-btn" type="submit" disabled={busy}>
							{busy ? 'Signing in...' : 'Sign in'}
						</button>
					</>
				)}
			</form>
		</main>
	);
}

export default function AdminApp() {
	const [session, setSession] = useState<Session | null>(null);
	const [route, setRoute] = useState(readHash);
	const [lookups, setLookups] = useState<Lookups | null>(null);
	const [error, setError] = useState('');
	const [menuOpen, setMenuOpen] = useState(false);

	const checkSession = useCallback(() => {
		getSession()
			.then(setSession)
			.catch((e) => setError((e as Error).message));
	}, []);

	const loadLookups = useCallback(async () => {
		try {
			const [c, g, a, site] = await Promise.all([
				readItems<{ rows: Lookups['categories'] }>({ type: 'categories', limit: 500 }),
				readItems<{ rows: Lookups['games'] }>({ type: 'games', limit: 500 }),
				readItems<{ rows: Lookups['authors'] }>({ type: 'authors', limit: 500 }),
				readItems<{ name: string }>({ type: 'site' }),
			]);
			setLookups({ categories: c.rows, games: g.rows, authors: a.rows, siteName: site.name });
		} catch (e) {
			if (e instanceof ApiError && e.status === 401) checkSession();
			else setError((e as Error).message);
		}
	}, [checkSession]);

	useEffect(checkSession, [checkSession]);
	useEffect(() => {
		if (session?.signedIn) loadLookups();
	}, [session?.signedIn, loadLookups]);
	useEffect(() => {
		const onHash = () => {
			setRoute(readHash());
			setMenuOpen(false);
		};
		window.addEventListener('hashchange', onHash);
		return () => window.removeEventListener('hashchange', onHash);
	}, []);

	const go = (hash: string) => {
		window.location.hash = hash;
	};

	if (error && !session) return <main className="adm-signin"><Notice tone="error">{error}</Notice></main>;
	if (!session) return <main className="adm-signin"><p className="adm-empty">Loading admin...</p></main>;
	if (!session.signedIn) return <SignIn session={session} onDone={checkSession} />;

	const title = SCREENS.find((s) => s.key === route.screen)?.label ?? 'Dashboard';

	return (
		<div className="adm-shell">
			<aside className="adm-side" data-open={menuOpen ? 'true' : 'false'}>
				<div className="adm-brand">
					<span className="adm-brand-mark" aria-hidden="true" />
					<span>
						SWG <b>Devo</b> admin
					</span>
				</div>
				<nav aria-label="Admin">
					<ul className="adm-nav">
						{SCREENS.map((s) => (
							<li key={s.key}>
								<a className="adm-nav-link" href={`#/${s.key}`} aria-current={route.screen === s.key ? 'page' : undefined}>
									{s.label}
								</a>
							</li>
						))}
					</ul>
				</nav>
				<div className="adm-side-foot">
					<a className="adm-nav-link" href="/" target="_blank" rel="noopener">
						View site
					</a>
					<button
						type="button"
						className="adm-nav-link"
						onClick={() => {
							const dark = document.documentElement.classList.toggle('dark');
							try {
								localStorage.setItem('theme', dark ? 'dark' : 'light');
							} catch {
								/* theme still switches for this visit */
							}
						}}
					>
						Switch theme
					</button>
					<button type="button" className="adm-nav-link" onClick={() => signOut().then(checkSession)}>
						Sign out
					</button>
				</div>
			</aside>

			<div className="adm-main">
				<header className="adm-top">
					<button type="button" className="adm-menu-btn" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
						Menu
					</button>
					<h1 className="adm-top-title">{title}</h1>
				</header>
				<div className="adm-body">
					{error && <Notice tone="error">{error}</Notice>}
					{!lookups ? (
						<p className="adm-empty">Loading content...</p>
					) : route.screen === 'posts' ? (
						<PostsView key={route.id === 'new' ? 'new' : 'posts'} lookups={lookups} siteName={lookups.siteName} startId={route.id} onChanged={loadLookups} />
					) : route.screen === 'categories' || route.screen === 'games' || route.screen === 'authors' ? (
						<ListView type={route.screen} onChanged={loadLookups} />
					) : route.screen === 'site' ? (
						<SiteView lookups={lookups} onChanged={loadLookups} />
					) : route.screen === 'media' ? (
						<MediaView />
					) : route.screen === 'redirects' ? (
						<RedirectsView />
					) : (
						<HomeView go={go} />
					)}
				</div>
			</div>
		</div>
	);
}
