import { NextApiHandler } from 'next'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import { PrismaClient } from '@prisma/client'
import {validateRequest, twiml, Twilio} from 'twilio';


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;


const ProtectedRoute: NextApiHandler = async (req, res) => {
    const prisma = new PrismaClient()

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


    try {
        console.log('Incoming handler webhook')
        console.log(req.body)
        
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
                user_id: user?user.uid:null
            }})
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