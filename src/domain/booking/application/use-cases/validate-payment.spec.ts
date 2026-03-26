import { it, describe, expect, beforeEach } from 'vitest'
import type { PaymentsRepository } from '../../../repositories/payments-repository.ts'
import { InMemoryPaymentsRepository } from '@/infra/repositories/in-memory/in-memory-payments-repository.ts'
import { ValidatePaymentUseCase } from './validate-payment.ts'
import { PaymentAlreadyPaid } from './errors/payment-already-paid.ts'
import { makePayment } from '../../../../utils/test/unit/factories/make-payment.ts'


let paymentsRepository: PaymentsRepository
let sut: ValidatePaymentUseCase

describe('Validate payment register Use Case', () => {
    beforeEach(() => {
        paymentsRepository = new InMemoryPaymentsRepository()

        sut = new ValidatePaymentUseCase(
            paymentsRepository,
        )
    })

    it('should be able to validate payment register', async () => {
        const createdPayment = await makePayment(paymentsRepository, true)

        const { payment } = await sut.execute({
            paymentId: createdPayment.id
        })

        expect(payment.validated_at).toEqual(expect.any(Date))
    })

    it('should not be able to validate payment already paid', async () => {
        const payment = await makePayment(paymentsRepository, true)

        await sut.execute({
            paymentId: payment.id
        })

        await expect(() =>
            sut.execute({
                paymentId: payment.id
            })
        ).rejects.toBeInstanceOf(PaymentAlreadyPaid)
    })
})