import type { Stripe } from "stripe";
import { checkoutFaileddHandler } from "./handlers/checkout.failed";
import { checkoutCompletedHandler } from "./handlers/checkout.completed";

export async function dispatchStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      return checkoutCompletedHandler(event)

    case "checkout.session.async_payment_failed":
    case "checkout.session.expired":
      return checkoutFaileddHandler(event)

    default:
      return;
  }
}