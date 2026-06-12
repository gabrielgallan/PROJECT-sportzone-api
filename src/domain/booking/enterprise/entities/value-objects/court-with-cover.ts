import { ValueObject } from '@/core/entities/value-object'
import type { Image } from '../image'

interface CourtWithCoverProps {
  courtId: string
  name: string
  description: string | null
  coverImage: Image
  address: string
  pricePerHour: number
  rating: number
}

export class CourtWithCover extends ValueObject<CourtWithCoverProps> {
  get courtId() {
    return this.props.courtId
  }

  get name() {
    return this.props.name
  }

  get description() {
    return this.props.description
  }

  get address() {
    return this.props.address
  }

  get pricePerHour() {
    return this.props.pricePerHour
  }

  get rating() {
    return this.props.rating
  }

  static create(props: CourtWithCoverProps) {
    return new CourtWithCover(props)
  }
}