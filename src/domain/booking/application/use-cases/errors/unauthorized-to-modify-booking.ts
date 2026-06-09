export class UnauthorizedToModifyBooking extends Error {
    constructor() {
        super('This user is unauthorized to modify this booking!')
    }
}