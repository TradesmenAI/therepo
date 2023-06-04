import { NextApiHandler } from 'next'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid';
import Stripe from 'stripe'
import { Twilio } from "twilio";


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;


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
        // create stripe customer
        const customers = await stripe.customers.list({
            email: user.email,
        });
    
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

        // const client = new Twilio(accountSid, authToken);
        // const availableNumbers = await client.availablePhoneNumbers('GB').local.list({ smsEnabled: true })
    
        // let userNumber = ''
    
        // for(let i = 0; i < availableNumbers.length; ++i){
        //     let n = availableNumbers[i]
        //     userNumber = n.phoneNumber
        //     console.log('Regsitering nre number: ' + userNumber)

        //     try{
        //         await client.incomingPhoneNumbers.create({
        //             phoneNumber: userNumber,
        //             addressSid: process.env.TWILIO_ADDRESS_ID,
        //             voiceUrl: 'http://example.com/voice', // Replace with your voice URL
        //             smsUrl: 'http://example.com/sms' // Replace with your SMS URL
        //         })

        //         break
        //     } catch(e){
        //         console.error(e)
        //     }
        // }
    
        // new user, create data
        profileData = await prisma.user.create({data: {
            uid: user.id,
            stripe_id: customer.id,
            email: user.email!
        }})


        // create new twilio number

    }

  
   

    // const key = await prisma.apiKey.findFirst({where: {
    //     user_id: user.id
    // }})

    // const msgs = await prisma.usage.findMany({where: {
    //     api_key: key?.key,
    //     operation: 'query'
    // }})

    // const files = await prisma.file.findMany({where: {
    //     api_key: key?.key
    // }})

    // const creditsLeft = profileData.credits - files.length * 2 - msgs.length

    const used_messages = 0

    const result = {
        subscription_status: profileData.subscription_status,
        total_messages: profileData.messages_per_month,
        twilio_number: profileData.twilio_number,
        business_number: profileData.business_number,
        service_enabled: profileData.service_enabled,
        messages_left: profileData.messages_per_month - used_messages,
        is_admin: profileData.is_admin,

    }


    return res.status(200).json(result)
}

export default ProtectedRoute