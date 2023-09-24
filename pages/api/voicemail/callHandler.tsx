import { NextApiHandler } from 'next'
import { PrismaClient } from '@prisma/client'
import { validateRequest, twiml } from 'twilio';
import { HandleCall, Send } from '../callStatusHandler';


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// this can be called also if the call is already completed (e.g. timeout is 15 seconds and user hangs up after 3 or voicemail kicks in)
const ProtectedRoute: NextApiHandler = async (req, res) => {
    const userId = req.query.userId as string;
    const code = req.query.code as string;

    if (!userId || !code || code !== process.env.WEBHOOK_SECRET_CUSTOM){
        return res.status(401).end()
    }

    const prisma = new PrismaClient()

    console.log('Incoming voicemail webhook')

    console.log(req.body)

    const rr = new twiml.VoiceResponse();
    res.setHeader('Content-Type', 'text/xml');
    

    const caller = req.body['From']
    const status = req.body['CallStatus']
    const targetNumber = req.body['To']

    if (status !== 'in-progress'){
        await HandleCall(req, res, false)

        return Send(res, 200);
    }

    
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

    const gt = rr.gather({action: process.env.TWILIO_FORWARD_CALL_HANDLER, actionOnEmptyResult: true, timeout: 3})
    gt.play(`https://tradesmenaiportal.com/api/voicemail/downloadByCode?userId=${user.uid}&code=${process.env.WEBHOOK_SECRET_CUSTOM}`)
    const conf = {
        action: process.env.TWILIO_VOICEMAIL_HANDLE_CALL_HANDLER,finishOnKey: '#',
        playBeep: true,
        transcribe: false,
    }   

    // rr.play(`https://tradesmenaiportal.com/api/voicemail/downloadByCode?userId=${user.uid}&code=${process.env.WEBHOOK_SECRET_CUSTOM}`);
    rr.record(conf)


    res.send(rr.toString());

    // await HandleCall(req, res, false)

    return
}

export default ProtectedRoute