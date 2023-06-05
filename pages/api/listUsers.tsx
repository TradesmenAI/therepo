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

    if (!profileData?.is_admin){
        return res.status(405).json({
            error: 'not_allowed',
            description: 'Not allwoed',
        })
    }

    const businesses = await prisma.businessType.findMany()
    
    let users = await prisma.user.findMany();
    let result:UserData[] = []
    users.map(user=>{
        let businessType:string|null = ''

        if (user.business_id){
            const bs = businesses.find(x=>x.id === user.business_id);
            if (bs) {
                if (bs.id !== 29) {
                    businessType = bs.name
                } else {
                    businessType = user.business_type
                }
            } 
        }

        result.push({
            email: user.email,
            details: user.description,
            phone: user.business_number,
            twilio_phone: user.twilio_number,
            subscsription: user.sub_id,
            service_enabled: user.service_enabled,
            register_date: user.created_at,
            uid:user.uid,
            prompt: user.prompt,
            bot_fail_message: user.bot_fail_message,
            business_type: businessType,
            bot_intro_message: user.bot_intro_message
        })
    })

    return res.status(200).json(result)
}

export interface UserData {
    email: string,
    details: string|null,
    phone: string|null,
    twilio_phone: string|null,
    subscsription: string|null,
    service_enabled: boolean,
    register_date: Date,
    uid:string
    prompt:string|null
    bot_fail_message: string|null,
    bot_intro_message: string|null,
    business_type:string|null
}

export default ProtectedRoute