import { NextApiHandler } from 'next'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import { PrismaClient } from '@prisma/client'
import {validateRequest, twiml, Twilio} from 'twilio';


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;


const ProtectedRoute: NextApiHandler = async (req, res) => {
    const prisma = new PrismaClient()

    console.log('Incoming handler webhook')
    console.log(req.body)

    const twilioSignature = req.headers['x-twilio-signature'];
    const url = 'https://upwork-callback-bot.vercel.app/api/callStatusHandler'

    const isValidRequest = validateRequest(
        authToken!,
        //@ts-ignore
        twilioSignature,
        url,
        req.body
    );

    if (!isValidRequest){
        console.error('Not valid request signature')
        return res.status(400).end()
    }

    const tw = new Twilio(accountSid, authToken);
    const call = await tw.calls(req.body['DialCallSid']).fetch()
    
    console.log(call)
    console.log(JSON.stringify(call))




    
    return res.status(200)
}

export default ProtectedRoute