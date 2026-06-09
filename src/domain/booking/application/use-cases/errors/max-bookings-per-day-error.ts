export class MaxBookingsPerDayError extends Error {
    constructor() {
        super('Max bookings per user limit exceeded!')
    }
}