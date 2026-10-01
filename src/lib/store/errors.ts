// A mistake in what the caller sent (bad field, missing record). The admin
// shows it next to the form; MCP returns it so the agent can fix and retry.
export class StoreError extends Error {
	issues: string[];
	constructor(message: string, issues: string[] = []) {
		super(issues.length ? `${message}: ${issues.join('; ')}` : message);
		this.issues = issues;
	}
}
