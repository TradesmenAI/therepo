import { NextApiHandler } from 'next'
import { PrismaClient } from '@prisma/client'
import { sendSms } from './smsWebhook'
import { applyTimezoneToHours } from '../app'

const LOCAL_TIME = 5


function canSend(userGtm: number) {
    const tz = userGtm;

    let fromHours = LOCAL_TIME;

    const now = new Date();
    let hoursNow = now.getUTCHours();

    let tzFromHours = applyTimezoneToHours(fromHours, tz);

    if (hoursNow >= tzFromHours) {
        return true;
    }

    return false
}

const ProtectedRoute: NextApiHandler = async (req, res) => {
    const prisma = new PrismaClient()

    const result = await prisma.reminders.findMany({
        where: {},
        distinct: ['phone'],
    })

    let sentPhones = []

    for (let i = 0; i < result.length; ++i) {
        const reminder = result[i];

        if (canSend(reminder.gmt)) {
            const txt = `You have unread messages. Link: https://tradesmenaiportal.com/callLog`

            await sendSms(txt, reminder.from, reminder.phone, '', '', prisma, true)

            sentPhones.push(reminder.phone)
        }
    }

    await prisma.reminders.deleteMany({ where: { phone: { in: sentPhones } } })

    return res.status(200).json({})
}


export default ProtectedRoute