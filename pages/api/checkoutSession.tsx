import { NextApiHandler } from 'next'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import { PrismaClient } from '@prisma/client'
import { loadStripe } from '@stripe/stripe-js';
import Stripe from 'stripe'

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

    const checkoutSession = await stripe.checkout.sessions.create({
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
          }
    });


    if (!checkoutSession || !checkoutSession.url){
        console.error('Failed to create checkout session')
        console.error(checkoutSession)
        return res.status(500)
    }

    return res.status(200).json(checkoutSession)
}

export default ProtectedRoute