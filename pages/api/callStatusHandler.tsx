import { NextApiHandler } from 'next'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import { PrismaClient } from '@prisma/client'
import { validateRequest, twiml, Twilio } from 'twilio';
import { use } from 'react';
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from 'openai'
import { sendSms } from './smsWebhook';

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});



const openai = new OpenAIApi(configuration);

export function dateDiffInDays(a: Date, b: Date) {
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

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

    if (!isValidRequest) {
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
        const tw = new Twilio(accountSid, authToken);


        let canSendSms = true;

        const lk = await tw.lookups.v2.phoneNumbers(from).fetch({ fields: 'line_type_intelligence' })
        console.log('Lookup:')
        console.log(lk.lineTypeIntelligence)



        const phoneType = lk?.lineTypeIntelligence?.type

        if (phoneType === 'landline'
            || phoneType === 'fixedVoip'
            || phoneType === 'nonFixedVoip'
            || phoneType === 'tollFree'
            || phoneType === 'voicemail'
            || phoneType === 'pager') {
                canSendSms = false;
        }

        const answeredByMachine = ((await prisma.machineCalls.findFirst({where:{callId: subcall_id}})) !== null)



        if (direction === 'inbound') {
            const user = await prisma.user.findFirst({
                where: {
                    twilio_number: to
                }
            })

            if (!user) {
                console.error(`User with number [${to}] not found`)
                return res.status(500).end()
            }


            if (to === process.env.TEST_NUMBER) {
                const used_ai_replies = (await prisma.messageLog.findMany({
                    where: {
                        from: to, // from test account 
                        // because test number has limit 5 replies per number
                        // and regular user - per account
                        to: from, // to user
                        user_id: 'test'
                    }
                })).length

                console.log('Bot answers: ' + used_ai_replies)

                // owner has no limits
                if (used_ai_replies < 5 || (from as string).includes('07392298069')) {

                    try {
                        await tw.messages.create({
                            from: user.twilio_number!,
                            to: from,
                            body: user.bot_intro_message!,
                        })

                        await prisma.messageLog.create({
                            data: {
                                from: user.twilio_number!,
                                to: from,
                                user_id: user.uid,
                                user_email: user.email,
                                direction: 'out',
                                text: user.bot_intro_message!,
                                customer_number: from
                            }
                        })
                    } catch (e) {
                        console.error('Error sending sms')
                        console.error(e)
                    }
                }

                return res.status(200).end()
            }

            if (!user.service_enabled) {
                return res.status(200).end()
            }


            await prisma.callLog.create({
                data: {
                    from,
                    to,
                    status,
                    subcall_id,
                    user_id: user ? user.email : null
                }
            })

            if (!canSendSms){
                return res.status(200).end()
            }

            // handle answering machine here
            if ((status === 'no-answer' || status === 'busy' || answeredByMachine) && user && user.twilio_number && user.sub_id && user.bot_intro_message) {
                const totalMessages = user.messages_per_month
                const usedMessages = (await prisma.messageLog.findMany({
                    where: {
                        from: user.twilio_number
                    }
                })).length

                if (usedMessages < totalMessages) {
                    // check if this user already received sms

                    // const existingMessages = await prisma.messageLog.findMany({
                    //     where: {
                    //         from: user.twilio_number,
                    //         to: from,
                    //         user_email: user.email,
                    //         direction: 'out'
                    //     }
                    // })

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

                    // console.log(`Existing msg count: ${existingMessages.length}`)

                    // if no previous messages - send intro message
                    if (history.length === 0) {
                        const tw = new Twilio(accountSid, authToken);

                        try {
                            await tw.messages.create({
                                from: user.twilio_number,
                                to: from,
                                body: user.bot_intro_message,
                            })

                            await prisma.messageLog.create({
                                data: {
                                    from: user.twilio_number,
                                    to: from,
                                    user_id: user.uid,
                                    user_email: user.email,
                                    direction: 'out',
                                    text: user.bot_intro_message,
                                    customer_number: from
                                }
                            })
                        } catch (e) {
                            console.error('Error sending sms')
                            console.error(e)
                        }
                    } else {
                        // continue conversation
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

                        const response = await openai.createChatCompletion({
                            model: "gpt-3.5-turbo",
                            temperature: 0.888,
                            max_tokens: 1000,
                            frequency_penalty: 0,
                            presence_penalty: 0,
                            top_p: 1,
                            messages: botMessages
                        }, { timeout: 40000 });

                        try {
                            await delay(10_000)
                            // @ts-ignore
                            const response_text = response.data.choices[0].message.content.trim();
                            if (response_text){
                                const targetNumber = from;
                                console.log(6)
                                await sendSms(response_text, user.twilio_number!, targetNumber, user.email, user.uid, prisma)
                                console.log(7)
                                
                            }
                        } catch(e){
                            // @ts-ignore
                            console.error(`Failed to get response from openai for chat request [${value.id}]`)
                
                
                        }
                    }
                } else {
                    try {
                        const errorMsg = (await prisma.config.findFirst({
                            where: {
                                key: 'generic_error'
                            }
                        }))!.value

                        const tw = new Twilio(accountSid, authToken);

                        await tw.messages.create({
                            from: user.twilio_number,
                            to: from,
                            body: errorMsg,
                        })
                    } catch (e) {
                        console.error(`Failed to send sms with error message`)
                        console.error(e)
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

                            const tw = new Twilio(accountSid, authToken);

                            await tw.messages.create({
                                from: user.twilio_number,
                                to: user.business_number!,
                                body: errorMsg,
                            })
                        } catch (e) {
                            console.error(`Failed to send sms with error message`)
                        }
                    }
                }

            }
        }

    } catch (e) {
        console.error(e)
    }


    return res.status(200).json({})
}

export default ProtectedRoute