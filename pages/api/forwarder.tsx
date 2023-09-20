import { NextApiHandler } from 'next'
import { PrismaClient } from '@prisma/client'
import { validateRequest, twiml } from 'twilio';
import { profile, time } from 'console';


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;


const ProtectedRoute: NextApiHandler = async (req, res) => {
    const prisma = new PrismaClient()

    console.log('Incoming fordwarder webhook')



    const twilioSignature = req.headers['x-twilio-signature'];
    const url = process.env.TWILIO_CALL_FORWARDER_URL;

    const isValidRequest = validateRequest(
        authToken!,
        //@ts-ignore
        twilioSignature,
        url,
        req.body
    );

    if (!isValidRequest) {
        console.error('Not valid request signature')
        return res.status(400).end()
    }

    const status = req.body['CallStatus']
    if (status !== 'ringing') {
        return res.status(200).end()
    }

    const caller = req.body['From']
    const targetNumber = req.body['To']

    console.log(req.body)



    const rr = new twiml.VoiceResponse();
    res.setHeader('Content-Type', 'text/xml');

    if (targetNumber === process.env.TEST_NUMBER) {
        console.log('Test call')
        rr.hangup()
        res.send(rr.toString());
        return
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

    let actionUrl = process.env.TWILIO_FORWARD_CALL_HANDLER;
    let timeout = 12;


    const voicemail = await prisma.voicemail.findUnique({ where: { user_id: user.uid } })
    const useVoicemail = voicemail && user.voicemail_enabled;
    
    if (useVoicemail) {
        console.log('Forwargind to voicemail...')
        actionUrl = process.env.TWILIO_VOICEMAIL_FORWARD_CALL_HANDLER + `?userId=${user.uid}&code=${process.env.WEBHOOK_SECRET_CUSTOM}`;
        timeout = 15
    }

    //forward call
    const forwardingNumber = user.business_number!;
    const dial = rr.dial({ action: actionUrl, timeout });

    if (!useVoicemail) {
        dial.number({
            machineDetection: 'Enable',
            // amdStatusCallback: 'https://upwork-callback-bot.vercel.app/api/amd'
            amdStatusCallback: 'https://tradesmenaiportal.com/api/amd'
        }, forwardingNumber)
    }
    // console.log(rr.toString())

    res.send(rr.toString());
    return
}

export default ProtectedRoute