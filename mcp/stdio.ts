// Local MCP server over stdio. Run with `npm run mcp` (Node 22.18+ runs the
// TypeScript directly). Register it in your agent, e.g. for Claude Code:
//   claude mcp add swg-blog -- node "<repo>/mcp/stdio.ts"
// Logs go to stderr; stdout carries the MCP protocol only.

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Point the store at this repo no matter where the agent starts the process.
process.env.BLOG_ROOT ??= join(dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(process.env.BLOG_ROOT);

const { makeBlogMcp } = await import('../src/lib/mcp/server.ts');
const server = makeBlogMcp({ allowLocalFiles: true });
await server.connect(new StdioServerTransport());
console.error(`[swg-blog mcp] ready, content at ${process.env.BLOG_ROOT}`);
