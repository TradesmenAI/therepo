import { NextApiHandler } from 'next'
import { PrismaClient } from '@prisma/client'
import { validateRequest, twiml, Twilio } from 'twilio';
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from 'openai'
import { dateDiffInDays } from './callStatusHandler';


function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});



const openai = new OpenAIApi(configuration);


export const sendSms = async (text: string, from: string, to: string, user_email: string, user_id: string, prisma: PrismaClient, skipLog: boolean = false) => {
    const tw = new Twilio(accountSid, authToken);

    await tw.messages.create({
        from,
        to,
        body: text,
    })

    if (!skipLog) {
        await prisma.messageLog.create({
            data: {
                from,
                to,
                user_id,
                user_email,
                direction: 'out',
                text,
                customer_number: to
            }
        })
    }
}


const ProtectedRoute: NextApiHandler = async (req, res) => {
    const prisma = new PrismaClient()

    const twilioSignature = req.headers['x-twilio-signature'];
    const url = process.env.TWILIO_SMS_WEBHOOK_URL;

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

    const to = req.body['To']
    const from = req.body['From']
    const status = req.body['SmsStatus']
    const text = req.body['Body']

    const isTestNumber = to === process.env.TEST_NUMBER

    const user = await prisma.user.findFirst({
        where: {
            twilio_number: to
        }
    })



    if (user && status === 'received') {
        const uid = req.body['SmsSid']
        const exists = await prisma.messageLog.findFirst({
            where: {
                message_uid: uid
            }
        })

        if (!user.service_enabled) {
            return res.status(200).end()
        }

        // filter out duplicates
        if (exists) {
            return res.status(200).end()
        }

        // add message to the log
        await prisma.messageLog.create({
            data: {
                from,
                to,
                text,
                user_id: user.uid,
                user_email: user.email,
                direction: 'in',
                customer_number: from,
                message_uid: uid
            }
        })


        let canProceed = true;


        // test number can have max 5 replies
        if (isTestNumber) {
            const used_ai_replies = (await prisma.messageLog.findMany({
                where: {
                    from: to,
                    // because test number has limit 5 replies per number
                    // and regular user - per account
                    to: from,
                    user_id: 'test'
                }
            })).length

            // owner has no limits on test number
            canProceed = used_ai_replies < 5 || (from as string).includes('7392298069')
        } else {
            // TODO: check date last 30 days
            const used_ai_replies = (await prisma.messageLog.findMany({
                where: {
                    from: to,
                    // user_id: user.uid
                }
            })).length

            canProceed = (used_ai_replies < user.messages_per_month)
        }

        console.log(1)

        // If user didn't hit monthly limit send him a message
        if (canProceed) {
            if (user.business_number) {
                await sendSms(`Customer: ${text}`, user.twilio_number!, user.business_number, user.email, user.uid, prisma, true)
            }

            console.log(2)
            // get message history for this conversation
            const history = await prisma.messageLog.findMany({
                where: {
                    user_email: user.email,
                    customer_number: from
                }, orderBy: [
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

            const botMessages: ChatCompletionRequestMessage[] = []

            botMessages.push({
                role: 'system',
                content: user.prompt!
            })

            history.map((msg) => {
                botMessages.push({
                    role: msg.direction === 'out' ? 'assistant' : 'user',
                    content: msg.text
                })
            })

            console.log(4)

            const response = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                temperature: 0.888,
                max_tokens: 1000,
                frequency_penalty: 0,
                presence_penalty: 0,
                top_p: 1,
                messages: botMessages
            }, { timeout: 40000 });

            console.log(response.data.choices)

            console.log(5)

            try {
                await delay(10_000)
                // @ts-ignore
                const response_text = response.data.choices[0].message.content.trim();
                if (response_text) {
                    const targetNumber = from;
                    console.log(6)
                    await sendSms(response_text, user.twilio_number!, targetNumber, user.email, user.uid, prisma)
                    console.log(7)

                    if (user.business_number) {
                        await sendSms(`AI: ${response_text}`, user.twilio_number!, user.business_number, user.email, user.uid, prisma, true)
                    }

                }
            } catch (e) {
                // @ts-ignore
                console.error(`Failed to get response from openai for chat request [${value.id}]`)


            }
        } else {
            if (!isTestNumber) {
                try {
                    const errorMsg = (await prisma.config.findFirst({
                        where: {
                            key: 'generic_error'
                        }
                    }))!.value

                    const targetNumber = from;
                    await sendSms(errorMsg, user.twilio_number!, targetNumber, user.email, user.uid, prisma, true)
                } catch (e) {
                    console.error(`Failed to send sms with error message`)
                }


                const lastUserMessageDateStr = user.bot_fail_message
                let shouldSendWarning = false

                if (lastUserMessageDateStr) {
                    var restoredDate = new Date(parseInt(lastUserMessageDateStr))
                    const daysDiff = dateDiffInDays(new Date(), restoredDate)
                    if (Math.abs(daysDiff) > 3) {
                        shouldSendWarning = true
                    }
                }

                if (shouldSendWarning) {
                    await prisma.user.update({
                        data: {
                            bot_fail_message: (new Date()).getTime().toString()
                        }, where: {
                            uid: user.uid
                        }
                    })


                    try {
                        const errorMsg = (await prisma.config.findFirst({
                            where: {
                                key: 'no_credits_warning'
                            }
                        }))!.value

                        await sendSms(errorMsg, user.twilio_number!, user.business_number!, user.email, user.uid, prisma, true)
                    } catch (e) {
                        console.error(`Failed to send sms with error message`)
                    }
                }
            }
        }

    }

    return res.status(200).end()
}

export default ProtectedRoute