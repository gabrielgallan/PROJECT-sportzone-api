export class SportCourtDateBlocked extends Error {
    constructor(reason: string | null) {
        super(`Sport Court date blocked! Reason: ${reason}`)
    }
}