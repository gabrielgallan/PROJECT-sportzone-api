export class UnauthorizedToModifySportCourts extends Error {
    constructor() {
        super('This user is unauthorized to modify this sport court!')
    }
}