export class LateBookingCancellation extends Error {
    constructor() {
        super('The booking can only be cancelled with at least 2 hours notice.')
    }
}