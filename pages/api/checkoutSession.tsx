import { NextApiHandler } from 'next'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { PrismaClient } from '@prisma/client'
import { loadStripe } from '@stripe/stripe-js';
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // https://github.com/stripe/stripe-node#configuration
    apiVersion: '2022-11-15',
})
  
export type CheckoutArgs = {
    okUrl: string,
    errorUrl:string
}

const ProtectedRoute: NextApiHandler = async (req, res) => {
    // Generic checks
    if (req.method !== 'POST') {
        res.status(405).send({ message: 'Only POST requests allowed' })
        return
    }

    const requestData:CheckoutArgs = req.body as CheckoutArgs;

    if (!requestData.okUrl || !requestData.errorUrl) {
        res.status(500).send({ message: 'Required fields missing' })
        return
    }

    const supabase = createServerSupabaseClient({ req, res })
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

    const profileData = await prisma.user.findFirst({
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

    

    userId  = user.id;

    //=========== actual logic ===========

    const customers = await stripe.customers.list({
        email: user.email
    });

    let customer = undefined;

    if (customers.data.length > 0) {
        customer = customers.data[0]
    } else {
        customer = await stripe.customers.create({
            name: user.user_metadata.full_name,
            email: user.email,
            metadata: {
              userId: userId,
            },
        });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
        line_items: [
            {
              price: process.env.CREDITS_PRICE_ID,
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: requestData.okUrl,
          cancel_url: requestData.errorUrl,
          customer: customer.id,
          metadata: {
            id: userId
          }
      });



    // const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
    // const customer = await stripe.customers.retrieve(session.customer);

    if (!checkoutSession || !checkoutSession.url){
        return res.status(500)
    }

    return res.status(200).json(checkoutSession)
}

export default ProtectedRoute