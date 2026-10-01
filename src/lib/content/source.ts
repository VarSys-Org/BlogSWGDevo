// The one interface a backend has to fill. Keep it this small on purpose:
// four "give me everything" calls are enough for a static build, and all
// sorting, filtering, paging, related posts and tag pages are worked out once
// in `./index.ts`, so no backend has to re-build that logic.
//
// To add a backend:
//   1. Make a folder next to `mock/` and `http/` (e.g. `strapi/`).
//   2. Export an object that matches `ContentSource`, mapping your API's
//      fields onto the shapes in `./schema.ts`.
//   3. Add it to `SOURCES` in `./index.ts` and set CONTENT_SOURCE=<name>.

import type { AuthorInput, CategoryInput, GameInput, PostInput } from './schema';

export interface ContentSource {
	name: string;
	listPosts(): Promise<PostInput[]>;
	listAuthors(): Promise<AuthorInput[]>;
	listCategories(): Promise<CategoryInput[]>;
	listGames(): Promise<GameInput[]>;
}
