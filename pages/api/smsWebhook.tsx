import { NextApiHandler } from 'next'
import { PrismaClient } from '@prisma/client'
import {validateRequest, twiml} from 'twilio';


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;


const ProtectedRoute: NextApiHandler = async (req, res) => {
    const prisma = new PrismaClient()

    console.log('Incoming sms webhook')

    console.log(req.body)

    
    const twilioSignature = req.headers['x-twilio-signature'];
    const url = process.env.TWILIO_SMS_WEBHOOK_URL;

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

    return res.status(200).end()
}

export default ProtectedRoute