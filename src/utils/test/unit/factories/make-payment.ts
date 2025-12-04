import type { Booking, User } from "@prisma/client";
import type { PaymentsRepository } from "@/domain/repositories/payments-repository.ts";

export async function makePayment(
    repository: PaymentsRepository,
    isValidated: boolean, 
    booking?: Booking, 
    user?: User
) {
    const payment = repository.create({
        amount: booking?.price ?? 50,
        user_email: user?.email ?? 'gabriel@example.com',
        booking_id: booking?.id ?? 'booking-01',
        external_id: isValidated ? 'externalId-01' : null
    })

    return payment
}