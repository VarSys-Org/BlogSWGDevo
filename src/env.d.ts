/// <reference types="astro/client" />

interface ImportMetaEnv {
	/** Which backend feeds the site: "mock" (default) or "http". See src/lib/content/source.ts. */
	readonly CONTENT_SOURCE?: string;
	/** Base URL of the content API when CONTENT_SOURCE=http. */
	readonly CONTENT_API_URL?: string;
	/** Optional bearer token for the content API. Build-time only, never sent to browsers. */
	readonly CONTENT_API_TOKEN?: string;
	/** Endpoint that accepts POST { email } for newsletter sign-ups. Public. */
	readonly PUBLIC_SIGNUP_URL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
