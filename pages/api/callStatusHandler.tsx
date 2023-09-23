import { NextApiHandler } from 'next'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import { PrismaClient } from '@prisma/client'
import { validateRequest, twiml, Twilio } from 'twilio';
import { use } from 'react';
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from 'openai'
import { sendSms } from './smsWebhook';
import { v4 as uuidv4 } from 'uuid';

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});


export const VoicemailPrefix = 'voicemail-url://'


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
    console.log(req.body)


    const prisma = new PrismaClient()

    // const twilioSignature = req.headers['x-twilio-signature'];
    // const url = process.env.TWILIO_FORWARD_CALL_HANDLER

    // const isValidRequest = validateRequest(
    //     authToken!,
    //     //@ts-ignore
    //     twilioSignature,
    //     url,
    //     req.body
    // );

    // if (!isValidRequest) {
    //     console.error('Not valid request signature')
    //     return res.status(400).end()
    // }


    try {
        console.log('Incoming handler webhook')

        let status = req.body['DialCallStatus']  // 'completed' or 'no-answer'
        const from = req.body['From']   // Customer number 
        const to = req.body['To']       // Tradesmen twilio number
        const direction = req.body['Direction'] // must be 'inbound'
        const subcall_id = req.body['DialCallSid'] ?? 'none'
        const tw = new Twilio(accountSid, authToken);

        const recordingUrl = req.body['RecordingUrl']

        if (recordingUrl) {
            status = 'user-voicemail-answered'
        }


        let canSendSms = true;

        // Check caller phone number type - landline, mobile, etc
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

        const answeredByMachine = (recordingUrl) || ((await prisma.machineCalls.findFirst({ where: { callId: subcall_id } })) !== null)


        if (direction === 'inbound') {
            // Find tradesmen profile
            const user = await prisma.user.findFirst({
                where: {
                    twilio_number: to // tradesment twilio number
                }
            })

            if (!user) {
                console.error(`User with number [${to}] not found`)
                return Send(res, 200)
            }


            // check if the call was made to test number
            // if yes - answer user only if total number of SENT messages by AI is < 5
            if (to === process.env.TEST_NUMBER) {
                const used_ai_replies = (await prisma.messageLog.findMany({
                    where: {
                        from: to, // find calls from test twilio number
                        // because test number has limit 5 replies per number
                        // and regular user - per account
                        to: from, // to customer that made this call
                        user_id: user.uid
                    }
                })).length

                // console.log('Bot answers: ' + used_ai_replies)

                // owner has no limits
                if (used_ai_replies < 5 || (from as string).includes('7392298069')) {

                    try {
                        await tw.messages.create({
                            from: to, // from twilio test number
                            to: from, // to customer number
                            body: user.bot_intro_message!, // send intro message
                        })

                        await prisma.messageLog.create({
                            data: {
                                from: to, // from twilio test number
                                to: from, // to customer number
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

                return Send(res, 200)
            }

            if (!user.service_enabled) {
                return Send(res, 200)
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

            if (!canSendSms) {
                return Send(res, 200)
            }

            // handle answering machine here
            if ((status === 'user-voicemail-answered' || status === 'no-answer' || status === 'busy' || answeredByMachine) && user && user.twilio_number && user.sub_id && user.bot_intro_message) {
                const totalMessages = user.messages_per_month
                // TODO: use date from sub date
                const lastDay = Date.now() - (720 * 60 * 60 * 1000);
                const lastDate = new Date(lastDay).toISOString();

                const usedMessages = (await prisma.messageLog.findMany({
                    where: {
                        AND: [
                            {
                                from: to // from user twilio number (basically from AI)
                            },
                            {
                                created_at: {
                                    gte: lastDate
                                }
                            }
                        ]
                    }
                })).length

                const creditsWarning = (totalMessages - usedMessages) === 5;
                const warningText = 'Your AI only has 5 texts remaining! To re-enable your service you will need to upgrade your account in your portal ( located here: https://tradesmenaiportal.com/billing ) or wait until next month when your credits will be reinstated.'

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
                        }, orderBy: [
                            {
                                id: 'asc'
                            }
                        ]
                    })

                    console.log(`History length: ${history.length}`)

                    // if no previous messages - send intro message
                    // test number send every time
                    if (history.length === 0) {
                        const tw = new Twilio(accountSid, authToken);

                        try {
                            // Send intro message from bot to user
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
                        const botMessages: ChatCompletionRequestMessage[] = []

                        botMessages.push({
                            role: 'system',
                            content: user.prompt!
                        })

                        history.map((msg) => {
                            if (!msg.text.startsWith(VoicemailPrefix)) {
                                botMessages.push({
                                    role: msg.direction === 'out' ? 'assistant' : 'user',
                                    content: msg.text
                                })
                            }
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
                            if (response_text) {
                                const targetNumber = from;
                                console.log(6)
                                await sendSms(response_text, user.twilio_number!, targetNumber, user.email, user.uid, prisma)
                                console.log(7)
                            }
                        } catch (e) {
                            // @ts-ignore
                            console.error(`Failed to get response from openai for chat request [${value.id}]`)
                        }
                    }

                    if (creditsWarning && user.business_number) {
                        await sendSms(warningText, user.twilio_number!, user.business_number, user.email, user.uid, prisma, true)
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

                if (status === 'user-voicemail-answered') {
                    await prisma.messageLog.create({
                        data: {
                            from,
                            to,
                            text: `${VoicemailPrefix}${recordingUrl}`,
                            user_id: user.uid,
                            user_email: user.email,
                            direction: 'in',
                            customer_number: from,
                            message_uid: uuidv4()
                        }
                    })
                }

            }
        }

    } catch (e) {
        console.error(e)
    }

    // const rr = new twiml.VoiceResponse();
    // rr.

    return Send(res, 200)
}

function Send(res: any, code: number) {
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send('<Response/>')
}

export default ProtectedRoute