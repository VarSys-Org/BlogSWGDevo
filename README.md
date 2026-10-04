# Swagamerz Gaming Blog

Gaming blog for the Swagamerz channel: guides, settings, reviews, hardware and esports.
Built with Astro: public pages are fully static HTML (best for SEO and speed), and an admin
dashboard plus an MCP server edit the content. Content lives as JSON in `content/` until a
real backend is chosen; the content layer lets any backend plug in later.

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run build` | Type check, then build the static site into `dist/` |
| `npm run preview` | Serve the built site |
| `npm start` | Run the built Node server (public pages + `/admin` + `/api`) |
| `npm run mcp` | Start the MCP server over stdio (for local AI agents) |
| `npm run mock:covers` | Rebuild mock cover art, share image and icons in `public/images/` |

Set `SITE_URL=https://swagamerz.varsys.co.in` in Coolify before a production build. Canonical URLs,
Open Graph tags, the sitemap, RSS and robots.txt are all built from it.

## Admin dashboard (`/admin/`)

1. Copy `.env.example` to `.env` and set `ADMIN_PASSWORD` (long and random).
2. `npm run dev`, open `http://localhost:4321/admin/`, sign in.

Screens: Dashboard (counts, average ranking score, posts to fix first), Posts, Categories,
Games, Authors, Media, Site settings, Redirects. The Posts screen has three panes: list,
editor and a live ranking pane (score, Google result preview, what to fix).

- Saving writes the JSON in `content/`; the dev server shows it immediately.
- New posts start as drafts. Drafts never appear on the public site.
- Changing a post URL adds a redirect from the old one automatically.
- Deletes move the item to `content/.trash/` (restore by moving the file back).
- Categories, games and authors still used by posts cannot be deleted; renaming one updates every post.
- Images are resized to 640/1200 WebP plus a 1200 JPG share image, and need alt text.

To publish, build and deploy: commit and push `content/` and `public/uploads/`. Static hosting
serves `dist/client/`; the admin and MCP endpoint need the Node server (`npm start`, with the
same `.env` values set on the server, and `node --env-file=.env` if you use a file).

## MCP server (AI agents)

Same actions and checks as the admin. Tools:

| Tool | Use |
| --- | --- |
| `blog_read` | `type`: posts, categories, games, authors, site, media, redirects, summary. Without `id`: compact list. With `id`: full item (posts include an SEO report). `fields: true`: what `blog_write` accepts |
| `blog_write` | Create (no `id` + `data`), update (`id` + changed fields, `null` clears), delete (`id` + `delete: true`), reorder (`order`) |
| `blog_upload` | `images: [{ alt, url or base64 or path }]` returns ready ImageRefs |
| `blog_seo_check` | Score a saved post (`id`) or unsaved fields (`post`) and list what to fix |

- **Local (stdio):** `.mcp.json` registers it for Claude Code in this folder. Elsewhere:
  `claude mcp add swg-blog -- node "<path>/BlogSWGDevo/mcp/stdio.ts"`. Needs Node 22.18+.
- **Remote (HTTP):** set `BLOG_MCP_KEY` on the server, then point clients at
  `https://<site>/api/mcp/` with `Authorization: Bearer <key>`. Local file paths are refused
  over HTTP.

## How content flows

```
backend (file = content/*.json | http | your adapter)
        |  4 calls: listPosts, listAuthors, listCategories, listGames
        v
src/lib/content/schema.ts   <- the contract; every record is checked at build time
        v
src/lib/content/index.ts    <- links posts to authors/categories/games, renders bodies,
        |                      works out tags, related posts and paging
        v
src/pages/**                <- pages only ever import from src/lib/content
```

### Plugging in a real backend

1. **REST API that already returns the schema shapes:** set `CONTENT_SOURCE=http` and
   `CONTENT_API_URL`. The adapter in `src/lib/content/http/` reads `/posts`, `/authors`,
   `/categories` and `/games` (bare arrays or `{ data: [...] }`).
2. **Different field names (Strapi, WordPress, Appwrite, Postgres API, ...):** edit only the
   `fromApi*` functions in `src/lib/content/http/index.ts`, or copy that folder into a new
   adapter and register it in `SOURCES` in `src/lib/content/index.ts`.
3. Post bodies can be Markdown or HTML (`body.format`). Headings get ids and feed the
   table of contents either way.
4. Newsletter: set `PUBLIC_SIGNUP_URL` to any endpoint that accepts `POST { email }`.
5. Search: `src/pages/search-index.json.ts` builds a small index; swap it for a search API
   that returns the same shape when the archive grows.

If the backend sends a record that does not match the schema, the build fails and names the
record and field, so broken data never reaches the live site.

## SEO built in

- Static HTML for every URL (no empty SPA shell), one `h1` per page, semantic landmarks.
- Per-page title (brand dropped when it would push past ~60 chars), description, canonical,
  robots, Open Graph and Twitter cards, `article:*` dates and tags.
- JSON-LD graph: Organization, WebSite with SearchAction, BlogPosting / NewsArticle,
  Review with the site's own score (never a fake aggregate rating), VideoGame, VideoObject,
  FAQPage, BreadcrumbList, CollectionPage, ItemList, ProfilePage / Person.
- Content features that help ranking: "In short" answer box, table of contents with jump
  links, FAQ in crawlable HTML, visible updated date and "tested on" patch, author box and
  author pages (E-E-A-T), editorial policy page, game hub pages for topical authority,
  related posts for internal linking.
- `sitemap.xml` with real `lastmod` and image entries, `robots.txt`, full-text RSS,
  web manifest. Thin tag pages and search are `noindex, follow`.
- Speed: zero framework JS, small inline scripts only for theme, menu, copy link, search and
  sign-up. Cover image preloaded with `fetchpriority=high`, everything else lazy with fixed
  sizes (no layout shift). YouTube loads only on click. Fonts are self-hosted.

## Writing posts that rank

- One search question per post; answer it in the first paragraph and in `keyPoints`.
- Aim for 1,000+ useful words on guides (the mock posts are short samples).
- Use `seoTitle` when the headline is longer than about 60 characters.
- Fill `patch` and update `updatedAt` when a game patch changes the advice.
- Add 2-4 real `faq` items taken from comments and search suggestions.
- Link every post to its game(s) so it appears on the game hub.

## Before going live

- Set `SITE_URL`, and replace the social links and channel URL in /admin > Site settings.
- Replace the sample authors and posts with real ones (in /admin, or the files in `content/`).
- Set `ADMIN_PASSWORD` (and `BLOG_MCP_KEY` if you want remote MCP) on the server.
- Paste the Google Search Console HTML-tag code in /admin > Site settings, submit
  `sitemap.xml`, then import the property into Bing Webmaster Tools.
