import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

export interface CourtUnavailabilityProps {
    courtId: UniqueEntityID
    startDate: Date
    endDate: Date
    reason?: string | null
    createdAt: Date
    updatedAt?: Date | null
}

export class CourtUnavailability extends Entity<CourtUnavailabilityProps> {
    static create(
        props: Optional<CourtUnavailabilityProps, 'createdAt'>,
        id?: UniqueEntityID,
    ) {
        const courtUnavailability = new CourtUnavailability(
            {
                ...props,
                reason: props.reason ?? null,
                createdAt: props.createdAt ?? new Date(),
                updatedAt: props.updatedAt ?? null,
            },
            id,
        )

        return courtUnavailability
    }

    // => Getters
    get courtId() {
        return this.props.courtId
    }

    get startDate() {
        return this.props.startDate
    }

    get endDate() {
        return this.props.endDate
    }

    get reason() {
        return this.props.reason
    }

    get createdAt() {
        return this.props.createdAt
    }

    get updatedAt() {
        return this.props.updatedAt
    }

    // => Setters
    set reason(reason: string | null | undefined) {
        this.props.reason = reason

        this.touch()
    }

    // => Methods
    private touch() {
        this.props.updatedAt = new Date()
    }
}