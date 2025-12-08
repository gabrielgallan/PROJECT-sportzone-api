import Stripe from "stripe"
import env from "../env/config.ts"

const stripe = new Stripe(env.STRIPE_SECRET_API_KEY)

export default stripe