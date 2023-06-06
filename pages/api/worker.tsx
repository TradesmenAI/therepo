import { NextApiHandler } from 'next'
import { PrismaClient } from '@prisma/client'
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from 'openai'
import {validateRequest, twiml, Twilio} from 'twilio';


const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

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

const openai = new OpenAIApi(configuration);

const ProtectedRoute: NextApiHandler = async (req, res) => {
    const prisma = new PrismaClient()

    const requests = await prisma.chatRequest.findMany({
        where: {
            responded: false
        }, 
        orderBy: [
            {
                id: 'desc'
            }
        ]
    })

    const uniqueRequests:any = {}
    let duplicates:number[] = []

    requests.map((request)=>{
        if (!uniqueRequests.hasOwnProperty(request.target_number)){
            uniqueRequests[request.target_number] = request
        } else {
            duplicates.push(request.id)
        }
    })

    await prisma.chatRequest.updateMany({data: {
        responded: true
    },
    where: {
        id: {
            in: duplicates
        }
    }})

    for (const [key, value] of Object.entries(uniqueRequests)) {  
        //@ts-ignore  
        const email:string = value.user_email
        const user = await prisma.user.findFirst({where: {email}})

        if (!user){
            console.error(`No user found with email [${email}]`)
            continue
        }

        if (!user.twilio_number){
            console.error(`User with email [${email}] has no number`)
            continue
        }

        //@ts-ignore
        const messages:any[] = JSON.parse(value.messages)

        const botMessages:ChatCompletionRequestMessage[] = []

        botMessages.push({
            role: 'system',
            content: user.prompt!
        })

        messages.map((msg:any)=>{
            botMessages.push({
                role: msg.direction === 'out'?'assistant':'user',
                content: msg.text
            })
        })

        console.log(botMessages)

        const response = await openai.createChatCompletion({
            model: "gpt-4",
            temperature: 0.888,
            max_tokens: 1000,
            frequency_penalty: 0,
            presence_penalty: 0,
            top_p: 1,
            messages: botMessages
        }, { timeout: 60000 });
    
        try {
            // @ts-ignore
            const response_text = response.data.choices[0].message.content.trim();
            if (response_text){
                // @ts-ignore
                const targetNumber = value.target_number;
                await sendSms(response_text, user.twilio_number, targetNumber, user.email, user.uid, prisma)

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

        // console.log(botMessages)
    }
      

    // Object.entries(uniqueRequests).forEach(([k,v]:[k:any, v:any]) => {
    //     console.log("The key: ", k)
    //     console.log("The value: ", v)


    //     const messages = JSON.parse(v.messages)
    //     console.log(messages)
    // })

    
    return res.status(200).end()
}

export default ProtectedRoute