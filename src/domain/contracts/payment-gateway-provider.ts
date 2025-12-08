export interface CreatePaymentIntentRequest {
    paymentId: string
    bookingId: string
    amount: number
    currency: string
    userEmail: string
    successUrl: string
    cancelUrl: string,
    description: string
}

export interface CreatePaymentIntentResponse {
    sessionId: string
    sessionUrl: string
    raw?: any
}

export interface ConfirmPaymentRequest {
    
}

export interface ConfirmPaymentResponse {

}

export interface RefundPaymentRequest {
    paymentIntentId: string,
    amount: number
}

export interface RefundPaymentResponse {
    refundId: string,
    refundStatus: string | null
    raw?: any
}

export interface PaymentGatewayProvider {
    createPaymentIntent(params: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse>
    refundPayment(params: RefundPaymentRequest): Promise<RefundPaymentResponse>
    confirmPayment(params: ConfirmPaymentRequest): Promise<ConfirmPaymentResponse>
}