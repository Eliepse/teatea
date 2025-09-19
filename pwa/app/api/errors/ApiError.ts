type ErrorPayload = {
	"@context": "/contexts/Error";
	"@id": string;
	"@type": "Error";
	description: string;
	detail: string;
	status: number;
	title: string;
	trace?: { file: string; line: number; function: string }[];
	type: string;
};

export class ApiError extends Error {
	public readonly error?: ErrorPayload;

	constructor(message: string, error?: ErrorPayload) {
		super(message);
		this.error = error;
	}

	static async fromResponse(response: Response) {
		const error = (await response.json()) as ErrorPayload;
		return new ApiError(error?.detail ?? error?.description ?? error?.title ?? response.statusText, error);
	}
}
