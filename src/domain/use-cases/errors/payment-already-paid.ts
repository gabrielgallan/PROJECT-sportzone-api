export class PaymentAlreadyPaid extends Error {
    constructor() {
        super('Payment already paid!')
    }
}