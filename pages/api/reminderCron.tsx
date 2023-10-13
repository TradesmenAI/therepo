import { NextApiHandler } from 'next'
import { PrismaClient } from '@prisma/client'
import { sendSms } from './smsWebhook'
import { applyTimezoneToHours } from '../app'
import { DateTime } from "luxon";

const LOCAL_TIME = 17

function canSend(userGtm: number, createdAt:Date) {
    const utcTime = new Date().getTime()
    const userOffsetMs = userGtm * 3600 * 1000
    const currentLocalTimeMs = utcTime + userOffsetMs
    const createdDateLocalTimeMs = createdAt.getTime() + userOffsetMs

    const reminderTime = new Date().setUTCHours(0,0,0,0)
    const reminderLocalTimeMs = reminderTime + LOCAL_TIME * 3600 * 1000

    if (currentLocalTimeMs > reminderLocalTimeMs && createdDateLocalTimeMs < reminderLocalTimeMs) {
        return true;
    }

    return false
}

const ProtectedRoute: NextApiHandler = async (req, res) => {
    const prisma = new PrismaClient()

    const result = await prisma.reminders.findMany({
        where: {},
        distinct: ['phone'],
        take: 10
    })

    const txt = (await prisma.config.findFirst({
        where: {
            key: 'reminder_message'
        }
    }))!.value

    let sentPhones = []

    for (let i = 0; i < result.length; ++i) {
        const reminder = result[i];
     
        if (canSend(reminder.gmt, reminder.created_at)) {
            

            await sendSms(txt, reminder.from, reminder.phone, '', '', prisma, true)

            sentPhones.push(reminder.phone)
        }
    }

    await prisma.reminders.deleteMany({ where: { phone: { in: sentPhones } } })

    return res.status(200).json({})
}


export default ProtectedRoute