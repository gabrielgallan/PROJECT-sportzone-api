export class BadGatewayError extends Error {
	constructor(message?: string) {
		super(message ?? 'Bad gateway error');
	}
}
