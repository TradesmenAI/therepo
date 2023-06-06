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

    const to = req.body['To']
    const from = req.body['From']
    const status = req.body['SmsStatus']
    const text = req.body['Body']

    const user = await prisma.user.findFirst({where: {
        twilio_number: to
    }})

    if (user && status === 'received'){
        await prisma.messageLog.create({data: {
            from,
            to,
            text,
            user_id: user.uid,
            user_email: user.email,
            direction: 'in',
            customer_number: from
        }})

        const history = await prisma.messageLog.findMany({
            where: {
                user_email: user.email,
                customer_number: from
            }
        })

        if (user.twilio_number){
             // TODO: check date last 30 days
            const used_messages = (await prisma.messageLog.findMany({
                where: {
                    from: user.twilio_number
                }
            })).length

            if (used_messages < user.messages_per_month){
                await prisma.chatRequest.create({data:{
                    messages: JSON.stringify(history),
                    target_number: from,
                    user_email: user.email
                }})
        
                console.log('Chat request created')
            }
        }

    }

    return res.status(200).end()
}

export default ProtectedRoute