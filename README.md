# SWG Devo Blog

Gaming blog for the SWG Devo channel: guides, best settings, reviews, hardware and esports.
Built with Astro as a fully static site (every page is real HTML at build time), with a
content layer that lets any backend plug in later. It currently runs on mock data.

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run build` | Type check, then build the static site into `dist/` |
| `npm run preview` | Serve the built site |
| `npm run mock:covers` | Rebuild mock cover art, share image and icons in `public/images/` |

Copy `.env.example` to `.env` and set `SITE_URL` before a production build. Canonical URLs,
Open Graph tags, the sitemap, RSS and robots.txt are all built from it.

## How content flows

```
backend (mock | http | your adapter)
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

- Set `SITE_URL`, and replace the social links and channel URL in `src/config/site.ts`.
- Replace mock authors and posts with real ones (mock data lives in `src/lib/content/mock/`).
- Add the Google Search Console HTML tag to `src/components/SeoHead.astro`, submit
  `sitemap.xml`, then import the property into Bing Webmaster Tools.
