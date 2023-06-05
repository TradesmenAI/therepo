import { NextApiHandler } from 'next'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import { PrismaClient } from '@prisma/client'
import {validateRequest, twiml, Twilio} from 'twilio';


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;


const ProtectedRoute: NextApiHandler = async (req, res) => {
    const prisma = new PrismaClient()

    const twilioSignature = req.headers['x-twilio-signature'];
    const url = process.env.TWILIO_FORWARD_CALL_HANDLER

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


    try {
        // console.log('Incoming handler webhook')
        // console.log(req.body)
        
        const status = req.body['DialCallStatus']  // 'completed' or 'no-answer'
        const from = req.body['From']
        const to = req.body['To']
        const direction = req.body['Direction'] // must be 'inbound'
        const subcall_id = req.body['DialCallSid']
    
        if (direction === 'inbound') {
            const user = await prisma.user.findFirst({
                where: {
                    twilio_number: to
                }
            })

            await prisma.callLog.create({data:{
                from, 
                to, 
                status, 
                subcall_id,
                user_id: user?user.email:null
            }})

            // TODO: check if user has messages left
            if (status === 'no-answer' && user && user.twilio_number && user.sub_id && user.bot_intro_message){
                const tw = new Twilio(accountSid, authToken);

                try {
                    await tw.messages.create({
                        from: user.twilio_number,
                        to: from,
                        body: user.bot_intro_message,
                    })

                    await prisma.messageLog.create({data: {
                        from: user.twilio_number,
                        to: from,
                        user_id: user.uid,
                        user_email: user.email,
                        direction: 'out',
                        text: user.bot_intro_message
                    }})
                } catch(e){
                    console.error('Error sending sms')
                    console.error(e)
                }
            }
        }
    
    } catch(e){
        console.error(e)
    }



    // const tw = new Twilio(accountSid, authToken);
    // const call = await tw.calls(req.body['DialCallSid']).fetch()

    // console.log(JSON.stringify(call))


    return res.status(200).end()
}

export default ProtectedRoute