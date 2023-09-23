import { NextApiHandler } from 'next'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import { PrismaClient } from '@prisma/client'
import { loadStripe } from '@stripe/stripe-js';
import Stripe from 'stripe'
import { v4 as uuidv4 } from 'uuid';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // https://github.com/stripe/stripe-node#configuration
    apiVersion: '2022-11-15',
})


export type CheckoutArgs = {
    okUrl: string,
    errorUrl:string,
    price_id:string,
}





const ProtectedRoute: NextApiHandler = async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send({ message: 'Only POST requests allowed' })
        return
    }


    const requestData:CheckoutArgs = req.body as CheckoutArgs;

    if (!requestData.okUrl || !requestData.errorUrl || !requestData.price_id) {
        res.status(500).send({ message: 'Required fields missing' })
        return
    }


    const supabase = createPagesServerClient({ req, res })
    const {
        data: { session },
    } = await supabase.auth.getSession()

    if (!session)
    {
        return res.status(401).json({
            error: 'not_authenticated',
            description: 'The user does not have an active session or is not authenticated',
        })
    }

    const prisma = new PrismaClient()

    const {data: { user },} = await supabase.auth.getUser()
    if (!user){
        return res.status(401).json({
            error: 'not_authenticated',
            description: 'The user does not have an active session or is not authenticated',
        })
    }

    let userId:string = ''

    let profileData = await prisma.user.findFirst({
        where: {
            uid: user.id
        }
    })

    if (!profileData) {
        return res.status(401).json({
            error: 'not_authenticated',
            description: 'The user does not have an active session or is not authenticated',
        })
    }

    if (!profileData.stripe_id){
        // create stripe customer
        const customers = await stripe.customers.list({
            email: user.email,
        });

        console.log('Stripe user created')

        let customer = undefined;

        let meta = {
            userId: user.id,
        }

        if (profileData.ref_id){
            //@ts-ignore
            //meta.referral = '7eac3d14-f51d-449b-a73a-7759e328e1ef'
        }

        if (customers.data.length > 0) {
            customer = customers.data[0]
        } else {
            customer = await stripe.customers.create({
                name: user.user_metadata.full_name,
                email: user.email,
                metadata: meta,
            });
        }

        profileData = await prisma.user.update({data: {stripe_id: customer.id}, where: {uid: user.id}})
    }

    userId  = user.id;

    //=========== actual logic ===========

    let checkoutData:any = {
        line_items: [
            {
              price: requestData.price_id,
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: requestData.okUrl,
          cancel_url: requestData.errorUrl,
          customer: profileData.stripe_id,
          metadata: {
            id: userId
          },
          client_reference_id: (profileData.ref_id??uuidv4())
    }

    if (requestData.price_id === process.env.NEXT_PUBLIC_PRODUCT_TIER_1 || requestData.price_id === process.env.NEXT_PUBLIC_PRODUCT_TIER_5){
        checkoutData['subscription_data'] = {
            trial_period_days: 7
         }
    }

    const checkoutSession = await stripe.checkout.sessions.create(checkoutData);


    if (!checkoutSession || !checkoutSession.url){
        console.error('Failed to create checkout session')
        console.error(checkoutSession)
        return res.status(500)
    }

    return res.status(200).json(checkoutSession)
}

export default ProtectedRoute