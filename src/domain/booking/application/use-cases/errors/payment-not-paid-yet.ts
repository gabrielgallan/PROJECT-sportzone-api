export class PaymentNotPaidYet extends Error {
    constructor() {
        super('Payment not paid yet')
    }
}