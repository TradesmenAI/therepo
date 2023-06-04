import { NextApiHandler } from 'next'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import { PrismaClient } from '@prisma/client'
import {validateRequest} from 'twilio';


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;


const ProtectedRoute: NextApiHandler = async (req, res) => {
    const prisma = new PrismaClient()

    const twilioSignature = req.headers['x-twilio-signature'];
    const url = 'https://upwork-callback-bot.vercel.app/api/forwarder'

    const isValidRequest = validateRequest(
        authToken!,
        //@ts-ignore
        twilioSignature,
        url,
        req.body
    );

    console.log('valid?')
    console.log(isValidRequest)
    
    
    return res.status(200).end()
}

export default ProtectedRoute