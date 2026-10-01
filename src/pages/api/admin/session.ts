// Sign in (POST { password }), check (GET) and sign out (DELETE).
import type { APIRoute } from 'astro';
import { adminIsSetUp, checkPassword, endSession, hasSession, loginIsBlocked, sendJson, startSession } from '../../../lib/admin/auth';

export const prerender = false;

export const GET: APIRoute = ({ cookies }) => sendJson({ setUp: adminIsSetUp(), signedIn: hasSession(cookies) });

export const POST: APIRoute = async ({ request, cookies, clientAddress, url }) => {
	if (!adminIsSetUp()) return sendJson({ error: 'Admin is locked: set ADMIN_PASSWORD in .env and restart the server.' }, 503);
	const ip = clientAddress ?? 'unknown';
	if (loginIsBlocked(ip)) return sendJson({ error: 'Too many wrong passwords. Wait 15 minutes and try again.' }, 429);
	const body = (await request.json().catch(() => ({}))) as { password?: string };
	if (!body.password || !checkPassword(body.password, ip)) return sendJson({ error: 'Wrong password.' }, 401);
	startSession(cookies, url.protocol === 'https:');
	return sendJson({ signedIn: true });
};

export const DELETE: APIRoute = ({ cookies }) => {
	endSession(cookies);
	return sendJson({ signedIn: false });
};
