import { NextApiHandler } from 'next'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid';
import Stripe from 'stripe'




const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // https://github.com/stripe/stripe-node#configuration
    apiVersion: '2022-11-15',
})

const ProtectedRoute: NextApiHandler = async (req, res) => {
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

    let profileData = await prisma.user.findFirst({
        where: {
            uid: user.id
        }
    })

    if (!profileData){
        console.log('Creating new user')
        // create stripe customer
        const customers = await stripe.customers.list({
            email: user.email,
        });
        console.log('Stripe user created')

    
        let customer = undefined;
    
        if (customers.data.length > 0) {
            customer = customers.data[0]
        } else {
            customer = await stripe.customers.create({
                name: user.user_metadata.full_name,
                email: user.email,
                metadata: {
                  userId: user.id,
                },
            });
        }

        console.log('Creating profile')


        // new user, create data
        profileData = await prisma.user.create({data: {
            uid: user.id,
            stripe_id: customer.id,
            email: user.email!
        }})
    }

    let used_messages = 0

    

    if (profileData.twilio_number){
        used_messages = (await prisma.messageLog.findMany({
            where: {
                from: profileData.twilio_number
            }
        })).length
    }

    const result = {
        subscription_status: profileData.subscription_status,
        total_messages: profileData.messages_per_month,
        twilio_number: profileData.twilio_number,
        business_number: profileData.business_number,
        service_enabled: profileData.service_enabled,
        messages_left: profileData.messages_per_month - used_messages,
        is_admin: profileData.is_admin,
        business_type: profileData.business_type,
        bot_intro_message: profileData.bot_intro_message
    }


    return res.status(200).json(result)
}

export default ProtectedRoute