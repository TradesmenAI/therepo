import { NextApiHandler } from 'next'
import { PrismaClient } from '@prisma/client'
import {validateRequest, twiml} from 'twilio';

// this callback called before call handler only if call was answered by machine
const ProtectedRoute: NextApiHandler = async (req, res) => {
    const prisma = new PrismaClient()

    const callId = req.body['CallSid']
    const answeredBy = req.body['AnsweredBy']

    if (answeredBy === 'machine_start'){
        await prisma.machineCalls.create({data:{'callId': callId}})
    }

    console.log(req.body)
   
    return res.status(200).end()
}

export default ProtectedRoute