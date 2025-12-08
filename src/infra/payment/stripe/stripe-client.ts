import env from "@/infra/env/config"
import Stripe from "stripe"

export function makeStripeClient() {
  // Ambiente de teste → NÃO criar Stripe real
  if (env.NODE_ENV === "test") {
    return {
      checkout: {
        sessions: {
          create: () => {
            return null
          },
        },
      },
      webhooks: {
        constructEvent: () => {
            return null
        },
      },
    } as any
  }

  // Ambiente normal → criar Stripe real
  return new Stripe(env.STRIPE_SECRET_API_KEY)
}
