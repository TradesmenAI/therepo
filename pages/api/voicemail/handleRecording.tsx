import { NextApiHandler } from 'next'
import { PrismaClient } from '@prisma/client'
import { validateRequest, twiml } from 'twilio';
import { profile, time } from 'console';


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;


const ProtectedRoute: NextApiHandler = async (req, res) => {
    const prisma = new PrismaClient()

    console.log('Incoming vicemail record webhook')


    const twilioSignature = req.headers['x-twilio-signature'];
    const url = process.env.TWILIO_CALL_FORWARDER_URL;

    console.log(req.body)



    const rr = new twiml.VoiceResponse();
    res.setHeader('Content-Type', 'text/xml');


    return res.status(200)
}

export default ProtectedRoute