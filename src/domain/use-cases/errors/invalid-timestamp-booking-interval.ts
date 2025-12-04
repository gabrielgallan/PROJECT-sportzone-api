export class InvalidTimestampBookingInterval extends Error {
    constructor() {
        super('Invalid timestamp interval, a booking must be made at least 2 hours in advance and with a limit of 6 hours.')
    }
}