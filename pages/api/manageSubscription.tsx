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

    if (!profileData || !profileData.stripe_id){
        console.error('Failed to find stripe id for user ' + user.id)
        
        return res.status(500).json({
            error: 'no_profile',
            description: 'User data not found',
        })
    }


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