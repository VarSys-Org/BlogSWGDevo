// Admin sign-in and API keys. Sessions are a signed, expiring cookie
// (HttpOnly, SameSite=Strict), so no session store is needed. The MCP HTTP
// endpoint uses a separate bearer key so an agent never needs the password.

import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import type { AstroCookies } from 'astro';
import { getSecret } from 'astro:env/server';

const COOKIE = 'swg_admin';
const SESSION_HOURS = 12;
const LOGIN_LIMIT = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

const tries = new Map<string, { count: number; since: number }>();

export function adminIsSetUp(): boolean {
	return Boolean(getSecret('ADMIN_PASSWORD'));
}

function getSigningKey(): string {
	const secret = getSecret('ADMIN_SESSION_SECRET');
	if (secret) return secret;
	const password = getSecret('ADMIN_PASSWORD') ?? '';
	return createHash('sha256').update(`swg-admin-session:${password}`).digest('hex');
}

function sign(value: string): string {
	return createHmac('sha256', getSigningKey()).update(value).digest('base64url');
}

function sameText(a: string, b: string): boolean {
	const left = createHash('sha256').update(a).digest();
	const right = createHash('sha256').update(b).digest();
	return timingSafeEqual(left, right);
}

export function loginIsBlocked(ip: string): boolean {
	const entry = tries.get(ip);
	if (!entry) return false;
	if (Date.now() - entry.since > LOGIN_WINDOW_MS) {
		tries.delete(ip);
		return false;
	}
	return entry.count >= LOGIN_LIMIT;
}

export function checkPassword(password: string, ip: string): boolean {
	const real = getSecret('ADMIN_PASSWORD');
	const ok = Boolean(real) && sameText(password, real!);
	if (ok) tries.delete(ip);
	else {
		const entry = tries.get(ip) ?? { count: 0, since: Date.now() };
		entry.count += 1;
		tries.set(ip, entry);
	}
	return ok;
}

export function startSession(cookies: AstroCookies, secure: boolean): void {
	const expires = Date.now() + SESSION_HOURS * 3600 * 1000;
	const value = `${expires}.${sign(String(expires))}`;
	cookies.set(COOKIE, value, { httpOnly: true, sameSite: 'strict', secure, path: '/', maxAge: SESSION_HOURS * 3600 });
}

export function endSession(cookies: AstroCookies): void {
	cookies.delete(COOKIE, { path: '/' });
}

export function hasSession(cookies: AstroCookies): boolean {
	if (!adminIsSetUp()) return false;
	const value = cookies.get(COOKIE)?.value;
	if (!value) return false;
	const [expires, signature] = value.split('.');
	if (!expires || !signature || Number(expires) < Date.now()) return false;
	return sameText(signature, sign(expires));
}

export function mcpKeyIsValid(header: string | null): boolean {
	const key = getSecret('BLOG_MCP_KEY');
	if (!key || !header?.startsWith('Bearer ')) return false;
	return sameText(header.slice(7).trim(), key);
}

export function sendJson(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
	});
}
