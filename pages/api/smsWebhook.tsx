import { NextApiHandler } from 'next'
import { PrismaClient } from '@prisma/client'
import {validateRequest, twiml, Twilio} from 'twilio';
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from 'openai'


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);


const sendSms = async(text:string, from:string, to:string, user_email:string, user_id:string, prisma:PrismaClient)=>{
    const tw = new Twilio(accountSid, authToken);

    await tw.messages.create({
        from,
        to,
        body: text,
    })

    await prisma.messageLog.create({data: {
        from,
        to,
        user_id,
        user_email,
        direction: 'out',
        text,
        customer_number: to
    }})
}


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
        const uid = req.body['SmsSid']
        const exists = await prisma.messageLog.findFirst({
            where: {
                message_uid: uid
            }
        })

        // filter out duplicates
        if (exists){
            return res.status(200).end()
        }

        // add message to the log
        await prisma.messageLog.create({data: {
            from,
            to,
            text,
            user_id: user.uid,
            user_email: user.email,
            direction: 'in',
            customer_number: from,
            message_uid: uid
        }})


         // TODO: check date last 30 days
        const used_messages = (await prisma.messageLog.findMany({
            where: {
                from: to
            }
        })).length

        console.log(1)

        // If user didn't hit monthly limit send him a message
        if (used_messages < user.messages_per_month){
            console.log(2)
            // get message history for this conversation
            const history = await prisma.messageLog.findMany({
                where: {
                    user_email: user.email,
                    customer_number: from
                },orderBy: [
                    {
                        id: 'asc'
                    }
                ]
            })
            console.log(3)

            // used if there is a background task
            // await prisma.chatRequest.create({data:{
            //     messages: JSON.stringify(history),
            //     target_number: from,
            //     user_email: user.email
            // }})
    
            const botMessages:ChatCompletionRequestMessage[] = []

            botMessages.push({
                role: 'system',
                content: user.prompt!
            })

            history.map((msg)=>{
                botMessages.push({
                    role: msg.direction === 'out'?'assistant':'user',
                    content: msg.text
                })
            })

            console.log(4)

            const response = await openai.createChatCompletion({
                model: "gpt-4",
                temperature: 0.888,
                max_tokens: 1000,
                frequency_penalty: 0,
                presence_penalty: 0,
                top_p: 1,
                messages: botMessages
            }, { timeout: 60000 });

            console.log(5)

            try {
                // @ts-ignore
                const response_text = response.data.choices[0].message.content.trim();
                if (response_text){
                    // @ts-ignore
                    const targetNumber = value.target_number;
                    await sendSms(response_text, user.twilio_number!, targetNumber, user.email, user.uid, prisma)
    
                    await prisma.chatRequest.update({data: {
                        responded: true
                    },
                    where: {
                        // @ts-ignore
                        id: value.id
                    }})
                }
                console.log(response_text)
            } catch(e){
                // @ts-ignore
                console.error(`Failed to get response from openai for chat request [${value.id}]`)
    
    
            }
        
        }

    }

    return res.status(200).end()
}

export default ProtectedRoute