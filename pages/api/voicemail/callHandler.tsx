import { NextApiHandler } from 'next'
import { PrismaClient } from '@prisma/client'
import { validateRequest, twiml } from 'twilio';


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;


const ProtectedRoute: NextApiHandler = async (req, res) => {
    const userId = req.query.userId as string;
    const code = req.query.code as string;

    if (!userId || !code || code !== process.env.WEBHOOK_SECRET_CUSTOM){
        return res.status(401).end()
    }

    const prisma = new PrismaClient()

    console.log('Incoming voicemail webhook')

    console.log(req.body)

   
    const status = req.body['CallStatus']
    // if (status !== 'ringing') {
    //     return res.status(200).end()
    // }

    const caller = req.body['From']
    const targetNumber = req.body['To']


    const rr = new twiml.VoiceResponse();
    res.setHeader('Content-Type', 'text/xml');

    
    const user = await prisma.user.findFirst({
        where: {
            twilio_number: targetNumber
        }
    })


    // hang up if no sub or no business number
    if (!user || !user.sub_id || !user.business_number?.trim()) {
        console.log('Skipping call, no sub etc')
        rr.hangup()
        res.send(rr.toString());
        return
    }

    let actionUrl = process.env.TWILIO_FORWARD_CALL_HANDLER;
    let timeout = 12;

    // const dial = rr.dial({ action: actionUrl, timeout });

    rr.play(`https://tradesmenaiportal.com/api/voicemail/downloadByCode?userId=${user.uid}&code=${process.env.WEBHOOK_SECRET_CUSTOM}`);

    res.send(rr.toString());
    return
}

export default ProtectedRoute