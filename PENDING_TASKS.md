# Pending tasks - Swagamerz gaming blog

Last updated: 4 Oct 2026. Production source: `main`. Brand: Swagamerz.
Production domain: `https://swagamerz.varsys.co.in/`.

## Where things stand

Done and pushed:

- Public blog (Astro 5, static HTML): home, posts, categories, tags, game hubs, authors,
  search, about/editorial/contact/privacy/terms, 404, sitemap, robots, RSS, JSON-LD.
- Content stored as JSON in `content/` (14 sample posts, 7 categories, 6 games, 2 authors).
- Admin dashboard at `/admin/` (password in local `.env`, not committed).
- MCP server: `npm run mcp` (stdio, registered in `.mcp.json`) and `/api/mcp/` (HTTP, needs
  `BLOG_MCP_KEY`). Tools: `blog_read`, `blog_write`, `blog_upload`, `blog_seo_check`.

## Resume in 3 steps

1. `cd BlogSWGDevo && npm install`
2. Check `.env` exists (copy `.env.example` and set `ADMIN_PASSWORD` if not).
3. `npm run dev` -> site at `localhost:4321`, admin at `localhost:4321/admin/`.

## Pending - before launch (do first)

- [ ] **Verified channel links.** Add the correct YouTube, Instagram, Discord and X URLs in
      /admin > Site settings when confirmed; currently unverified links are intentionally omitted.
- [x] **Creator identity.** The public author is Vasanthan, the creator of Swagamerz.
- [ ] **Real posts.** The 14 sample posts are short (300-600 words) and partly invented.
      Replace them with real guides of 900+ words; use the SEO pane until each scores 80+.
- [ ] **Real cover images.** Mock covers come from `scripts/make-mock-covers.mjs`. Upload real
      screenshots/thumbnails through /admin > Media (alt text required).
- [x] **Hosting and domain selected.** Coolify on WebDedis; `SITE_URL` is the Swagamerz domain.
- [ ] **Decide the publish model:**
      - Option A (now): edit locally -> commit `content/` + `public/uploads/` -> deploy builds the static site.
      - Option B: run the Node server (`npm start`) on the VPS so /admin works online; needs a
        persistent volume for `content/` and `public/uploads/`, plus a rebuild step after edits.
- [ ] **Server secrets.** On the host set `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` and (only if
      remote MCP is wanted) `BLOG_MCP_KEY`. Store them in OpenBao, never in the repo.
- [ ] **Search engines.** Paste the Google Search Console HTML-tag code in /admin > Site settings,
      submit `sitemap.xml`, request indexing for home and `/blog/`, then import into Bing.
- [ ] **AdSense.** Add the actual publisher ID and ads.txt after the AdSense account is approved;
      no ads are currently served.

## Pending - backend (when chosen)

- [ ] Choose the backend (Postgres API, headless CMS, Appwrite...).
- [ ] Reads: add an adapter next to `src/lib/content/file/` or map fields in
      `src/lib/content/http/index.ts`; set `CONTENT_SOURCE`.
- [ ] Writes: `src/lib/store/actions.ts` still writes JSON files. Move its read/write calls to
      the backend so /admin and MCP keep working unchanged.
- [ ] Add edit conflict protection (today the last save wins if two people edit one post).
- [ ] Newsletter: set `PUBLIC_SIGNUP_URL` to an endpoint that accepts `POST { email }`.
- [ ] Search: swap `src/pages/search-index.json.ts` for a search API once the archive is large.

## Pending - admin and MCP improvements (nice to have)

- [ ] Full draft preview page (today only the body preview exists in the editor).
- [ ] Scheduled publishing (future `publishedAt` is stored but not hidden until that time).
- [ ] Delete unused media from the library.
- [ ] Post revision history / undo beyond the `content/.trash/` folder.
- [ ] More than one admin user with roles, plus a change log of who edited what.
- [ ] A small skill file for agents (like `vasanths-kitchen-admin`) describing the MCP tools.

## Pending - checks not yet done

- [ ] Visual check of /admin with screenshots at 320x568, 360x640, 768x1024, 1024x600 and
      1920x1080 (layout was checked by measurement only; screenshots timed out).
- [ ] Public site at 2560x1440 (not checked).
- [ ] Lighthouse / Core Web Vitals run on a phone profile after deploy.
- [ ] Accessibility audit (axe / `scan` skill) on home, a post page and /admin.
- [ ] Automated tests for `src/lib/store/actions.ts` and `src/lib/seo/checkPost.ts`.
- [ ] Review `npm audit` warnings.

## Housekeeping

- [ ] Decide whether to keep `GEMINI.md` and `.idx/` (Firebase Studio leftovers).
- [ ] The `swg-blog` dev entry in the workspace `.claude/launch.json` is not committed (that
      file has other agents' changes too).
- [ ] Optional: upgrade Astro 5 -> 7 later (current add-ons are pinned to the Astro 5 line).
- [x] Production deploys use `main` only. Never deploy from `stagging`.
