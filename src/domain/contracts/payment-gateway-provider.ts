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
}

export interface ConfirmPaymentRequest {
    
}

export interface ConfirmPaymentResponse {

}

export interface RefundPaymentRequest {
    
}

export interface RefundPaymentResponse {

}

export interface PaymentGatewayProvider {
    createPaymentIntent(params: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse>
    confirmPayment(params: ConfirmPaymentRequest): Promise<ConfirmPaymentResponse>
    refundPayment(params: RefundPaymentRequest): Promise<RefundPaymentResponse>
}