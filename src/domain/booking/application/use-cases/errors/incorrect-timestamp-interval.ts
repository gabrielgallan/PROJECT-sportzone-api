export class IncorrectTimestampInterval extends Error {
    constructor() {
        super('Incorrect timestamp interval, start date must be before end date!')
    }
}