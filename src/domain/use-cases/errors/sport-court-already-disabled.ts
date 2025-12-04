export class SportCourtAlreadyDisabled extends Error {
    constructor() {
        super('This sport court its already disabled!')
    }
}