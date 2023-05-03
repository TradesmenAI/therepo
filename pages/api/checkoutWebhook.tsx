import { buffer } from 'micro'
import Cors from 'micro-cors'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { PrismaClient } from '@prisma/client'
import { NextApiHandler } from 'next'
import { assert } from 'console'



const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // https://github.com/stripe/stripe-node#configuration
    apiVersion: '2022-11-15',
})

export const config = {
    api: {
      bodyParser: false,
    },
}

const cors = Cors({
    allowMethods: ['POST', 'HEAD'],
})

const webhookSecret = process.env.CHECKOUT_WEBHOOK_SECRET!

const WebhookRoute: NextApiHandler = async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send({ message: 'Only POST requests allowed' })
        return
    }

    const buf = await buffer(req)
    const sig = req.headers['stripe-signature']!

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(buf.toString(), sig, webhookSecret)
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        // On error, log and return the error message.
        if (err! instanceof Error) console.log(err)
        console.log(`❌ Error message: ${errorMessage}`)
        res.status(400).send(`Webhook Error: ${errorMessage}`)
        return
    }

    const prisma = new PrismaClient()

    
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        const exists = await prisma.payments.findFirst({
            where: {
                session_id: session.id
            }
        })

        if (exists) {
            return res.status(200).send({ message: 'Payment already exists' })
        }

        await prisma.payments.create({
            data: {
                session: {
                    id: session.id,
                    liveMode: session.livemode,
                    status: session.status,
                    paymentStatus: session.payment_status,
                    metadata: session.metadata
                },
                session_id: session.id
            }
        })
        

        const customers = await stripe.customers.list({
            email: session.customer_details!.email!
        });

        const customer = customers.data[0]

        console.log(customer)


        // // Retrieve the session. If you require line items in the response, you may include them by expanding line_items.
        const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
          session.id,
          {
            expand: ['line_items'],
          }
        );
        const lineItems = sessionWithLineItems.line_items;

        let price = lineItems!.data[0].price

        if (price!.id === process.env.CREDITS_PRICE_ID){
            // give user credits
            const internalUserId = customer.metadata.userId;

            const profileData = await prisma.profile.findFirst({
                where: {
                    owner_uid: internalUserId
                }
            })

            const newCredits = profileData!.credits + 25;

            await prisma.profile.update({
                where: {
                    id: profileData!.id
                },
                data: {
                    credits: newCredits
                }
            })
        }
    }

    return res.status(200).json({})
}

export default WebhookRoute