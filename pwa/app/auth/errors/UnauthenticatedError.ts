export class UnauthenticatedError extends Error {
	constructor(public readonly response: Response) {
		super("Not authenticated");
	}
}
