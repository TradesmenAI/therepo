import { NextApiHandler } from 'next'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import { PrismaClient } from '@prisma/client'
import {validateRequest, twiml} from 'twilio';


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

    if (!isValidRequest){
        console.error('Not valid request signature')
        return res.status(400).end()
    }

    const status = req.body['CallStatus']
    if (status !== 'ringing'){
        return res.status(200).end()
    }

    const caller = req.body['From']
    const targetNumber = req.body['To']

    const user = await prisma.user.findFirst({where: {
        twilio_number: targetNumber
    }})

    const rr = new twiml.VoiceResponse();
    res.setHeader('Content-Type', 'text/xml');

    // hang up if no sub or no business number
    if (!user || !user.sub_id || !user.business_number?.trim()){
        
        rr.hangup()
        res.send(rr.toString());
        return
    }

    //forward call
    const forwardingNumber = user.business_number!;
    rr.dial(forwardingNumber);
    
    res.send(rr.toString());
    return
}

export default ProtectedRoute