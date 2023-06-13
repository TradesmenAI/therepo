import { NextApiHandler } from 'next'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import { PrismaClient } from '@prisma/client'
import { loadStripe } from '@stripe/stripe-js';
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // https://github.com/stripe/stripe-node#configuration
    apiVersion: '2022-11-15',
})

const ProtectedRoute: NextApiHandler = async (req, res) => {
    // Generic checks
    if (req.method !== 'POST') {
        res.status(405).send({ message: 'Only POST requests allowed' })
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

    const billingSession = await stripe.billingPortal.sessions.create({
        customer: profileData.stripe_id,
        return_url: process.env.BILLING_URL,
    });


    if (!billingSession || !billingSession.url){
        return res.status(500)
    }

    return res.status(200).json({portal_url: billingSession.url})
}

export default ProtectedRoute



// const stripe = require('stripe')('sk_test_51N3ingHNdYkf8k35tGNo0bV0TnCSYos6ZtJKW7WCkJa2JRQ4YO5VDkAlWAu8ejDcgeAHxC2dLBFx23aZuFaLpb18002ntBNcK3');

// app.post('/create-customer-portal-session', async (req, res) => {
//   // Authenticate your user.
//   const session = await stripe.billingPortal.sessions.create({
//     customer: '{{CUSTOMER_ID}}',
//     return_url: 'https://example.com/account',
//   });

//   res.redirect(session.url);
// });