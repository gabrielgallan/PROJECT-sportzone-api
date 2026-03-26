export class LateBookingConfirmation extends Error {
    constructor() {
        super('The booking must be confirmed within 20 minutes!')
    }
}