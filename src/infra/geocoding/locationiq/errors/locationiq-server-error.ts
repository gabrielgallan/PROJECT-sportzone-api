export class LocationIqServerError extends Error {
    constructor(message?: string) {
        super(`Unknown request to LocationIQ API error! ${message}`)
    }
}