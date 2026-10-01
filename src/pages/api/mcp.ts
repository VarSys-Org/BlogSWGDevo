// Remote MCP endpoint (Streamable HTTP, stateless JSON). Off until
// BLOG_MCP_KEY is set; every request must send `Authorization: Bearer <key>`.
import type { APIRoute } from 'astro';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { mcpKeyIsValid, sendJson } from '../../lib/admin/auth';
import { makeBlogMcp } from '../../lib/mcp/server.ts';

export const prerender = false;

const handle: APIRoute = async ({ request }) => {
	if (!mcpKeyIsValid(request.headers.get('authorization'))) {
		return sendJson({ error: 'Missing or wrong MCP key (set BLOG_MCP_KEY on the server and send it as a Bearer token).' }, 401);
	}
	const server = makeBlogMcp({ allowLocalFiles: false });
	const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
	await server.connect(transport);
	try {
		return await transport.handleRequest(request);
	} finally {
		void server.close();
	}
};

export const POST = handle;
export const GET = handle;
export const DELETE = handle;
