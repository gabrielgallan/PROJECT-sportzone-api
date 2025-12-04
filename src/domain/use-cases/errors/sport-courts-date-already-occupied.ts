export class SportCourtDateAlreadyOccupied extends Error {
    constructor() {
        super('Booking datetime for this sport court is already occupied!')
    }
}