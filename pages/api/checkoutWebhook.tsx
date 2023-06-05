import { buffer } from 'micro'
import Cors from 'micro-cors'
import Stripe from 'stripe'
import { PrismaClient } from '@prisma/client'
import { NextApiHandler } from 'next'
import { assert } from 'console'
import { Config } from '../../state/appContext'
import { Twilio } from "twilio";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // https://github.com/stripe/stripe-node#configuration
    apiVersion: '2022-11-15',
})


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

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
        console.log('received event: ' + event.type)
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        if (err! instanceof Error) console.log(err)
        console.log(`❌ Error message: ${errorMessage}`)
        res.status(400).send(`Webhook Error: ${errorMessage}`)
        return
    }

    const prisma = new PrismaClient()


    if (event.type === 'customer.subscription.created' 
        || event.type === 'customer.subscription.updated' 
        || event.type === 'customer.subscription.deleted')
    {
        const subscription = event.data.object as Stripe.Subscription;
        let stripeId:string|null = null

        if (typeof subscription.customer === 'string') {
            stripeId = subscription.customer
        }

        if (typeof subscription.customer === 'object') {
            stripeId = (subscription.customer as Stripe.Customer).id
        }

        if (stripeId === null){
            console.error('Customer is NULL')
            return res.status(500).send(`Customer is NULL`)
        }

        if (event.type === 'customer.subscription.deleted') {
            const subMeta = await prisma.subscriptionMeta.findFirst({
                where: {
                    subscription_id: subscription.id
                }
            })

            await prisma.user.update({
                where: {
                    stripe_id: subMeta?.stripe_id
                }, data: {
                    subscription_status: '',
                    messages_per_month: 0,
                    sub_id: null
                }
            })
        } else {
            const itemId = subscription.items.data[0].price.id

            const userProfile = await prisma.user.findUnique({where: {
                stripe_id: stripeId
            }}) 

            if (!userProfile){
                console.error(`Failed to find user profile for stripe id [${stripeId}]`)
                return res.status(200).json({})
            }

            await prisma.subscriptionMeta.create({data: {
                user_id: userProfile!.uid,
                stripe_id: stripeId,
                subscription_id: subscription.id,
                price_id: itemId
            }})

            let twilio_number = userProfile.twilio_number

            if (!twilio_number){
                const client = new Twilio(accountSid, authToken);
                const availableNumbers = await client.availablePhoneNumbers('GB').local.list({ smsEnabled: true })
            
                let userNumber = ''
            
                for(let i = 0; i < availableNumbers.length; ++i){
                    let n = availableNumbers[i]
                    userNumber = n.phoneNumber

                    console.log(`Regsitering NEW number: [${userNumber}] for user [${userProfile.email}]`)

                    try{
                        await client.incomingPhoneNumbers.create({
                            phoneNumber: userNumber,
                            addressSid: process.env.TWILIO_ADDRESS_ID,
                            voiceUrl: process.env.TWILIO_CALL_FORWARDER_URL,
                            smsUrl: process.env.TWILIO_SMS_WEBHOOK_URL
                        })

                        twilio_number = userNumber

                        break
                    } catch(e){
                        console.error(`Failed to register a number: [${userNumber}] for user [${userProfile.email}]`)
                        console.error(e)
                    }
                }
            }

            for(let i = 0; i < Config.plans.length; ++i){
                if (itemId === Config.plans[i].price_id){
                    await prisma.user.update({
                        where: {
                            stripe_id: stripeId
                        }, data: {
                            subscription_status: itemId,
                            messages_per_month: Config.plans[i].replies,
                            sub_id: subscription.id,
                            twilio_number: twilio_number
                        }
                    })
                }
            }  
        }
    }

    
    // if (event.type === 'checkout.session.completed') {
    //     const session = event.data.object as Stripe.Checkout.Session;

    //     const exists = await prisma.payment.findFirst({
    //         where: {
    //             session_id: session.id
    //         }
    //     })

    //     if (exists) {
    //         return res.status(200).send({ message: 'Payment already exists' })
    //     }

    //     const customers = await stripe.customers.list({
    //         email: session.customer_details!.email!
    //     });

    //     const customer = customers.data[0]

    //     // Retrieve the session. If you require line items in the response, you may include them by expanding line_items.
    //     const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
    //       session.id,
    //       {
    //         expand: ['line_items'],
    //       }
    //     );
    //     const lineItems = sessionWithLineItems.line_items;

    //     let price = lineItems!.data[0].price


    //     await prisma.payment.create({
    //         data: {
    //             user_id: session.metadata!.id,
    //             details: JSON.stringify({
    //                 id: session.id,
    //                 liveMode: session.livemode,
    //                 status: session.status,
    //                 paymentStatus: session.payment_status,
    //                 metadata: session.metadata
    //             }),
    //             session_id: session.id,
    //             product_id: price!.id
    //         }
    //     })

       
    // }

    return res.status(200).json({})
}

export default WebhookRoute